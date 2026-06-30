# Iteration Review

Use this reference when the user asks to keep running and reviewing strategy variants until a target such as 20% annualized return is reached.

## Allowed Iteration

Allowed in this skill:

- Compare supplied strategy versions.
- Compare supplied parameter/input sets.
- Correct TradingView setup mistakes.
- Identify whether a result improvement came from settings, data range, costs, or the supplied strategy version.

Not allowed in this skill:

- Invent new trading rules.
- Add indicators or entry/exit logic.
- Reverse-engineer public-account behavior into a new strategy.

## Iteration Loop

For each candidate run:

1. Name the run: `run-001`, `run-002`, etc.
2. Record the exact changed variable.
3. Run Strategy Tester.
4. Capture result evidence.
5. Compute annualized return when date range is known.
6. Compare against prior run and target.
7. Decide: keep, retest, reject, or request the next supplied variant.

## Stop Rules

Stop and report instead of continuing when:

- TradingView login, subscription, or data limits block the run.
- The script is an indicator, not a strategy.
- Metrics cannot be collected strongly enough to compare.
- A run reaches target return only by unacceptable drawdown, too few trades, or missing costs.
- Further progress requires inventing strategy logic.

When stopping, produce a blocked-run record instead of a vague status update. Include the last observed UI evidence, the missing checkpoint, and the smallest user action needed to resume.
