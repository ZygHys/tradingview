---
description: "Use the TradingView backtest skill for supplied Pine strategies, Strategy Tester, browser operation, result collection, and review."
---

# TradingView Backtest

## Intent

Use `tradingview-backtest` for a TradingView strategy research or backtesting task.

## Preflight

Confirm what the user has already provided:

- Existing Pine strategy code, TradingView saved strategy, screenshot, copied Strategy Tester table, or exported result file.
- Symbol, timeframe, market, date range, commission, slippage, and position sizing assumptions.
- Whether browser automation is available and whether the user is already logged into TradingView.

## Execute

Load and follow the `tradingview-backtest` Skill. Do not duplicate its workflow in this command. If the user asks to invent a strategy from indicators, public accounts, or a vague idea, route that to a future strategy-construction skill instead of this command.
