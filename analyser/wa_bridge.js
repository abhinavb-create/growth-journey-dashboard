/**
 * wa_bridge.js — WhatsApp Web bridge for Growth Journey AI Analyser
 *
 * Usage:
 *   node wa_bridge.js [--days 14] [--members '[...]'] [--output ./wa_messages.json]
 *
 * On first run, a QR code is printed to the terminal.
 * Scan it with WhatsApp mobile → Settings → Linked Devices → Link a Device.
 * Session is cached in .wwebjs_auth/ so subsequent runs don't need a scan.
 */

'use strict';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode  = require('qrcode-terminal');
const fs      = require('fs');
const path    = require('path');

/* ── CLI ARGS ─────────────────────────────────────────────── */
const args = process.argv.slice(2);
function getArg(flag, def) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return def;
}
const DAYS        = parseInt(getArg('--days', '14'), 10);
const OUTPUT_FILE = getArg('--output', path.join(__dirname, 'wa_messages.json'));
const MEMBERS_RAW = getArg('--members', null);

/* ── DEFAULT TEAM MEMBERS ─────────────────────────────────── */
const DEFAULT_MEMBERS = [
  'Anam Imteyaz',
  'Chandel Yajat',
  'Suman Soumya Dash',
  'Harsha Thomas John',
  'Kirubhavani B',
  'Nishi Agarwal',
  'Mary L. Pulamte',
  'Milind Singh Bora',
  'Priyanka Pati',
];

const TEAM_MEMBERS = MEMBERS_RAW ? JSON.parse(MEMBERS_RAW) : DEFAULT_MEMBERS;

/* ── FUZZY NAME MATCHING ──────────────────────────────────── */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

function extractFirstNames(fullName) {
  return normalize(fullName).split(/\s+/);
}

/**
 * Returns the canonical team member name if the given string matches,
 * otherwise null. Matches on first name, last name, or two-word substring.
 */
function matchMember(str) {
  const normStr = normalize(str);
  for (const member of TEAM_MEMBERS) {
    const parts = extractFirstNames(member);
    // Full name match
    if (normStr.includes(normalize(member))) return member;
    // First name match (must be at least 4 chars to avoid false positives)
    if (parts[0].length >= 4 && normStr.includes(parts[0])) return member;
    // Last name match
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 4 && normStr.includes(lastName)) return member;
    // Two consecutive parts
    for (let i = 0; i < parts.length - 1; i++) {
      const bigram = parts[i] + ' ' + parts[i + 1];
      if (normStr.includes(bigram)) return member;
    }
  }
  return null;
}

/* ── CUTOFF DATE ──────────────────────────────────────────── */
const cutoffMs = Date.now() - DAYS * 24 * 60 * 60 * 1000;

/* ── MAIN ─────────────────────────────────────────────────── */
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\n========================================');
  console.log('Scan this QR code with WhatsApp mobile:');
  console.log('  Settings → Linked Devices → Link a Device');
  console.log('========================================\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('[wa_bridge] Authenticated — session cached for future runs.');
});

client.on('auth_failure', (msg) => {
  console.error('[wa_bridge] Auth failure:', msg);
  process.exit(1);
});

client.on('ready', async () => {
  console.log(`[wa_bridge] Connected. Fetching messages from last ${DAYS} days...`);

  /** @type {Object.<string, Array>} */
  const result = {};
  for (const member of TEAM_MEMBERS) {
    result[member] = [];
  }

  try {
    const chats = await client.getChats();
    console.log(`[wa_bridge] Found ${chats.length} chats total.`);

    for (const chat of chats) {
      const chatName = chat.name || '';

      // Determine which team member(s) this chat is about / involves
      const chatMemberMatch = matchMember(chatName);

      // Fetch messages within the lookback window
      // whatsapp-web.js limits: fetch up to 100 messages at a time
      let messages = [];
      try {
        // fetchMessages returns newest first
        const rawMsgs = await chat.fetchMessages({ limit: 200 });
        messages = rawMsgs.filter((msg) => msg.timestamp * 1000 >= cutoffMs);
      } catch (e) {
        // Some chats may not support message fetching
        continue;
      }

      if (messages.length === 0) continue;

      for (const msg of messages) {
        if (!msg.body || msg.body.trim() === '') continue;

        // Get sender display name
        let senderName = '';
        try {
          const contact = await msg.getContact();
          senderName = contact.pushname || contact.name || msg.author || '';
        } catch (_) {
          senderName = msg.author || '';
        }

        const msgEntry = {
          from: senderName,
          body: msg.body.slice(0, 600),  // cap at 600 chars to keep tokens low
          ts: new Date(msg.timestamp * 1000).toISOString(),
          chat: chatName,
        };

        // 1. If this chat is named after a team member, attribute all messages to them
        if (chatMemberMatch) {
          result[chatMemberMatch].push(msgEntry);
          continue;
        }

        // 2. Try to match the sender name to a team member
        const senderMatch = matchMember(senderName);
        if (senderMatch) {
          result[senderMatch].push(msgEntry);
          continue;
        }

        // 3. If the message body mentions a team member, attribute to them
        for (const member of TEAM_MEMBERS) {
          if (matchMember(msg.body) === member) {
            result[member].push({ ...msgEntry, attributed: 'body_mention' });
          }
        }
      }
    }

    // Write output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

    // Summary
    let total = 0;
    for (const [member, msgs] of Object.entries(result)) {
      if (msgs.length > 0) {
        console.log(`  ${member}: ${msgs.length} messages`);
        total += msgs.length;
      }
    }
    console.log(`\n[wa_bridge] Done. ${total} messages written to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('[wa_bridge] Error fetching chats:', err.message);
    // Write empty result so analyser can still run
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  }

  await client.destroy();
  process.exit(0);
});

client.on('disconnected', (reason) => {
  console.log('[wa_bridge] Disconnected:', reason);
  process.exit(1);
});

console.log('[wa_bridge] Initialising WhatsApp Web client...');
client.initialize();
