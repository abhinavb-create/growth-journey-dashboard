from __future__ import annotations
"""
claude_rater.py — Core Claude AI rating engine for Growth Journey AI Analyser

Rates each team member across:
  - 9 skills (all levels)
  - 6 leadership competencies (SA and above)

Uses claude-3-haiku-20240307 for cost efficiency.
"""

import json
import re
from typing import Optional

import anthropic

from budget_tracker import BudgetTracker, BudgetExceededError


# ─── SKILL + LEADERSHIP KEYS ──────────────────────────────────────────────────

SKILL_KEYS = [
    'sales', 'reporting', 'maturity', 'independence',
    'ai_adoption', 'cross_functional', 'escalation', 'communication', 'enthusiasm',
]

LEADERSHIP_KEYS = [
    'people_leadership', 'vision_strategy', 'stakeholder_influence',
    'developing_others', 'resilience', 'decision_quality',
]

# Levels at which leadership competencies are evaluated
LEADERSHIP_LEVELS = {'SA', 'AM', 'M', 'SM'}


# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert people analytics engine for a sales and business development team.
Your task is to analyse communication data (WhatsApp, Gmail, Slack messages) and rate a team member across behavioural competencies.

You will be given:
1. The person's name and current level in the organisation
2. Their historical analysis notes (if any) — use these for continuity and to detect trends
3. Their recent messages grouped by source

Rate each competency on a 0-100 scale based only on observable evidence in the messages.
Be fair, nuanced, and specific — back your scores with evidence from the messages.

━━━ SKILL DEFINITIONS ━━━

**sales (0-100)**
Look for: mentions of client pitches, deal progression, revenue conversations, pipeline updates, client relationship building, handling objections, closing signals, follow-up discipline.
High (80-100): Frequent deal-focused language, proactive pipeline updates, revenue ownership, client-centric framing.
Medium (50-79): Occasional sales references, some client communication, basic follow-up.
Low (0-49): Little/no sales language, reactive rather than proactive on deals.

**reporting (0-100)**
Look for: structured status updates, use of data/numbers in updates, clear summaries, dashboards mentioned, meeting recaps, quantified outcomes.
High (80-100): Every update is structured with numbers, context, and next steps. Clear and easy to parse.
Medium (50-79): Some structured updates but inconsistent or missing data context.
Low (0-49): Vague updates, no data, difficult to understand progress from messages.

**maturity (0-100)**
Look for: composure under pressure, professional language even in difficult situations, avoiding blame or drama, handling criticism gracefully, measured responses to setbacks.
High (80-100): Consistently calm, constructive, never escalates interpersonally, models professionalism.
Medium (50-79): Generally professional with occasional lapses in tone.
Low (0-49): Reactive language, drama-creating, blame-shifting, unprofessional in stressed moments.

**independence (0-100)**
Look for: problem-solving without asking for help, ownership signals ("I took care of it", "I figured out"), bringing solutions not just problems, self-direction.
High (80-100): Solves problems before reporting them, rarely asks for basic guidance, demonstrates initiative.
Medium (50-79): Handles most tasks independently but checks in frequently on judgment calls.
Low (0-49): Frequent dependency on others, asks many basic questions, waits for direction.

**ai_adoption (0-100)**
Look for: mentions of ChatGPT, Claude, Gemini, Copilot, automation tools, AI-assisted workflows, prompts, "I used AI to...", productivity automation, tool exploration.
High (80-100): Actively uses multiple AI tools, shares AI workflows with team, innovates with AI.
Medium (50-79): Occasionally mentions AI tools, experimenting.
Low (0-49): No evidence of AI tool usage in messages.

**cross_functional (0-100)**
Look for: coordination with other teams (finance, tech, ops, marketing), cross-team shoutouts, joint project references, stakeholder outreach beyond own team.
High (80-100): Actively collaborates across functions, drives joint initiatives, strong cross-team relationships.
Medium (50-79): Some cross-team interaction, participates in joint work.
Low (0-49): Appears to work only within own team silo.

**escalation (0-100) — INVERTED SCALE**
IMPORTANT: This metric measures escalation frequency. Lower score = healthier behaviour.
Look for: how often they escalate issues to the manager, whether they try to solve first, quality of escalation context (do they include what they tried?).
Score 0-25: Excellent — Almost never escalates, resolves independently, when they do escalate they include full context and proposed solutions.
Score 26-45: Good — Occasional escalations, mostly with context and attempted solutions.
Score 46-65: Moderate — Escalates regularly, sometimes without trying first.
Score 66-100: Concerning — Over-escalates, seeks manager input on decisions they should own, does not include context.

**communication (0-100)**
Look for: response timeliness signals (quick acknowledgements, follow-ups), clarity of written messages, appropriate length (not too verbose, not too terse), follow-through on commitments, confirmation of understanding.
High (80-100): Clear, concise, timely, follows through, adapts style to audience, no loose ends.
Medium (50-79): Generally communicates well but occasionally unclear or slow to respond.
Low (0-49): Messages are vague, late, miss key context, or drop threads.

