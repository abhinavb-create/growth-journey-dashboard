# Growth Journey AI Analyser — Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 16+
- An Anthropic account with API access

---

## Step 1 — Install Node dependencies (WhatsApp bridge)

```bash
cd analyser
npm install
```

This installs `whatsapp-web.js` and `qrcode-terminal`.

---

## Step 2 — Install Python dependencies

```bash
pip install -r requirements.txt
```

---

## Step 3 — Fill in `config.yaml`

Open `analyser/config.yaml` and fill in the following:

### Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Paste it as `anthropic_api_key` in config.yaml

### Gmail OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Go to **APIs & Services → Library** → search for **Gmail API** → Enable it
4. Go to **APIs & Services → Credentials** → **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Desktop app**
6. Download the JSON file and save it as `credentials.json` in the `analyser/` folder
7. Set `gmail_credentials: "./credentials.json"` in config.yaml

On first run, a browser window will open for OAuth consent. The token is then cached in `token.json`.

### Slack Bot Token
1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch**
2. Add the following **Bot Token Scopes** under **OAuth & Permissions**:
   - `channels:history`
   - `channels:read`
   - `im:history`
   - `im:read`
   - `users:read`
3. Click **Install to Workspace**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Paste it as `slack_bot_token: "xoxb-..."` in config.yaml
6. Invite the bot to relevant channels: `/invite @YourBotName`

---

## Step 4 — First run: WhatsApp QR scan

```bash
cd analyser
node wa_bridge.js
```

A QR code will appear in the terminal. On your phone:
1. Open WhatsApp
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR code

The session is cached in `.wwebjs_auth/` — subsequent runs won't need a rescan unless you log out.

Once connected, the bridge fetches messages and writes `wa_messages.json`, then exits automatically.

---

## Step 5 — Dry run (cost estimate)

```bash
python analyser.py --dry-run
```

This shows:
- How many messages were found per member per source
- Estimated token usage and cost
- No API calls are made, no files are written

---

## Step 6 — Run for real

```bash
python analyser.py
```

Or use the convenience script (runs WhatsApp bridge first):

```bash
./run.sh
```

### Optional flags

```bash
# Analyse only one person
python analyser.py --member "Anam Imteyaz"

# Use only specific sources
python analyser.py --sources gmail,slack

# Look back further
python analyser.py --days 30
```

---

## Step 7 — Check the dashboard

The dashboard reads `analyser/ai_scores.js` automatically on each page load.
AI-derived scores appear with an **🤖 AI** badge on skill bars in the manager deep-dive panel.

You can toggle AI scoring on/off with the **"AI Scoring: ON/OFF"** toggle in the header.

---

## Obsidian Vault

All analysis notes are written to `~/Obsidian/Growth Journey/`:

| File/Folder | Contents |
|---|---|
| `analyses/` | One markdown note per analysis run per member |
| `members/` | One summary note per team member (overwritten each run) |
| `_budget.md` | Running spend log |
| `_index.md` | Master table of all current AI scores |

**Self-learning:** Each run reads the previous analysis notes from `analyses/` and injects them as context into the next rating prompt. This means Claude improves its assessment over time as it sees trends.

---

## Budget Management

- Default cap: **$10.00** (set `budget_usd` in config.yaml)
- Default warning threshold: **$8.00** (set `budget_warn_usd`)
- Spend is tracked in `~/Obsidian/Growth Journey/_budget.md`
- If the cap is exceeded, the analyser aborts before making additional API calls

### Typical costs
- Per member per run: ~$0.01–$0.04 (Haiku, 50 messages per source)
- Full team (9 members): ~$0.10–$0.35 per run
- Monthly (weekly runs): ~$0.40–$1.40

---

## Troubleshooting

**"No AI scores yet" in the browser console**
→ Run `python analyser.py` at least once to generate `analyser/ai_scores.js`

**Gmail auth loop / browser doesn't open**
→ Delete `token.json` and re-run. Make sure the OAuth client type is "Desktop app" not "Web app".

**WhatsApp bridge exits immediately without QR**
→ Check Node.js version (`node --version` must be ≥16). Try deleting `.wwebjs_auth/` and re-running.

**Slack returns no messages**
→ Make sure the bot is invited to the channels: `/invite @YourBotName`

**Budget exceeded error**
→ Increase `budget_usd` in config.yaml, or wait until next cycle and reset `_budget.md` manually.
