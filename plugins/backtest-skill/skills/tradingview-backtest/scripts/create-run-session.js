#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { validateHandoff } = require("./validate-handoff.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/create-run-session.js <handoff.json>",
    "  node scripts/create-run-session.js -  # read JSON from stdin",
  ].join("\n");
}

function readInput(target) {
  if (!target || target === "--help" || target === "-h") {
    console.log(usage());
    process.exit(target ? 0 : 2);
  }
  if (target === "-") {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(path.resolve(target), "utf8");
}

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function slug(value) {
  const text = asText(value).toLowerCase();
  const normalized = text.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "unknown";
}

function normalizeHandoff(raw) {
  return raw && typeof raw === "object" && raw.handoff ? raw.handoff : raw;
}

function createRunSession(raw, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const validation = validateHandoff(raw, baseDir);
  const handoff = normalizeHandoff(raw);

  if (!validation.ok) {
    return {
      ok: false,
      status: "blocked",
      reason: "handoff_not_executable",
      validation,
      required_next_checkpoint: "complete-handoff-package",
      blocked_run_hint: {
        blocking_condition: "handoff_not_executable",
        missing_fields_or_errors: validation.errors,
        not_attempted: [
          "opening TradingView",
          "inventing missing strategy logic",
          "claiming Strategy Tester performance",
        ],
      },
    };
  }

  const strategyName = asText(handoff.strategy_name) || "unnamed-strategy";
  const strategyVersion = asText(handoff.strategy_version) || "unversioned";
  const symbol = asText(handoff.symbol) || "unknown-symbol";
  const timeframe = asText(handoff.timeframe) || "unknown-timeframe";
  const artifactType = asText(handoff.artifact_type);
  const parameterSets = Array.isArray(handoff.parameter_sets) ? handoff.parameter_sets : [];

  const runSessionId = [
    "tv",
    slug(strategyName),
    slug(strategyVersion),
    slug(symbol),
    slug(timeframe),
  ].join("-");

  const baseCheckpoints = [
    "login-ready",
    "blank-layout-ready or one free indicator slot",
    "symbol-timeframe-confirmed",
    "strategy-added",
    "tester-ready",
    "metrics-captured",
  ];

  const loadStepsByArtifact = {
    pine_strategy: [
      "Open Pine Editor.",
      "Replace existing editor contents with the supplied Pine strategy.",
      "Verify the editor contains strategy(...) and not only indicator(...).",
      "Save the script.",
      "Add the strategy to chart.",
    ],
    saved_tradingview_strategy: [
      "Open Indicators, Metrics, and Strategies.",
      "Search for the saved strategy name visible to the logged-in account.",
      "Add the saved strategy to chart.",
    ],
    parameter_set: [
      "Confirm the named base strategy is already on chart or can be opened.",
      "Open strategy settings.",
      "Apply only the supplied parameter set values.",
      "Confirm the changed inputs before running Strategy Tester.",
    ],
    tester_result: [
      "Skip browser execution and review the supplied Strategy Tester artifact.",
      "Normalize copied metrics or transcribed fields before scoring.",
    ],
  };

  const session = {
    ok: true,
    status: "ready_for_browser_or_manual_run",
    run_session_id: runSessionId,
    validation,
    handoff_summary: {
      strategy_name: strategyName,
      strategy_version: strategyVersion,
      artifact_type: artifactType,
      symbol,
      exchange: asText(handoff.exchange) || "unknown",
      timeframe,
      chart_type: asText(handoff.chart_type) || "unknown",
      target_metric: asText(handoff.target_metric) || "annualized_return",
      target_threshold: asText(handoff.target_threshold) || "20%",
      parameter_sets: parameterSets.map((item) => asText(item && item.name) || "unnamed-parameter-set"),
    },
    browser_preflight_checkpoints: baseCheckpoints,
    browser_steps: [
      "Open the logged-in TradingView chart without refreshing an in-progress layout unless explicitly approved.",
      "Confirm symbol, exchange, timeframe, chart type, and date range.",
      ...(loadStepsByArtifact[artifactType] || []),
      "Open Strategy Tester or Strategy Report.",
      "Capture Overview, Performance Summary, List of Trades, and Properties when available.",
      "Record plan/data-depth prompts and any report-rendering blockers.",
    ],
    required_evidence: [
      "screenshot or copied table for Strategy Tester summary",
      "strategy properties or settings snapshot",
      "date range and available data depth",
      "net profit or net return",
      "max drawdown",
      "total trades",
      "win rate",
      "profit factor",
    ],
    allowed_iteration_scope: [
      "Use only supplied Pine versions.",
      "Use only supplied parameter sets.",
      "Stop if improvement requires new entry, exit, filter, stop, or take-profit logic.",
    ],
    run_record_seed: {
      run_id: runSessionId,
      status: "blocked_until_metrics_captured",
      target: {
        metric: asText(handoff.target_metric) || "annualized_return",
        threshold: asText(handoff.target_threshold) || "20%",
        continuation_gate: parameterSets.length > 0 ? "supplied_strategy_or_supplied_parameter_set" : "unknown",
      },
      strategy: {
        name: strategyName,
        version: strategyVersion,
        source: artifactType,
        script_is_strategy: artifactType === "pine_strategy" ? true : "unknown",
        fixture_only: /fixture|smoke/i.test(`${strategyName} ${strategyVersion}`),
      },
      market: {
        symbol,
        exchange: asText(handoff.exchange) || null,
        timeframe,
        chart_type: asText(handoff.chart_type) || null,
        date_range: asText(handoff.date_range) || null,
      },
      properties: {
        initial_capital: asText(handoff.initial_capital) || null,
        order_size: asText(handoff.order_size) || null,
        commission: asText(handoff.commission) || null,
        slippage: asText(handoff.slippage) || null,
        pyramiding: asText(handoff.pyramiding) || null,
        margin: asText(handoff.margin) || null,
      },
      evidence: {
        screenshots: [],
        exports: [],
        copied_tables: [],
        browser_notes: [],
      },
      analysis: {
        workflow_result: "pending_metrics",
        strategy_quality: "unknown",
        decision: "metrics-captured required before scoring",
        next_allowed_step: "collect Strategy Tester summary evidence, then run score-run.js",
      },
    },
  };

  return session;
}

function main() {
  const target = process.argv[2];
  const input = readInput(target).replace(/^\uFEFF/, "");
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    console.error(JSON.stringify({ ok: false, errors: [`Invalid JSON: ${error.message}`] }, null, 2));
    process.exit(1);
  }

  const baseDir = target && target !== "-" ? path.dirname(path.resolve(target)) : process.cwd();
  const session = createRunSession(parsed, { baseDir });
  console.log(JSON.stringify(session, null, 2));
  process.exit(session.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { createRunSession };
