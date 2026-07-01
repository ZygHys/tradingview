#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { normalizeRunRecord } = require("./normalize-run-record.js");
const { scoreRun } = require("./score-run.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/complete-run-record.js <browser-metrics.json>",
    "  node scripts/complete-run-record.js -  # read JSON from stdin",
    "",
    "Input shape:",
    "  { \"run_record_seed\": {...}, \"fields\": {...}, \"evidence\": {...} }",
    "  { \"run_session\": {...}, \"raw_text\": \"copied Strategy Tester text\" }",
    "  { \"run_record\": {...}, \"metrics\": {...}, \"evidence\": {...} }",
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

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function objectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && String(item).trim() !== "").map(String);
  }
  if (value == null || String(value).trim() === "") {
    return [];
  }
  return [String(value)];
}

function mergeArrays(...values) {
  const seen = new Set();
  const merged = [];
  for (const value of values.flatMap(asArray)) {
    if (!seen.has(value)) {
      seen.add(value);
      merged.push(value);
    }
  }
  return merged;
}

function mergeRecord(base, overlay) {
  const next = clone(base);
  const source = objectOrEmpty(overlay);
  for (const key of ["run_id", "status", "timestamp", "operator"]) {
    if (source[key] != null && source[key] !== "") {
      next[key] = source[key];
    }
  }
  for (const section of ["target", "strategy", "market", "properties", "inputs", "metrics", "analysis"]) {
    next[section] = {
      ...objectOrEmpty(next[section]),
      ...objectOrEmpty(source[section]),
    };
  }
  const currentEvidence = objectOrEmpty(next.evidence);
  const overlayEvidence = objectOrEmpty(source.evidence);
  next.evidence = {
    screenshots: mergeArrays(currentEvidence.screenshots, overlayEvidence.screenshots),
    exports: mergeArrays(currentEvidence.exports, overlayEvidence.exports),
    copied_tables: mergeArrays(currentEvidence.copied_tables, overlayEvidence.copied_tables),
    browser_notes: mergeArrays(currentEvidence.browser_notes, overlayEvidence.browser_notes),
  };
  return next;
}

function baseRecord(input) {
  const raw = objectOrEmpty(input);
  if (raw.run_record_seed) {
    return mergeRecord(raw.run_record_seed, raw.run_record);
  }
  if (raw.run_session && raw.run_session.run_record_seed) {
    return mergeRecord(raw.run_session.run_record_seed, raw.run_record);
  }
  if (raw.run_session && raw.run_session.run_record) {
    return mergeRecord(raw.run_session.run_record, raw.run_record);
  }
  return mergeRecord(raw.run_record, {});
}

function parseDateRangeDays(value) {
  const matches = String(value || "").match(/\b\d{4}-\d{2}-\d{2}\b/g);
  if (!matches || matches.length < 2) {
    return null;
  }
  const start = Date.parse(`${matches[0]}T00:00:00Z`);
  const end = Date.parse(`${matches[1]}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }
  return Math.round((end - start) / 86400000);
}

function missingMetricFields(metrics) {
  const required = [
    "net_profit",
    "net_return",
    "max_drawdown",
    "total_trades",
    "win_rate",
    "profit_factor",
  ];
  return required.filter((field) => metrics[field] == null || String(metrics[field]).trim() === "");
}

function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }
  return `${(value * 100).toFixed(2)}%`;
}

function mergeInputSections(record, input) {
  const raw = objectOrEmpty(input);
  let next = mergeRecord(record, {
    run_id: raw.run_id,
    status: raw.status,
    timestamp: raw.timestamp,
    operator: raw.operator,
    target: raw.target,
    strategy: raw.strategy,
    market: raw.market,
    properties: raw.properties,
    inputs: raw.inputs,
    metrics: raw.metrics,
    analysis: raw.analysis,
    evidence: raw.evidence,
  });

  if (!next.market) {
    next.market = {};
  }
  if (!next.market.test_days && next.market.date_range) {
    const days = parseDateRangeDays(next.market.date_range);
    if (days != null) {
      next.market.test_days = days;
    }
  }
  return next;
}

function completeRunRecord(input) {
  const raw = objectOrEmpty(input);
  const seeded = mergeInputSections(baseRecord(raw), raw);
  const normalized = normalizeRunRecord({
    run_record: seeded,
    fields: raw.fields,
    raw_text: raw.raw_text,
  }).run_record;

  const inferredCopiedTables = [];
  if (raw.fields) {
    inferredCopiedTables.push("fields");
  }
  if (raw.raw_text) {
    inferredCopiedTables.push("raw_text");
  }
  if (raw.metrics) {
    inferredCopiedTables.push("metrics");
  }

  normalized.evidence = {
    screenshots: mergeArrays(seeded.evidence && seeded.evidence.screenshots, raw.evidence && raw.evidence.screenshots),
    exports: mergeArrays(seeded.evidence && seeded.evidence.exports, raw.evidence && raw.evidence.exports),
    copied_tables: mergeArrays(
      normalized.evidence && normalized.evidence.copied_tables,
      seeded.evidence && seeded.evidence.copied_tables,
      raw.evidence && raw.evidence.copied_tables,
      inferredCopiedTables
    ),
    browser_notes: mergeArrays(seeded.evidence && seeded.evidence.browser_notes, raw.evidence && raw.evidence.browser_notes),
  };

  const missing = missingMetricFields(normalized.metrics || {});
  normalized.analysis = objectOrEmpty(normalized.analysis);

  if (missing.length) {
    const scored = scoreRun({ run_record: normalized });
    normalized.status = "blocked";
    normalized.analysis.workflow_result = "blocked_missing_metrics";
    normalized.analysis.strategy_quality = "blocked";
    normalized.analysis.comparison_to_target = "not_comparable";
    normalized.analysis.decision = `Missing Strategy Tester metric field(s): ${missing.join(", ")}.`;
    normalized.analysis.next_allowed_step = "Collect the missing Strategy Tester summary metrics or export before scoring.";
    normalized.analysis.missing_metric_fields = missing;
    normalized.analysis.score = scored;
    return { run_record: normalized };
  }

  normalized.analysis.workflow_result = "metrics_captured";
  const scored = scoreRun({ run_record: normalized });
  normalized.status = scored.status;
  normalized.analysis.strategy_quality = scored.strategy_quality;
  normalized.analysis.comparison_to_target = `annualized_return=${formatPercent(scored.metrics.annualized_return)}, target=${formatPercent(scored.metrics.target_threshold)}`;
  normalized.analysis.decision = scored.decision;
  normalized.analysis.next_allowed_step = scored.next_allowed_step;
  normalized.analysis.score = scored;
  return { run_record: normalized };
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
  console.log(JSON.stringify(completeRunRecord(parsed), null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { completeRunRecord };