**enthusiasm (0-100)**
Look for: energy words ("excited", "great opportunity", "let's do this"), going beyond minimum, volunteering for things, proactive suggestions, positive framing, initiative signals.
High (80-100): Consistently energetic, volunteers, brings ideas, lifts team energy.
Medium (50-79): Generally positive but not distinctly proactive.
Low (0-49): Flat or negative tone, minimal initiative, just completing tasks.

━━━ LEADERSHIP COMPETENCIES (SA and above only) ━━━

**people_leadership (0-100)**
Look for: mentoring junior team members, running 1:1s, giving feedback, team development activities, protecting team from pressure, defending team members.

**vision_strategy (0-100)**
Look for: forward-looking thinking, team goal-setting language, connecting daily work to bigger picture, strategic suggestions, roadmap thinking.

**stakeholder_influence (0-100)**
Look for: managing up/across, senior stakeholder communication, influencing without authority, navigating org politics constructively.

**developing_others (0-100)**
Look for: coaching language, sharing knowledge proactively, creating learning opportunities for team, running workshops or training.

**resilience (0-100)**
Look for: bouncing back language after setbacks, maintaining performance signals during challenging periods, constructive response to failure.

**decision_quality (0-100)**
Look for: evidence of independent decision-making, structured thinking in how they present choices, ownership of decisions and their outcomes.

━━━ SCORING RULES ━━━

1. Score only what you can see evidence for. If there are no messages, return null for all skills (do not penalise for silence).
2. If messages exist but a specific skill cannot be assessed from them, return null for that skill.
3. Never assume negative intent — give benefit of the doubt on ambiguous messages.
4. For leadership competencies at JA/A level: always return 0 (not yet evaluated).
5. Return a confidence value (0.0 to 1.0) reflecting how much data you had to work with.
   - 0.0-0.3: Very few messages, low confidence
   - 0.4-0.6: Moderate data, some inference required
   - 0.7-1.0: Rich data, confident assessment

━━━ OUTPUT FORMAT ━━━

Return ONLY valid JSON in this exact structure (no markdown fences, no preamble):
{
  "skills": {
    "sales": <integer 0-100 or null>,
    "reporting": <integer 0-100 or null>,
    "maturity": <integer 0-100 or null>,
    "independence": <integer 0-100 or null>,
    "ai_adoption": <integer 0-100 or null>,
    "cross_functional": <integer 0-100 or null>,
    "escalation": <integer 0-100 or null>,
    "communication": <integer 0-100 or null>,
    "enthusiasm": <integer 0-100 or null>
  },
  "leadership": {
    "people_leadership": <integer 0-100 or null>,
    "vision_strategy": <integer 0-100 or null>,
    "stakeholder_influence": <integer 0-100 or null>,
    "developing_others": <integer 0-100 or null>,
    "resilience": <integer 0-100 or null>,
    "decision_quality": <integer 0-100 or null>
  },
  "reasoning": "<paragraph explaining your overall assessment and key evidence>",
  "key_observations": [
    "<specific observation 1 with evidence>",
    "<specific observation 2 with evidence>",
    "<specific observation 3 with evidence>"
  ],
  "confidence": <float 0.0-1.0>
}
"""


# ─── MESSAGE FORMATTING ───────────────────────────────────────────────────────

def _format_messages_block(messages_by_source: dict) -> str:
    """Format messages from all sources into a readable block for the prompt."""
    parts = []
    total_msgs = 0

    for source, messages in messages_by_source.items():
        if not messages:
            continue
        parts.append(f'### {source.upper()} Messages ({len(messages)} messages)\n')
        for i, msg in enumerate(messages[:50], 1):  # cap at 50 per source
            if source == 'whatsapp':
                parts.append(
                    f'{i}. [{msg.get("ts", "")[:10]}] '
                    f'[Chat: {msg.get("chat", "")}] '
                    f'{msg.get("from", "")}: '
                    f'{msg.get("body", "")}'
                )
            elif source == 'gmail':
                parts.append(
                    f'{i}. [{msg.get("date", "")[:10]}] '
                    f'Subject: {msg.get("subject", "")} | '
                    f'From: {msg.get("from", "")} | '
                    f'{msg.get("body_snippet", "")}'
                )
            elif source == 'slack':
                parts.append(
                    f'{i}. [{msg.get("ts", "")[:10]}] '
                    f'#{msg.get("channel", "")} '
                    f'@{msg.get("username", "")}: '
                    f'{msg.get("text", "")}'
                )
        total_msgs += len(messages)
        parts.append('')

    if total_msgs == 0:
        return 'No messages available from any source.'

    return '\n'.join(parts)


def _validate_scores(data: dict) -> dict:
    """Validate and clamp all scores to 0-100 range."""
    for key in SKILL_KEYS:
        val = data.get('skills', {}).get(key)
        if val is not None:
            data['skills'][key] = max(0, min(100, int(val)))

    for key in LEADERSHIP_KEYS:
        val = data.get('leadership', {}).get(key)
        if val is not None:
            data['leadership'][key] = max(0, min(100, int(val)))

    conf = data.get('confidence', 0.5)
    data['confidence'] = max(0.0, min(1.0, float(conf)))

    return data


# ─── MAIN RATING FUNCTION ─────────────────────────────────────────────────────

def rate_member(
    name: str,
    level: str,
    messages_by_source: dict,
    history_context: str,
    config: dict,
    tracker: BudgetTracker,
    dry_run: bool = False,
) -> Optional[dict]:
    """
    Rate a team member using Claude.

    Args:
        name: Full name of the team member
        level: Their level code (JA, A, SA, AM, M, SM)
        messages_by_source: { 'whatsapp': [...], 'gmail': [...], 'slack': [...] }
        history_context: Concatenated previous Obsidian analysis notes (for self-learning)
        config: Parsed config.yaml
        tracker: BudgetTracker instance for this run
        dry_run: If True, estimate cost but don't call API

    Returns:
        {
            skills:           { skill_key: int|None, ... },
            leadership:       { ldr_key: int|None, ... },
            reasoning:        str,
            key_observations: [str, ...],
            confidence:       float,
            cost:             float,
            sources_used:     [str, ...]
        }
        or None if skipped due to budget
    """
    model = config.get('model_rate', 'claude-3-haiku-20240307')

    total_messages = sum(len(v) for v in messages_by_source.values())
    sources_used   = [s for s, msgs in messages_by_source.items() if msgs]

    # ── Build user message ─────────────────────────────────────────────────
    history_section = ''
    if history_context:
        history_section = f"""
