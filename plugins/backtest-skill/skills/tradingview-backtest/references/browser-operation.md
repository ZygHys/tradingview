# Browser Operation

Use this reference when the task involves operating TradingView in a browser.

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

## Strategy Tester Runbook

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

Do not use browser automation to design a new strategy from indicators or public accounts. Browser work in this skill is limited to loading supplied code, operating TradingView, collecting results, and comparing already-defined variants or inputs.

## Manual Checkpoints

Use manual checkpoints when account state or UI automation blocks a reliable run:

- `login-ready`: the user has logged in to TradingView and the chart is visible.
- `editor-empty`: Pine Editor is open and contains no default `indicator("My script")` snippet.
- `strategy-loaded`: the supplied `strategy()` script is in the editor and has been saved or added to chart.
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
