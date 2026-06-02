"""
LeadReply — WhatsApp Webhook Handler
Receives inbound WhatsApp messages and routes them to the conversation engine.

Supports:
- OpenWA webhook format
- Generic webhook format (Twilio, 360dialog, etc.)

Usage:
    from flows.webhook import WhatsAppWebhookHandler
    handler = WhatsAppWebhookHandler(client_id="swiftclean-london")
    reply = handler.process_inbound(from_phone, message_text)
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from flows.engine import (
    ConversationEngine,
    SessionManager,
    LeadLogger,
    load_client_config,
)
from flows.google_sheets import get_logger

logger = logging.getLogger(__name__)


class WhatsAppWebhookHandler:
    """
    Handles inbound WhatsApp messages and returns replies.
    """

    def __init__(
        self,
        client_id: str,
        log_dir: str = "logs",
        google_sheet_id: Optional[str] = None,
    ):
        self.client_id = client_id
        self.config = load_client_config(client_id)
        self.engine = ConversationEngine(self.config)
        self.sessions = SessionManager()
        self.lead_logger = LeadLogger(log_dir=str(Path(log_dir)))
        self.sheets_logger = get_logger(sheet_id=google_sheet_id)

    def process_inbound(
        self,
        from_phone: str,
        message_text: str,
        message_type: str = "text",
    ) -> dict[str, Any]:
        """
        Process an inbound WhatsApp message.

        Args:
            from_phone: Customer's phone number (e.g. "447700900123")
            message_text: The message content
            message_type: Message type (text, image, etc.)

        Returns:
            Dict with reply text and metadata
        """
        # Normalise phone number
        phone = self._normalise_phone(from_phone)

        logger.info(f"Inbound from {phone}: {message_text[:50]}...")

        # Get or create session
        state = self.sessions.get_or_create(phone)

        # Process through engine
        reply, state, summary = self.engine.handle_message(phone, message_text, state)

        # Log lead if generated
        if summary:
            self.lead_logger.log_lead(state.lead, self.config["business_name"])
            self.lead_logger.log_conversation(state)
            try:
                self.sheets_logger.log_lead(state.lead)
            except Exception as e:
                logger.error(f"Failed to log to Google Sheets: {e}")

            # Send lead summary to owner
            self._notify_owner(summary, state)

        return {
            "reply": reply,
            "phone": phone,
            "session_step": state.current_step,
            "lead_generated": summary is not None,
            "handoff_triggered": state.handoff_triggered,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def _notify_owner(self, summary: str, state) -> None:
        """Send lead summary to the business owner."""
        delivery = self.config.get("lead_delivery", {})
        method = delivery.get("method", "console_log")

        if method == "email":
            self._send_email(summary, delivery.get("email", ""))
        elif method == "whatsapp":
            self._send_whatsapp(summary, delivery.get("whatsapp_number", ""))
        elif method == "google_sheet":
            # Already logged above
            pass

        # Always log to console
        print(f"\n🔔 OWNER NOTIFICATION ({method}):")
        print(summary)
        print()

    def _send_email(self, summary: str, email: str) -> None:
        """Send lead summary via email. Implement with your email provider."""
        logger.info(f"Would send email to {email}: {summary[:100]}...")
        # TODO: Implement with SendGrid, AWS SES, or SMTP

    def _send_whatsapp(self, summary: str, number: str) -> None:
        """Send lead summary via WhatsApp. Implement with your WhatsApp provider."""
        logger.info(f"Would send WhatsApp to {number}: {summary[:100]}...")
        # TODO: Implement with OpenWA, Twilio, or 360dialog

    @staticmethod
    def _normalise_phone(phone: str) -> str:
        """Normalise phone number to a consistent format."""
        cleaned = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if cleaned.startswith("0"):
            cleaned = "44" + cleaned[1:]
        if not cleaned.startswith("+"):
            cleaned = "+" + cleaned
        return cleaned


# ---------------------------------------------------------------------------
# Flask/FastAPI webhook endpoint examples
# ---------------------------------------------------------------------------

def create_flask_app(client_id: str, google_sheet_id: Optional[str] = None):
    """Create a Flask app with the webhook endpoint."""
    try:
        from flask import Flask, request, jsonify
    except ImportError:
        raise ImportError("Flask is required. Install with: pip install flask")

    app = Flask(__name__)
    handler = WhatsAppWebhookHandler(
        client_id=client_id,
        google_sheet_id=google_sheet_id,
    )

    @app.route("/webhook/whatsapp", methods=["POST"])
    def whatsapp_webhook():
        data = request.get_json(silent=True) or {}

        # Try common webhook formats
        # OpenWA format
        from_phone = (
            data.get("from")
            or data.get("sender")
            or data.get("data", {}).get("from", "")
        )
        message_text = (
            data.get("body")
            or data.get("text")
            or data.get("message")
            or data.get("data", {}).get("body", "")
        )

        if not from_phone or not message_text:
            return jsonify({"error": "Missing from/body"}), 400

        result = handler.process_inbound(from_phone, message_text)
        return jsonify(result)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "client": client_id})

    return app


def create_fastapi_app(client_id: str, google_sheet_id: Optional[str] = None):
    """Create a FastAPI app with the webhook endpoint."""
    try:
        from fastapi import FastAPI, Request
        from fastapi.responses import JSONResponse
    except ImportError:
        raise ImportError("FastAPI is required. Install with: pip install fastapi uvicorn")

    app = FastAPI(title="LeadReply Webhook")
    handler = WhatsAppWebhookHandler(
        client_id=client_id,
        google_sheet_id=google_sheet_id,
    )

    @app.post("/webhook/whatsapp")
    async def whatsapp_webhook(request: Request):
        data = await request.json()

        from_phone = (
            data.get("from")
            or data.get("sender")
            or data.get("data", {}).get("from", "")
        )
        message_text = (
            data.get("body")
            or data.get("text")
            or data.get("message")
            or data.get("data", {}).get("body", "")
        )

        if not from_phone or not message_text:
            return JSONResponse({"error": "Missing from/body"}, status_code=400)

        result = handler.process_inbound(from_phone, message_text)
        return result

    @app.get("/health")
    def health():
        return {"status": "ok", "client": client_id}

    return app


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    client_id = sys.argv[1] if len(sys.argv) > 1 else "swiftclean-london"
    handler = WhatsAppWebhookHandler(client_id=client_id)

    print(f"LeadReply Webhook Handler — {client_id}")
    print("Enter customer messages (phone|message) or 'quit' to exit:")
    print()

    while True:
        try:
            line = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if line.lower() in ("quit", "exit", "q"):
            break
        if "|" not in line:
            print("  Format: phone|message  (e.g. +447700900123|Hi)")
            continue

        phone, message = line.split("|", 1)
        result = handler.process_inbound(phone.strip(), message.strip())
        print(f"  Reply: {result['reply']}")
        if result["lead_generated"]:
            print(f"  📋 Lead generated!")
        print()
