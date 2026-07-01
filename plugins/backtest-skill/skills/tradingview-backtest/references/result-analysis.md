# Result Collection and Analysis

Use this reference when collecting or reviewing TradingView Strategy Tester results.

When metrics come from a live browser run, pair this file with [end-to-end-browser-run.md](end-to-end-browser-run.md) so browser evidence, run-session seed, scoring, review, and next-run request stay tied together.

## Evidence Priority

Prefer, in order:

1. Exported Strategy Tester data when available.
2. Copied Strategy Tester tables.
3. Screenshots with visible settings and metrics.
4. Manual metric transcription with explicit uncertainty.

## Minimum Result Record

For every run, record:

- Run id.
- Strategy name and version.
- Symbol, exchange, timeframe, and chart type.
- Date range and approximate test days.
- Inputs and strategy properties.
- Net profit and net return.
- Annualized return if date range is known.
- Max drawdown.
- Total trades.
- Win rate.
- Profit factor.
- Average trade.
- Largest win/loss if visible.
- Notes on data depth, plan limits, Deep Backtesting, and Bar Magnifier.

Use [run-record-template.md](run-record-template.md) when the output needs to be persisted, compared across runs, or resumed by another agent.

## Normalize Copied Metrics

When Strategy Tester metrics are copied or manually transcribed as labels and values, normalize them before scoring:

```bash
node scripts/normalize-run-record.js copied-metrics.json
```

The input can include `fields` for key-value labels or `raw_text` for pasted Strategy Tester text. The normalizer maps common English labels and Chinese UI labels such as `总损益`, `最大回撤`, `盈利交易`, `盈利因子`, and `平均盈亏` into the run record metric fields. It only structures evidence; it does not calculate strategy quality.

See `assets/run-record-examples/copied-metrics-cn-input.json` and `assets/run-record-examples/copied-metrics-cn-normalized.json` for a sanitized Chinese UI metrics example.

## Complete A Browser Run Record

When a browser run starts from `scripts/create-run-session.js`, merge the generated `run_record_seed` with copied/transcribed metrics and evidence before scoring:

```bash
node scripts/complete-run-record.js browser-report.json
```

Use `assets/run-package-templates/browser-metrics-template.json` as the fill-in package when the browser operator has screenshots, copied fields, exports, or manual transcriptions but no JSON report yet.

The input can contain `run_record_seed`, `run_session.run_record_seed`, or an existing `run_record` plus `fields`, `raw_text`, normalized `metrics`, and `evidence`. The output is a full JSON run record with `workflow_result`, `strategy_quality`, target comparison, scorer output, and missing-metric blockers when evidence is incomplete.

See `assets/run-record-examples/browser-report-cn-input.json` and `assets/run-record-examples/browser-report-cn-completed.json` for a Chrome TradingView fixture run whose metrics are captured after removing a non-strategy overlay indicator.

## Score A Run Record

For JSON run records, use the bundled dependency-free scorer to compute annualized return and a target decision before writing the review:

```bash
node scripts/score-run.js run-record.json
```

Use `-` to read JSON from stdin:

```bash
node scripts/score-run.js -
```

The scorer accepts decimal returns such as `-0.2496` and percent strings such as `-24.96%`. It separates `workflow_result` from `strategy_quality`, rejects `fixture_only` records as strategy candidates, and treats annualized return >= 20% as incomplete unless drawdown, trade count, and profit factor are also acceptable.

## Render A Review Report

After one run record or a supplied run set is normalized and score-ready, generate a deterministic Markdown report:

```bash
node scripts/render-review.js run-record-or-runs.json
```

Use `-` to read JSON from stdin:

```bash
node scripts/render-review.js -
```

The renderer reuses `score-run.js` and `compare-runs.js`, summarizes the target gate, best run, decision, next allowed step, and per-run quality notes. See `assets/review-examples/target-iteration-review.md` for the Markdown report generated from `assets/run-record-examples/target-iteration-runs.json`.

## TradingView Field Names

English and localized TradingView labels vary by account language. Map visible labels to the normalized record fields:

| Normalized field | Common Chinese label |
| --- | --- |
| net profit / net return | `总损益` |
| max drawdown | `最大回撤` |
| win rate and winning trades | `盈利交易` |
| profit factor | `盈利因子` |
| average trade | `平均盈亏` |
| total trades | `总交易` |
| trade list | `交易清单` |
| date range | header range such as `2026年6月8日 — 2026年7月1日` |

If the trade-list tab is available, record whether a `.csv` download control is visible. Do not treat a trade list alone as complete evidence; also capture summary metrics.

## Analysis

Classify the result:

- `pass`: target metric reached with acceptable risk and enough trades.
- `watch`: target reached but evidence is weak or risk is high.
- `iterate`: below target but a specific next supplied variant or input set is worth testing.
- `reject`: insufficient edge, excessive drawdown, too few trades, or invalid setup.
- `blocked`: TradingView account state, browser instability, missing supplied strategy, or unavailable metrics prevents a valid comparison.

For a 20% annualized return target, never use annualized return alone. Pair it with drawdown, trade count, time coverage, and setup validity.

## Operational First

Before recommending target-return iteration, decide whether the TV operation loop itself is stable:

- `operation_stable`: supplied strategy loaded, Strategy Tester refreshed, metrics/evidence were captured, and the run can be reconstructed.
- `operation_blocked`: account, layout, plan, browser, or report-rendering state prevented auditable metrics.
- `operation_incomplete`: the strategy loaded but screenshots, tables, exports, properties, or copied metrics are not strong enough for analysis.

If operation is blocked or incomplete, the next recommendation must repair the TV operation or evidence path. Do not move to annualized-return improvement until operation is stable.

## Target Comparison Rules

Separate workflow validity from strategy quality:

- `workflow_result`: whether TradingView loaded the script, refreshed Strategy Tester, and exposed usable metrics or exports.
- `strategy_quality`: whether the supplied candidate is worth keeping, watching, iterating, or rejecting.

When a bundled smoke-test fixture is used, `workflow_result` can be `pass` if metrics are captured, but `strategy_quality` must be `reject`. Do not promote fixture results into a target-reaching comparison, and do not tune fixture inputs to chase annualized return.

Continue a 20% annualized-return iteration only when the next run is backed by a supplied strategy version or supplied parameter set. If that artifact is missing, set `status: blocked` or `status: reject` according to the run evidence, and make `analysis.next_allowed_step` ask for the smallest real strategy artifact needed to resume.
