#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function usage() {
  return [
    "Usage:",
    "  node scripts/score-run.js <run-record.json>",
    "  node scripts/score-run.js -  # read JSON from stdin",
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

function firstObject(value, key) {
  if (value && typeof value === "object" && value[key] && typeof value[key] === "object") {
    return value[key];
  }
  return value && typeof value === "object" ? value : {};
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned) {
    return null;
  }
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseReturn(value) {
  if (typeof value === "string" && value.includes("%")) {
    const percent = parseNumber(value);
    return percent == null ? null : percent / 100;
  }
  const numeric = parseNumber(value);
  if (numeric == null) {
    return null;
  }
  return Math.abs(numeric) > 1 ? numeric / 100 : numeric;
}

function parsePercentThreshold(value, fallback = 0.2) {
  const parsed = parseReturn(value);
  return parsed == null ? fallback : parsed;
}

function annualize(netReturn, testDays) {
  if (netReturn == null || testDays == null || testDays <= 0 || 1 + netReturn <= 0) {
    return null;
  }
  return Math.pow(1 + netReturn, 365 / testDays) - 1;
}

function scoreRun(raw) {
  const record = firstObject(raw, "run_record");
  const target = record.target || {};
  const strategy = record.strategy || {};
  const market = record.market || {};
  const metrics = record.metrics || {};
  const analysis = record.analysis || {};
  const errors = [];
  const warnings = [];

  const testDays = parseNumber(market.test_days);
  const netReturn = parseReturn(metrics.net_return);
  const annualizedReturn = parseReturn(metrics.annualized_return) ?? annualize(netReturn, testDays);
  const targetThreshold = parsePercentThreshold(target.threshold, 0.2);
  const maxDrawdown = parseReturn(metrics.max_drawdown);
  const profitFactor = parseNumber(metrics.profit_factor);
  const totalTrades = parseNumber(metrics.total_trades);
  const fixtureOnly = strategy.fixture_only === true || strategy.fixture_only === "true";

  if (netReturn == null && annualizedReturn == null) {
    errors.push("metrics.net_return or metrics.annualized_return is required.");
  }
  if (annualizedReturn == null) {
    warnings.push("Annualized return could not be computed; provide metrics.annualized_return or market.test_days plus metrics.net_return.");
  }
  if (totalTrades != null && totalTrades < 30) {
    warnings.push("Trade count is low; target comparison may be weak.");
  }
  if (profitFactor != null && profitFactor < 1) {
    warnings.push("Profit factor is below 1.");
  }
  if (maxDrawdown != null && maxDrawdown > 0.25) {
    warnings.push("Max drawdown is above 25%.");
  }

  let workflowResult = analysis.workflow_result || "unknown";
  let strategyQuality = analysis.strategy_quality || "unknown";
  let status = record.status || "blocked";
  let decision = analysis.decision || "";
  let nextAllowedStep = analysis.next_allowed_step || "";

  if (fixtureOnly) {
    strategyQuality = "reject";
    status = errors.length ? "blocked" : "reject";
    decision = "Smoke fixture is workflow evidence only and cannot be optimized toward the target.";
    nextAllowedStep = "Provide a real supplied Pine strategy, saved TradingView strategy, or supplied parameter/version set.";
  } else if (errors.length) {
    status = "blocked";
    decision = "Result record is incomplete.";
    nextAllowedStep = "Collect missing Strategy Tester metrics or exports.";
  } else if (annualizedReturn != null && annualizedReturn >= targetThreshold) {
    const enoughTrades = totalTrades == null || totalTrades >= 30;
    const acceptableProfitFactor = profitFactor == null || profitFactor >= 1;
    const acceptableDrawdown = maxDrawdown == null || maxDrawdown <= 0.25;
    if (enoughTrades && acceptableProfitFactor && acceptableDrawdown) {
      status = "pass";
      strategyQuality = "pass";
      decision = "Target reached with basic risk checks satisfied.";
      nextAllowedStep = "Retest on another date range or export trades for robustness review.";
    } else {
      status = "watch";
      strategyQuality = "watch";
      decision = "Target return reached, but risk or evidence checks are weak.";
      nextAllowedStep = "Collect more evidence or test a supplied lower-risk variant.";
    }
  } else {
    status = "iterate";
    strategyQuality = "iterate";
    decision = "Target return not reached.";
    nextAllowedStep = "Run the next supplied strategy version or supplied parameter set.";
  }

  return {
    ok: errors.length === 0,
    status,
    workflow_result: workflowResult,
    strategy_quality: strategyQuality,
    metrics: {
      net_return: netReturn,
      annualized_return: annualizedReturn,
      target_threshold: targetThreshold,
      max_drawdown: maxDrawdown,
      total_trades: totalTrades,
      profit_factor: profitFactor,
    },
    decision,
    next_allowed_step: nextAllowedStep,
    errors,
    warnings,
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
  const result = scoreRun(parsed);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  annualize,
  parseNumber,
  parseReturn,
  scoreRun,
};