## Previous Analysis History (for context and trend detection)
{history_context}

---
"""

    messages_block = _format_messages_block(messages_by_source)

    user_message = f"""Please rate the following team member:

**Name:** {name}
**Level:** {level}
**Total messages available:** {total_messages}
**Sources:** {', '.join(sources_used) if sources_used else 'none'}
{history_section}
## Recent Messages to Analyse

{messages_block}

Rate this person on all 9 skills and 6 leadership competencies (leadership only if level is SA or above).
For level {level}: {"Include leadership competencies." if level in LEADERSHIP_LEVELS else "Set all leadership scores to 0 (not yet evaluated at this level)."}
"""

    # ── Dry run cost estimate ──────────────────────────────────────────────
    from budget_tracker import estimate_message_tokens, estimate_cost
    input_tokens  = estimate_message_tokens(SYSTEM_PROMPT + user_message)
    output_tokens = 600  # estimated JSON response
    estimated_cost = estimate_cost(input_tokens, output_tokens, model)

    if dry_run:
        print(f'  [dry-run] {name}: ~{input_tokens} input tokens, ~{output_tokens} output tokens, '
              f'est. ${estimated_cost:.4f}')
        # Return zero scores for dry run
        return {
            'skills':           {k: None for k in SKILL_KEYS},
            'leadership':       {k: 0 for k in LEADERSHIP_KEYS},
            'reasoning':        'Dry run — no API call made.',
            'key_observations': [],
            'confidence':       0.0,
            'cost':             estimated_cost,
            'sources_used':     sources_used,
            'dry_run':          True,
        }

    # ── Budget check ────────────────────────────────────────────────────────
    try:
        tracker.check_before_call(estimated_cost)
    except BudgetExceededError as e:
        print(f'  [budget] Skipping {name}: {e}')
        return None

    # ── Call Claude ─────────────────────────────────────────────────────────
    if not config.get('anthropic_api_key'):
        raise ValueError('anthropic_api_key is not set in config.yaml')

    client = anthropic.Anthropic(api_key=config['anthropic_api_key'])

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{'role': 'user', 'content': user_message}],
    )

    # ── Record spend ────────────────────────────────────────────────────────
    actual_input  = response.usage.input_tokens
    actual_output = response.usage.output_tokens
    actual_cost   = tracker.record(
        actual_input, actual_output, model,
        f'Rate {name} ({level}) via {", ".join(sources_used) or "no sources"}'
    )

    # ── Parse response ──────────────────────────────────────────────────────
    raw_text = response.content[0].text.strip()

    # Strip markdown code fences if present
    raw_text = re.sub(r'^```(?:json)?\n?', '', raw_text)
    raw_text = re.sub(r'\n?```$', '', raw_text)

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        m = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if m:
            data = json.loads(m.group(0))
        else:
            raise ValueError(f'Could not parse JSON from Claude response for {name}:\n{raw_text[:500]}')

    # Ensure all expected keys exist
    if 'skills' not in data:
        data['skills'] = {}
    if 'leadership' not in data:
        data['leadership'] = {}
    for k in SKILL_KEYS:
        data['skills'].setdefault(k, None)
    for k in LEADERSHIP_KEYS:
        data['leadership'].setdefault(k, 0 if level not in LEADERSHIP_LEVELS else None)

    # Validate and clamp scores
    data = _validate_scores(data)

    data['cost']         = actual_cost
    data['sources_used'] = sources_used

    return data
