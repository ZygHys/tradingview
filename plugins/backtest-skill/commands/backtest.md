---
description: "Use the TradingView backtest skill for supplied Pine strategies, Strategy Tester, browser operation, result collection, and review."
---

# TradingView Backtest

## Intent

Use `tradingview-backtest` for a TradingView strategy research or backtesting task.

## Preflight

Confirm what the user has already provided:

- Existing Pine strategy code, TradingView saved strategy, screenshot, copied Strategy Tester table, or exported result file.
- Whether the request includes a complete strategy handoff package or only an idea/indicator/public-account clue.
- Symbol, timeframe, market, date range, commission, slippage, and position sizing assumptions.
- Whether browser automation is available and whether the user is already logged into TradingView.
- Whether the visible TradingView layout has one free indicator slot for the strategy; if not, ask for `blank-layout-ready` or explicit approval before removing existing indicators.

## Execute

Load and follow the `tradingview-backtest` Skill. Do not duplicate its workflow in this command. For browser execution, start from `references/end-to-end-browser-run.md`: use the logged-in browser, write the supplied `strategy()` into Pine Editor, verify `strategy(`, add it to chart, collect Strategy Tester evidence, complete the run record, render the review, and emit the next-run request. When the user supplies a JSON handoff package, validate it, generate a run session with `scripts/create-run-session.js`, and render a browser/manual runbook with `scripts/render-runbook.js` before opening TradingView. When Strategy Tester metrics are collected into JSON, complete the run-session seed with `scripts/complete-run-record.js`, then score/compare it, render a portable review with `scripts/render-review.js`, and create the next structured run request with `scripts/create-next-run-request.js` when another TradingView run should follow or when a fixture run must be stopped and converted into a real-strategy handoff request. Render that request with `scripts/render-next-run-request.js` when the output needs to be handed to a user or browser operator. If the user asks to invent a strategy from indicators, public accounts, or a vague idea, route that to a future strategy-construction skill instead of this command. If the request has no executable strategy handoff package, produce a blocked-run record naming the missing fields.
