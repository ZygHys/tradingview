# TradingView Browser Runbook

- Run session: `tv-tv-backtest-skill-fixture-ema-cross-v1-smoke-v1-btcusdt-5m`
- Status: `ready_for_browser_or_manual_run`
- Strategy: `TV Backtest Skill Fixture EMA Cross v1` (`smoke-v1`)
- Artifact: `pine_strategy`
- Market: BTCUSDT on OKX, 5m, candles
- Target: annualized_return >= 20%
- Validation: pass

## Preflight Checkpoints

- [ ] login-ready
- [ ] blank-layout-ready or one free indicator slot
- [ ] symbol-timeframe-confirmed
- [ ] strategy-added
- [ ] tester-ready
- [ ] metrics-captured

## Browser Steps

1. Open the logged-in TradingView chart without refreshing an in-progress layout unless explicitly approved.
2. Confirm symbol, exchange, timeframe, chart type, and date range.
3. Open Pine Editor.
4. Replace existing editor contents with the supplied Pine strategy.
5. Verify the editor contains strategy(...) and not only indicator(...).
6. Save the script.
7. Add the strategy to chart.
8. Open Strategy Tester or Strategy Report.
9. Capture Overview, Performance Summary, List of Trades, and Properties when available.
10. Record plan/data-depth prompts and any report-rendering blockers.

## Required Evidence

- [ ] screenshot or copied table for Strategy Tester summary
- [ ] strategy properties or settings snapshot
- [ ] date range and available data depth
- [ ] net profit or net return
- [ ] max drawdown
- [ ] total trades
- [ ] win rate
- [ ] profit factor

## Allowed Iteration Scope

- Use only supplied Pine versions.
- Use only supplied parameter sets.
- Stop if improvement requires new entry, exit, filter, stop, or take-profit logic.

## Run Record Seed

```json
{
  "run_id": "tv-tv-backtest-skill-fixture-ema-cross-v1-smoke-v1-btcusdt-5m",
  "status": "blocked_until_metrics_captured",
  "target": {
    "metric": "annualized_return",
    "threshold": "20%",
    "continuation_gate": "supplied_strategy_or_supplied_parameter_set"
  },
  "strategy": {
    "name": "TV Backtest Skill Fixture EMA Cross v1",
    "version": "smoke-v1",
    "source": "pine_strategy",
    "script_is_strategy": true,
    "fixture_only": true
  },
  "market": {
    "symbol": "BTCUSDT",
    "exchange": "OKX",
    "timeframe": "5m",
    "chart_type": "candles",
    "date_range": "user-selected TradingView chart range"
  },
  "properties": {
    "initial_capital": "10000 USDT",
    "order_size": "100% of equity",
    "commission": "0.1%",
    "slippage": "1 tick",
    "pyramiding": "0",
    "margin": "TradingView default"
  },
  "evidence": {
    "screenshots": [],
    "exports": [],
    "copied_tables": [],
    "browser_notes": []
  },
  "analysis": {
    "workflow_result": "pending_metrics",
    "strategy_quality": "unknown",
    "decision": "metrics-captured required before scoring",
    "next_allowed_step": "collect Strategy Tester summary evidence, then run score-run.js"
  }
}
```

## Stop Conditions

- Stop if TradingView account state, plan limits, or browser instability prevents a reliable Strategy Tester run.
- Stop if Strategy Tester metrics are unavailable; create a blocked-run record instead of inferring performance.
- Stop if improvement requires new entry, exit, filter, stop, or take-profit logic.
- Do not claim performance from chart order markers or a strategy legend row alone.
