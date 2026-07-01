from __future__ import annotations
"""
slack_source.py — Fetch Slack messages for Growth Journey AI Analyser

Uses slack-sdk with a bot token. The bot must be added to channels to read them.
Required scopes: channels:history, channels:read, im:history, im:read, users:read
"""

import re
from datetime import datetime, timedelta, timezone


# ─── FUZZY NAME MATCHING ──────────────────────────────────────────────────────

def _normalize(s: str) -> str:
    return re.sub(r'[^a-z\s]', '', s.lower()).strip()


def _match_member(display_name: str, real_name: str, team_members: list[str]) -> str | None:
    """Return canonical member name if display_name or real_name matches, else None."""
    candidates = [_normalize(display_name), _normalize(real_name)]

    for member in team_members:
        norm_member = _normalize(member)
        parts = norm_member.split()

        for cand in candidates:
            if not cand:
                continue
            # Full name
            if norm_member in cand or cand in norm_member:
                return member
            # First name (≥4 chars)
            if parts[0] and len(parts[0]) >= 4 and parts[0] in cand:
                return member
            # Last name (≥4 chars)
            if parts[-1] and len(parts[-1]) >= 4 and parts[-1] in cand:
                return member
            # Two-word bigram
            for i in range(len(parts) - 1):
                bigram = parts[i] + ' ' + parts[i + 1]
                if bigram in cand:
                    return member

    return None


# ─── PUBLIC API ───────────────────────────────────────────────────────────────

