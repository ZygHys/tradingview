# Run Record Template

Use this template for each TradingView Strategy Tester run or blocked attempt.

```yaml
run_id:
status: pass | watch | iterate | reject | blocked
timestamp:
operator: agent | user | mixed

strategy:
  name:
  version:
  source: supplied_pine | saved_tradingview_strategy | built_in_strategy | screenshot_or_export
  script_is_strategy: true | false | unknown

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
  setup_validity:
  repaint_or_lookahead_risk:
  cost_and_fill_risk:
  overfit_risk:
  comparison_to_target:
  decision:
  next_allowed_step:
```

For blocked attempts, fill the `evidence.browser_notes`, `analysis.decision`, and `analysis.next_allowed_step` fields even when metrics are empty.

