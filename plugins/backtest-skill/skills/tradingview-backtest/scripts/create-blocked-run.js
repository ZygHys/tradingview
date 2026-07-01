#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function usage() {
  return [
    "Usage:",
    "  node scripts/create-blocked-run.js <blocked-input.json>",
    "  node scripts/create-blocked-run.js -  # read JSON from stdin",
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

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && String(item).trim() !== "").map(String);
  }
  if (value == null || String(value).trim() === "") {
    return [];
  }
  return [String(value)];
}

function stamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function createBlockedRun(input) {
  const base = input.run_record && typeof input.run_record === "object" ? input.run_record : {};
  const runId = input.run_id || base.run_id || `blocked-${stamp().replace(/[-:]/g, "").replace("T", "-").replace("Z", "")}`;
  const missing = asArray(input.missing_fields || input.missing_checkpoints || input.missing_checkpoint);
  const notAttempted = asArray(input.not_attempted);

  const record = {
    run_id: runId,
    status: "blocked",
    timestamp: input.timestamp || stamp(),
    operator: input.operator || "agent",
    target: base.target || input.target || {},
    strategy: base.strategy || input.strategy || {},
    market: base.market || input.market || {},
    properties: base.properties || input.properties || {},
    inputs: base.inputs || input.inputs || {},
    metrics: base.metrics || {},
    evidence: {
      screenshots: asArray(input.screenshots || base.evidence?.screenshots),
      exports: asArray(input.exports || base.evidence?.exports),
      copied_tables: asArray(input.copied_tables || base.evidence?.copied_tables),
      browser_notes: asArray(input.browser_notes || input.last_observed_state || base.evidence?.browser_notes),
    },
    analysis: {
      workflow_result: "blocked",
      strategy_quality: "blocked",
      setup_validity: input.setup_validity || "incomplete",
      repaint_or_lookahead_risk: input.repaint_or_lookahead_risk || "unknown",
      cost_and_fill_risk: input.cost_and_fill_risk || "unknown",
      overfit_risk: input.overfit_risk || "unknown",
      comparison_to_target: "not_comparable",
      decision: input.blocking_condition || input.decision || "Blocked before a valid TradingView comparison could be made.",
      next_allowed_step:
        input.smallest_resume_action ||
        input.next_allowed_step ||
        (missing.length ? `Provide missing checkpoint(s): ${missing.join(", ")}.` : "Provide the missing checkpoint or evidence."),
    },
    blocked: {
      blocking_condition: input.blocking_condition || "",
      missing_checkpoints: missing,
      what_was_attempted: asArray(input.what_was_attempted),
      smallest_resume_action: input.smallest_resume_action || input.next_allowed_step || "",
      not_attempted: notAttempted.length
        ? notAttempted
        : ["credential capture", "subscription bypass", "inventing new strategy logic"],
    },
  };

  return { run_record: record };
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
  console.log(JSON.stringify(createBlockedRun(parsed), null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { createBlockedRun };

