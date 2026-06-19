"""
gmail_source.py — Fetch Gmail messages for Growth Journey AI Analyser

Uses Gmail API with OAuth2. On first run, opens a browser for consent.
Token is cached in token.json next to the credentials file.
"""

import os
import json
import base64
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path


SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# ─── AUTH ─────────────────────────────────────────────────────────────────────

def _get_service(credentials_path: str):
    """Build and return an authenticated Gmail service object."""
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds_file = Path(credentials_path).expanduser()
    token_file = creds_file.parent / 'token.json'

    creds = None
    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_file), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_file, 'w') as f:
            f.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _get_header(headers: list, name: str) -> str:
    for h in headers:
        if h['name'].lower() == name.lower():
            return h['value']
    return ''


def _decode_body(payload: dict) -> str:
    """Extract plain-text body (first 500 chars) from a Gmail message payload."""
    def _extract(part):
        mime = part.get('mimeType', '')
        if mime == 'text/plain':
            data = part.get('body', {}).get('data', '')
            if data:
                return base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
        if 'parts' in part:
            for sub in part['parts']:
                result = _extract(sub)
                if result:
                    return result
        return ''

    body = _extract(payload)
    # Strip excessive whitespace / quoted sections
    body = re.sub(r'\n{3,}', '\n\n', body)
    body = re.sub(r'On .{0,80} wrote:.*', '', body, flags=re.DOTALL)
    return body[:500].strip()


def _name_query(name: str) -> str:
    """Build a Gmail search query that looks for the person's name."""
    # Use first + last name combinations for better precision
    parts = name.split()
    queries = []
    # Full name
    queries.append(f'"{name}"')
    # First name + last name separately in case they appear apart
    if len(parts) >= 2:
        queries.append(f'"{parts[0]} {parts[-1]}"')
    return ' OR '.join(queries)


# ─── PUBLIC API ───────────────────────────────────────────────────────────────

def fetch_gmail_messages(team_members: list[str], credentials_path: str, lookback_days: int = 14) -> dict:
    """
    Fetch Gmail messages related to each team member.

    Returns:
        dict mapping member name → list of message dicts:
          { subject, body_snippet, from, to, date }
    """
    if not credentials_path:
        print('[gmail] No credentials path configured.')
        print('[gmail] Setup: download credentials.json from Google Cloud Console')
        print('[gmail]   → APIs & Services → Credentials → OAuth 2.0 Client IDs → Download JSON')
        print('[gmail]   → Set gmail_credentials in config.yaml to the file path.')
        return {m: [] for m in team_members}

    creds_path = Path(credentials_path).expanduser()
    if not creds_path.exists():
        print(f'[gmail] Credentials file not found: {creds_path}')
        print('[gmail] Skipping Gmail source.')
        return {m: [] for m in team_members}

    try:
        service = _get_service(credentials_path)
    except Exception as e:
        print(f'[gmail] Auth failed: {e}')
        print('[gmail] Skipping Gmail source.')
        return {m: [] for m in team_members}

    cutoff = datetime.now(tz=timezone.utc) - timedelta(days=lookback_days)
    after_epoch = int(cutoff.timestamp())

    result = {m: [] for m in team_members}

    for member in team_members:
        query = f'({_name_query(member)}) after:{after_epoch}'
        try:
            resp = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=50,
            ).execute()
        except Exception as e:
            print(f'[gmail] Error listing messages for {member}: {e}')
            continue

        messages_meta = resp.get('messages', [])
        if not messages_meta:
            continue

        for meta in messages_meta:
            try:
                msg = service.users().messages().get(
                    userId='me',
                    id=meta['id'],
                    format='full',
                ).execute()
            except Exception:
                continue

            payload = msg.get('payload', {})
            headers = payload.get('headers', [])

            subject = _get_header(headers, 'Subject')
            from_   = _get_header(headers, 'From')
            to_     = _get_header(headers, 'To')
            date_   = _get_header(headers, 'Date')
            body    = _decode_body(payload)

            result[member].append({
                'subject':      subject[:200],
                'body_snippet': body,
                'from':         from_[:150],
                'to':           to_[:150],
                'date':         date_[:100],
            })

        print(f'[gmail] {member}: {len(result[member])} emails found')

    return result


if __name__ == '__main__':
    # Quick test
    import yaml
    cfg = yaml.safe_load(open('config.yaml'))
    members = [
        'Anam Imteyaz', 'Chandel Yajat', 'Suman Soumya Dash',
        'Harsha Thomas John', 'Kirubhavani B', 'Nishi Agarwal',
        'Mary L. Pulamte', 'Milind Singh Bora', 'Priyanka Pati',
    ]
    data = fetch_gmail_messages(members, cfg.get('gmail_credentials', ''), cfg.get('lookback_days', 14))
    for m, msgs in data.items():
        print(f'{m}: {len(msgs)} emails')
