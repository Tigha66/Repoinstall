"""
LeadReply — Google Sheets Lead Logger
Logs leads to a Google Sheet via the Google Sheets API.

Setup:
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account
4. Download the credentials JSON file
5. Share your Google Sheet with the service account email
6. Set the GOOGLE_CREDENTIALS_PATH and GOOGLE_SHEET_ID env vars

Usage:
    from flows.google_sheets import GoogleSheetsLogger
    logger = GoogleSheetsLogger(sheet_id="your-sheet-id")
    logger.log_lead(lead_data)
"""

import os
import json
from pathlib import Path
from typing import Optional

try:
    import gspread
    from google.oauth2.service_account import Credentials
    HAS_GSPREAD = True
except ImportError:
    HAS_GSPREAD = False


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

DEFAULT_HEADERS = [
    "Date",
    "Customer Name",
    "Phone",
    "Service",
    "Postcode",
    "Property Type",
    "Rooms",
    "Extras",
    "Preferred Date",
    "Urgency",
    "Lead Quality",
    "Summary",
    "Status",
    "Notes",
]


class GoogleSheetsLogger:
    """Log leads to a Google Sheet."""

    def __init__(
        self,
        sheet_id: Optional[str] = None,
        credentials_path: Optional[str] = None,
    ):
        if not HAS_GSPREAD:
            raise ImportError(
                "gspread and google-auth are required. "
                "Install with: pip install gspread google-auth"
            )

        self.sheet_id = sheet_id or os.environ.get("GOOGLE_SHEET_ID", "")
        self.credentials_path = (
            credentials_path
            or os.environ.get("GOOGLE_CREDENTIALS_PATH", "")
            or "credentials.json"
        )
        self._client = None
        self._sheet = None

    def _get_client(self):
        if self._client is None:
            creds = Credentials.from_service_account_file(
                self.credentials_path, scopes=SCOPES
            )
            self._client = gspread.authorize(creds)
        return self._client

    def _get_sheet(self):
        if self._sheet is None:
            client = self._get_client()
            spreadsheet = client.open_by_key(self.sheet_id)
            self._sheet = spreadsheet.sheet1
            # Ensure headers exist
            existing = self._sheet.row_values(1)
            if not existing:
                self._sheet.append_row(DEFAULT_HEADERS)
        return self._sheet

    def log_lead(self, lead_data) -> str:
        """Append a lead to the Google Sheet. Returns the row number."""
        sheet = self._get_sheet()
        row = lead_data.to_google_sheet_row()
        result = sheet.append_row(row)
        return result.get("updates", {}).get("updatedRange", "unknown")

    def get_all_leads(self) -> list[dict]:
        """Get all leads from the sheet."""
        sheet = self._get_sheet()
        return sheet.get_all_records()

    def update_status(self, row_number: int, status: str) -> None:
        """Update the status column for a given row."""
        sheet = self._get_sheet()
        # Status is column 12 (L)
        sheet.update_cell(row_number, 12, status)


class ConsoleLogger:
    """Fallback logger that prints to console."""

    def log_lead(self, lead_data) -> str:
        row = lead_data.to_google_sheet_row()
        print("\n📋 LEAD LOGGED TO CONSOLE:")
        for header, value in zip(DEFAULT_HEADERS, row):
            print(f"  {header}: {value}")
        return "console"

    def get_all_leads(self) -> list[dict]:
        return []

    def update_status(self, row_number: int, status: str) -> None:
        print(f"  Status updated to: {status}")


def get_logger(
    sheet_id: Optional[str] = None,
    credentials_path: Optional[str] = None,
):
    """Factory: returns GoogleSheetsLogger if credentials available, else ConsoleLogger."""
    if HAS_GSPREAD and (sheet_id or os.environ.get("GOOGLE_SHEET_ID")):
        try:
            return GoogleSheetsLogger(sheet_id=sheet_id, credentials_path=credentials_path)
        except Exception as e:
            print(f"⚠ Google Sheets not available ({e}), falling back to console logger")
    return ConsoleLogger()
