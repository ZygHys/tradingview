# Backtest Skill Plugin

`backtest-skill` is the first plugin in the unofficial `tradingview` marketplace.

It packages one reusable Agent Skill:

```text
skills/tradingview-backtest/SKILL.md
```

## Goal

Help an AI agent first stabilize TradingView operation for supplied strategies, then run Strategy Tester, collect results, review the evidence, and only after that iterate supplied versions or parameters toward a target metric such as 20% annualized return.

The plugin solves these recurring gaps:

- Which language or surface to use for each step.
- How to load, compile, and run an existing Pine Script v6 `strategy()` in TradingView.
- How to operate the TradingView UI or guide the user manually.
- How to collect and audit Strategy Tester results.
- How to detect repaint and lookahead risk.
- How to generate alert webhook payloads.
- How to compare runs and iterate user-provided versions or parameter sets without inventing strategy logic.
- How to accept a strategy handoff package from a user or future strategy-construction plugin before opening TradingView.
- How to keep stable browser operation and evidence capture as the baseline goal before target-return iteration.

## Components

| Path | Purpose |
| --- | --- |
| `.codebuddy-plugin/plugin.json` | AME / CodeBuddy-compatible plugin manifest |
| `.codex-plugin/plugin.json` | Codex plugin manifest |
| `.claude-plugin/plugin.json` | Claude Code-compatible plugin manifest |
| `commands/backtest.md` | Thin command entry that delegates to the skill |
| `skills/tradingview-backtest/SKILL.md` | Core skill workflow |
| `skills/tradingview-backtest/references/` | One-hop references loaded as needed |
| `skills/tradingview-backtest/references/end-to-end-browser-run.md` | Browser-to-Pine-Editor-to-Strategy-Tester execution protocol |
| `skills/tradingview-backtest/scripts/validate-handoff.js` | Dependency-free checker for executable strategy handoff packages |
| `skills/tradingview-backtest/scripts/create-run-session.js` | Dependency-free generator for browser run checklists from validated handoffs |
| `skills/tradingview-backtest/scripts/render-runbook.js` | Dependency-free Markdown runbook renderer for browser/manual execution |
| `skills/tradingview-backtest/scripts/normalize-run-record.js` | Dependency-free normalizer for copied Strategy Tester metrics |
| `skills/tradingview-backtest/scripts/complete-run-record.js` | Dependency-free merger for browser-captured metrics and run-session seeds |
| `skills/tradingview-backtest/scripts/score-run.js` | Dependency-free scorer for Strategy Tester run records |
| `skills/tradingview-backtest/scripts/compare-runs.js` | Dependency-free comparer for supplied strategy versions or parameter runs |
| `skills/tradingview-backtest/scripts/render-review.js` | Dependency-free Markdown review renderer for scored run records |
| `skills/tradingview-backtest/scripts/create-next-run-request.js` | Dependency-free generator for the next structured TradingView run request |
| `skills/tradingview-backtest/scripts/render-next-run-request.js` | Dependency-free Markdown renderer for next-run or handoff requests |
| `skills/tradingview-backtest/scripts/create-blocked-run.js` | Dependency-free generator for resumable blocked-run records |
| `skills/tradingview-backtest/assets/pine-fixtures/` | Minimal Pine fixtures for browser workflow smoke tests only |
| `skills/tradingview-backtest/assets/handoff-examples/` | Sanitized handoff packages for pre-browser validation |
| `skills/tradingview-backtest/assets/run-session-examples/` | Sanitized browser run-session examples |
| `skills/tradingview-backtest/assets/runbook-examples/` | Sanitized Markdown browser/manual runbooks generated from run sessions |
| `skills/tradingview-backtest/assets/run-record-examples/` | Sanitized JSON examples for blocked, copied, browser-completed, and iteration states |
| `skills/tradingview-backtest/assets/review-examples/` | Sanitized Markdown review examples generated from run records |
| `skills/tradingview-backtest/assets/next-run-request-examples/` | Sanitized next-run request examples for pass, blocked, and fixture-rejected states |
| `skills/tradingview-backtest/assets/run-package-templates/` | Fill-in templates for real strategy handoffs and browser-captured metrics |
| `scripts/validate.js` | Deterministic repository validation |

## Operational Notes

