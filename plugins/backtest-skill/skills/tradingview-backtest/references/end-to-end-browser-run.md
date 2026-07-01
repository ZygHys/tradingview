# End-to-End Browser Strategy Run

Use this reference before opening TradingView when the task is to operate a logged-in browser, put a supplied Pine strategy into TradingView, run Strategy Tester, and analyze the result.

## Objective Ladder

Use this order:

1. Stable TradingView operation: open the logged-in chart, manage layout/plan blockers, write or select the supplied strategy, and reach Strategy Tester repeatably.
2. Evidence capture: collect screenshots, copied tables, exports, properties, and browser notes strongly enough to reconstruct the run.
3. Result analysis: normalize metrics, complete the run record, score it, render a review, and emit the next-run or blocked-run request.
4. Target-return iteration: only after the first three levels are reliable, compare supplied strategy versions or supplied parameter sets against targets such as annualized return >= 20%.

Do not treat annualized return as the baseline success condition. The baseline success condition is a stable TV operation and analysis loop.

## Definition Of Done

A browser strategy run is complete only when all are true:

- The exact supplied `strategy()` or saved strategy/version is identified.
- TradingView is on the requested symbol, exchange, timeframe, and chart type.
- The strategy is added to the chart or an existing saved strategy is selected.
- Strategy Tester or Strategy Report exposes auditable metrics, copied tables, screenshots, or exports.
- The metrics are converted into a completed run record, scored, reviewed, and followed by a next-run request or blocked-run record.

Chart order markers, a legend row, or a successful compile are not enough. They prove the chart loaded something, not that Strategy Tester produced evidence.

## Preflight Gate

Before browser work:

1. Read [strategy-handoff.md](strategy-handoff.md) and verify the artifact is executable.
2. If the user has no JSON package yet, copy `assets/run-package-templates/pine-strategy-handoff-template.json`, fill it with the supplied strategy details, and keep the filled copy with the run artifacts.
3. If JSON is available, run `node scripts/validate-handoff.js <handoff.json>`.
4. Run `node scripts/create-run-session.js <handoff.json>` for a reproducible run seed.
5. Run `node scripts/render-runbook.js <run-session-or-handoff.json>` when the steps must be handed to a user, browser operator, or another agent.
6. Stop if the handoff is indicator-only, a trading idea, public-account research, or missing execution rules. Do not fill missing trading logic inside this skill.

If the user has not supplied a real strategy and only wants browser plumbing tested, use the bundled smoke fixture under `assets/pine-fixtures/` and mark the result as workflow evidence only.

## Browser Operation Protocol

Use the user's logged-in browser when available.

1. Open the TradingView chart.
2. Capture a screenshot before layout changes.
3. Set the requested symbol, exchange, timeframe, and chart type.
4. Confirm the chart has one free indicator slot. If the plan blocks adding a strategy, follow [plan-limits-and-layouts.md](plan-limits-and-layouts.md).
5. Open Pine Editor or the saved strategy selector.
6. Record the visible strategy title, chart symbol, timeframe, and any plan/layout blocker before clicking destructive controls.

Do not ask for credentials, cookies, 2FA codes, broker secrets, or webhook secrets.

## Pine Editor Write Protocol

Use this only for supplied Pine `strategy()` code.

1. Open Pine Editor.
2. Create a new script or select a scratch script when the UI exposes one.
3. Replace the editor contents with the supplied code.
4. Verify the editor no longer contains the default `indicator("My script")` snippet or duplicated old code.
5. Verify the code contains a `strategy(` declaration.
6. Save with a deterministic name that includes the supplied strategy name/version when possible.
7. Click `Add to chart`.
8. If TradingView reports compile errors, fix only mechanical compile/run issues that preserve the supplied trading logic, such as Pine version syntax or obvious name typos. Record every fix. If the fix would change entries, exits, filters, stops, sizing, or take-profit logic, stop and request a corrected strategy handoff.

If automation cannot reliably replace Monaco editor content, ask for the `strategy-loaded` checkpoint instead of repeatedly pasting.

## Strategy Tester Protocol

After the strategy is added:

1. Open Strategy Tester or Strategy Report.
2. Open Properties/Settings when available and record initial capital, order size, commission, slippage, pyramiding, margin, inputs, and date range. If a value cannot be set in the UI, record the visible or inferred actual value instead of pretending it was configured.
3. Wait for the report to refresh.
4. Capture Overview, Performance Summary, List of Trades, and Properties when available.
5. Export reports or trade lists when exposed by the account plan; otherwise copy visible tables or capture screenshots.
6. If the report stays blank or metrics are unavailable, follow [failure-recovery.md](failure-recovery.md) and produce a blocked-run record.

## Result Analysis Protocol

When metrics are available:

1. If no browser report JSON exists yet, copy `assets/run-package-templates/browser-metrics-template.json` and fill it with the run-session seed, Strategy Tester fields, screenshots, exports, copied tables, and browser notes.
2. Normalize copied/transcribed Strategy Tester labels with `node scripts/normalize-run-record.js <metrics.json>` when needed.
3. Merge browser metrics with the run-session seed using `node scripts/complete-run-record.js <browser-report.json>`.
4. Score the completed record with `node scripts/score-run.js <run-record.json>`.
5. Render a Markdown review with `node scripts/render-review.js <run-record-or-runs.json>`.
6. Create the next structured request with `node scripts/create-next-run-request.js <run-record-or-runs.json>`.
7. Render the request for handoff with `node scripts/render-next-run-request.js <next-run-request.json>`.

For a target such as annualized return >= 20%, first confirm the operation and evidence loop is stable. Then evaluate annualized return together with max drawdown, total trades, profit factor, date coverage, setup validity, and whether the next candidate is user-supplied.

## Stop Conditions

Stop and produce a blocked-run or next-run request when:

- The artifact is not a Pine `strategy()` or accessible saved strategy.
- The browser is not logged in and Strategy Tester cannot be reached.
- TradingView plan/layout limits prevent adding one strategy and the user has not approved a non-destructive recovery or named indicator removal.
- The strategy is visible on the chart but Strategy Tester metrics are missing.
- Continuing would require inventing strategy logic or changing trading rules.
- The only completed run is the bundled smoke fixture; request a real strategy, saved strategy, Strategy Tester artifact, or supplied parameter/version set.
