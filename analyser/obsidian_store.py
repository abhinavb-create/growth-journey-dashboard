"""
obsidian_store.py — Manages the Obsidian vault for Growth Journey AI Analyser

Vault structure:
  ~/Obsidian/Growth Journey/
    members/          ← one summary note per team member
    analyses/         ← one note per analysis run per member per source
    prompts/          ← (reserved for future prompt archiving)
    _budget.md        ← spend log
    _index.md         ← master table of all member scores
"""

import os
import re
from pathlib import Path
from datetime import datetime
from typing import Optional


# ─── VAULT PATH ───────────────────────────────────────────────────────────────

def get_vault_path() -> Path:
    return Path('~/Obsidian/Growth Journey').expanduser()


def ensure_vault() -> Path:
    vault = get_vault_path()
    for subdir in ['members', 'analyses', 'prompts']:
        (vault / subdir).mkdir(parents=True, exist_ok=True)
    return vault


# ─── READING HISTORY ──────────────────────────────────────────────────────────

def read_member_history(name: str, max_files: int = 5) -> str:
    """
    Read the most recent analysis files for a member and return as concatenated text.
    Used for self-learning context injection into future prompts.
    """
    vault   = get_vault_path()
    analyses_dir = vault / 'analyses'

    if not analyses_dir.exists():
        return ''

    # Find all analysis files for this member, sorted newest first
    safe_name = _safe_filename(name)
    pattern   = re.compile(r'^\d{4}-\d{2}-\d{2}-' + re.escape(safe_name) + r'-.*\.md$', re.IGNORECASE)

    files = sorted(
        [f for f in analyses_dir.iterdir() if pattern.match(f.name)],
        reverse=True,
    )[:max_files]

    if not files:
        return ''

    parts = [f'## Historical Analysis Context for {name}\n']
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            # Strip YAML frontmatter for cleanliness
            content = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL)
            parts.append(f'### From: {f.stem}\n{content.strip()}\n')
        except Exception:
            continue

    return '\n'.join(parts)


# ─── WRITING ANALYSIS ─────────────────────────────────────────────────────────

def write_analysis(
    name: str,
    date_str: str,
    source: str,
    skill_ratings: dict,
    leadership_ratings: dict,
    reasoning: str,
    key_observations: list[str],
    cost_usd: float,
) -> Path:
    """
    Write a full analysis markdown file for one member / source.
    Returns the path of the written file.
    """
    vault    = ensure_vault()
    filename = f'{date_str}-{_safe_filename(name)}-{source}.md'
    filepath = vault / 'analyses' / filename

    # Build skill table
    skill_rows = '\n'.join(
        f'| {_skill_label(k)} | {v if v is not None else "—"} |'
        for k, v in skill_ratings.items()
    )

    # Build leadership table (only if any non-zero / non-null values)
    ldr_rows = ''
    if leadership_ratings and any(v is not None and v != 0 for v in leadership_ratings.values()):
        ldr_rows = '\n'.join(
            f'| {_ldr_label(k)} | {v if v is not None else "—"} |'
            for k, v in leadership_ratings.items()
        )

    obs_bullets = '\n'.join(f'- {o}' for o in (key_observations or []))

    content = f"""---
member: {name}
date: {date_str}
source: {source}
cost_usd: {cost_usd:.4f}
---
# Analysis: {name} — {date_str} ({source})

## Skill Ratings
| Skill | Score |
|-------|-------|
{skill_rows}

"""

    if ldr_rows:
        content += f"""## Leadership Competencies
| Competency | Score |
|------------|-------|
{ldr_rows}

"""

    content += f"""## Reasoning
{reasoning.strip()}

## Key Observations
{obs_bullets if obs_bullets else '- No specific observations extracted.'}
"""

    filepath.write_text(content, encoding='utf-8')
    return filepath


# ─── MEMBER SUMMARY ───────────────────────────────────────────────────────────

def write_member_summary(name: str, level: str, latest_scores: dict, last_updated: str) -> Path:
    """
    Write/overwrite the member's summary note in members/{name}.md
    """
    vault    = ensure_vault()
    filepath = vault / 'members' / f'{_safe_filename(name)}.md'

    skills   = latest_scores.get('skills', {})
    ldr      = latest_scores.get('leadership', {})
    sources  = latest_scores.get('sources', [])
    conf     = latest_scores.get('confidence', 0.0)

    skill_rows = '\n'.join(
        f'| {_skill_label(k)} | {v if v is not None else "—"} |'
        for k, v in skills.items()
    )

    ldr_section = ''
    if ldr and any(v for v in ldr.values()):
        ldr_rows = '\n'.join(
            f'| {_ldr_label(k)} | {v if v is not None else "—"} |'
            for k, v in ldr.items()
        )
        ldr_section = f"""
## Leadership Competencies
| Competency | Score |
|------------|-------|
{ldr_rows}
"""

    content = f"""# {name}

**Level:** {level}
**Last AI Update:** {last_updated}
**Sources:** {', '.join(sources) if sources else 'none'}
**Confidence:** {conf:.0%}

## Current Skill Scores (AI-derived)
| Skill | Score |
|-------|-------|
{skill_rows}
{ldr_section}
---
*Auto-generated by Growth Journey AI Analyser. Do not edit manually — will be overwritten.*
"""

    filepath.write_text(content, encoding='utf-8')
    return filepath


