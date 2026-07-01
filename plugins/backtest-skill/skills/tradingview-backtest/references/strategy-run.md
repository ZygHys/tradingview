# Strategy Run Setup

Use this reference when loading a supplied strategy into TradingView Strategy Tester.

When the run requires operating a real browser, writing supplied Pine into Pine Editor, collecting Strategy Tester evidence, and scoring the result, read [end-to-end-browser-run.md](end-to-end-browser-run.md) first.

## Required Inputs

Collect or infer:

- Supplied Pine `strategy()` code or the name of a saved TradingView strategy.
- Symbol and exchange.
- Timeframe and chart type.
- Date range or visible history constraint.
- Initial capital.
- Order size.
- Commission and slippage.
- Pyramiding and margin settings.
- Strategy input values for this run.
- Target metric, if any, such as annualized return >= 20%.

## Run Steps

If the run starts from a JSON handoff or run session, use `node scripts/render-runbook.js <run-session-or-handoff.json>` to produce the browser/manual runbook before operating TradingView.

1. Open TradingView chart.
2. Set symbol, exchange, timeframe, and chart type.
3. Open Pine Editor or the strategy selector.
4. Load the supplied strategy.
5. Save/add it to the chart.
6. Open Strategy Tester.
7. Set strategy properties and inputs.
8. Wait until results refresh.
9. Capture Overview, Performance Summary, List of Trades, Properties, and visible date range.
10. Record all run settings before comparing results.

## Browser Smoke-Test Fixture

Use `../assets/pine-fixtures/ema-cross-smoke-v1.pine` only when the task is to verify the TradingView browser/Pine Editor/Strategy Tester workflow and the user has not supplied a strategy yet.

Rules for this fixture:

- Treat it as plumbing evidence, not trading logic.
- Do not compare its return to the user's target metric.
- Do not use it to claim strategy quality.
- Replace it with a user-supplied `strategy()` before any real review or iteration.
- If TradingView blocks adding the fixture because the chart has no free indicator slot, ask for `blank-layout-ready` or explicit approval to remove existing indicators.
- If a slot is freed and the fixture is added, treat that as workflow plumbing only. Do not call the run usable until Strategy Tester metrics or an export are captured.
- If fixture metrics are captured, record `workflow_result: pass` and `strategy_quality: reject`; the next allowed step is still a supplied real strategy or supplied parameter/version set.

## Annualized Return Target

When the user gives a target such as 20% annual return, do not optimize blindly and do not make it the first success condition. First prove the TradingView operation loop is stable: supplied strategy loaded, Strategy Tester evidence captured, run record completed, and review/next-run request generated.

Calculate or request:

```text
annualized_return = (1 + net_return)^(365 / test_days) - 1
```

Then compare alongside:

- Max drawdown.
- Total trades.
- Profit factor.
- Largest win/loss concentration.
- In-sample and out-of-sample split, if available.
- Setup risk such as missing costs or too little history.
