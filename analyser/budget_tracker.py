from __future__ import annotations
"""
budget_tracker.py — Anthropic API cost tracking for Growth Journey AI Analyser

Pricing (as of mid-2025):
  claude-3-haiku-20240307:        $0.25/MTok input,  $1.25/MTok output
  claude-3-5-sonnet-20241022:     $3.00/MTok input,  $15.00/MTok output
"""

from datetime import datetime
from typing import Optional

import obsidian_store


# ─── PRICING TABLE ────────────────────────────────────────────────────────────

MODEL_PRICING = {
    'claude-3-haiku-20240307': {
        'input':  0.25 / 1_000_000,   # $ per token
        'output': 1.25 / 1_000_000,
    },
    'claude-3-5-sonnet-20241022': {
        'input':  3.00 / 1_000_000,
        'output': 15.00 / 1_000_000,
    },
    # Fallback for unknown models — use haiku pricing
    'default': {
        'input':  0.25 / 1_000_000,
        'output': 1.25 / 1_000_000,
    },
}


# ─── EXCEPTIONS ───────────────────────────────────────────────────────────────

class BudgetExceededError(Exception):
    """Raised when total spend would exceed the configured hard cap."""
    def __init__(self, spent: float, cap: float):
        self.spent = spent
        self.cap   = cap
        super().__init__(
            f'Budget cap exceeded: ${spent:.4f} spent of ${cap:.2f} cap. '
            f'Increase budget_usd in config.yaml or wait until next cycle.'
        )


class BudgetWarningException(Exception):
    """Raised (and caught) to log a warning when approaching the cap."""
    pass


# ─── COST ESTIMATION ──────────────────────────────────────────────────────────

def estimate_cost(input_tokens: int, output_tokens: int, model: str) -> float:
    """Return estimated USD cost for a single API call."""
    pricing = MODEL_PRICING.get(model, MODEL_PRICING['default'])
    return input_tokens * pricing['input'] + output_tokens * pricing['output']


def estimate_message_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return max(1, len(text) // 4)


# ─── BUDGET CHECKS ────────────────────────────────────────────────────────────

def check_budget(config: dict, additional_cost: float = 0.0) -> float:
    """
    Check current spend against the configured cap.

    Args:
        config: parsed config.yaml dict
        additional_cost: projected additional spend to check against cap

    Returns:
        current total spent (float)

    Raises:
        BudgetExceededError if (spent + additional_cost) > budget_usd
    """
    cap       = float(config.get('budget_usd', 10.0))
    warn_at   = float(config.get('budget_warn_usd', 8.0))
    budget    = obsidian_store.read_budget()
    spent     = budget.get('spent', 0.0)
    projected = spent + additional_cost

    if projected >= cap:
        raise BudgetExceededError(spent=projected, cap=cap)

    if projected >= warn_at:
        print(f'[budget] WARNING: ${projected:.4f} of ${cap:.2f} budget used. Approaching cap.')

    return spent


def get_remaining_budget(config: dict) -> float:
    """Return remaining budget in USD."""
    cap    = float(config.get('budget_usd', 10.0))
    budget = obsidian_store.read_budget()
    spent  = budget.get('spent', 0.0)
    return max(0.0, cap - spent)


# ─── RECORDING SPEND ──────────────────────────────────────────────────────────

def record_spend(config: dict, cost: float, description: str) -> float:
    """
    Add a spend entry to the Obsidian budget log.

    Returns:
        new total spent
    """
    budget  = obsidian_store.read_budget()
    spent   = budget.get('spent', 0.0) + cost
    entry   = {
        'date':        datetime.now().strftime('%Y-%m-%d %H:%M'),
        'cost':        cost,
        'description': description,
    }
    obsidian_store.write_budget(spent, entry)
    return spent


# ─── CONVENIENCE WRAPPER ──────────────────────────────────────────────────────

class BudgetTracker:
    """
    Stateful tracker used throughout a single analyser run.
    Accumulates per-run cost independently of the stored total.
    """

    def __init__(self, config: dict):
        self.config     = config
        self.run_cost   = 0.0
        self.cap        = float(config.get('budget_usd', 10.0))
        self.warn_at    = float(config.get('budget_warn_usd', 8.0))

    def check_before_call(self, estimated_cost: float = 0.0):
        """Call before an API request. Raises BudgetExceededError if over cap."""
        check_budget(self.config, additional_cost=estimated_cost)

    def record(self, input_tokens: int, output_tokens: int, model: str, description: str) -> float:
        """Record actual spend from a completed API call. Returns cost of this call."""
        cost = estimate_cost(input_tokens, output_tokens, model)
        self.run_cost += cost
        record_spend(self.config, cost, description)
        return cost

    def summarise(self) -> str:
        budget = obsidian_store.read_budget()
        total  = budget.get('spent', 0.0)
        return (
            f'This run: ${self.run_cost:.4f} | '
            f'Total spent: ${total:.4f} | '
            f'Remaining: ${max(0, self.cap - total):.4f}'
        )