# ─── BUDGET ───────────────────────────────────────────────────────────────────

def read_budget() -> dict:
    """
    Read _budget.md and return { spent: float, history: [ {date, cost, description} ] }
    """
    vault    = ensure_vault()
    filepath = vault / '_budget.md'

    if not filepath.exists():
        return {'spent': 0.0, 'history': []}

    content = filepath.read_text(encoding='utf-8')

    spent = 0.0
    m = re.search(r'\*\*Total Spent:\*\*\s*\$([0-9.]+)', content)
    if m:
        spent = float(m.group(1))

    history = []
    for row in re.finditer(r'\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|', content):
        date_str, cost_str, desc = row.group(1).strip(), row.group(2).strip(), row.group(3).strip()
        if date_str == 'Date':
            continue
        try:
            history.append({'date': date_str, 'cost': float(cost_str.lstrip('$')), 'description': desc})
        except ValueError:
            continue

    return {'spent': spent, 'history': history}


def write_budget(spent: float, new_entry: Optional[dict] = None) -> Path:
    """
    Overwrite _budget.md with updated total and log entry.
    new_entry: { date, cost, description }
    """
    vault    = ensure_vault()
    filepath = vault / '_budget.md'

    existing = read_budget()
    history  = existing['history']
    if new_entry:
        history.append(new_entry)

    rows = '\n'.join(
        f'| {e["date"]} | ${e["cost"]:.4f} | {e["description"]} |'
        for e in history
    )

    content = f"""# Growth Journey AI Analyser — Budget Log

**Total Spent:** ${spent:.4f}
**Budget Cap:** configured in config.yaml

## Spend History
| Date | Cost | Description |
|------|------|-------------|
{rows if rows else '| — | — | No entries yet |'}

---
*Auto-generated. Do not edit manually.*
"""

    filepath.write_text(content, encoding='utf-8')
    return filepath


# ─── INDEX ────────────────────────────────────────────────────────────────────

def write_index(team_scores: dict) -> Path:
    """
    Write _index.md with a table of all members and their current AI scores.
    team_scores: { member_name: { skills: {...}, leadership: {...}, last_updated, confidence } }
    """
    vault    = ensure_vault()
    filepath = vault / '_index.md'

    now = datetime.now().strftime('%Y-%m-%d %H:%M')

    rows = []
    for name, data in sorted(team_scores.items()):
        skills  = data.get('skills', {})
        ldr     = data.get('leadership', {})
        updated = data.get('last_updated', '—')
        conf    = data.get('confidence', 0.0)
        sources = ', '.join(data.get('sources', []))

        # Compute simple averages
        sk_vals = [v for v in skills.values() if v is not None and v > 0]
        sk_avg  = round(sum(sk_vals) / len(sk_vals)) if sk_vals else 0

        ldr_vals = [v for v in ldr.values() if v is not None and v > 0]
        ldr_avg  = round(sum(ldr_vals) / len(ldr_vals)) if ldr_vals else 0

        rows.append(f'| {name} | {sk_avg} | {ldr_avg} | {conf:.0%} | {sources} | {updated} |')

    table = '\n'.join(rows) if rows else '| — | — | — | — | — | — |'

    content = f"""# Growth Journey — AI Score Index

*Last updated: {now}*

| Member | Avg Skills | Avg Leadership | Confidence | Sources | Last Updated |
|--------|-----------|----------------|------------|---------|--------------|
{table}

---
*Auto-generated by Growth Journey AI Analyser.*
"""

    filepath.write_text(content, encoding='utf-8')
    return filepath


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _safe_filename(name: str) -> str:
    """Convert a person's name to a safe filename component."""
    return re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '_')


_SKILL_LABELS = {
    'sales':          'Sales & Revenue',
    'reporting':      'Reporting & Analytics',
    'maturity':       'Professional Maturity',
    'independence':   'Independence',
    'ai_adoption':    'AI Adoption',
    'cross_functional': 'Cross-functional',
    'escalation':     'Escalation Quality',
    'communication':  'Communication',
    'enthusiasm':     'Enthusiasm & Drive',
}

_LDR_LABELS = {
    'people_leadership':    'People Leadership',
    'vision_strategy':      'Vision & Strategy',
    'stakeholder_influence':'Stakeholder Influence',
    'developing_others':    'Developing Others',
    'resilience':           'Resilience & Grit',
    'decision_quality':     'Decision Quality',
}

def _skill_label(key: str) -> str:
    return _SKILL_LABELS.get(key, key.replace('_', ' ').title())

def _ldr_label(key: str) -> str:
    return _LDR_LABELS.get(key, key.replace('_', ' ').title())
