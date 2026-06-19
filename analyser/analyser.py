#!/usr/bin/env python3
"""
analyser.py — Main entry point for Growth Journey AI Analyser

Usage:
  python analyser.py [--days 14] [--member "Anam Imteyaz"] [--dry-run]
                     [--sources gmail,slack,whatsapp]

Examples:
  python analyser.py --dry-run
  python analyser.py --days 7 --sources slack,gmail
  python analyser.py --member "Anam Imteyaz"
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import yaml


# ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

TEAM = [
    {'name': 'Anam Imteyaz',       'level': 'JA'},
    {'name': 'Chandel Yajat',      'level': 'A'},
    {'name': 'Suman Soumya Dash',  'level': 'AM'},
    {'name': 'Harsha Thomas John', 'level': 'SA'},
    {'name': 'Kirubhavani B',      'level': 'A'},
    {'name': 'Nishi Agarwal',      'level': 'AM'},
    {'name': 'Mary L. Pulamte',    'level': 'JA'},
    {'name': 'Milind Singh Bora',  'level': 'A'},
    {'name': 'Priyanka Pati',      'level': 'A'},
]


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def load_config(config_path: str = 'config.yaml') -> dict:
    """Load and validate config.yaml."""
    path = Path(config_path)
    if not path.exists():
        print(f'[analyser] ERROR: config.yaml not found at {path.absolute()}')
        print('[analyser] Copy config.yaml.example or check the path.')
        sys.exit(1)

    with open(path, 'r') as f:
        config = yaml.safe_load(f)

    return config


def load_whatsapp_messages(config: dict) -> dict:
    """Load WhatsApp messages from JSON file written by wa_bridge.js."""
    wa_path = Path(config.get('whatsapp_output', './wa_messages.json'))
    if not wa_path.exists():
        print(f'[analyser] WhatsApp messages not found at {wa_path} — skipping WhatsApp source.')
        return {}
    try:
        with open(wa_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f'[analyser] Error reading WhatsApp JSON: {e} — skipping.')
        return {}


# ─── RICH TABLE OUTPUT ────────────────────────────────────────────────────────

def print_summary_table(results: dict, dry_run: bool = False):
    """Print a rich summary table of all results."""
    try:
        from rich.console import Console
        from rich.table import Table
        from rich import box

        console = Console()
        label   = '[DRY RUN] ' if dry_run else ''
        table   = Table(
            title=f'{label}Growth Journey AI Analyser Results',
            box=box.ROUNDED,
            show_lines=True,
        )

        table.add_column('Member',     style='bold cyan', no_wrap=True)
        table.add_column('Level',      justify='center')
        table.add_column('Sources',    style='dim')
        table.add_column('Avg Skills', justify='center')
        table.add_column('Avg Ldr',    justify='center')
        table.add_column('Confidence', justify='center')
        table.add_column('Cost',       justify='right', style='green')
        table.add_column('Status',     justify='center')

        for member_name, result in sorted(results.items()):
            if result is None:
                table.add_row(member_name, '—', '—', '—', '—', '—', '—', '[red]SKIPPED[/]')
                continue

            if result.get('error'):
                table.add_row(member_name, '—', '—', '—', '—', '—', '—',
                              f'[red]ERROR: {result["error"][:40]}[/]')
                continue

            skills    = result.get('skills', {})
            ldr       = result.get('leadership', {})
            sources   = ', '.join(result.get('sources_used', []))
            level     = result.get('level', '?')
            conf      = result.get('confidence', 0.0)
            cost      = result.get('cost', 0.0)
            is_dry    = result.get('dry_run', False)

            sk_vals  = [v for v in skills.values() if v is not None and v > 0]
            sk_avg   = str(round(sum(sk_vals) / len(sk_vals))) if sk_vals else '—'

            ldr_vals = [v for v in ldr.values() if v is not None and v > 0]
            ldr_avg  = str(round(sum(ldr_vals) / len(ldr_vals))) if ldr_vals else '—'

            conf_str  = f'{conf:.0%}'
            cost_str  = f'${cost:.4f}' if not is_dry else f'~${cost:.4f}'
            status    = '[yellow]DRY RUN[/]' if is_dry else '[green]OK[/]'

            table.add_row(member_name, level, sources or '—', sk_avg, ldr_avg, conf_str, cost_str, status)

        console.print(table)

    except ImportError:
        # Fallback plain-text summary
        print('\n=== Results ===')
        for name, r in results.items():
            if r is None:
                print(f'  {name}: SKIPPED')
            elif r.get('error'):
                print(f'  {name}: ERROR — {r["error"]}')
            else:
                skills = r.get('skills', {})
                sk_vals = [v for v in skills.values() if v is not None and v > 0]
                avg = round(sum(sk_vals) / len(sk_vals)) if sk_vals else 0
                print(f'  {name} [{r.get("level","?")}]: avg_skills={avg} conf={r.get("confidence",0):.0%} cost=${r.get("cost",0):.4f}')


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Growth Journey AI Analyser')
    parser.add_argument('--days',    type=int, default=None,
                        help='Override lookback_days from config')
    parser.add_argument('--member',  type=str, default=None,
                        help='Analyse only this member (full name)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Estimate cost without calling API or writing files')
    parser.add_argument('--sources', type=str, default=None,
                        help='Comma-separated list of sources (gmail,slack,whatsapp)')
    parser.add_argument('--config',  type=str, default='config.yaml',
                        help='Path to config.yaml')
    args = parser.parse_args()

    # ── Change to script directory so relative paths work ─────────────────
    os.chdir(Path(__file__).parent)

    # ── Load config ────────────────────────────────────────────────────────
    config = load_config(args.config)

    lookback_days = args.days or config.get('lookback_days', 14)
    dashboard_dir = config.get('dashboard_dir', str(Path(__file__).parent.parent))

    # Determine which sources to use
    all_sources    = {'gmail', 'slack', 'whatsapp'}
    enabled_sources = all_sources
    if args.sources:
        enabled_sources = set(s.strip().lower() for s in args.sources.split(','))

    # ── Imports (after chdir) ──────────────────────────────────────────────
    import obsidian_store
    import budget_tracker as bt
    import claude_rater
    import score_exporter

    # ── Check/initialise vault ─────────────────────────────────────────────
    if not args.dry_run:
        obsidian_store.ensure_vault()
        print(f'[analyser] Obsidian vault: {obsidian_store.get_vault_path()}')

    # ── Budget check ────────────────────────────────────────────────────────
    tracker = bt.BudgetTracker(config)
    try:
        current_spend = bt.check_budget(config)
        remaining     = bt.get_remaining_budget(config)
        print(f'[analyser] Budget: ${current_spend:.4f} spent, ${remaining:.4f} remaining (cap: ${config.get("budget_usd",10):.2f})')
    except bt.BudgetExceededError as e:
        print(f'[analyser] ABORTED: {e}')
        sys.exit(1)

    # ── Fetch messages ─────────────────────────────────────────────────────
    member_names = [m['name'] for m in TEAM]

    # WhatsApp (from JSON file written by wa_bridge.js)
    wa_data: dict = {}
    if 'whatsapp' in enabled_sources:
        wa_data = load_whatsapp_messages(config)

    # Gmail
    gmail_data: dict = {}
    if 'gmail' in enabled_sources:
        if not args.dry_run:
            from gmail_source import fetch_gmail_messages
            gmail_data = fetch_gmail_messages(
                member_names,
                config.get('gmail_credentials', ''),
                lookback_days,
            )
        else:
            print('[analyser] [dry-run] Skipping Gmail fetch.')

    # Slack
    slack_data: dict = {}
    if 'slack' in enabled_sources:
        if not args.dry_run:
            from slack_source import fetch_slack_messages
            slack_data = fetch_slack_messages(
                member_names,
                config.get('slack_bot_token', ''),
                lookback_days,
            )
        else:
            print('[analyser] [dry-run] Skipping Slack fetch.')

    # ── Determine members to process ───────────────────────────────────────
    team_to_process = TEAM
    if args.member:
        team_to_process = [m for m in TEAM if m['name'].lower() == args.member.lower()]
        if not team_to_process:
            print(f'[analyser] ERROR: Member "{args.member}" not found in team list.')
            print(f'[analyser] Known members: {", ".join(m["name"] for m in TEAM)}')
            sys.exit(1)

    # ── Process each member ────────────────────────────────────────────────
    today     = datetime.now().strftime('%Y-%m-%d')
    all_results: dict = {}
    team_scores: dict = {}

    print(f'\n[analyser] Processing {len(team_to_process)} member(s) across '
          f'{", ".join(enabled_sources)} source(s)...\n')

    for member_info in team_to_process:
        name  = member_info['name']
        level = member_info['level']

        print(f'  → {name} ({level})')

        # Gather messages for this member from all enabled sources
        messages_by_source = {}
        if 'whatsapp' in enabled_sources and wa_data:
            messages_by_source['whatsapp'] = wa_data.get(name, [])
        if 'gmail' in enabled_sources and gmail_data:
            messages_by_source['gmail'] = gmail_data.get(name, [])
        if 'slack' in enabled_sources and slack_data:
            messages_by_source['slack'] = slack_data.get(name, [])

        total_msgs = sum(len(v) for v in messages_by_source.values())
        print(f'     Messages: {total_msgs} total '
              f'({", ".join(f"{s}:{len(m)}" for s, m in messages_by_source.items() if m)})')

        # Load Obsidian history for self-learning context
        history_context = ''
        if not args.dry_run:
            history_context = obsidian_store.read_member_history(name)
            if history_context:
                print(f'     History context loaded ({len(history_context)} chars)')

        # Call Claude
        try:
            result = claude_rater.rate_member(
                name=name,
                level=level,
                messages_by_source=messages_by_source,
                history_context=history_context,
                config=config,
                tracker=tracker,
                dry_run=args.dry_run,
            )
        except bt.BudgetExceededError as e:
            print(f'     BUDGET EXCEEDED — stopping analysis: {e}')
            all_results[name] = {'error': str(e), 'level': level}
            break
        except Exception as e:
            print(f'     ERROR rating {name}: {e}')
            all_results[name] = {'error': str(e), 'level': level}
            continue

        if result is None:
            print(f'     Skipped (budget).')
            all_results[name] = None
            continue

        result['level'] = level
        all_results[name] = result

        # Write to Obsidian (skip in dry-run)
        if not args.dry_run and not result.get('dry_run'):
            sources_label = '_'.join(result.get('sources_used', ['unknown']))
            try:
                analysis_path = obsidian_store.write_analysis(
                    name=name,
                    date_str=today,
                    source=sources_label,
                    skill_ratings=result.get('skills', {}),
                    leadership_ratings=result.get('leadership', {}),
                    reasoning=result.get('reasoning', ''),
                    key_observations=result.get('key_observations', []),
                    cost_usd=result.get('cost', 0.0),
                )
                print(f'     Obsidian analysis → {analysis_path.name}')

                obsidian_store.write_member_summary(
                    name=name,
                    level=level,
                    latest_scores={
                        'skills':     result.get('skills', {}),
                        'leadership': result.get('leadership', {}),
                        'sources':    result.get('sources_used', []),
                        'confidence': result.get('confidence', 0.0),
                    },
                    last_updated=today,
                )
            except Exception as e:
                print(f'     WARNING: Could not write to Obsidian: {e}')

        # Build team_scores entry for exporter
        team_scores[name] = {
            'skills':       result.get('skills', {}),
            'leadership':   result.get('leadership', {}),
            'last_updated': today,
            'sources':      result.get('sources_used', []),
            'confidence':   result.get('confidence', 0.0),
        }

    # ── Export scores to dashboard ─────────────────────────────────────────
    if team_scores and not args.dry_run:
        try:
            budget_info = bt.obsidian_store.read_budget() if not args.dry_run else {}
            total_spent = budget_info.get('spent', 0.0)

            js_path, log_path = score_exporter.export_scores(
                team_scores=team_scores,
                dashboard_dir=dashboard_dir,
                run_cost=tracker.run_cost,
                total_spent=total_spent,
            )
            print(f'\n[analyser] Exported scores → {js_path}')
            print(f'[analyser] Score log updated → {log_path}')
        except Exception as e:
            print(f'[analyser] WARNING: Could not export scores: {e}')

        # Update Obsidian index
        try:
            obsidian_store.write_index(team_scores)
            print(f'[analyser] Obsidian index updated.')
        except Exception as e:
            print(f'[analyser] WARNING: Could not update Obsidian index: {e}')

    elif args.dry_run and team_scores:
        # In dry run, still write a placeholder scores file to show format
        print(f'\n[analyser] [dry-run] Would export {len(team_scores)} member scores to:')
        print(f'           {Path(dashboard_dir) / "analyser" / "ai_scores.js"}')

    # ── Print summary ──────────────────────────────────────────────────────
    print()
    print_summary_table(all_results, dry_run=args.dry_run)
    print()
    print(f'[analyser] Budget summary: {tracker.summarise()}')

    if args.dry_run:
        print('\n[analyser] Dry run complete. No API calls made, no files written.')
        print('[analyser] Run without --dry-run to execute for real.')
    else:
        print('\n[analyser] Done! Reload the dashboard to see updated AI scores.')


if __name__ == '__main__':
    main()
