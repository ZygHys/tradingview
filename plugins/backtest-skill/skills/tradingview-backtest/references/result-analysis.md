# Result Collection and Analysis

Use this reference when collecting or reviewing TradingView Strategy Tester results.

## Evidence Priority

Prefer, in order:

1. Exported Strategy Tester data when available.
2. Copied Strategy Tester tables.
3. Screenshots with visible settings and metrics.
4. Manual metric transcription with explicit uncertainty.

## Minimum Result Record

For every run, record:

- Run id.
- Strategy name and version.
- Symbol, exchange, timeframe, and chart type.
- Date range and approximate test days.
- Inputs and strategy properties.
- Net profit and net return.
- Annualized return if date range is known.
- Max drawdown.
- Total trades.
- Win rate.
- Profit factor.
- Average trade.
- Largest win/loss if visible.
- Notes on data depth, plan limits, Deep Backtesting, and Bar Magnifier.

## Analysis

Classify the result:

- `pass`: target metric reached with acceptable risk and enough trades.
- `watch`: target reached but evidence is weak or risk is high.
- `iterate`: below target but a specific next supplied variant or input set is worth testing.
- `reject`: insufficient edge, excessive drawdown, too few trades, or invalid setup.

For a 20% annualized return target, never use annualized return alone. Pair it with drawdown, trade count, time coverage, and setup validity.

