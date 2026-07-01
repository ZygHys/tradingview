#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { createRunSession } = require("./create-run-session.js");
const { renderRunbook } = require("./render-runbook.js");

function usage() {
  return [
    "Usage:",
    "  node scripts/create-browser-run-package.js <handoff.json>",
    "  node scripts/create-browser-run-package.js <handoff.json> --format markdown",
    "  node scripts/create-browser-run-package.js <handoff.json> --output browser-run-package.json",
    "  node scripts/create-browser-run-package.js <handoff.json> --format markdown --output browser-runbook.md",
    "  node scripts/create-browser-run-package.js -  # read JSON from stdin",
  ].join("\n");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    process.exit(args.length === 0 ? 2 : 0);
  }
  const target = args[0];
  let format = "json";
  let output = "";
  let outputWasProvided = false;
  for (let index = 1; index < args.length; index += 1) {
    const item = args[index];
    if (item === "--format") {
      format = args[index + 1] || "";
      index += 1;
      continue;
    }
    if (item === "--output") {
      outputWasProvided = true;
      output = args[index + 1] || "";
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${item}`);
  }
  if (!["json", "markdown"].includes(format)) {
    throw new Error("--format must be json or markdown");
  }
  if (outputWasProvided && (!output || output === "--format" || output === "--output")) {
    throw new Error("--output requires a file path");
  }
  return { target, format, output };
}

function readInput(target) {
  if (target === "-") {
    return fs.readFileSync(0, "utf8").replace(/^\uFEFF/, "");
  }
  return fs.readFileSync(path.resolve(target), "utf8").replace(/^\uFEFF/, "");
}

function parseJson(input) {
  try {
    return JSON.parse(input);
  } catch (error) {
    return { ok: false, errors: [`Invalid JSON: ${error.message}`] };
  }
}

function writeOutput(output, content) {
  if (!output) {
    process.stdout.write(content);
    return;
  }
  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function createBrowserRunPackage(raw, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const runSession = createRunSession(raw, { baseDir });
  const runbookMarkdown = renderRunbook(runSession, { baseDir });
  const blocked = runSession.ok === false || runSession.status === "blocked";

  return {
    ok: !blocked,
    package_type: "tradingview_browser_run_package",
    status: blocked ? "blocked_until_executable_handoff" : "ready_for_logged_in_browser",
    objective_order: [
      "stabilize TradingView operation",
      "capture Strategy Tester evidence",
      "complete and score a run record",
      "render review and next-run request",
      "only then iterate supplied versions or parameters toward annualized return >= 20%",
    ],
    run_session: runSession,
    runbook_markdown: runbookMarkdown,
    next_operator_step: blocked
      ? "Complete the strategy handoff package before opening TradingView."
      : "Open the logged-in TradingView browser and follow runbook_markdown exactly.",
    guardrails: [
      "Do not invent missing strategy logic.",
      "Do not optimize bundled smoke fixtures toward the return target.",
      "Do not claim Strategy Tester performance from chart markers alone.",
      "Do not bypass TradingView account, plan, data, or subscription limits.",
    ],
  };
}

function main() {
  let parsedArgs;
  try {
    parsedArgs = parseArgs(process.argv);
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exit(2);
  }

  const { target, format, output } = parsedArgs;
  const input = readInput(target);
  const parsed = parseJson(input);
  if (parsed && parsed.ok === false && parsed.errors) {
    console.error(JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  const baseDir = target && target !== "-" ? path.dirname(path.resolve(target)) : process.cwd();
  const browserRunPackage = createBrowserRunPackage(parsed, { baseDir });

  if (format === "markdown") {
    writeOutput(output, browserRunPackage.runbook_markdown);
  } else {
    writeOutput(output, `${JSON.stringify(browserRunPackage, null, 2)}\n`);
  }

  process.exit(browserRunPackage.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { createBrowserRunPackage };
