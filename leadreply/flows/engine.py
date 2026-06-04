"""
LeadReply — WhatsApp Receptionist Engine
Conversation state tracker and message handler
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class LeadData:
    """Collected lead information for a single enquiry."""
    customer_phone: str = ""
    customer_name: str = ""
    service: str = ""
    postcode: str = ""
    property_type: str = ""
    rooms: str = ""
    furnished_status: str = ""
    extras: list[str] = field(default_factory=list)
    preferred_date: str = ""
    urgency: str = ""
    photos_requested: bool = False
    frequency: str = ""          # for recurring services
    extras_office: list[str] = field(default_factory=list)
    building_work_type: str = "" # for after-builders
    dust_level: str = ""         # for after-builders
    ready_to_book: str = ""
    handoff_requested: bool = False
    handoff_reason: str = ""
    lead_quality: str = "Medium"
    suggested_next_step: str = ""
    status: str = "new"
    notes: str = ""

    def to_summary(self, business_name: str) -> str:
        extras_str = ", ".join(self.extras) if self.extras else "None"
        lines = [
            "New cleaning lead captured",
            f"Business: {business_name}",
            f"Customer name: {self.customer_name or 'Not provided'}",
            f"Customer phone: {self.customer_phone or 'Not provided'}",
            f"Service: {self.service or 'Not specified'}",
            f"Postcode: {self.postcode or 'Not provided'}",
            f"Property type: {self.property_type or 'Not specified'}",
        ]
        if self.rooms:
            lines.append(f"Rooms/Bedrooms: {self.rooms}")
        if self.furnished_status:
            lines.append(f"Furnished status: {self.furnished_status}")
        if extras_str != "None":
            lines.append(f"Extras: {extras_str}")
        if self.preferred_date:
            lines.append(f"Preferred date: {self.preferred_date}")
        if self.urgency:
            lines.append(f"Urgency: {self.urgency}")
        if self.frequency:
            lines.append(f"Frequency: {self.frequency}")
        if self.building_work_type:
            lines.append(f"Building work: {self.building_work_type}")
        if self.dust_level:
            lines.append(f"Dust/debris level: {self.dust_level}")
        lines.append(f"Lead quality: {self.lead_quality}")
        if self.suggested_next_step:
            lines.append(f"Suggested next step: {self.suggested_next_step}")
        if self.handoff_requested:
            lines.append(f"Handoff requested: Yes — {self.handoff_reason}")
        lines.append(f"Status: {self.status}")
        return "\n".join(lines)

    def to_google_sheet_row(self) -> list[str]:
        return [
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            self.customer_name,
            self.customer_phone,
            self.service,
            self.postcode,
            self.property_type,
            self.rooms,
            ", ".join(self.extras),
            self.preferred_date,
            self.urgency,
            self.lead_quality,
            self.to_summary(""),
            self.status,
            self.notes,
        ]

    def is_complete(self) -> bool:
        return bool(
            self.customer_name
            and self.customer_phone
            and self.service
            and self.postcode
        )

    def assess_quality(self) -> str:
        score = 0
        if self.customer_name: score += 1
        if self.customer_phone: score += 1
        if self.service: score += 1
        if self.postcode: score += 1
        if self.property_type: score += 1
        if self.preferred_date: score += 1
        if self.ready_to_book.lower() in ("yes", "ready", "book now", "book"): score += 2
        if score >= 6:
            self.lead_quality = "High"
        elif score >= 3:
            self.lead_quality = "Medium"
        else:
            self.lead_quality = "Low"
        return self.lead_quality


@dataclass
class ConversationState:
    """Tracks the state of a single customer conversation."""
    customer_phone: str
    session_id: str = ""
    started_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    last_message_at: str = ""
    message_count: int = 0
    current_step: str = "greeting"   # greeting → service → qualifying → closing → done
    current_field: str = ""          # which detail we're currently asking for
    lead: LeadData = field(default_factory=LeadData)
    history: list[dict[str, str]] = field(default_factory=list)
    handoff_triggered: bool = False
    owner_took_over: bool = False
    is_new: bool = True

    def add_message(self, role: str, text: str) -> None:
        self.history.append({
            "role": role,
            "text": text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        self.message_count += 1
        self.last_message_at = datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Client config loader
# ---------------------------------------------------------------------------

CLIENTS_DIR = Path(__file__).resolve().parent.parent / "config" / "clients"


def load_client_config(client_id: str) -> dict[str, Any]:
    path = CLIENTS_DIR / f"{client_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"Client config not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Postcode helper
# ---------------------------------------------------------------------------

# Very loose UK postcode pattern — good enough for conversation
_POSTCODE_RE = re.compile(
    r"\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b",
    re.IGNORECASE,
)

# Short postcode area (e.g. "SW6", "NW1", "E1")
_POSTCODE_AREA_RE = re.compile(r"\b[A-Z]{1,2}\d{1,2}[A-Z]?\b", re.IGNORECASE)


def extract_postcode(text: str) -> Optional[str]:
    m = _POSTCODE_RE.search(text)
    if m:
        return m.group(0).upper()
    m = _POSTCODE_AREA_RE.search(text)
    if m:
        return m.group(0).upper()
    return None


# ---------------------------------------------------------------------------
# Service matcher
# ---------------------------------------------------------------------------

def match_service(text: str, services: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    """Match user text to a configured service by name or alias."""
    text_lower = text.lower()
    for svc in services:
        # Check primary name
        if svc["name"].lower() in text_lower:
            return svc
        # Check aliases
        for alias in svc.get("aliases", []):
            if alias.lower() in text_lower:
                return svc
    return None


# ---------------------------------------------------------------------------
# Property type extractor
# ---------------------------------------------------------------------------

_PROPERTY_TYPES = [
    "studio",
    "1-bed flat", "one bed flat", "1 bed flat",
    "2-bed flat", "two bed flat", "2 bed flat",
    "3-bed flat", "three bed flat", "3 bed flat",
    "1-bed house", "one bed house", "1 bed house",
    "2-bed house", "two bed house", "2 bed house",
    "3-bed house", "three bed house", "3 bed house",
    "4-bed house", "four bed house", "4 bed house",
    "house", "flat", "maisonette", "bungalow",
    "office", "shop", "warehouse", "airbnb",
]

_PROPERTY_NORMALISE: dict[str, str] = {
    "studio": "Studio",
    "one bed flat": "1-bed flat", "1 bed flat": "1-bed flat", "1-bed flat": "1-bed flat",
    "two bed flat": "2-bed flat", "2 bed flat": "2-bed flat", "2-bed flat": "2-bed flat",
    "three bed flat": "3-bed flat", "3 bed flat": "3-bed flat", "3-bed flat": "3-bed flat",
    "one bed house": "1-bed house", "1 bed house": "1-bed house", "1-bed house": "1-bed house",
    "two bed house": "2-bed house", "2 bed house": "2-bed house", "2-bed house": "2-bed house",
    "three bed house": "3-bed house", "3 bed house": "3-bed house", "3-bed house": "3-bed house",
    "four bed house": "4-bed house", "4 bed house": "4-bed house", "4-bed house": "4-bed house",
    "house": "House",
    "flat": "Flat",
    "maisonette": "Maisonette",
    "bungalow": "Bungalow",
    "office": "Office",
    "shop": "Shop",
    "warehouse": "Warehouse",
    "airbnb": "Airbnb",
}


def extract_property_type(text: str) -> Optional[str]:
    text_lower = text.lower()
    for pt in _PROPERTY_TYPES:
        if pt in text_lower:
            return _PROPERTY_NORMALISE.get(pt, pt.title())
    return None


# ---------------------------------------------------------------------------
# Furnished status extractor
# ---------------------------------------------------------------------------

def extract_furnished(text: str) -> Optional[str]:
    text_lower = text.lower()
    if "unfurnished" in text_lower or "no furniture" in text_lower or "empty" in text_lower:
        return "Unfurnished"
    if "part" in text_lower and "furnish" in text_lower:
        return "Part-furnished"
    if "fully" in text_lower and "furnish" in text_lower:
        return "Furnished"
    if "furnished" in text_lower:
        return "Furnished"
    return None


# ---------------------------------------------------------------------------
# Handoff trigger checker
# ---------------------------------------------------------------------------

def check_handoff_trigger(text: str, triggers: list[str]) -> Optional[str]:
    text_lower = text.lower()
    for trigger in triggers:
        if trigger.lower() in text_lower:
            return trigger
    return None


# ---------------------------------------------------------------------------
# FAQ matcher
# ---------------------------------------------------------------------------

def match_faq(text: str, faq: dict[str, str]) -> Optional[str]:
    text_lower = text.lower().strip()
    for question, answer in faq.items():
        # Simple keyword overlap — can be improved with embeddings
        q_words = set(question.lower().split())
        t_words = set(text_lower.split())
        overlap = q_words & t_words
        if len(overlap) >= min(3, len(q_words)):
            return answer
    return None


# ---------------------------------------------------------------------------
# Conversation engine
# ---------------------------------------------------------------------------

class ConversationEngine:
    """
    Stateless-ish conversation engine.
    Call `handle_message()` with the customer text + current state;
    it returns (reply_text, updated_state, lead_summary_or_None).
    """

    def __init__(self, client_config: dict[str, Any]):
        self.config = client_config
        self.business_name = client_config["business_name"]
        self.services = client_config["services"]
        self.areas = client_config.get("areas_covered", [])
        self.faq = client_config.get("faq", {})
        self.handoff_triggers = client_config.get("handoff_rules", {}).get("triggers", [])
        self.handoff_number = client_config.get("handoff_rules", {}).get("handoff_number", "")
        self.pricing_policy = client_config.get("pricing_rules", {}).get(
            "policy",
            "Prices depend on the property size, service type, location and any extras needed.",
        )

    # ------------------------------------------------------------------
    # Main entry
    # ------------------------------------------------------------------

    def handle_message(
        self, customer_phone: str, text: str, state: ConversationState
    ) -> tuple[str, ConversationState, Optional[str]]:
        """
        Process one inbound message.
        Returns: (reply, updated_state, lead_summary_or_None)
        """
        state.add_message("customer", text)
        text_lower = text.lower().strip()

        # Owner took over — stay silent
        if state.owner_took_over:
            return "", state, None

        # Already handed off
        if state.handoff_triggered:
            return self._handle_post_handoff(state, text)

        # Check handoff trigger
        trigger = check_handoff_trigger(text, self.handoff_triggers)
        if trigger:
            return self._do_handoff(state, text, trigger)

        # Route by step
        step = state.current_step

        if step == "greeting" or state.is_new:
            return self._step_greeting(state, text)
        elif step == "service":
            return self._step_service(state, text)
        elif step == "qualifying":
            return self._step_qualifying(state, text)
        elif step == "closing":
            return self._step_closing(state, text)
        elif step == "done":
            return self._step_done(state, text)
        else:
            return self._step_greeting(state, text)

    # ------------------------------------------------------------------
    # Steps
    # ------------------------------------------------------------------

    def _step_greeting(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        state.is_new = False
        text_lower = text.lower()
        # Check if they mention a service straight away
        svc = match_service(text, self.services)
        if svc:
            state.lead.service = svc["name"]
            state.current_step = "qualifying"
            state.current_field = "postcode"
            reply = (
                f"Hi, yes — we can help with {svc['name'].lower()} in London. "
                "To prepare a quote, can I ask a few quick questions? "
                "First, what postcode is the property in?"
            )
            state.add_message("assistant", reply)
            return reply, state, None

        # Check for price question
        if any(w in text_lower for w in ("how much", "price", "cost", "quote", "pricing")):
            reply = (
                "Prices depend on the property size, service type, location and any extras needed. "
                "I can collect the details now so the team can give you an accurate quote. "
                "What type of cleaning do you need?"
            )
            state.current_step = "service"
            state.add_message("assistant", reply)
            return reply, state, None

        # Check FAQ
        faq_answer = match_faq(text, self.faq)
        if faq_answer:
            reply = faq_answer + " Would you like to get a quote?"
            state.current_step = "service"
            state.add_message("assistant", reply)
            return reply, state, None

        # Generic greeting
        reply = (
            f"Hi! Thanks for messaging {self.business_name}. "
            "I can help with cleaning enquiries and prepare a quote for the team. "
            "What type of cleaning do you need? For example: end-of-tenancy, deep clean, Airbnb, office, after-builders, or carpet cleaning."
        )
        state.current_step = "service"
        state.add_message("assistant", reply)
        return reply, state, None

    def _step_service(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        svc = match_service(text, self.services)
        if svc:
            state.lead.service = svc["name"]
            state.current_step = "qualifying"
            state.current_field = "postcode"
            reply = (
                f"Great — {svc['name']}. "
                "To prepare a quote, can I ask a few quick questions? "
                "First, what postcode is the property in?"
            )
            state.add_message("assistant", reply)
            return reply, state, None

        # Price question without service
        if any(w in text.lower() for w in ("how much", "price", "cost")):
            reply = (
                "I don't want to give you the wrong price without checking the property details. "
                "I'll collect the main information and the team can confirm the quote. "
                "What type of cleaning do you need?"
            )
            state.add_message("assistant", reply)
            return reply, state, None

        # FAQ
        faq_answer = match_faq(text, self.faq)
        if faq_answer:
            reply = faq_answer + " What type of cleaning do you need?"
            state.add_message("assistant", reply)
            return reply, state, None

        # Unclear — ask again
        reply = (
            "I can help with end-of-tenancy cleaning, deep cleaning, Airbnb cleaning, office cleaning, after-builders cleaning, or carpet cleaning. "
            "Which one do you need?"
        )
        state.add_message("assistant", reply)
        return reply, state, None

    def _step_qualifying(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        field = state.current_field
        text_lower = text.lower()

        # Price question mid-flow
        if any(w in text_lower for w in ("how much", "price", "cost")) and field not in ("closing",):
            reply = (
                "I don't want to give you the wrong price without checking the property details. "
                "I'll collect the main information and the team can confirm the quote. "
                f"{self._ask_for_field(field, state)}"
            )
            state.add_message("assistant", reply)
            return reply, state, None

        # Route to field handler
        handlers = {
            "postcode": self._handle_postcode,
            "property_type": self._handle_property_type,
            "furnished": self._handle_furnished,
            "extras": self._handle_extras,
            "preferred_date": self._handle_preferred_date,
            "urgency": self._handle_urgency,
            "name": self._handle_name,
            "phone": self._handle_phone,
            "frequency": self._handle_frequency,
            "office_size": self._handle_office_size,
            "office_frequency": self._handle_office_frequency,
            "building_work": self._handle_building_work,
            "dust_level": self._handle_dust_level,
            "photos": self._handle_photos,
        }

        handler = handlers.get(field)
        if handler:
            return handler(state, text)

        # Fallback — move to closing
        state.current_step = "closing"
        state.current_field = "name"
        reply = "What's your name and best number for the team to confirm the quote?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _step_closing(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        field = state.current_field

        if field == "name":
            return self._handle_name(state, text)
        elif field == "phone":
            return self._handle_phone(state, text)

        # Both collected — close
        return self._close_conversation(state)

    def _step_done(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        # Already closed — only respond to new enquiries
        svc = match_service(text, self.services)
        if svc:
            # Start fresh
            state.current_step = "qualifying"
            state.current_field = "postcode"
            state.lead = LeadData()
            state.lead.service = svc["name"]
            reply = (
                f"Hi, yes — we can help with {svc['name'].lower()} in London. "
                "To prepare a quote, can I ask a few quick questions? "
                "First, what postcode is the property in?"
            )
            state.add_message("assistant", reply)
            return reply, state, None

        reply = "Thanks for your message. The team will get back to you shortly."
        state.add_message("assistant", reply)
        return reply, state, None

    # ------------------------------------------------------------------
    # Field handlers
    # ------------------------------------------------------------------

    def _handle_postcode(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        pc = extract_postcode(text)
        if pc:
            state.lead.postcode = pc
            state.current_field = "property_type"
            reply = (
                "Great, thanks. What type of property is it? "
                "For example: studio, 1-bed flat, 2-bed flat, house, office, or Airbnb."
            )
        else:
            reply = "Could you share the postcode? For example SW6 or NW1."
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_property_type(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        pt = extract_property_type(text)
        if pt:
            state.lead.property_type = pt
            # Check if we need furnished status
            svc = next((s for s in self.services if s["name"] == state.lead.service), None)
            if svc and svc.get("ask_furnished"):
                state.current_field = "furnished"
                reply = "Is the property furnished, part-furnished, or unfurnished?"
            else:
                state.current_field = "extras"
                reply = self._ask_extras(state)
        else:
            reply = "What type of property is it? For example: studio, 1-bed flat, 2-bed flat, house, or office."
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_furnished(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        fs = extract_furnished(text)
        if fs:
            state.lead.furnished_status = fs
        else:
            state.lead.furnished_status = text.strip().title()
        state.current_field = "extras"
        reply = self._ask_extras(state)
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_extras(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        text_lower = text.lower()
        if any(w in text_lower for w in ("no", "none", "just the standard", "nothing else", "no extras", "that's all", "nope")):
            state.lead.extras = []
        else:
            state.lead.extras = [e.strip().title() for e in re.split(r"[,+&]|and", text) if e.strip()]

        # Service-specific branching
        if state.lead.service == "Airbnb cleaning":
            state.current_field = "frequency"
            reply = "How often do you usually need the clean? For example weekly, several times per week, or only when guests check out?"
        elif state.lead.service == "Office cleaning":
            state.current_field = "office_size"
            reply = "Roughly how many desks or what size is the office?"
        elif state.lead.service == "After-builders cleaning":
            state.current_field = "building_work"
            reply = "What type of building work was done? For example: extension, kitchen fit, bathroom, full renovation."
        else:
            state.current_field = "preferred_date"
            reply = "What date would you ideally like the cleaning done?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_frequency(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.frequency = text.strip()
        state.current_field = "preferred_date"
        reply = "What date would you like the first clean?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_office_size(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.rooms = text.strip()
        state.current_field = "office_frequency"
        reply = "Is this a one-off clean or recurring? If recurring, how often?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_office_frequency(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.frequency = text.strip()
        state.current_field = "preferred_date"
        reply = "What date would you ideally like the cleaning done?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_building_work(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.building_work_type = text.strip()
        state.current_field = "dust_level"
        reply = "What's the level of dust or debris? Light, moderate, or heavy?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_dust_level(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.dust_level = text.strip()
        state.current_field = "photos"
        reply = "Would you like to send photos of the property? The team can review them before quoting. (Yes/No)"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_photos(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        text_lower = text.lower()
        if any(w in text_lower for w in ("yes", "yeah", "yep", "sure", "can send", "send them")):
            state.lead.photos_requested = True
            reply = "Perfect, you can send them shortly. "
        else:
            reply = "No problem. "
        state.current_field = "preferred_date"
        reply += "What date would you ideally like the cleaning done?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_preferred_date(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        state.lead.preferred_date = text.strip()
        state.current_field = "urgency"
        reply = "How urgent is this? For example: this week, next week, or flexible."
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_urgency(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        state.lead.urgency = text.strip()
        state.current_step = "closing"
        state.current_field = "name"
        reply = "What's your name and best number for the team to confirm the quote?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_name(self, state: ConversationState, text: str) -> tuple[str, ConversationState, None]:
        # Try to extract name and phone from combined input
        phone = self._extract_phone(text)
        if phone:
            state.lead.customer_phone = phone
            # Remove phone from text to get name
            name_part = re.sub(r"[\d\+\-\s\(\)]{7,}", "", text).strip(", ")
            state.lead.customer_name = name_part or "Not provided"
            return self._close_conversation(state)

        # Just a name — ask for phone
        state.lead.customer_name = text.strip()
        state.current_field = "phone"
        reply = "And the best number for the team to contact you on?"
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_phone(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        phone = self._extract_phone(text)
        if phone:
            state.lead.customer_phone = phone
        else:
            state.lead.customer_phone = text.strip()
        return self._close_conversation(state)

    # ------------------------------------------------------------------
    # Close + summary
    # ------------------------------------------------------------------

    def _close_conversation(self, state: ConversationState) -> tuple[str, ConversationState, str]:
        state.current_step = "done"
        state.lead.assess_quality()

        # Suggest next step
        if state.lead.lead_quality == "High":
            state.lead.suggested_next_step = "Send quote or call customer"
        elif state.lead.frequency:
            state.lead.suggested_next_step = "Call customer and offer recurring package"
        else:
            state.lead.suggested_next_step = "Review details and send quote"

        reply = (
            f"Thanks {state.lead.customer_name or ''}. "
            f"I've passed this to the {self.business_name} team. "
            "They'll review the details and contact you shortly with availability and a quote."
        )
        state.add_message("assistant", reply)

        summary = state.lead.to_summary(self.business_name)
        return reply, state, summary

    # ------------------------------------------------------------------
    # Handoff
    # ------------------------------------------------------------------

    def _do_handoff(
        self, state: ConversationState, text: str, trigger: str
    ) -> tuple[str, ConversationState, None]:
        state.handoff_triggered = True
        state.lead.handoff_requested = True
        state.lead.handoff_reason = f"Customer said: '{trigger}'"
        reply = (
            "Of course. I'll pass this to the team now. "
            "Please share your name and the best number to contact you on."
        )
        state.add_message("assistant", reply)
        return reply, state, None

    def _handle_post_handoff(self, state: ConversationState, text: str) -> tuple[str, ConversationState, Optional[str]]:
        phone = self._extract_phone(text)
        name = re.sub(r"[\d\+\-\s\(\)]{7,}", "", text).strip(", ") or "Not provided"

        state.lead.customer_name = name
        if phone:
            state.lead.customer_phone = phone

        reply = f"Thanks {name}. The team will contact you shortly."
        state.add_message("assistant", reply)
        state.current_step = "done"

        summary = (
            f"Human handoff requested\n"
            f"Customer name: {name}\n"
            f"Phone: {state.lead.customer_phone or 'Not provided'}\n"
            f"Message: {state.lead.handoff_reason}\n"
            f"Suggested next step: Call or reply manually"
        )
        return reply, state, summary

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _ask_for_field(self, field: str, state: ConversationState) -> str:
        prompts = {
            "postcode": "What postcode is the property in?",
            "property_type": "What type of property is it?",
            "furnished": "Is the property furnished, part-furnished, or unfurnished?",
            "extras": self._ask_extras(state),
            "preferred_date": "What date would you ideally like the cleaning done?",
            "urgency": "How urgent is this?",
            "name": "What's your name and best number for the team to confirm the quote?",
            "phone": "And the best number for the team to contact you on?",
        }
        return prompts.get(field, "Could you share a few more details?")

    def _ask_extras(self, state: ConversationState) -> str:
        svc = next((s for s in self.services if s["name"] == state.lead.service), None)
        if svc and svc.get("default_extras"):
            extras_list = ", ".join(svc["default_extras"][:4])
            return f"Do you need any extras? Common extras include {extras_list}."
        return "Do you need any extras?"

    @staticmethod
    def _extract_phone(text: str) -> Optional[str]:
        # Match UK phone numbers loosely
        m = re.search(r"(\+44[\d\s\(\)-]{7,}|0[\d\s\(\)-]{9,})", text)
        if m:
            return m.group(1).strip()
        return None


# ---------------------------------------------------------------------------
# Session manager (in-memory; swap for Redis/DB in production)
# ---------------------------------------------------------------------------

class SessionManager:
    """Simple in-memory session store. Replace with Redis/DB for production."""

    def __init__(self):
        self._sessions: dict[str, ConversationState] = {}

    def get_or_create(self, customer_phone: str) -> ConversationState:
        if customer_phone not in self._sessions:
            self._sessions[customer_phone] = ConversationState(customer_phone=customer_phone)
        return self._sessions[customer_phone]

    def get(self, customer_phone: str) -> Optional[ConversationState]:
        return self._sessions.get(customer_phone)

    def all_sessions(self) -> dict[str, ConversationState]:
        return dict(self._sessions)

    def reset(self, customer_phone: str) -> None:
        self._sessions.pop(customer_phone, None)


# ---------------------------------------------------------------------------
# Lead logger
# ---------------------------------------------------------------------------

class LeadLogger:
    """Log leads to JSON file. Replace with Google Sheets API for production."""

    def __init__(self, log_dir: str | Path = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)

    def log_lead(self, lead: LeadData, business_name: str) -> Path:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safe_phone = re.sub(r"[^\d]", "", lead.customer_phone or "unknown")[-8:]
        path = self.log_dir / f"lead_{timestamp}_{safe_phone}.json"
        data = {
            "business": business_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "summary": lead.to_summary(business_name),
            "lead": lead.__dict__,
        }
        path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        return path

    def log_conversation(self, state: ConversationState) -> Path:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safe_phone = re.sub(r"[^\d]", "", state.customer_phone)[-8:]
        path = self.log_dir / f"conv_{timestamp}_{safe_phone}.json"
        data = {
            "customer_phone": state.customer_phone,
            "started_at": state.started_at,
            "message_count": state.message_count,
            "history": state.history,
        }
        path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        return path
