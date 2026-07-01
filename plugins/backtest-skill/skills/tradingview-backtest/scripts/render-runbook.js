#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { createRunSession } = require("./create-run-session.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/render-runbook.js <run-session-or-handoff.json>",
    "  node scripts/render-runbook.js -  # read JSON from stdin",
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

function asText(value, fallback = "n/a") {
  if (value == null || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return value.trim() || fallback;
  }
  return String(value);
}

function isRunSession(raw) {
  return Boolean(
    raw &&
      typeof raw === "object" &&
      (raw.run_session_id || raw.required_next_checkpoint || raw.run_record_seed) &&
      (raw.browser_steps || raw.blocked_run_hint || raw.validation)
  );
}

function toRunSession(raw, options = {}) {
  if (isRunSession(raw)) {
    return raw;
  }
  return createRunSession(raw, { baseDir: options.baseDir || process.cwd() });
}

function checklist(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    return "- [ ] n/a";
  }
  return list.map((item) => `- [ ] ${asText(item)}`).join("\n");
}

function bullets(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    return "- n/a";
  }
  return list.map((item) => `- ${asText(item)}`).join("\n");
}

function numbered(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    return "1. n/a";
  }
  return list.map((item, index) => `${index + 1}. ${asText(item)}`).join("\n");
}

function formatTarget(summary, seed) {
  const target = seed && seed.target ? seed.target : {};
  const metric = asText(summary && summary.target_metric, asText(target.metric, "annualized_return"));
  const threshold = asText(summary && summary.target_threshold, asText(target.threshold, "20%"));
  return `${metric} >= ${threshold}`;
}

function formatMarket(summary, seed) {
  const market = seed && seed.market ? seed.market : {};
  const symbol = asText(summary && summary.symbol, asText(market.symbol));
  const exchange = asText(summary && summary.exchange, asText(market.exchange));
  const timeframe = asText(summary && summary.timeframe, asText(market.timeframe));
  const chartType = asText(summary && summary.chart_type, asText(market.chart_type));
  return `${symbol} on ${exchange}, ${timeframe}, ${chartType}`;
}

function renderValidation(session) {
  const validation = session.validation || {};
  if (validation.ok) {
    return "- Validation: pass";
  }
  const errors = Array.isArray(validation.errors) ? validation.errors : [];
  const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
  const lines = ["- Validation: fail"];
  if (errors.length > 0) {
    lines.push(`- Errors: ${errors.join("; ")}`);
  }
  if (warnings.length > 0) {
    lines.push(`- Warnings: ${warnings.join("; ")}`);
  }
  return lines.join("\n");
}

function renderRunbook(raw, options = {}) {
  const session = toRunSession(raw, options);
  const summary = session.handoff_summary || {};
  const seed = session.run_record_seed || {};
  const strategy = seed.strategy || {};
  const blocked = session.status === "blocked" || session.ok === false;
  const lines = [];

  lines.push("# TradingView Browser Runbook");
  lines.push("");
  lines.push(`- Run session: \`${asText(session.run_session_id, "unavailable")}\``);
  lines.push(`- Status: \`${asText(session.status)}\``);
  lines.push(`- Strategy: \`${asText(summary.strategy_name, asText(strategy.name))}\` (\`${asText(summary.strategy_version, asText(strategy.version))}\`)`);
  lines.push(`- Artifact: \`${asText(summary.artifact_type, asText(strategy.source))}\``);
  lines.push(`- Market: ${formatMarket(summary, seed)}`);
  lines.push(`- Target: ${formatTarget(summary, seed)}`);
  lines.push(renderValidation(session));
  lines.push("");

  if (blocked) {
    const hint = session.blocked_run_hint || {};
    lines.push("## Blocked");
    lines.push("");
    lines.push(`- Reason: \`${asText(session.reason || hint.blocking_condition)}\``);
    lines.push(`- Required next checkpoint: \`${asText(session.required_next_checkpoint)}\``);
    lines.push("");
    lines.push("### Missing Fields Or Errors");
    lines.push("");
    lines.push(bullets(hint.missing_fields_or_errors || (session.validation && session.validation.errors)));
    lines.push("");
    lines.push("### Do Not Attempt");
    lines.push("");
    lines.push(bullets(hint.not_attempted));
    lines.push("");
    lines.push("## Stop Conditions");
    lines.push("");
    lines.push("- Do not open TradingView until the handoff validates.");
    lines.push("- Do not invent missing strategy logic or parameter values.");
    lines.push("- Do not claim Strategy Tester performance without captured metrics.");
    return `${lines.join("\n")}\n`;
  }

  lines.push("## Preflight Checkpoints");
  lines.push("");
  lines.push(checklist(session.browser_preflight_checkpoints));
  lines.push("");
  lines.push("## Browser Steps");
  lines.push("");
  lines.push(numbered(session.browser_steps));
  lines.push("");
  lines.push("## Required Evidence");
  lines.push("");
  lines.push(checklist(session.required_evidence));
  lines.push("");
  lines.push("## Allowed Iteration Scope");
  lines.push("");
  lines.push(bullets(session.allowed_iteration_scope));
  lines.push("");
  lines.push("## Run Record Seed");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(seed, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## Stop Conditions");
  lines.push("");
  lines.push("- Stop if TradingView account state, plan limits, or browser instability prevents a reliable Strategy Tester run.");
  lines.push("- Stop if Strategy Tester metrics are unavailable; create a blocked-run record instead of inferring performance.");
  lines.push("- Stop if improvement requires new entry, exit, filter, stop, or take-profit logic.");
  lines.push("- Do not claim performance from chart order markers or a strategy legend row alone.");
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
  const baseDir = target && target !== "-" ? path.dirname(path.resolve(target)) : process.cwd();
  process.stdout.write(renderRunbook(parsed, { baseDir }));
}

if (require.main === module) {
  main();
}

module.exports = { renderRunbook, toRunSession };
