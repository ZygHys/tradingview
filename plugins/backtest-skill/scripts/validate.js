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
  "plugins/backtest-skill/skills/tradingview-backtest/references/pine-strategy.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/result-audit.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/alerts-webhooks.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/local-migration.md",
]) {
  assertFile(file);
}

validateSkill("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md");

console.log("Validation passed");

