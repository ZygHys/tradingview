#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { scoreRun, parseReturn } = require("./score-run.js");
const { compareRuns } = require("./compare-runs.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/render-review.js <run-record-or-runs.json>",
    "  node scripts/render-review.js -  # read JSON from stdin",
  ].join("\n");
}

function readInput(target) {
  if (!target || target === "--help" || target === "-h") {
    console.log(usage());
    process.exit(target ? 0 : 2);
  }
  if (target === "-") {
    return fs.readFileSync(0, "utf8").replace(/^\uFEFF/, "");
  }
  return fs.readFileSync(path.resolve(target), "utf8").replace(/^\uFEFF/, "");
}

function getRuns(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && Array.isArray(raw.runs)) {
    return raw.runs;
  }
  if (raw && Array.isArray(raw.run_records)) {
    return raw.run_records;
  }
  if (raw && (raw.run_record || raw.metrics || raw.status)) {
    return [raw];
  }
  return [];
}

function unwrap(record) {
  return record && record.run_record ? record.run_record : record;
}

function runId(record, index) {
  const item = unwrap(record) || {};
  return item.run_id || `run-${String(index + 1).padStart(3, "0")}`;
}

function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatMetricValue(value) {
  if (value == null || value === "") {
    return "n/a";
  }
  if (typeof value === "number") {
    return formatNumber(value);
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function strategyLabel(record) {
  const item = unwrap(record) || {};
  const strategy = item.strategy || {};
  const parts = [strategy.name, strategy.version].filter(Boolean);
  return parts.length ? parts.join(" ") : "n/a";
}

function marketLabel(record) {
  const item = unwrap(record) || {};
  const market = item.market || {};
  return [market.exchange, market.symbol, market.timeframe].filter(Boolean).join(" ") || "n/a";
}

function changedLabel(record) {
  const item = unwrap(record) || {};
  const inputs = item.inputs || {};
  return inputs.changed_from_prior_run || item.changed_from_prior_run || "n/a";
}

function inputSummary(record) {
  const item = unwrap(record) || {};
  const values = item.inputs && item.inputs.values;
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return "n/a";
  }
  const pairs = Object.entries(values).map(([key, value]) => `${key}=${formatMetricValue(value)}`);
  return pairs.length ? pairs.map((item) => `\`${item}\``).join(", ") : "n/a";
}

function targetThreshold(records, scores) {
  for (const record of records) {
    const item = unwrap(record) || {};
    const threshold = item.target && item.target.threshold;
    const parsed = parseReturn(threshold);
    if (parsed != null) {
      return parsed;
    }
  }
  for (const score of scores) {
    const threshold = score.metrics && score.metrics.target_threshold;
    if (threshold != null) {
      return threshold;
    }
  }
  return 0.2;
}

function renderWarnings(score) {
  const warnings = []
    .concat(score.errors || [])
    .concat(score.warnings || []);
  return warnings.length ? warnings.join("; ") : "none";
}

function renderReview(raw) {
  const records = getRuns(raw);
  if (records.length === 0) {
    return "# TradingView Backtest Review\n\nNo run records were supplied.\n";
  }

  const scores = records.map((record, index) => ({
    run_id: runId(record, index),
    record,
    score: scoreRun(record),
  }));
  const comparison = compareRuns({ runs: records });
  const target = targetThreshold(records, scores.map((item) => item.score));
  const bestRunId = comparison.best_run_id || scores[0].run_id;
  const best = scores.find((item) => item.run_id === bestRunId) || scores[0];
  const bestRecord = best ? best.record : null;
  const passCount = comparison.pass_count || 0;
  const watchCount = comparison.watch_count || 0;

  const lines = [];
  lines.push("# TradingView Backtest Review");
  lines.push("");
  lines.push(`- Target: annualized return >= ${formatPercent(target)}`);
  lines.push(`- Comparable runs: ${comparison.comparable_count || 0} / ${records.length}`);
  lines.push(`- Pass / watch: ${passCount} / ${watchCount}`);
  lines.push(`- Best run: ${bestRunId || "n/a"}`);
  lines.push(`- Decision: ${comparison.decision || best.score.decision || "No decision available."}`);
  lines.push(`- Next allowed step: ${comparison.next_allowed_step || best.score.next_allowed_step || "Collect complete Strategy Tester metrics."}`);
  lines.push("");
  lines.push("## Runs");
  lines.push("");
  lines.push("| Run | Status | Annualized | Net | Max DD | Trades | PF | Quality | Notes |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |");
  for (const item of scores) {
    const record = unwrap(item.record) || {};
    const metrics = record.metrics || {};
    const scored = item.score.metrics || {};
    const netReturn = scored.net_return != null ? scored.net_return : parseReturn(metrics.net_return);
    lines.push([
      item.run_id,
      item.score.status || "unknown",
      formatPercent(scored.annualized_return),
      formatPercent(netReturn),
      formatPercent(scored.max_drawdown),
      formatNumber(scored.total_trades),
      formatNumber(scored.profit_factor),
      item.score.strategy_quality || "unknown",
      renderWarnings(item.score),
    ].map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }
  lines.push("");
  lines.push("## Best Run Notes");
  lines.push("");
  lines.push(`- Strategy: ${strategyLabel(bestRecord)}`);
  lines.push(`- Market: ${marketLabel(bestRecord)}`);
  lines.push(`- Changed variable: ${changedLabel(bestRecord)}`);
  lines.push(`- Inputs: ${inputSummary(bestRecord)}`);
  lines.push(`- Warnings/errors: ${renderWarnings(best.score)}`);
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  lines.push("- Use only supplied Pine strategies, saved TradingView strategies, or supplied parameter/version sets.");
  lines.push("- Do not tune bundled smoke-test fixtures toward target return.");
  lines.push("- Treat target-reaching runs as provisional until another date range or exported trades confirm robustness.");
  lines.push("- Keep Strategy Tester evidence, settings, costs, and plan limitations attached to the run record.");
  return `${lines.join("\n")}\n`;
}

function main() {
  const target = process.argv[2];
  const input = readInput(target);
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    console.error(`Invalid JSON: ${error.message}`);
    process.exit(1);
  }
  process.stdout.write(renderReview(parsed));
}

if (require.main === module) {
  main();
}

module.exports = { renderReview };
