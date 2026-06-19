#!/bin/bash
# run.sh — Run WhatsApp bridge (Node), then Python analyser
# Usage: ./run.sh [--days 14] [--member "Name"] [--dry-run] [--sources gmail,slack,whatsapp]

set -euo pipefail
cd "$(dirname "$0")"

DAYS=${GROWTH_DAYS:-14}

echo "🔄 Starting WhatsApp bridge..."
# Run in background, give it 45 seconds to fetch, then kill
node wa_bridge.js --days "$DAYS" &
WA_PID=$!

echo "   Waiting 45s for WhatsApp to fetch messages (PID: $WA_PID)..."
sleep 45
kill "$WA_PID" 2>/dev/null && echo "   WhatsApp bridge stopped." || echo "   WhatsApp bridge already exited."

echo ""
echo "🤖 Running AI analyser..."
python analyser.py --days "$DAYS" "$@"
