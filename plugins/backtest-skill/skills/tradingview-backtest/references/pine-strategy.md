# Pine Strategy Workflow

Use this reference when creating or auditing Pine Script for TradingView Strategy Tester.

## Language Choice

- Use Pine Script v6 for TradingView charts and Strategy Tester.
- Use `strategy()` instead of `indicator()` when the user needs backtest orders.
- Use Python only for local reproduction or post-export analysis, not for running Pine inside TradingView.

## Pine Strategy Minimum

Every generated strategy should specify:

- `//@version=6`
- `strategy(title=..., overlay=..., initial_capital=..., commission_type=..., commission_value=..., slippage=..., pyramiding=...)`
- Inputs for key periods and thresholds.
- Deterministic entry and exit conditions.
- `strategy.entry`, `strategy.exit`, and optional `strategy.close`.
- Comments only where behavior is non-obvious.

## Repaint and Lookahead Checks

Flag these patterns:

- `request.security()` without explicit lookahead discipline.
- Higher-timeframe signals used before the higher-timeframe bar is confirmed.
- Signals based on future pivots without delayed confirmation.
- Intrabar assumptions that depend on Bar Magnifier or lower-timeframe data.
- Logic that visually uses `plotshape` signals but does not match actual `strategy.entry` timing.

Prefer:

- Confirmed bars for higher-timeframe signals.
- Explicit `barstate.isconfirmed` where appropriate.
- Delayed pivot confirmation.
- Clear distinction between signal discovery and order execution.

## Cost and Fill Assumptions

Ask for or set defaults:

- Commission type and value.
- Slippage in ticks.
- Position sizing.
- Pyramiding.
- Stop and take-profit logic.
- Time-in-force assumption if relevant.

If the user does not provide these, state assumptions in the output.

## Output Pattern

When producing Pine:

1. Briefly state assumptions.
2. Provide the full script.
3. List TradingView setup steps.
4. List known limitations and what to verify in Strategy Tester.

