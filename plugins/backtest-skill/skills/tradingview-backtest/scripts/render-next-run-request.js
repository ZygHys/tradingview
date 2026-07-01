#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { createNextRunRequest } = require("./create-next-run-request.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/render-next-run-request.js <next-run-request-or-run-record.json>",
    "  node scripts/render-next-run-request.js -  # read JSON from stdin",
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

function valueOrNA(value) {
  if (value == null || value === "") {
    return "n/a";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function boolLabel(value) {
  if (value === true || value === "true") {
    return "true";
  }
  if (value === false || value === "false") {
    return "false";
  }
  return valueOrNA(value);
}

function renderList(items) {
  const values = Array.isArray(items) ? items : [];
  if (values.length === 0) {
    return "- n/a";
  }
  return values.map((item) => `- ${valueOrNA(item)}`).join("\n");
}

function toNextRunRequest(raw) {
  if (raw && raw.request_type === "next_tradingview_run_request") {
    return raw;
  }
  return createNextRunRequest(raw);
}

function renderNextRunRequest(raw) {
  const request = toNextRunRequest(raw);
  const target = request.target || {};
  const basedOn = request.based_on || {};
  const strategy = basedOn.strategy || {};
  const market = basedOn.market || {};
  const summary = request.comparison_summary || {};
  const lines = [];

  lines.push("# TradingView Next Run Request");
  lines.push("");
  lines.push(`- Status: ${valueOrNA(request.status)}`);
  lines.push(`- Next action: ${valueOrNA(request.next_action)}`);
  lines.push(`- Target: ${valueOrNA(target.metric)} >= ${valueOrNA(target.threshold)}`);
  lines.push(`- Required artifact: ${valueOrNA(request.required_user_artifact)}`);
  lines.push(`- Browser step: ${valueOrNA(request.browser_step)}`);
  lines.push("");
  lines.push("## Based On");
  lines.push("");
  lines.push(`- Run: ${valueOrNA(basedOn.best_run_id)}`);
  lines.push(`- Run status: ${valueOrNA(basedOn.best_status)}`);
  lines.push(`- Annualized return: ${valueOrNA(basedOn.best_annualized_return)}`);
  lines.push(`- Max drawdown: ${valueOrNA(basedOn.best_max_drawdown)}`);
  lines.push(`- Total trades: ${valueOrNA(basedOn.best_total_trades)}`);
  lines.push(`- Profit factor: ${valueOrNA(basedOn.best_profit_factor)}`);
  lines.push(`- Strategy: ${valueOrNA(strategy.name)} ${valueOrNA(strategy.version)} (${valueOrNA(strategy.source)}, fixture_only=${boolLabel(strategy.fixture_only)})`);
  lines.push(`- Market: ${valueOrNA(market.exchange)} ${valueOrNA(market.symbol)} ${valueOrNA(market.timeframe)}, test_days=${valueOrNA(market.test_days)}`);
  lines.push(`- Changed variable: ${valueOrNA(basedOn.changed_variable)}`);
  lines.push("");
  lines.push("## Acceptance Checkpoints");
  lines.push("");
  lines.push(renderList(request.acceptance_checkpoints));
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  lines.push(renderList(request.guardrails));
  lines.push("");
  lines.push("## Comparison Summary");
  lines.push("");
  lines.push(`- Decision: ${valueOrNA(summary.decision)}`);
  lines.push(`- Next allowed step: ${valueOrNA(summary.next_allowed_step)}`);
  lines.push(`- Comparable runs: ${valueOrNA(summary.comparable_count)}`);
  lines.push(`- Pass / watch: ${valueOrNA(summary.pass_count)} / ${valueOrNA(summary.watch_count)}`);
  lines.push(`- Errors: ${Array.isArray(summary.errors) && summary.errors.length ? summary.errors.map(valueOrNA).join("; ") : "none"}`);
  lines.push("");
  lines.push("## Operator Notes");
  lines.push("");
  if (request.next_action === "request-real-strategy-handoff") {
    lines.push("- Stop browser iteration until a real strategy handoff or supplied parameter/version set is available.");
    lines.push("- Do not continue optimizing the bundled smoke-test fixture.");
  } else if (request.status === "ready_for_next_run") {
    lines.push("- Create a fresh browser run session before touching TradingView again.");
    lines.push("- Change only the supplied strategy version, date range, export action, or parameter set named in the request.");
  } else {
    lines.push("- Resume only at the checkpoint named by the request.");
    lines.push("- Preserve the prior run record and attach any new evidence before scoring.");
  }
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
  process.stdout.write(renderNextRunRequest(parsed));
}

if (require.main === module) {
  main();
}

module.exports = { renderNextRunRequest, toNextRunRequest };
