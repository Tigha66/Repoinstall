"""
LeadReply — Test Script
Tests the SwiftClean London demo with 15 customer messages.
Run: python3 tests/test_swiftclean.py
"""

import json
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flows.engine import (
    ConversationEngine,
    SessionManager,
    LeadLogger,
    load_client_config,
)


def print_separator(label: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}\n")


def run_test(
    engine: ConversationEngine,
    sessions: SessionManager,
    logger: LeadLogger,
    customer_phone: str,
    message: str,
    verbose: bool = True,
) -> None:
    state = sessions.get_or_create(customer_phone)
    reply, state, summary = engine.handle_message(customer_phone, message, state)

    if verbose:
        print(f"  Customer: {message}")
        print(f"  Assistant: {reply}")
        if summary:
            print(f"\n  📋 LEAD SUMMARY:\n  {'-'*40}")
            for line in summary.split("\n"):
                print(f"  {line}")
            print(f"  {'-'*40}")
        print()


def main() -> None:
    print_separator("LeadReply — SwiftClean London Demo Test")

    # Load config
    config = load_client_config("swiftclean-london")
    engine = ConversationEngine(config)
    sessions = SessionManager()
    logger = LeadLogger(log_dir=str(Path(__file__).resolve().parent.parent / "logs"))

    business_name = config["business_name"]
    print(f"Business: {business_name}")
    print(f"Services: {', '.join(s['name'] for s in config['services'])}")
    print(f"Areas: {', '.join(config['areas_covered'][:5])}...")

    # ------------------------------------------------------------------
    # Full end-to-end conversation test
    # ------------------------------------------------------------------
    print_separator("Full End-to-End: End-of-Tenancy Cleaning")

    PHONE = "+447700900123"

    conversation = [
        "Hi",
        "Do you do end-of-tenancy cleaning?",
        "SW6",
        "2-bed flat",
        "Part furnished",
        "Oven and windows",
        "Friday morning",
        "This week",
        "Sarah, 07700 900123",
    ]

    for msg in conversation:
        run_test(engine, sessions, logger, PHONE, msg)

    # Log the lead
    state = sessions.get(PHONE)
    if state:
        logger.log_lead(state.lead, business_name)
        logger.log_conversation(state)

    # ------------------------------------------------------------------
    # 15 individual test messages (fresh sessions each)
    # ------------------------------------------------------------------
    print_separator("15 Individual Test Messages")

    test_cases = [
        ("+447000000001", "Hi"),
        ("+447000000002", "Do you do end-of-tenancy cleaning?"),
        ("+447000000003", "How much for a 2-bed flat?"),
        ("+447000000004", "I need cleaning tomorrow"),
        ("+447000000005", "Do you cover Croydon?"),
        ("+447000000006", "Can you clean an oven?"),
        ("+447000000007", "I have an Airbnb in Camden"),
        ("+447000000008", "Need office cleaning"),
        ("+447000000009", "Can someone call me?"),
        ("+447000000010", "What are your prices?"),
        ("+447000000011", "Are you available this weekend?"),
        ("+447000000012", "I need a deep clean after builders"),
        ("+447000000013", "Can I send photos?"),
        ("+447000000014", "I only need carpet cleaning"),
        ("+447000000015", "Thanks, I'll think about it"),
    ]

    results = []
    for phone, message in test_cases:
        state = sessions.get_or_create(phone)
        reply, state, summary = engine.handle_message(phone, message, state)
        results.append({
            "phone": phone,
            "message": message,
            "reply": reply,
            "step": state.current_step,
            "service": state.lead.service,
        })
        print(f"  [{phone[-4:]}] Customer: {message}")
        print(f"         Assistant: {reply}")
        print(f"         Step: {state.current_step} | Service: {state.lead.service or '—'}")
        print()

    # ------------------------------------------------------------------
    # Flow tests
    # ------------------------------------------------------------------
    print_separator("Flow 1: Price Question")

    price_msgs = [
        "How much for end-of-tenancy cleaning?",
        "SW6",
        "2-bed flat",
        "Furnished",
        "Oven",
        "Next Friday",
        "This week",
        "Mike, 07700 111222",
    ]
    for msg in price_msgs:
        run_test(engine, sessions, logger, "+447000000100", msg)

    print_separator("Flow 2: Airbnb Cleaning")

    airbnb_msgs = [
        "Hi, I need Airbnb cleaning in Camden.",
        "NW1",
        "1-bed flat",
        "Linen and restocking",
        "2-3 times a week",
        "Next Monday",
        "This week",
        "James, 07700 111222",
    ]
    for msg in airbnb_msgs:
        run_test(engine, sessions, logger, "+447000000101", msg)

    print_separator("Flow 3: Human Handoff")

    handoff_msgs = [
        "Can I speak to someone?",
        "David, 07700 333444",
    ]
    for msg in handoff_msgs:
        run_test(engine, sessions, logger, "+447000000102", msg)

    print_separator("Flow 4: Office Cleaning")

    office_msgs = [
        "Do you do office cleaning?",
        "EC1A",
        "Office",
        "Kitchen and toilets",
        "About 20 desks",
        "Weekly",
        "Next Monday",
        "This week",
        "Rachel, 07700 444555",
    ]
    for msg in office_msgs:
        run_test(engine, sessions, logger, "+447000000103", msg)

    print_separator("Flow 5: After-Builders Cleaning")

    builder_msgs = [
        "I need cleaning after building work.",
        "SW19",
        "3-bed house",
        "Kitchen extension",
        "Heavy",
        "Yes please",
        "Next Tuesday",
        "This week",
        "Tom, 07700 555666",
    ]
    for msg in builder_msgs:
        run_test(engine, sessions, logger, "+447000000104", msg)

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print_separator("Test Summary")

    total = len(test_cases)
    replied = sum(1 for r in results if r["reply"])
    services_matched = sum(1 for r in results if r["service"])

    print(f"  Total test messages:    {total}")
    print(f"  Got replies:            {replied}/{total}")
    print(f"  Services matched:       {services_matched}/{total}")
    print(f"  Sessions created:       {len(sessions.all_sessions())}")
    print(f"  Logs written to:        {logger.log_dir}/")
    print()

    # Check for issues
    issues = []
    for r in results:
        if not r["reply"]:
            issues.append(f"  ✗ No reply for: '{r['message']}'")
        if "error" in r["reply"].lower() or "sorry" in r["reply"].lower():
            issues.append(f"  ⚠ Possible issue for: '{r['message']}' → '{r['reply']}'")

    if issues:
        print("  Issues found:")
        for issue in issues:
            print(issue)
    else:
        print("  ✓ All tests passed — no issues found")

    print()
    print("  Expected lead summaries logged for:")
    print("  • End-of-tenancy (Sarah, SW6, 2-bed flat)")
    print("  • Price question flow (Mike, SW6, 2-bed flat)")
    print("  • Airbnb (James, Camden/NW1, 1-bed flat)")
    print("  • Handoff (David, phone only)")
    print("  • Office (Rachel, EC1A, 20 desks)")
    print("  • After-builders (Tom, SW19, 3-bed house)")
    print()


if __name__ == "__main__":
    main()
