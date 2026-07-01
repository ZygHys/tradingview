#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { compareRuns } = require("./compare-runs.js");
const { parseReturn } = require("./score-run.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/create-next-run-request.js <run-record-or-runs.json>",
    "  node scripts/create-next-run-request.js -  # read JSON from stdin",
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

function targetThreshold(records) {
  for (const record of records) {
    const item = unwrap(record) || {};
    const parsed = parseReturn(item.target && item.target.threshold);
    if (parsed != null) {
      return parsed;
    }
  }
  return 0.2;
}

function findBestRecord(records, comparison) {
  const bestRunId = comparison && comparison.best_run_id;
  if (!bestRunId) {
    return records[0] || null;
  }
  return records.find((record, index) => runId(record, index) === bestRunId) || null;
}

function labelStrategy(record) {
  const item = unwrap(record) || {};
  const strategy = item.strategy || {};
  return {
    name: strategy.name || "n/a",
    version: strategy.version || "n/a",
    source: strategy.source || "n/a",
    fixture_only: strategy.fixture_only === true || strategy.fixture_only === "true",
  };
}

function labelMarket(record) {
  const item = unwrap(record) || {};
  const market = item.market || {};
  return {
    exchange: market.exchange || "n/a",
    symbol: market.symbol || "n/a",
    timeframe: market.timeframe || "n/a",
    test_days: market.test_days || "n/a",
  };
}

function changedVariable(record) {
  const item = unwrap(record) || {};
  const inputs = item.inputs || {};
  return inputs.changed_from_prior_run || item.changed_from_prior_run || "n/a";
}

function requestForStatus(bestStatus, hasFixtureOnlyBest) {
  if (hasFixtureOnlyBest) {
    return {
      status: "blocked_until_user_supplies_artifact",
      next_action: "request-real-strategy-handoff",
      required_user_artifact: "A real supplied Pine strategy(), saved TradingView strategy, Strategy Tester artifact, or supplied parameter/version set.",
      browser_step: "Do not continue browser optimization on the bundled smoke-test fixture.",
    };
  }
  if (bestStatus === "pass") {
    return {
      status: "ready_for_next_run",
      next_action: "robustness-retest",
      required_user_artifact: "The same supplied strategy/version/parameter set plus either another date range or a Strategy Tester trade export.",
      browser_step: "Run the best supplied version on another date range, or export its trade list for robustness review.",
    };
  }
  if (bestStatus === "watch") {
    return {
      status: "ready_for_next_run",
      next_action: "risk-evidence-or-lower-risk-variant",
      required_user_artifact: "More Strategy Tester evidence, trade export, or a supplied lower-risk parameter/version set.",
      browser_step: "Capture stronger metrics or run the supplied lower-risk variant without changing trading logic.",
    };
  }
  if (bestStatus === "iterate") {
    return {
      status: "blocked_until_user_supplies_artifact",
      next_action: "request-next-supplied-variant",
      required_user_artifact: "The next supplied strategy version or supplied parameter/input set.",
      browser_step: "Wait for the next supplied version or parameter set, then create a fresh browser run session.",
    };
  }
  if (bestStatus === "blocked") {
    return {
      status: "blocked_until_user_supplies_artifact",
      next_action: "recover-missing-evidence",
      required_user_artifact: "Missing Strategy Tester metrics, screenshot, copied table, export, or explicit browser recovery approval.",
      browser_step: "Resume only at the missing checkpoint named in the blocked run record.",
    };
  }
  return {
    status: "blocked_until_user_supplies_artifact",
    next_action: "request-alternative-supplied-strategy-or-parameter-set",
    required_user_artifact: "A different supplied strategy version, saved strategy, or parameter set.",
    browser_step: "Do not invent a new strategy; wait for a supplied artifact before another TradingView run.",
  };
}

function createNextRunRequest(raw) {
  const records = getRuns(raw);
  if (records.length === 0) {
    return {
      ok: false,
      request_type: "next_tradingview_run_request",
      status: "blocked_until_user_supplies_artifact",
      next_action: "collect-run-records",
      required_user_artifact: "At least one completed or blocked TradingView run record.",
      browser_step: "Collect Strategy Tester metrics, screenshot, copied table, export, or a blocked-run record before choosing the next browser action.",
      errors: ["Input must contain a run record, array, runs[], or run_records[]."],
    };
  }

  const comparison = compareRuns({ runs: records });
  const best = findBestRecord(records, comparison);
  const fallbackRunId = best ? runId(best, records.indexOf(best)) : null;
  const bestScored = comparison.runs.find((item) => item.run_id === comparison.best_run_id)
    || comparison.runs.find((item) => item.run_id === fallbackRunId)
    || {};
  const bestStrategy = labelStrategy(best);
  const request = requestForStatus(bestScored.status, bestStrategy.fixture_only);
  const target = targetThreshold(records);

  return {
    ok: comparison.ok,
    request_type: "next_tradingview_run_request",
    status: request.status,
    target: {
      metric: "annualized_return",
      threshold: formatPercent(target),
    },
    based_on: {
      best_run_id: comparison.best_run_id || fallbackRunId || "n/a",
      best_status: bestScored.status || "n/a",
      best_annualized_return: formatPercent(bestScored.annualized_return),
      best_max_drawdown: formatPercent(bestScored.max_drawdown),
      best_total_trades: bestScored.total_trades == null ? "n/a" : bestScored.total_trades,
      best_profit_factor: bestScored.profit_factor == null ? "n/a" : bestScored.profit_factor,
      strategy: bestStrategy,
      market: labelMarket(best),
      changed_variable: changedVariable(best),
    },
    next_action: request.next_action,
    required_user_artifact: request.required_user_artifact,
    browser_step: request.browser_step,
    acceptance_checkpoints: [
      "strategy handoff is supplied and executable",
      "TradingView chart symbol, exchange, timeframe, and date range are recorded",
      "Strategy Tester metrics or export are captured",
      "run record is normalized, scored, compared, and rendered into a review",
    ],
    guardrails: [
      "Do not invent or modify trading rules inside this backtest skill.",
      "Do not tune bundled smoke-test fixtures toward the target.",
      "Do not claim target success until annualized return, drawdown, trade count, profit factor, costs, and evidence quality are checked.",
      "Use browser recovery only for layout/report issues, not for subscription bypass or credential capture.",
    ],
    comparison_summary: {
      decision: comparison.decision,
      next_allowed_step: comparison.next_allowed_step,
      pass_count: comparison.pass_count || 0,
      watch_count: comparison.watch_count || 0,
      comparable_count: comparison.comparable_count || 0,
      errors: comparison.errors || [],
    },
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
  const result = createNextRunRequest(parsed);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { createNextRunRequest };
