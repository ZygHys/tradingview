---
name: tradingview-backtest
description: TradingView strategy research and backtesting workflow. Use when the user wants to create or audit Pine Script strategies, run or guide Strategy Tester in TradingView, operate TradingView through browser tools, analyze exported backtest results, generate alert/webhook payloads, or migrate a TradingView strategy to local Python, Freqtrade, Backtrader, vectorbt, or similar backtesting stacks.
---

# TradingView Backtest

## Operating Rules

- Treat this as an unofficial workflow. Do not claim TradingView provides an official ChatGPT/OpenAI/Claude Skill or a local Pine runtime.
- Use Pine Script v6 for TradingView execution, Python for local reproducibility, JSON for alert/webhook payloads, and Markdown for audit reports.
- Prefer a user-mediated browser session for TradingView. Ask the user to log in manually when needed; never store credentials, cookies, API keys, broker secrets, or webhook secrets.
- If browser automation tools are unavailable or unstable, provide a precise manual TradingView runbook.
- Preserve reproducibility: symbol, exchange, timeframe, date range, chart type, session, strategy inputs, commission, slippage, order size, pyramiding, and TradingView plan limitations.

## Route

1. Clarify the entry artifact: idea, Pine code, screenshot, exported trades/performance, or local data.
2. Select the path:
   - Idea to TradingView strategy: read [pine-strategy.md](references/pine-strategy.md).
   - Browser/UI operation: read [browser-operation.md](references/browser-operation.md).
   - Result audit or export analysis: read [result-audit.md](references/result-audit.md).
   - Alert/webhook production: read [alerts-webhooks.md](references/alerts-webhooks.md).
   - Local migration: read [local-migration.md](references/local-migration.md).
3. Run the smallest complete loop:
   - Generate or inspect Pine.
   - Run or guide TradingView Strategy Tester.
   - Record assumptions and results.
   - Identify repaint, lookahead, fill, cost, and overfit risks.
   - Recommend next action: revise, reject, forward-test, or migrate locally.

## Deliverables

Choose deliverables by task, not by template:

- Pine Script v6 `strategy()` code.
- TradingView runbook for Strategy Tester.
- Browser automation checklist and observed UI evidence.
- Backtest quality report.
- Alert message and webhook JSON template.
- Local migration plan or starter Python/Freqtrade/vectorbt skeleton.

## Quality Gates

Before calling a strategy "usable", check:

- No avoidable repaint or lookahead behavior.
- Costs and sizing are explicit.
- Entry, exit, stop, and take-profit logic are deterministic.
- Date range and market regime are stated.
- Strategy Tester results are not treated as live performance.
- Local migration notes preserve Pine semantics where possible.

## Refusal and Safety

Decline requests to bypass TradingView subscriptions, scrape private accounts without authorization, steal credentials, or automate broker actions without explicit user-controlled infrastructure. For live trading, keep outputs educational and insist on paper trading or small controlled trials.

