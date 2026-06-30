# Result Audit

Use this reference when analyzing Strategy Tester output, screenshots, copied tables, or exports.

## Required Context

Ask for missing facts that materially affect interpretation:

- Symbol and exchange.
- Timeframe and chart type.
- Date range and visible historical bars.
- Strategy settings.
- Commission and slippage.
- Whether Bar Magnifier or Deep Backtesting was used.
- Exported trades or performance tables, if available.

## Metrics to Review

Core:

- Net profit and percent return.
- Max drawdown and drawdown duration.
- Profit factor.
- Total closed trades.
- Win rate and average win/loss.
- Expectancy.
- Largest win/loss.
- Exposure and average bars in trade.

Quality:

- Enough trades for the strategy frequency.
- Performance not dominated by one outlier trade.
- Costs do not erase edge.
- Long/short asymmetry is understood.
- In-sample and out-of-sample periods are separated if possible.

## Failure Modes

Flag:

- Too few trades.
- Unrealistic fill assumptions.
- Missing commission/slippage.
- Overfit parameters.
- Strategy only works on one symbol or one regime.
- High drawdown relative to return.
- Repaint or lookahead risk from Pine logic.
- TradingView data depth limitations.

## Output

Return a concise audit:

- Verdict: promising, inconclusive, or reject.
- Evidence: key metrics and settings.
- Risks: what can invalidate the result.
- Next test: the smallest useful next experiment.

