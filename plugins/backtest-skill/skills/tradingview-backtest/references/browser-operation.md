# Browser Operation

Use this reference when the task involves operating TradingView in a browser.

For the full sequence from logged-in browser to Pine Editor write, Strategy Tester metrics, and result analysis, use [end-to-end-browser-run.md](end-to-end-browser-run.md) first. This file provides lower-level browser behavior rules.

## Tool Preference

Use the host's browser tools when available:

- Codex in-app browser or Chrome control tools.
- Claude Code browser-capable tools if installed.
- Playwright-based tools if the environment exposes them.

If no browser tool is available, provide a manual runbook instead of pretending automation is possible.

## Login and Account State

TradingView login is user-owned.

- Ask the user to log in manually if needed.
- Do not request passwords, 2FA codes, cookies, or session exports.
- Do not store credentials.
- Do not automate broker orders from TradingView unless the user has explicitly provided a safe paper-trading or sandbox path.
- Treat visible prompts such as "Create a free account" or "Join for free" as evidence that the current session may not be able to save, add, or run scripts reliably. Stop and ask the user to sign in manually before continuing if Strategy Tester cannot be reached.
- Treat plan-limit prompts such as "maximum number of indicators" as account/layout constraints. Read [plan-limits-and-layouts.md](plan-limits-and-layouts.md) before removing or replacing anything.

## Strategy Tester Runbook

If a JSON handoff is available, run `node scripts/create-run-session.js <handoff.json>` first and follow the generated checkpoints. When the checklist needs to be handed to a user, browser operator, or another agent, run `node scripts/render-runbook.js <run-session-or-handoff.json>` and use the Markdown runbook as the visible execution guide. This keeps browser actions, required evidence, and allowed iteration scope tied to the supplied strategy instead of ad hoc page clicks.

1. Open `https://www.tradingview.com/chart/`.
2. Select the symbol and exchange.
3. Set timeframe and chart type.
4. Open Pine Editor.
5. Paste or update the supplied Pine v6 `strategy()` script.
6. Save the script.
7. Add it to chart.
8. Open Strategy Tester.
9. Configure strategy properties: capital, order size, commission, slippage, pyramiding, date range, and inputs.
10. Wait for Strategy Tester to refresh.
11. Capture Overview, Performance Summary, List of Trades, and Properties.
12. Export data if the UI and account plan expose export controls; otherwise capture visible tables and summarize limitations.

## Automation Style

When automating:

- Prefer semantic actions and stable UI text over fragile CSS selectors.
- Take screenshots after major UI transitions.
- Verify that the script was added to chart before reading Strategy Tester results.
- Pine Editor uses a Monaco-style editor. After paste or replace, verify the full editor content does not still contain the default `indicator("My script")` snippet or duplicated code before clicking "Add to chart".
- If direct `fill`, keyboard replace, or paste appends instead of replacing content, stop and switch to a manual checkpoint: ask the user to paste the supplied script into an empty Pine Editor and tell you when it is ready.
- If a selector fails, stop and ask for a screenshot or manual checkpoint.
- Keep a log of observed symbol, timeframe, script title, and visible metrics.
- If TradingView's chart page, Pine Editor, or Strategy Tester repeatedly times out in browser tooling, do not keep retrying the same action. Record a blocked-run entry, then switch to the manual runbook or ask the user to complete the named checkpoint.
- If the indicator or strategy dialog opens a preview/detail panel that covers the add-to-chart target, one layout recovery attempt is acceptable: reduce browser zoom, use fullscreen, or reopen the dialog. After two failed add attempts, stop and ask for `strategy-loaded` or `tester-ready`.
- If the Pine Editor or right-side Pine toolbar is not visible in the current layout, do not infer that TradingView has no Pine access. Ask for `editor-empty` or `strategy-loaded` instead of searching unrelated menus.
- If a strategy cannot be added because the account plan's indicator limit is already reached, follow [plan-limits-and-layouts.md](plan-limits-and-layouts.md): first try a non-destructive blank layout or fresh chart. If the same saved layout is reused, stop and ask for `blank-layout-ready` or explicit approval to remove existing indicators.
- When the user approves removing a named indicator to free a slot, use the approved indicator removal protocol in [plan-limits-and-layouts.md](plan-limits-and-layouts.md). Back up the chart first, target the exact row, and verify the row-local remove button before clicking.
- If Strategy Tester or Strategy Report opens but metrics remain unavailable in the DOM, do not claim performance. Ask for `metrics-captured` via screenshot, copied table, or export.
- Chart order markers and a strategy legend row only prove that TradingView loaded the strategy overlay. They are not Strategy Tester evidence.
- If Strategy Tester or Strategy Report opens and the content area stays blank after expanding the panel, clicking the visible strategy row, and checking available tabs, set `analysis.decision: blocked_at_report_render`, capture a screenshot, and ask for `metrics-captured`, an export, or explicit approval for one saved-layout reload.
- If Strategy Report shows only a loading spinner after the strategy is added, one non-destructive page reload is allowed when the layout is saved. After reload, verify the strategy is still visible, reopen the report if needed, then inspect both summary and trade-list tabs.

Do not use browser automation to design a new strategy from indicators or public accounts. Browser work in this skill is limited to loading supplied code, operating TradingView, collecting results, and comparing already-defined variants or inputs.

## Manual Checkpoints

Use manual checkpoints when account state or UI automation blocks a reliable run:

- `login-ready`: the user has logged in to TradingView and the chart is visible.
- `blank-layout-ready`: a TradingView chart is open with enough free indicator slots for one strategy.
- `editor-empty`: Pine Editor is open and contains no default `indicator("My script")` snippet.
- `strategy-loaded`: the supplied `strategy()` script is in the editor and has been saved or added to chart.
- `strategy-added`: a strategy, either supplied Pine code or a selected built-in strategy, is visibly added to the chart.
- `tester-ready`: Strategy Tester is open and has refreshed results for the visible script.
- `metrics-captured`: the user has provided a screenshot, copied table, or export.

When a checkpoint is needed, ask only for the exact next checkpoint. Do not ask for credentials or private session artifacts.

## Evidence to Capture

Minimum:

- Script title and version.
- Symbol and timeframe.
- Strategy inputs.
- Net profit, max drawdown, total trades, win rate, profit factor.
- Date range and data depth.
- Screenshot or export path when available.
