# TradingView Next Run Request

- Status: blocked_until_user_supplies_artifact
- Next action: request-real-strategy-handoff
- Target: annualized_return >= 20.00%
- Required artifact: A real supplied Pine strategy(), saved TradingView strategy, Strategy Tester artifact, or supplied parameter/version set.
- Browser step: Do not continue browser optimization on the bundled smoke-test fixture.

## Based On

- Run: tv-tv-backtest-skill-fixture-ema-cross-v1-smoke-v1-btcusdt-5m
- Run status: reject
- Annualized return: -99.06%
- Max drawdown: 25.84%
- Total trades: 129
- Profit factor: 0.292
- Strategy: TV Backtest Skill Fixture EMA Cross v1 smoke-v1 (pine_strategy, fixture_only=true)
- Market: OKX BTCUSDT 5m, test_days=23
- Changed variable: n/a

## Acceptance Checkpoints

- strategy handoff is supplied and executable
- TradingView chart symbol, exchange, timeframe, and date range are recorded
- Strategy Tester metrics or export are captured
- run record is normalized, scored, compared, and rendered into a review

## Guardrails

- Do not invent or modify trading rules inside this backtest skill.
- Do not tune bundled smoke-test fixtures toward the target.
- Do not claim target success until annualized return, drawdown, trade count, profit factor, costs, and evidence quality are checked.
- Use browser recovery only for layout/report issues, not for subscription bypass or credential capture.

## Comparison Summary

- Decision: tv-tv-backtest-skill-fixture-ema-cross-v1-smoke-v1-btcusdt-5m is the strongest available run, but it is not acceptable.
- Next allowed step: Request a real supplied strategy version or parameter set with a different setup.
- Comparable runs: 1
- Pass / watch: 0 / 0
- Errors: none

## Operator Notes

- Stop browser iteration until a real strategy handoff or supplied parameter/version set is available.
- Do not continue optimizing the bundled smoke-test fixture.
