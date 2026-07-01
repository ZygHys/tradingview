# Strategy Handoff Contract

Use this reference when the task needs to continue from strategy creation, parameter search, public-account research, or another skill into TradingView execution.

This skill does not create trading logic. It accepts a strategy handoff package and runs or reviews it in TradingView.

## Accepted Handoff Artifacts

Accept one of:

- Pine Script v6 code containing a `strategy()` declaration.
- A saved TradingView strategy name that the logged-in user can open.
- A Strategy Tester result artifact: screenshot, copied table, or export.
- A named parameter/version set for a strategy already present on the chart.

Reject or reroute:

- An indicator-only `indicator()` script when no strategy wrapper is supplied.
- A vague trading idea, public-account story, chart screenshot, or indicator stack with no strategy execution rules.
- A request to infer new entries, exits, filters, stops, or take-profit logic inside this skill.

## Minimum Handoff Package

Before browser execution, collect or mark unknown. JSON is preferred when using the bundled validator; YAML is acceptable for manual records.

Use `assets/run-package-templates/pine-strategy-handoff-template.json` as the fill-in package when a user supplies Pine code, a saved strategy name, or a parameter set in prose instead of JSON.

```yaml
handoff:
  strategy_name:
  strategy_version:
  artifact_type: pine_strategy | saved_tradingview_strategy | parameter_set | tester_result
  pine_source_path_or_inline_code:
  symbol:
  exchange:
  timeframe:
  chart_type:
  date_range:
  initial_capital:
  order_size:
  commission:
  slippage:
  pyramiding:
  margin:
  target_metric:
  target_threshold:
  parameter_sets:
    - name:
      values:
  allowed_next_variants:
```

## Validate The Package

For JSON handoff packages, run the bundled dependency-free validator before opening TradingView:

```bash
node scripts/validate-handoff.js handoff.json
```

See `assets/handoff-examples/pine-strategy-handoff.json` for a complete executable Pine `strategy()` handoff example, and `assets/handoff-examples/indicator-only-invalid.json` for an input that must be blocked or rerouted.

Use `-` to read JSON from stdin:

```bash
node scripts/validate-handoff.js -
```

The validator only checks execution readiness. It does not judge strategy quality, financial merit, or whether the target will be reached.

## Create A Browser Run Package

After validation passes, create a browser run package before operating TradingView:

```bash
node scripts/create-browser-run-package.js handoff.json
```

Use `--format markdown` when a browser operator needs a direct runbook:

```bash
node scripts/create-browser-run-package.js handoff.json --format markdown
```

Use `--output <path>` to persist either format with the run artifacts. See `assets/browser-run-package-examples/pine-strategy-browser-run-package.json` and `assets/browser-run-package-examples/pine-strategy-browser-run-package.md` for generated examples.

The package combines validation, run-session seed, objective order, guardrails, and a Markdown runbook. If validation fails, it blocks before opening TradingView.

Use lower-level scripts only when a specific intermediate artifact is needed:

```bash
node scripts/create-run-session.js handoff.json
```

The output records preflight checkpoints, browser steps, required Strategy Tester evidence, allowed iteration scope, and a run-record seed. See `assets/run-session-examples/pine-strategy-session.json`.

If validation fails, the script returns a blocked session hint and must not open TradingView or fill missing strategy logic.

## Gate Before Chrome

Open TradingView only when at least one executable artifact is present:

- `artifact_type: pine_strategy` and the script contains `strategy(`.
- `artifact_type: saved_tradingview_strategy` and the strategy name is accessible in the user's logged-in account.
- `artifact_type: parameter_set` and the base strategy is already on the chart or explicitly named.

If the package is incomplete, produce a blocked-run record that names the missing fields. Do not fill missing trading logic from context.

If the logged-in browser already has the bundled smoke fixture on the chart but no real handoff package exists, treat that as `fixture_visible_no_real_handoff`. Produce a blocked-run record and request a real Pine `strategy()`, saved TradingView strategy name, Strategy Tester artifact, or supplied parameter/version set.

If the only completed run is a bundled smoke fixture, run `node scripts/create-next-run-request.js <fixture-run-record.json>` and return the generated handoff request. Render it with `node scripts/render-next-run-request.js <next-run-request.json>` when the handoff must be readable by a user or browser operator. Do not continue parameter optimization on the fixture. See `assets/next-run-request-examples/fixture-rejected-next-run-request.json`, `assets/next-run-request-examples/fixture-rejected-next-run-request.md`, `assets/next-run-request-examples/fixture-visible-no-real-handoff-next-run-request.json`, and `assets/next-run-request-examples/fixture-visible-no-real-handoff-next-run-request.md`.

## Handoff To Iteration

For target-driven loops such as annualized return >= 20%:

- Treat each `parameter_sets[].name` or `strategy_version` as a candidate run.
- Change only supplied inputs or supplied versions.
- Use `run-record-template.md` for each run.
- Stop when the next improvement would require inventing strategy logic.
