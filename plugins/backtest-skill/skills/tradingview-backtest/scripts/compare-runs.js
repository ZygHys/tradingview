#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { scoreRun } = require("./score-run.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/compare-runs.js <runs.json>",
    "  node scripts/compare-runs.js -  # read JSON from stdin",
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
  return [];
}

function runId(record, index) {
  const item = record && record.run_record ? record.run_record : record;
  return (item && item.run_id) || `run-${String(index + 1).padStart(3, "0")}`;
}

function statusRank(status) {
  return {
    pass: 5,
    watch: 4,
    iterate: 3,
    reject: 2,
    blocked: 1,
  }[status] || 0;
}

function rankScore(scored) {
  const metrics = scored.metrics || {};
  const annualized = metrics.annualized_return == null ? -Infinity : metrics.annualized_return;
  const drawdown = metrics.max_drawdown == null ? 0.25 : metrics.max_drawdown;
  const profitFactor = metrics.profit_factor == null ? 1 : metrics.profit_factor;
  return statusRank(scored.status) * 1000 + annualized * 100 + profitFactor * 10 - drawdown * 10;
}

function compareRuns(raw) {
  const runs = getRuns(raw);
  const errors = [];
  if (runs.length === 0) {
    return { ok: false, errors: ["Input must contain an array, runs[], or run_records[]."] };
  }

  const scored = runs.map((record, index) => {
    const score = scoreRun(record);
    return {
      run_id: runId(record, index),
      status: score.status,
      strategy_quality: score.strategy_quality,
      annualized_return: score.metrics.annualized_return,
      max_drawdown: score.metrics.max_drawdown,
      total_trades: score.metrics.total_trades,
      profit_factor: score.metrics.profit_factor,
      decision: score.decision,
      warnings: score.warnings,
      errors: score.errors,
      rank_score: rankScore(score),
    };
  });

  const valid = scored.filter((item) => item.errors.length === 0);
  if (valid.length === 0) {
    errors.push("No comparable runs have complete metrics.");
  }

  const sorted = [...valid].sort((a, b) => b.rank_score - a.rank_score);
  const best = sorted[0] || null;
  const passCount = valid.filter((item) => item.status === "pass").length;
  const watchCount = valid.filter((item) => item.status === "watch").length;

  let decision = "No comparable run is ready.";
  let nextAllowedStep = "Collect complete Strategy Tester metrics or exports.";
  if (best) {
    if (best.status === "pass") {
      decision = `${best.run_id} is the strongest run and reaches the target with basic checks satisfied.`;
      nextAllowedStep = "Retest the best supplied version on another date range or export trades for robustness review.";
    } else if (best.status === "watch") {
      decision = `${best.run_id} reaches return target but has weak risk or evidence checks.`;
      nextAllowedStep = "Collect more evidence or run a supplied lower-risk variant.";
    } else if (best.status === "iterate") {
      decision = `${best.run_id} is the strongest run, but the target is not reached.`;
      nextAllowedStep = "Run the next supplied strategy version or supplied parameter set.";
    } else {
      decision = `${best.run_id} is the strongest available run, but it is not acceptable.`;
      nextAllowedStep = "Request a real supplied strategy version or parameter set with a different setup.";
    }
  }

  return {
    ok: errors.length === 0,
    best_run_id: best ? best.run_id : null,
    pass_count: passCount,
    watch_count: watchCount,
    comparable_count: valid.length,
    decision,
    next_allowed_step: nextAllowedStep,
    runs: scored.map(({ rank_score, ...item }) => item),
    errors,
  };
}

function main() {
  const target = process.argv[2];
  const input = readInput(target);
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    console.error(JSON.stringify({ ok: false, errors: [`Invalid JSON: ${error.message}`] }, null, 2));
    process.exit(1);
  }
  const result = compareRuns(parsed);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { compareRuns };

