# Local Backtest Migration

Use this reference when converting a TradingView strategy to local tooling.

## Target Selection

- Freqtrade: crypto bot development, dry-run, and exchange execution.
- Backtrader: general Python event-driven backtesting.
- vectorbt: fast vectorized research and parameter sweeps.
- pandas-only: small one-off reproducibility checks.

## Migration Checklist

1. Extract Pine inputs and defaults.
2. Map data fields: open, high, low, close, volume, timezone, session.
3. Recreate indicators with equivalent rolling windows and warmup behavior.
4. Recreate signal timing and bar-close semantics.
5. Recreate order model: market, stop, limit, stop-limit, pyramiding, and position sizing.
6. Recreate costs: commission, spread, slippage, funding if relevant.
7. Compare sample trades against TradingView.
8. Document known semantic mismatches.

## Pine to Python Notes

- Pine series indexing such as `close[1]` maps to shifted arrays.
- `ta.sma`, `ta.ema`, `ta.rsi`, and similar functions need matching warmup rules.
- TradingView broker emulator fill assumptions may differ from local engines.
- Higher-timeframe requests must be resampled without future leakage.

## Output

Produce:

- Framework recommendation.
- Data requirements.
- Semantic mismatch list.
- Minimal starter code or pseudocode.
- Test plan comparing TradingView trades to local trades.

