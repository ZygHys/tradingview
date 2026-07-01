# Run Record Template

Use this template for each TradingView Strategy Tester run or blocked attempt.

When starting from a JSON handoff, run `node scripts/create-run-session.js <handoff.json>` first. Copy the generated `run_record_seed` into this template before adding metrics and evidence.

```yaml
run_id:
status: pass | watch | iterate | reject | blocked
timestamp:
operator: agent | user | mixed
target:
  metric:
  threshold:
  continuation_gate: supplied_strategy_or_supplied_parameter_set | smoke_fixture_only | unknown

strategy:
  name:
  version:
  source: supplied_pine | saved_tradingview_strategy | built_in_strategy | screenshot_or_export
  script_is_strategy: true | false | unknown
  fixture_only: true | false

market:
  symbol:
  exchange:
  timeframe:
  chart_type:
  session:
  date_range:
  test_days:

properties:
  initial_capital:
  order_size:
  commission:
  slippage:
  pyramiding:
  margin:
  deep_backtesting:
  bar_magnifier:

inputs:
  changed_from_prior_run:
  values:

metrics:
  net_profit:
  net_return:
  annualized_return:
  max_drawdown:
  total_trades:
  win_rate:
  profit_factor:
  average_trade:
  largest_win:
  largest_loss:

evidence:
  screenshots:
  exports:
  copied_tables:
  browser_notes:

analysis:
  workflow_result:
  strategy_quality:
  setup_validity:
  repaint_or_lookahead_risk:
  cost_and_fill_risk:
  overfit_risk:
  comparison_to_target:
  decision:
  next_allowed_step:
```

For blocked attempts, fill the `evidence.browser_notes`, `analysis.decision`, and `analysis.next_allowed_step` fields even when metrics are empty.

If a strategy legend row or chart order markers are visible but the Strategy Tester content area is blank, set `status: blocked`, set `analysis.decision: blocked_at_report_render`, and record that chart order markers are not Strategy Tester evidence.

For JSON blocked attempts, run `node scripts/create-blocked-run.js <blocked-input.json>` to generate a standard blocked run record before ending the task or asking for the next checkpoint.

For smoke fixture attempts, set `strategy.fixture_only: true`, keep `analysis.workflow_result` separate from `analysis.strategy_quality`, and make `analysis.next_allowed_step` request a supplied real strategy or supplied parameter/version set.

When browser-captured metrics are available as `fields`, `raw_text`, or normalized `metrics`, run `node scripts/complete-run-record.js <browser-metrics.json>` to merge them with `run_record_seed`, fill evidence, score the run, and preserve fixture rejection rules.

For JSON records, run `node scripts/score-run.js <run-record.json>` after filling metrics to compute annualized return and a first-pass status. Treat the scorer as a consistency check, not as financial advice or a replacement for manual risk review.

When a user or another agent needs a portable decision artifact, run `node scripts/render-review.js <run-record-or-runs.json>` to generate the Markdown review report after metrics are normalized and score-ready.

When another TradingView run should follow, run `node scripts/create-next-run-request.js <run-record-or-runs.json>` to produce a structured next-run request. Use that JSON to resume browser automation or manual execution without inventing new strategy logic.
