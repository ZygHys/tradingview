# Iteration Review

Use this reference when the user asks to keep running and reviewing strategy variants until a target such as 20% annualized return is reached.

Target-return iteration starts only after the TradingView operation loop is stable: supplied strategy loading, Strategy Tester refresh, evidence capture, run-record completion, review rendering, and next-run request generation all work for the current setup.

## Allowed Iteration

Allowed in this skill:

- Compare supplied strategy versions.
- Compare supplied parameter/input sets.
- Correct TradingView setup mistakes.
- Identify whether a result improvement came from settings, data range, costs, or the supplied strategy version.

Not allowed in this skill:

- Invent new trading rules.
- Add indicators or entry/exit logic.
- Reverse-engineer public-account behavior into a new strategy.

## Iteration Loop

For each candidate run:

1. Name the run: `run-001`, `run-002`, etc.
2. Record the exact changed variable.
3. Run Strategy Tester.
4. Capture result evidence.
5. Compute annualized return when date range is known.
6. Compare against prior run and target.
7. Decide: keep, retest, reject, or request the next supplied variant.

For JSON run records, use the bundled comparer after scoring-ready metrics are filled:

```bash
node scripts/compare-runs.js runs.json
```

The input can be a JSON array, `{ "runs": [...] }`, or `{ "run_records": [...] }`. The comparer reuses `score-run.js`, ranks supplied versions by target status, annualized return, profit factor, and drawdown, and keeps `fixture_only` runs out of valid strategy selection.

See `assets/run-record-examples/target-iteration-runs.json` for a sanitized supplied-parameter A/B comparison example.

To produce a portable Markdown decision report from the same run set, use:

```bash
node scripts/render-review.js runs.json
```

See `assets/review-examples/target-iteration-review.md` for the expected report shape. It should be generated from supplied strategy versions or supplied parameter sets, not from the bundled smoke-test fixture.

To convert the comparison into the next machine-readable browser/manual action, use:

```bash
node scripts/create-next-run-request.js runs.json
```

The output states whether the next action is a robustness retest, trade export, lower-risk supplied variant, missing-evidence recovery, a request for the next supplied version, or a real-strategy handoff request after a fixture is rejected or only a fixture is visible. See `assets/next-run-request-examples/target-iteration-next-run-request.json`, `assets/next-run-request-examples/blocked-report-render-next-run-request.json`, `assets/next-run-request-examples/fixture-rejected-next-run-request.json`, and `assets/next-run-request-examples/fixture-visible-no-real-handoff-next-run-request.json`.

To render a next-run request for a user or browser operator, use:

```bash
node scripts/render-next-run-request.js next-run-request-or-run-record.json
```

The renderer accepts either a next-run request JSON or a run record/run set that can be converted by `create-next-run-request.js`. See `assets/next-run-request-examples/fixture-rejected-next-run-request.md` and `assets/next-run-request-examples/fixture-visible-no-real-handoff-next-run-request.md`.

## Target Gate

For a 20% annualized return target, continue iteration only when all of these are true:

- The TradingView operation loop is stable and auditable.
- The current candidate is a supplied Pine `strategy()`, a saved TradingView strategy, or a supplied parameter/version set.
- Strategy Tester summary metrics are captured strongly enough to compute or verify annualized return.
- Date range, test days, order size, commission, slippage, and pyramiding are recorded.
- The next change is supplied by the user or already exists as a named parameter/version set.

If the only successful run used the bundled smoke-test fixture, classify the browser workflow as `pass` but classify the strategy candidate as `reject`. Do not tune the fixture toward the target. The next allowed step is to request a real supplied `strategy()` or a supplied parameter/version set.

## Stop Rules

Stop and report instead of continuing when:

- TradingView login, subscription, or data limits block the run.
- The script is an indicator, not a strategy.
- Metrics cannot be collected strongly enough to compare.
- A run reaches target return only by unacceptable drawdown, too few trades, or missing costs.
- Further progress requires inventing strategy logic.
- The available run is only a smoke fixture or plumbing check.

When stopping, produce a blocked-run record instead of a vague status update. Include the last observed UI evidence, the missing checkpoint, and the smallest user action needed to resume.
