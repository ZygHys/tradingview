#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..", "..");

function readJson(file) {
  const full = path.join(root, file);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFile(file) {
  const full = path.join(root, file);
  assert(fs.existsSync(full), `Missing ${file}`);
}

function validateSemver(version, label) {
  assert(/^\d+\.\d+\.\d+$/.test(version), `${label} version must be semver`);
}

function validateSkill(file) {
  const full = path.join(root, file);
  const content = fs.readFileSync(full, "utf8");
  assert(content.startsWith("---\n"), `${file} must start with YAML frontmatter`);
  const end = content.indexOf("\n---", 4);
  assert(end !== -1, `${file} must close YAML frontmatter`);
  const frontmatter = content.slice(4, end);
  assert(/^name:\s*tradingview-backtest\s*$/m.test(frontmatter), `${file} missing skill name`);
  assert(/^description:\s*.+$/m.test(frontmatter), `${file} missing description`);
}

function assertNoForbiddenScope(file) {
  const full = path.join(root, file);
  const content = fs.readFileSync(full, "utf8").toLowerCase();
  const forbidden = [
    "turn a strategy idea",
    "convert trading ideas",
    "build and test this strategy idea",
    "migrate this backtest",
    "local migration",
    "freqtrade",
    "backtrader",
    "vectorbt",
    "every generated strategy",
  ];
  for (const phrase of forbidden) {
    assert(!content.includes(phrase), `${file} contains out-of-scope phrase: ${phrase}`);
  }
}

const rootMarket = readJson(".codebuddy-plugin/marketplace.json");
assert(rootMarket.name === "tradingview", "CodeBuddy marketplace name must be tradingview");
validateSemver(rootMarket.version, "CodeBuddy marketplace");

const codexMarket = readJson(".agents/plugins/marketplace.json");
assert(codexMarket.name === "tradingview", "Codex marketplace name must be tradingview");
assert(codexMarket.plugins.some((p) => p.name === "backtest-skill"), "Codex marketplace must include backtest-skill");

const claudeMarket = readJson(".claude-plugin/marketplace.json");
assert(claudeMarket.name === "tradingview", "Claude marketplace name must be tradingview");
validateSemver(claudeMarket.version, "Claude marketplace");

for (const manifest of [
  "plugins/backtest-skill/.codebuddy-plugin/plugin.json",
  "plugins/backtest-skill/.codex-plugin/plugin.json",
  "plugins/backtest-skill/.claude-plugin/plugin.json",
]) {
  const json = readJson(manifest);
  assert(json.name === "backtest-skill", `${manifest} name must be backtest-skill`);
  validateSemver(json.version, manifest);
  assert(json.description && json.description.length > 20, `${manifest} needs a useful description`);
}

for (const file of [
  "README.md",
  "AGENTS.md",
  "plugins/backtest-skill/README.md",
  "plugins/backtest-skill/commands/backtest.md",
  "plugins/backtest-skill/skills/tradingview-backtest/SKILL.md",
  "plugins/backtest-skill/skills/tradingview-backtest/agents/openai.yaml",
  "plugins/backtest-skill/skills/tradingview-backtest/references/language-use.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/alerts-webhooks.md",
]) {
  assertFile(file);
}

validateSkill("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md");

for (const file of [
  "README.md",
  "plugins/backtest-skill/README.md",
  "plugins/backtest-skill/commands/backtest.md",
  "plugins/backtest-skill/.codex-plugin/plugin.json",
  "plugins/backtest-skill/.codebuddy-plugin/plugin.json",
  "plugins/backtest-skill/.claude-plugin/plugin.json",
  "plugins/backtest-skill/skills/tradingview-backtest/SKILL.md",
  "plugins/backtest-skill/skills/tradingview-backtest/agents/openai.yaml",
]) {
  assertNoForbiddenScope(file);
}

console.log("Validation passed");
