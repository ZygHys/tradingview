---
name: tradingview-backtest
description: TradingView usage and backtesting workflow for supplied strategies. Use when the user wants to load or run an existing Pine Script strategy, operate TradingView Strategy Tester through browser tools or manual steps, collect screenshots/tables/exports, analyze test results, compare parameter or version runs, iterate toward a target metric such as 20% annualized return, or generate alert/webhook payloads for an already-tested strategy. Do not use for inventing a strategy from indicators, public accounts, or vague trading ideas.
---

# TradingView Backtest

## Operating Rules

- Treat this as an unofficial workflow. Do not claim TradingView provides an official ChatGPT/OpenAI/Claude Skill or a local Pine runtime.
- Use Pine Script v6 only for supplied TradingView strategy code. Use browser automation or manual runbooks for UI operation, CSV/JSON for result artifacts, and Markdown for review reports.
- Prefer a user-mediated browser session for TradingView. Ask the user to log in manually when needed; never store credentials, cookies, API keys, broker secrets, or webhook secrets.
- If browser automation tools are unavailable or unstable, provide a precise manual TradingView runbook.
- Preserve reproducibility: symbol, exchange, timeframe, date range, chart type, session, strategy inputs, commission, slippage, order size, pyramiding, and TradingView plan limitations.
- Do not invent entry/exit rules, convert indicators into strategies, reverse-engineer public accounts, or generate new strategy logic. Those tasks belong to separate strategy-construction skills.

## Route

1. Clarify the entry artifact: existing Pine `strategy()` code, saved TradingView strategy, Strategy Tester screenshot/table/export, or browser page state.
2. Select the path:
   - Language and artifact choices: read [language-use.md](references/language-use.md).
   - Strategy loading and run setup: read [strategy-run.md](references/strategy-run.md).
   - Browser/UI operation: read [browser-operation.md](references/browser-operation.md).
   - Browser failure recovery and manual checkpoints: read [failure-recovery.md](references/failure-recovery.md).
   - Result collection and analysis: read [result-analysis.md](references/result-analysis.md).
   - Run record template: read [run-record-template.md](references/run-record-template.md).
   - Targeted run comparison and iteration: read [iteration-review.md](references/iteration-review.md).
   - Alert/webhook production: read [alerts-webhooks.md](references/alerts-webhooks.md).
3. Run the smallest complete loop:
   - Load or inspect the supplied strategy.
   - Run or guide TradingView Strategy Tester.
   - Record assumptions and results.
   - Identify repaint, lookahead, fill, cost, and overfit risks.
   - Compare against the target metric and recommend the next supplied variant, parameter set, or setup correction.

## Deliverables

Choose deliverables by task, not by template:

- Strategy loading/run instructions for the supplied Pine or saved strategy.
- TradingView runbook for Strategy Tester.
- Browser automation checklist and observed UI evidence.
- Backtest quality report.
- Completed run record or blocked-run record.
- Iteration log comparing run settings, annualized return, drawdown, trade count, and risk notes.
- Alert message and webhook JSON template.

## Quality Gates

Before calling a TradingView run "usable", check:

- No avoidable repaint or lookahead behavior.
- Costs and sizing are explicit.
- Entry, exit, stop, and take-profit logic are deterministic.
- Date range and market regime are stated.
- Strategy Tester results are not treated as live performance.
- Annualized return targets are paired with drawdown, trade count, and robustness checks rather than optimized alone.

## Refusal and Safety

Decline requests to bypass TradingView subscriptions, scrape private accounts without authorization, steal credentials, automate broker actions without explicit user-controlled infrastructure, or invent a strategy inside this skill. For live trading, keep outputs educational and insist on paper trading or small controlled trials.
