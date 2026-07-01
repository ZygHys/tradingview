# Plan Limits and Layouts

Use this reference when TradingView account plan limits, saved chart layouts, indicator slots, or add-to-chart blockers affect a Strategy Tester run.

## Facts to Record

Record the exact visible blocker before choosing recovery:

- Current plan name if visible.
- Indicator limit and current indicator count if visible.
- Historical bar limit, data-depth prompt, or Basic plan upsell if visible.
- Whether the chart is a saved layout or an unsaved blank layout.
- Whether the attempted script is a `strategy()`.
- Whether Strategy Tester already has a populated result from another strategy.

## Indicator Slot Rule

Treat a Pine `strategy()` added to the chart as consuming a TradingView indicator slot. If the plan says the maximum number of indicators is reached, do not keep clicking `Add to chart`.

Do not remove indicators from a user's saved chart layout unless the user explicitly approves that specific change.

## Data-Depth Upsells

A historical-bars, data-depth, or Basic plan upsell is different from an indicator-slot blocker.

- Record the visible prompt and the implied data-depth limit.
- Dismiss it only when it blocks Strategy Tester inspection.
- Do not start a trial, change subscription, or bypass a plan limit.
- Do not use the prompt itself as evidence that metrics exist.
- If the report remains blank after dismissal, follow `blocked_at_report_render` in [failure-recovery.md](failure-recovery.md).

## Non-Destructive Recovery Order

Try these before asking to remove anything:

1. Open a fresh TradingView chart tab with the target symbol.
2. Check whether TradingView reused the same saved layout.
3. If the same layout is reused, look for a new blank layout or layout-management option.
4. If no reliable blank-layout action is exposed, stop and ask for `blank-layout-ready`.

`blank-layout-ready` means:

```text
A TradingView chart is open, logged in, on the target symbol/timeframe, and has at least one free indicator slot for a strategy.
```

## Destructive or Account-Changing Actions

Do not do these without explicit user approval:

- Remove existing chart indicators.
- Delete or overwrite saved chart layouts.
- Start a TradingView trial or subscription change.
- Change broker/trading connections.
- Accept payment, billing, or subscription prompts.

## Approved Indicator Removal Protocol

Use this only after the user explicitly approves removing a named indicator from the current saved layout.

1. Capture a screenshot before changing the chart.
2. Record the exact indicator name and visible row text.
3. Target the indicator row by a stable row label or title, not a generic `移除` / `Remove` button.
4. Activate or hover the exact row.
5. Verify the row-local remove button is visible and actionable before clicking it.
6. Click only that row-local remove button.
7. Capture a screenshot after removal.
8. Verify the removed indicator text is absent from the legend/object tree.

TradingView can expose multiple generic remove buttons at once, including hidden or inactive row actions. A generic remove click can delete the wrong indicator. If the wrong indicator is removed, stop, record the mistake, and do not continue removing other indicators without fresh user approval.

## Recovery Wording

Ask for the smallest next checkpoint:

```text
TradingView blocked Add to chart because the current layout already uses the plan's indicator limit. Please open a blank TradingView layout with one free indicator slot and tell me `blank-layout-ready`, or explicitly approve removing one existing indicator from the current layout.
```

## Evidence

For the blocked-run record, include:

- The visible plan-limit text.
- Existing indicator names if visible.
- Whether a fresh chart reused the same saved layout.
- What non-destructive recovery was attempted.
- The next allowed action.
- For approved removals, include the before/after screenshot paths and the row-specific selector or visible label used.
- For historical-bars or data-depth prompts, include the visible plan prompt and whether metrics remained unavailable after dismissal.
