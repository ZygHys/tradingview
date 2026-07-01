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
- Treat return improvement as a later phase. First prove stable TradingView operation, evidence capture, result normalization, review, and next-run handoff. Only pursue annualized-return targets such as 20% after that operating loop is reliable.
- Do not invent entry/exit rules, convert indicators into strategies, reverse-engineer public accounts, or generate new strategy logic. Those tasks belong to separate strategy-construction skills.

## Route

1. Clarify the entry artifact: existing Pine `strategy()` code, saved TradingView strategy, Strategy Tester screenshot/table/export, or browser page state.
2. Select the path:
   - Strategy handoff contract from users or future strategy-construction skills: read [strategy-handoff.md](references/strategy-handoff.md).
   - Language and artifact choices: read [language-use.md](references/language-use.md).
   - End-to-end browser strategy execution: read [end-to-end-browser-run.md](references/end-to-end-browser-run.md) before opening TradingView, writing Pine into the editor, running Strategy Tester, or analyzing browser-captured results.
   - Strategy loading and run setup: read [strategy-run.md](references/strategy-run.md).
   - Browser/UI operation: read [browser-operation.md](references/browser-operation.md).
   - Account plan limits and saved layouts: read [plan-limits-and-layouts.md](references/plan-limits-and-layouts.md).
   - Browser failure recovery and manual checkpoints: read [failure-recovery.md](references/failure-recovery.md).
   - Result collection and analysis: read [result-analysis.md](references/result-analysis.md).
   - Run record template: read [run-record-template.md](references/run-record-template.md).
   - Targeted run comparison and iteration: read [iteration-review.md](references/iteration-review.md).
   - Alert/webhook production: read [alerts-webhooks.md](references/alerts-webhooks.md).
3. Run the smallest complete loop:
   - Validate the handoff package when one is provided as JSON.
   - Create a browser run package with `scripts/create-browser-run-package.js` when a real handoff needs one stable pre-browser artifact.
   - Create a browser run session with `scripts/create-run-session.js` when execution needs a reproducible checklist.
   - Render a browser/manual runbook with `scripts/render-runbook.js` when the checklist should be handed to a browser operator or user.
   - Load or inspect the supplied strategy.
   - If Pine code is supplied, write it into Pine Editor, verify `strategy(`, save it, and add it to chart using the protocol in `end-to-end-browser-run.md`.
   - Run or guide TradingView Strategy Tester.
   - Record assumptions, screenshots/tables/exports, and visible metrics.
   - Normalize copied Strategy Tester metrics with `scripts/normalize-run-record.js` when labels need mapping.
   - Complete browser-captured metrics into a scored run record with `scripts/complete-run-record.js` when starting from a run-session seed.
   - Score JSON run records with `scripts/score-run.js` when metrics are available.
   - Compare supplied JSON run records with `scripts/compare-runs.js` when multiple versions or parameter sets have metrics.
   - Render a Markdown review with `scripts/render-review.js` when a run record or run set needs a portable decision report.
   - Create the next structured TradingView run request with `scripts/create-next-run-request.js` when another browser/manual run should follow or when a fixture result must be converted into a real-strategy handoff request.
   - Render the next-run request with `scripts/render-next-run-request.js` when the request should be handed to a user or browser operator.
   - Generate a blocked JSON run record with `scripts/create-blocked-run.js` when handoff, browser state, or metrics are missing.
   - Identify repaint, lookahead, fill, cost, and overfit risks.
   - If the operating loop is not stable, recommend the next setup or evidence correction before discussing returns.
   - After stable operation is proven, compare against the target metric and recommend the next supplied variant, parameter set, or setup correction.

## Deliverables

Choose deliverables by task, not by template:

- Strategy loading/run instructions for the supplied Pine or saved strategy.
- TradingView runbook for Strategy Tester.
- Browser run package generated from a strategy handoff.
- Markdown browser/manual runbook generated from a run session or handoff package.
- Browser automation checklist and observed UI evidence.
- Backtest quality report.
- Completed, scored run record or blocked-run record.
- Operational stability finding: whether TradingView can be operated repeatably enough to support analysis.
- Iteration log comparing run settings, annualized return, drawdown, trade count, and risk notes.
- Markdown next-run or handoff request.
- Alert message and webhook JSON template.

## Quality Gates

Before calling a TradingView run "usable", check:

- No avoidable repaint or lookahead behavior.
- Costs and sizing are explicit.
- Entry, exit, stop, and take-profit logic are deterministic.
- Date range and market regime are stated.
- Strategy Tester results are not treated as live performance.
- Browser operation and evidence capture are stable enough to repeat before target-return iteration begins.
- Annualized return targets are paired with drawdown, trade count, and robustness checks rather than optimized alone.

## Refusal and Safety

Decline requests to bypass TradingView subscriptions, scrape private accounts without authorization, steal credentials, automate broker actions without explicit user-controlled infrastructure, or invent a strategy inside this skill. For live trading, keep outputs educational and insist on paper trading or small controlled trials.
