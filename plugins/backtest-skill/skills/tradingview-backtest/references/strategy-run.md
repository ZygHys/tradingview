# Strategy Run Setup

Use this reference when loading a supplied strategy into TradingView Strategy Tester.

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

## Annualized Return Target

When the user gives a target such as 20% annual return, do not optimize blindly.

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

