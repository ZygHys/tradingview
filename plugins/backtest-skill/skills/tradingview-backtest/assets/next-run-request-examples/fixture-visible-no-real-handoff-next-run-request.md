# TradingView Next Run Request

- Status: blocked_until_user_supplies_artifact
- Next action: request-real-strategy-handoff
- Target: annualized_return >= 20.00%
- Required artifact: A real supplied Pine strategy(), saved TradingView strategy, Strategy Tester artifact, or supplied parameter/version set.
- Browser step: Do not continue browser optimization on the bundled smoke-test fixture.

## Based On

- Run: example-fixture-visible-no-real-handoff-v1
- Run status: blocked
- Annualized return: n/a
- Max drawdown: n/a
- Total trades: n/a
- Profit factor: n/a
- Strategy: TV Backtest Skill Fixture EMA Cross v1 smoke-v1 (pine_fixture, fixture_only=true)
- Market: OKX BTCUSDT 5m, test_days=n/a
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

- Decision: No comparable run is ready.
- Next allowed step: Collect complete Strategy Tester metrics or exports.
- Comparable runs: 0
- Pass / watch: 0 / 0
- Errors: No comparable runs have complete metrics.

## Operator Notes

- Stop browser iteration until a real strategy handoff or supplied parameter/version set is available.
- Do not continue optimizing the bundled smoke-test fixture.