def fetch_slack_messages(team_members: list[str], bot_token: str, lookback_days: int = 14) -> dict:
    """
    Fetch Slack messages mentioning or sent by each team member.

    Returns:
        dict mapping member name → list of message dicts:
          { channel, text, ts, username }
    """
    if not bot_token:
        print('[slack] No bot token configured.')
        print('[slack] Setup:')
        print('[slack]   1. Go to https://api.slack.com/apps and create a new app')
        print('[slack]   2. Add OAuth scopes: channels:history, channels:read, im:history, im:read, users:read')
        print('[slack]   3. Install app to your workspace')
        print('[slack]   4. Copy the Bot User OAuth Token (xoxb-...) into config.yaml → slack_bot_token')
        return {m: [] for m in team_members}

    try:
        from slack_sdk import WebClient
        from slack_sdk.errors import SlackApiError
    except ImportError:
        print('[slack] slack-sdk not installed. Run: pip install slack-sdk')
        return {m: [] for m in team_members}

    client = WebClient(token=bot_token)

    # ── Build user map: user_id → { display_name, real_name } ─────────────────
    user_map: dict[str, dict] = {}
    try:
        cursor = None
        while True:
            kwargs = {'limit': 200}
            if cursor:
                kwargs['cursor'] = cursor
            resp = client.users_list(**kwargs)
            for u in resp.get('members', []):
                profile = u.get('profile', {})
                user_map[u['id']] = {
                    'display_name': profile.get('display_name', '') or u.get('name', ''),
                    'real_name':    profile.get('real_name', '') or '',
                }
            cursor = resp.get('response_metadata', {}).get('next_cursor')
            if not cursor:
                break
    except SlackApiError as e:
        print(f'[slack] Failed to fetch user list: {e.response["error"]}')

    # ── Build member-to-user-id map ─────────────────────────────────────────
    member_user_ids: dict[str, list[str]] = {m: [] for m in team_members}
    for uid, info in user_map.items():
        matched = _match_member(info['display_name'], info['real_name'], team_members)
        if matched:
            member_user_ids[matched].append(uid)

    # ── Gather channels ────────────────────────────────────────────────────
    channels = []
    try:
        cursor = None
        while True:
            kwargs = {'types': 'public_channel,private_channel', 'limit': 200, 'exclude_archived': True}
            if cursor:
                kwargs['cursor'] = cursor
            resp = client.conversations_list(**kwargs)
            channels.extend(resp.get('channels', []))
            cursor = resp.get('response_metadata', {}).get('next_cursor')
            if not cursor:
                break
    except SlackApiError as e:
        print(f'[slack] Failed to list channels: {e.response["error"]}')

    # ── Gather DMs the bot is in ───────────────────────────────────────────
    try:
        cursor = None
        while True:
            kwargs = {'types': 'im', 'limit': 200}
            if cursor:
                kwargs['cursor'] = cursor
            resp = client.conversations_list(**kwargs)
            channels.extend(resp.get('channels', []))
            cursor = resp.get('response_metadata', {}).get('next_cursor')
            if not cursor:
                break
    except SlackApiError as e:
        print(f'[slack] Failed to list DMs: {e.response.get("error", str(e))}')

    cutoff_ts = (datetime.now(tz=timezone.utc) - timedelta(days=lookback_days)).timestamp()

    result: dict[str, list] = {m: [] for m in team_members}

    for ch in channels:
        ch_id   = ch['id']
        ch_name = ch.get('name', ch_id)

        messages = []
        try:
            cursor = None
            while True:
                kwargs = {
                    'channel':  ch_id,
                    'oldest':   str(cutoff_ts),
                    'limit':    200,
                }
                if cursor:
                    kwargs['cursor'] = cursor
                resp = client.conversations_history(**kwargs)
                messages.extend(resp.get('messages', []))
                cursor = resp.get('response_metadata', {}).get('next_cursor')
                if not cursor or not resp.get('has_more'):
                    break
        except SlackApiError as e:
            err = e.response.get('error', '')
            if err not in ('not_in_channel', 'channel_not_found', 'missing_scope'):
                print(f'[slack] Error fetching #{ch_name}: {err}')
            continue

        for msg in messages:
            if msg.get('subtype'):
                continue  # skip join/leave/bot messages
            text = msg.get('text', '').strip()
            if not text:
                continue

            user_id = msg.get('user', '')
            info    = user_map.get(user_id, {})
            display = info.get('display_name', '')
            real    = info.get('real_name', '')
            username = display or real or user_id

            entry = {
                'channel':  ch_name,
                'text':     text[:600],
                'ts':       datetime.fromtimestamp(float(msg.get('ts', 0)), tz=timezone.utc).isoformat(),
                'username': username,
            }

            # 1. Message was sent by a team member
            matched_sender = _match_member(display, real, team_members)
            if matched_sender:
                result[matched_sender].append(entry)
                continue

            # 2. Message mentions a team member by display name or @user_id
            for member in team_members:
                # Check body text for name mentions
                if _normalize(member) in _normalize(text):
                    result[member].append({**entry, 'attributed': 'text_mention'})
                    continue
                # Check @uid mentions
                for uid in member_user_ids.get(member, []):
                    if f'<@{uid}>' in text:
                        result[member].append({**entry, 'attributed': 'at_mention'})
                        break

    for member, msgs in result.items():
        # Deduplicate (same ts + channel)
        seen = set()
        deduped = []
        for m in msgs:
            key = (m['channel'], m['ts'])
            if key not in seen:
                seen.add(key)
                deduped.append(m)
        result[member] = deduped
        if deduped:
            print(f'[slack] {member}: {len(deduped)} messages')

    return result


if __name__ == '__main__':
    import yaml
    cfg = yaml.safe_load(open('config.yaml'))
    members = [
        'Anam Imteyaz', 'Chandel Yajat', 'Suman Soumya Dash',
        'Harsha Thomas John', 'Kirubhavani B', 'Nishi Agarwal',
        'Mary L. Pulamte', 'Milind Singh Bora', 'Priyanka Pati',
    ]
    data = fetch_slack_messages(members, cfg.get('slack_bot_token', ''), cfg.get('lookback_days', 14))
    for m, msgs in data.items():
        print(f'{m}: {len(msgs)} Slack messages')
