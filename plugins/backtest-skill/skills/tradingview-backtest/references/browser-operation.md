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

## Strategy Tester Runbook

1. Open `https://www.tradingview.com/chart/`.
2. Select the symbol and exchange.
3. Set timeframe and chart type.
4. Open Pine Editor.
5. Paste or update the Pine v6 `strategy()` script.
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
- If a selector fails, stop and ask for a screenshot or manual checkpoint.
- Keep a log of observed symbol, timeframe, script title, and visible metrics.

## Evidence to Capture

Minimum:

- Script title and version.
- Symbol and timeframe.
- Strategy inputs.
- Net profit, max drawdown, total trades, win rate, profit factor.
- Date range and data depth.
- Screenshot or export path when available.

