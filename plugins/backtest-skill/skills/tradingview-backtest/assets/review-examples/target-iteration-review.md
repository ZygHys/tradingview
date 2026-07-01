# TradingView Backtest Review

- Target: annualized return >= 20.00%
- Comparable runs: 2 / 2
- Pass / watch: 1 / 0
- Best run: example-param-b
- Decision: example-param-b is the strongest run and reaches the target with basic checks satisfied.
- Next allowed step: Retest the best supplied version on another date range or export trades for robustness review.

## Runs

| Run | Status | Annualized | Net | Max DD | Trades | PF | Quality | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| example-param-a | iterate | 12.87% | 1.00% | 8.00% | 64 | 1.05 | iterate | none |
| example-param-b | pass | 27.24% | 2.00% | 10.00% | 61 | 1.2 | pass | none |

## Best Run Notes

- Strategy: Example Supplied Strategy v1
- Market: OKX BTCUSDT 5m
- Changed variable: supplied parameter set B
- Inputs: `Fast length=8`, `Slow length=21`
- Warnings/errors: none

## Guardrails

- Use only supplied Pine strategies, saved TradingView strategies, or supplied parameter/version sets.
- Do not tune bundled smoke-test fixtures toward target return.
- Treat target-reaching runs as provisional until another date range or exported trades confirm robustness.
- Keep Strategy Tester evidence, settings, costs, and plan limitations attached to the run record.
