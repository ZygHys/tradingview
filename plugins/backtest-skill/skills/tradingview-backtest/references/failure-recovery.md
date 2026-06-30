# Failure Recovery

Use this reference when TradingView browser operation fails, account state blocks the flow, or the agent cannot collect enough Strategy Tester evidence.

## Do Not Retry Blindly

Stop repeating an action when any of these happen twice:

- TradingView chart, Pine Editor, or Strategy Tester page load times out.
- Pine Editor replacement leaves duplicated code or the default `indicator("My script")` snippet.
- A visible sign-up or account prompt blocks save, add-to-chart, or Strategy Tester refresh.
- Metrics cannot be found after the strategy is supposedly added to chart.

## Recovery Decision

Choose the smallest recovery path:

| Condition | Next action |
| --- | --- |
| User is not logged in | Ask for `login-ready` manual checkpoint. |
| Pine Editor contains mixed code | Ask for `editor-empty` or `strategy-loaded` manual checkpoint. |
| Strategy Tester is not reachable | Ask for `tester-ready` manual checkpoint. |
| Metrics are not visible | Ask for `metrics-captured` screenshot, copied table, or export. |
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