- A TradingView `strategy()` consumes an indicator slot when added to a chart. On Basic plans, use a blank layout or a chart with one free indicator slot before starting a browser run.
- The bundled Pine fixture is only for validating the browser/Pine Editor/Strategy Tester workflow. Do not use it as strategy-quality evidence or compare it to a 20% annualized return target.
- Iterating toward a 20% annualized return target requires a supplied real strategy or a supplied parameter/version set. The plugin records fixture runs as workflow evidence only.
- Annualized-return improvement is a later phase. The baseline goal is stable TV operation: load the supplied strategy, run Strategy Tester, capture evidence, complete the run record, render the review, and produce the next-run request.
- Browser execution starts only after a complete executable handoff exists: Pine `strategy()` code, accessible saved strategy, existing chart strategy plus parameter set, or Strategy Tester artifact.
- Browser runs follow `references/end-to-end-browser-run.md`: use the logged-in browser, write the supplied `strategy()` into Pine Editor, verify `strategy(`, add it to chart, collect Strategy Tester evidence, complete the run record, render the review, and emit the next-run request.
- `assets/run-package-templates/pine-strategy-handoff-template.json` and `assets/run-package-templates/browser-metrics-template.json` provide the fill-in contract for a real strategy browser run.
- JSON handoff packages can be checked with `skills/tradingview-backtest/scripts/validate-handoff.js` before opening TradingView.
- `assets/handoff-examples/pine-strategy-handoff.json` shows the minimum complete package accepted before browser execution.
- A validated handoff can be converted into a browser run checklist with `skills/tradingview-backtest/scripts/create-run-session.js`.
- `assets/run-session-examples/pine-strategy-session.json` shows the pre-browser checkpoints, browser steps, required evidence, and run-record seed.
- A run session or executable handoff can be rendered into a Markdown browser/manual runbook with `skills/tradingview-backtest/scripts/render-runbook.js`.
- `assets/runbook-examples/pine-strategy-runbook.md` shows the browser checklist, evidence checklist, stop conditions, and run-record seed for a Pine strategy run.
- Copied or transcribed Strategy Tester metrics can be normalized with `skills/tradingview-backtest/scripts/normalize-run-record.js`.
- `assets/run-record-examples/copied-metrics-cn-input.json` shows Chinese TradingView summary labels normalized into a run record.
- Browser-captured metrics can be merged with a run-session seed and scored with `skills/tradingview-backtest/scripts/complete-run-record.js`.
- `assets/run-record-examples/browser-report-cn-input.json` and `assets/run-record-examples/browser-report-cn-completed.json` show the Chrome TradingView fixture run after overlay-indicator removal.
- JSON run records can be scored with `skills/tradingview-backtest/scripts/score-run.js` after Strategy Tester metrics are collected.
- Multiple JSON run records can be compared with `skills/tradingview-backtest/scripts/compare-runs.js` without inventing new strategy logic.
- `assets/run-record-examples/target-iteration-runs.json` shows a supplied-parameter A/B comparison against a 20% annualized target.
- A deterministic review report can be rendered with `skills/tradingview-backtest/scripts/render-review.js` from one run record or multiple supplied runs.
- `assets/review-examples/target-iteration-review.md` shows the Markdown review produced from the target-iteration example.
- A structured next-run request can be generated with `skills/tradingview-backtest/scripts/create-next-run-request.js` after scoring/comparison.
- `assets/next-run-request-examples/target-iteration-next-run-request.json` shows a pass-state request to retest/export the best supplied version; `assets/next-run-request-examples/blocked-report-render-next-run-request.json` shows a blocked-state request for missing Strategy Tester evidence; `assets/next-run-request-examples/fixture-rejected-next-run-request.json` shows the required handoff request after a smoke fixture is rejected.
- A next-run request can be rendered to Markdown with `skills/tradingview-backtest/scripts/render-next-run-request.js`.
- `assets/next-run-request-examples/fixture-rejected-next-run-request.md` shows a human-readable handoff request generated from the fixture-rejected JSON request.
- Blocked browser or handoff states can be recorded with `skills/tradingview-backtest/scripts/create-blocked-run.js`.
- `assets/run-record-examples/blocked-report-render-input.json` shows how to record a Strategy Tester panel that stays blank even though strategy order markers are visible.
- `assets/run-record-examples/fixture-visible-no-real-handoff-input.json` shows how to stop when the logged-in chart only contains the bundled smoke fixture and no real strategy handoff exists.
- The skill must stop at account, layout, plan, or metric blockers and produce a blocked-run record instead of inventing results.
- Handoff examples and bundled fixtures reference files inside this plugin only, so cached plugin installs do not require repository-external paths.

## Validation

```bash
node scripts/validate.js
```

## Use

Ask the agent to use `$tradingview-backtest`, or install the `backtest-skill` plugin from the `tradingview` marketplace and ask naturally:

```text
Use the TradingView backtest skill to run this existing Pine strategy in TradingView, collect Strategy Tester results, and review whether parameter set B improves annualized return toward 20%.
```
