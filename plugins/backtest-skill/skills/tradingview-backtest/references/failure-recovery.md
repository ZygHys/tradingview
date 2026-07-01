# Failure Recovery

Use this reference when TradingView browser operation fails, account state blocks the flow, or the agent cannot collect enough Strategy Tester evidence.

## Do Not Retry Blindly

Stop repeating an action when any of these happen twice:

- TradingView chart, Pine Editor, or Strategy Tester page load times out.
- Pine Editor replacement leaves duplicated code or the default `indicator("My script")` snippet.
- A visible sign-up or account prompt blocks save, add-to-chart, or Strategy Tester refresh.
- A built-in strategy search result opens a detail or preview panel that blocks the add-to-chart target.
- TradingView reports the current plan's indicator limit is reached when adding a strategy to chart.
- Metrics cannot be found after the strategy is supposedly added to chart.
- A strategy legend row or chart order markers are visible, but the Strategy Tester or Strategy Report content area remains blank after opening, expanding, and selecting the strategy row.
- A Basic plan historical-bars or data-depth upsell appears while the report is still blank.

## Recovery Decision

Choose the smallest recovery path:

| Condition | Next action |
| --- | --- |
| User is not logged in | Ask for `login-ready` manual checkpoint. |
| Pine Editor contains mixed code | Ask for `editor-empty` or `strategy-loaded` manual checkpoint. |
| Built-in strategy is visible but the detail or preview panel blocks add-to-chart | Ask for `strategy-loaded` or `tester-ready` manual checkpoint. |
| Pine Editor or the Pine toolbar is not visible in the chart layout | Ask for `editor-empty` or `strategy-loaded` manual checkpoint. |
| Plan indicator limit blocks Add to chart | Read `plan-limits-and-layouts.md`, then ask for `blank-layout-ready` or explicit approval to remove existing chart indicators. |
| User approves removing a named indicator | Back up the chart, use row-local removal from `plan-limits-and-layouts.md`, verify the named row disappeared, then retry Add to chart once. |
| Wrong indicator is removed | Stop, record the mistaken removal and evidence, and ask for a new user decision before any further destructive chart changes. |
| Strategy Tester is not reachable | Ask for `tester-ready` manual checkpoint. |
| Metrics are not visible or Strategy Report times out | Ask for `metrics-captured` screenshot, copied table, or export. |
| Strategy Report spinner persists after a strategy is visible | If the layout is saved and reload is acceptable for the current handoff, reload the same chart once, verify the strategy remains visible, reopen the report, then inspect summary and trade-list tabs. |
| Strategy Tester content is blank after strategy and chart order markers are visible | Record `blocked_at_report_render`, capture screenshot evidence, and do not treat chart order markers as Strategy Tester evidence. Ask for `metrics-captured`, a Strategy Tester export, or explicit approval for one saved-layout reload. |
| The logged-in chart contains only the bundled smoke fixture and no real handoff exists | Record `fixture_visible_no_real_handoff`; do not continue return iteration. Ask for a real Pine `strategy()`, saved TradingView strategy, tester artifact, or supplied parameter/version set. |
| Basic historical-bars or data-depth upsell appears while metrics are unavailable | Record the plan/data-depth limitation and dismiss only if it blocks the report. Do not start a trial, change subscription, or infer metrics from the chart. |
| Supplied artifact is an indicator | Stop; this skill requires an existing strategy. |
| Further improvement needs new rules | Stop; route to a strategy-construction skill. |

## Blocked-Run Record

When blocked, still produce a useful artifact:

```text
status: blocked
last_observed_state:
blocking_condition:
missing_checkpoint:
what_was_attempted:
evidence:
smallest_resume_action:
not_attempted:
```

`not_attempted` should explicitly state unsafe or out-of-scope actions, such as credential capture, subscription bypass, or inventing new strategy logic.

For JSON blocked records, use the bundled generator:

```bash
node scripts/create-blocked-run.js blocked-input.json
```

See `assets/run-record-examples/blocked-report-render-input.json` and `assets/run-record-examples/blocked-report-render-run.json` for a sanitized `blocked_at_report_render` example.

See `assets/run-record-examples/fixture-visible-no-real-handoff-input.json` and `assets/run-record-examples/fixture-visible-no-real-handoff-run.json` for a sanitized example where the browser is usable but the only strategy available is the smoke fixture. This state proves the operating surface can be inspected; it does not permit 20% target-return iteration.

The input should include `blocking_condition`, missing checkpoints or fields, what was attempted, observed evidence, and the smallest resume action. The generator does not diagnose the browser or create strategy logic; it only turns a known blocked state into a resumable run record.
