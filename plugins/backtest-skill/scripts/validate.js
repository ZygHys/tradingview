#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..", "..");
const pluginRoot = path.join(root, "plugins/backtest-skill");

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
  const content = normalizeLineEndings(fs.readFileSync(full, "utf8").replace(/^\uFEFF/, ""));
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

function assertContains(file, phrase) {
  const full = path.join(root, file);
  const content = fs.readFileSync(full, "utf8");
  assert(content.includes(phrase), `${file} must contain: ${phrase}`);
}

function assertJsonDeepEqual(fileA, fileB, message) {
  const left = readJson(fileA);
  const right = readJson(fileB);
  assert(JSON.stringify(left) === JSON.stringify(right), message);
}

function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, "\n");
}

function assertResolvedInside(boundaryDir, resolvedPath, label) {
  const relative = path.relative(boundaryDir, resolvedPath);
  assert(
    relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)),
    `${label} must stay inside ${path.relative(root, boundaryDir) || "."}`
  );
}

function assertPluginRelativePath(value, baseDir, label) {
  assert(typeof value === "string" && value.length > 0, `${label} must be a non-empty string`);
  assert(!path.isAbsolute(value), `${label} must be relative, not absolute`);
  assert(value.startsWith("./"), `${label} must start with ./`);
  const normalized = value.replace(/\\/g, "/");
  assert(!normalized.split("/").includes(".."), `${label} must not contain .. path segments`);
  const resolved = path.resolve(baseDir, value);
  assertResolvedInside(baseDir, resolved, label);
  assert(fs.existsSync(resolved), `${label} target must exist: ${value}`);
}

function assertPluginRelativePathField(value, baseDir, label) {
  if (Array.isArray(value)) {
    assert(value.length > 0, `${label} must not be empty`);
    value.forEach((item, index) => assertPluginRelativePath(item, baseDir, `${label}[${index}]`));
    return;
  }
  assertPluginRelativePath(value, baseDir, label);
}

function assertHandoffPathInsidePlugin(handoff, baseDir, label) {
  const source = handoff && handoff.pine_source_path_or_inline_code;
  if (typeof source !== "string" || !source || source.includes("\n") || source.includes("strategy(")) {
    return;
  }
  assert(!path.isAbsolute(source), `${label} pine source path must be relative or inline code`);
  const resolved = path.resolve(baseDir, source);
  assertResolvedInside(pluginRoot, resolved, `${label} pine source path`);
  assert(fs.existsSync(resolved), `${label} pine source path must exist: ${source}`);
}

function assertArrayOfStrings(value, label, min = 1, max = Infinity) {
  assert(Array.isArray(value), `${label} must be an array`);
  assert(value.length >= min, `${label} must contain at least ${min} item(s)`);
  assert(value.length <= max, `${label} must contain no more than ${max} item(s)`);
  for (const item of value) {
    assert(typeof item === "string" && item.length > 0, `${label} entries must be non-empty strings`);
  }
}

function validateCodexMarketplace(marketplace) {
  const entry = marketplace.plugins.find((p) => p.name === "backtest-skill");
  assert(entry, "Codex marketplace must include backtest-skill");
  assert(entry.source && entry.source.source === "local", "Codex marketplace source must be local");
  assert(entry.source.path === "./plugins/backtest-skill", "Codex marketplace source path must be ./plugins/backtest-skill");
  assert(entry.policy && entry.policy.installation === "AVAILABLE", "Codex marketplace installation policy must be AVAILABLE");
  assert(entry.policy.authentication === "ON_INSTALL", "Codex marketplace authentication policy must be ON_INSTALL");
  assert(entry.category === "Trading", "Codex marketplace category must be Trading");
}

function validateFlatMarketplace(marketplace, label) {
  const entry = marketplace.plugins.find((p) => p.name === "backtest-skill");
  assert(entry, `${label} marketplace must include backtest-skill`);
  assert(entry.source === "./plugins/backtest-skill", `${label} marketplace source must be ./plugins/backtest-skill`);
  assertPluginRelativePath(entry.source, root, `${label} marketplace source`);
}

function validateCodexPluginManifest(json) {
  assert(json.skills === "./skills/", "Codex plugin skills path must be ./skills/");
  assert(json.interface && typeof json.interface === "object", "Codex plugin must include interface metadata");
  assert(json.interface.displayName === "TradingView Backtest Skill", "Codex plugin displayName mismatch");
  assert(json.interface.shortDescription && json.interface.shortDescription.length <= 80, "Codex plugin shortDescription must be concise");
  assert(json.interface.longDescription && json.interface.longDescription.length > 80, "Codex plugin needs a useful longDescription");
  assert(json.interface.developerName === "ZygHys", "Codex plugin developerName must be ZygHys");
  assert(json.interface.category === "Trading", "Codex plugin category must be Trading");
  assertArrayOfStrings(json.interface.capabilities, "Codex plugin capabilities");
  assertArrayOfStrings(json.interface.defaultPrompt, "Codex plugin defaultPrompt", 1, 3);
  for (const prompt of json.interface.defaultPrompt) {
    assert(prompt.length <= 128, "Codex plugin defaultPrompt entries must be <= 128 chars");
  }
  assert(/^#[0-9A-Fa-f]{6}$/.test(json.interface.brandColor), "Codex plugin brandColor must be a hex color");
}

function validateOpenAiYaml(file) {
  const full = path.join(root, file);
  const content = fs.readFileSync(full, "utf8");
  assert(content.includes('display_name: "TradingView Backtest"'), `${file} display_name mismatch`);
  assert(content.includes('short_description: "Run and review TradingView backtests"'), `${file} short_description mismatch`);
  assert(content.includes('brand_color: "#1E88E5"'), `${file} brand_color mismatch`);
  assert(content.includes("Use $tradingview-backtest"), `${file} default_prompt must mention $tradingview-backtest`);
  assert(content.includes("allow_implicit_invocation: true"), `${file} must allow implicit invocation`);
}

const rootMarket = readJson(".codebuddy-plugin/marketplace.json");
assert(rootMarket.name === "tradingview", "CodeBuddy marketplace name must be tradingview");
validateSemver(rootMarket.version, "CodeBuddy marketplace");
validateFlatMarketplace(rootMarket, "CodeBuddy");

const codexMarket = readJson(".agents/plugins/marketplace.json");
assert(codexMarket.name === "tradingview", "Codex marketplace name must be tradingview");
validateCodexMarketplace(codexMarket);

const claudeMarket = readJson(".claude-plugin/marketplace.json");
assert(claudeMarket.name === "tradingview", "Claude marketplace name must be tradingview");
validateSemver(claudeMarket.version, "Claude marketplace");
validateFlatMarketplace(claudeMarket, "Claude");
assert(
  claudeMarket.version === rootMarket.version,
  "CodeBuddy and Claude marketplace versions must match"
);

const pluginVersions = new Map();
for (const manifest of [
  "plugins/backtest-skill/.codebuddy-plugin/plugin.json",
  "plugins/backtest-skill/.codex-plugin/plugin.json",
  "plugins/backtest-skill/.claude-plugin/plugin.json",
]) {
  const json = readJson(manifest);
  assert(json.name === "backtest-skill", `${manifest} name must be backtest-skill`);
  validateSemver(json.version, manifest);
  assert(json.description && json.description.length > 20, `${manifest} needs a useful description`);
  if (json.commands) {
    assertPluginRelativePathField(json.commands, pluginRoot, `${manifest} commands`);
  }
  if (json.skills) {
    assertPluginRelativePathField(json.skills, pluginRoot, `${manifest} skills`);
  }
  if (manifest === "plugins/backtest-skill/.codex-plugin/plugin.json") {
    validateCodexPluginManifest(json);
  }
  pluginVersions.set(manifest, json.version);
}

assert(new Set(pluginVersions.values()).size === 1, "All backtest-skill plugin manifest versions must match");

const codebuddyPluginVersion = pluginVersions.get("plugins/backtest-skill/.codebuddy-plugin/plugin.json");
const claudePluginVersion = pluginVersions.get("plugins/backtest-skill/.claude-plugin/plugin.json");
assert(
  rootMarket.plugins.some((p) => p.name === "backtest-skill" && p.version === codebuddyPluginVersion),
  "CodeBuddy marketplace backtest-skill version must match plugin manifest"
);
assert(
  claudeMarket.plugins.some((p) => p.name === "backtest-skill" && p.version === claudePluginVersion),
  "Claude marketplace backtest-skill version must match plugin manifest"
);

for (const file of [
  ".gitattributes",
  "README.md",
  "AGENTS.md",
  "plugins/backtest-skill/README.md",
  "plugins/backtest-skill/commands/backtest.md",
  "plugins/backtest-skill/skills/tradingview-backtest/SKILL.md",
  "plugins/backtest-skill/skills/tradingview-backtest/agents/openai.yaml",
  "plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/validate-handoff.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-run-session.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-runbook.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/normalize-run-record.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/complete-run-record.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/score-run.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/compare-runs.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-review.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-next-run-request.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-next-run-request.js",
  "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-blocked-run.js",
  "plugins/backtest-skill/skills/tradingview-backtest/references/language-use.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/plan-limits-and-layouts.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md",
  "plugins/backtest-skill/skills/tradingview-backtest/references/alerts-webhooks.md",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/pine-fixtures/ema-cross-smoke-v1.pine",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/handoff-examples/pine-strategy-handoff.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/handoff-examples/indicator-only-invalid.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-session-examples/pine-strategy-session.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/runbook-examples/pine-strategy-runbook.md",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/blocked-report-render-input.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/blocked-report-render-run.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/copied-metrics-cn-input.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/copied-metrics-cn-normalized.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/browser-report-cn-input.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/browser-report-cn-completed.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/target-iteration-runs.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/review-examples/target-iteration-review.md",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/target-iteration-next-run-request.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/blocked-report-render-next-run-request.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/fixture-rejected-next-run-request.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/fixture-rejected-next-run-request.md",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-package-templates/pine-strategy-handoff-template.json",
  "plugins/backtest-skill/skills/tradingview-backtest/assets/run-package-templates/browser-metrics-template.json",
]) {
  assertFile(file);
}

validateSkill("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md");
validateOpenAiYaml("plugins/backtest-skill/skills/tradingview-backtest/agents/openai.yaml");

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

assertContains("plugins/backtest-skill/commands/backtest.md", "blank-layout-ready");
assertContains("plugins/backtest-skill/commands/backtest.md", "strategy handoff package");
assertContains("plugins/backtest-skill/commands/backtest.md", "end-to-end-browser-run.md");
assertContains("plugins/backtest-skill/commands/backtest.md", "Pine Editor");
assertContains("plugins/backtest-skill/commands/backtest.md", "create-run-session.js");
assertContains("plugins/backtest-skill/commands/backtest.md", "render-runbook.js");
assertContains("plugins/backtest-skill/commands/backtest.md", "render-review.js");
assertContains("plugins/backtest-skill/commands/backtest.md", "create-next-run-request.js");
assertContains("README.md", "strategy handoff package");
assertContains("README.md", "Pine Editor");
assertContains("README.md", "Markdown browser/manual runbooks");
assertContains("README.md", "scored run records");
assertContains("README.md", "Markdown review reports");
assertContains("README.md", "structured next-run requests");
assertContains("README.md", "Markdown next-run handoff requests");
assertContains("README.md", "fixture-rejected states");
assertContains("README.md", "fill-in run-package templates");
assertContains("README.md", "Stabilize the TradingView operating loop first");
assertContains("README.md", "Only after the operating loop is stable");
assertContains("plugins/backtest-skill/README.md", "`strategy()` consumes an indicator slot");
assertContains("plugins/backtest-skill/README.md", "end-to-end-browser-run.md");
assertContains("plugins/backtest-skill/README.md", "Pine Editor");
assertContains("plugins/backtest-skill/README.md", "run-package-templates");
assertContains("plugins/backtest-skill/README.md", "pine-strategy-handoff-template.json");
assertContains("plugins/backtest-skill/README.md", "browser-metrics-template.json");
assertContains("plugins/backtest-skill/README.md", "baseline goal is stable TV operation");
assertContains("plugins/backtest-skill/README.md", "requires a supplied real strategy");
assertContains("plugins/backtest-skill/README.md", "complete executable handoff");
assertContains("plugins/backtest-skill/README.md", "validate-handoff.js");
assertContains("plugins/backtest-skill/README.md", "create-run-session.js");
assertContains("plugins/backtest-skill/README.md", "render-runbook.js");
assertContains("plugins/backtest-skill/README.md", "normalize-run-record.js");
assertContains("plugins/backtest-skill/README.md", "complete-run-record.js");
assertContains("plugins/backtest-skill/README.md", "score-run.js");
assertContains("plugins/backtest-skill/README.md", "compare-runs.js");
assertContains("plugins/backtest-skill/README.md", "render-review.js");
assertContains("plugins/backtest-skill/README.md", "create-next-run-request.js");
assertContains("plugins/backtest-skill/README.md", "render-next-run-request.js");
assertContains("plugins/backtest-skill/README.md", "create-blocked-run.js");
assertContains("plugins/backtest-skill/README.md", "pine-strategy-handoff.json");
assertContains("plugins/backtest-skill/README.md", "pine-strategy-session.json");
assertContains("plugins/backtest-skill/README.md", "pine-strategy-runbook.md");
assertContains("plugins/backtest-skill/README.md", "blocked-report-render-input.json");
assertContains("plugins/backtest-skill/README.md", "copied-metrics-cn-input.json");
assertContains("plugins/backtest-skill/README.md", "browser-report-cn-completed.json");
assertContains("plugins/backtest-skill/README.md", "target-iteration-runs.json");
assertContains("plugins/backtest-skill/README.md", "target-iteration-review.md");
assertContains("plugins/backtest-skill/README.md", "target-iteration-next-run-request.json");
assertContains("plugins/backtest-skill/README.md", "blocked-report-render-next-run-request.json");
assertContains("plugins/backtest-skill/README.md", "fixture-rejected-next-run-request.json");
assertContains("plugins/backtest-skill/README.md", "fixture-rejected-next-run-request.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "plan-limits-and-layouts.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "strategy-handoff.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "end-to-end-browser-run.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "write it into Pine Editor");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "Treat return improvement as a later phase");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "operating loop is not stable");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "Validate the handoff package");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "create-run-session.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "render-runbook.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "normalize-run-record.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "complete-run-record.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "score-run.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "compare-runs.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "render-review.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "create-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "render-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/SKILL.md", "create-blocked-run.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "Minimum Handoff Package");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "Validate The Package");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "pine-strategy-handoff-template.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "Do not fill missing trading logic");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "indicator-only-invalid.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "Create A Run Session");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "pine-strategy-session.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "fixture-rejected-next-run-request.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-handoff.md", "fixture-rejected-next-run-request.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Definition Of Done");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Objective Ladder");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "The baseline success condition is a stable TV operation and analysis loop");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Pine Editor Write Protocol");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Strategy Tester Protocol");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Result Analysis Protocol");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "pine-strategy-handoff-template.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "browser-metrics-template.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "complete-run-record.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "render-review.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "render-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/end-to-end-browser-run.md", "Do not fill missing trading logic");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/validate-handoff.js", "Pine handoff must contain a strategy(...) declaration.");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/create-run-session.js", "ready_for_browser_or_manual_run");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/render-runbook.js", "TradingView Browser Runbook");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md", "create-run-session.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md", "end-to-end-browser-run.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md", "render-runbook.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md", "Browser Smoke-Test Fixture");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md", "end-to-end-browser-run.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md", "render-runbook.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/strategy-run.md", "strategy_quality: reject");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/plan-limits-and-layouts.md", "Do not remove indicators");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/plan-limits-and-layouts.md", "row-local remove button");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "Wrong indicator is removed");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "reload the same chart once");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "blocked_at_report_render");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "chart order markers as Strategy Tester evidence");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "create-blocked-run.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/failure-recovery.md", "blocked-report-render-run.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md", "metrics-captured");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/browser-operation.md", "Chart order markers");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/plan-limits-and-layouts.md", "Data-Depth Upsells");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "总损益");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "workflow_result");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "supplied parameter set");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Normalize Copied Metrics");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "copied-metrics-cn-normalized.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/normalize-run-record.js", "normalizeRunRecord");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Complete A Browser Run Record");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "browser-metrics-template.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Operational First");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Do not move to annualized-return improvement until operation is stable");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "browser-report-cn-completed.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/complete-run-record.js", "completeRunRecord");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Score A Run Record");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "Render A Review Report");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/result-analysis.md", "render-review.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/score-run.js", "Smoke fixture is workflow evidence only");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md", "continuation_gate");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md", "run_record_seed");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md", "fixture_only");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md", "complete-run-record.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/run-record-template.md", "create-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "Target Gate");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "Target-return iteration starts only after the TradingView operation loop is stable");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "smoke-test fixture");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "compare-runs.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "render-review.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "create-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "target-iteration-runs.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "target-iteration-review.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "target-iteration-next-run-request.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "blocked-report-render-next-run-request.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "fixture-rejected-next-run-request.json");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "render-next-run-request.js");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/references/iteration-review.md", "fixture-rejected-next-run-request.md");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/compare-runs.js", "scoreRun(record)");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/render-review.js", "TradingView Backtest Review");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/create-next-run-request.js", "next_tradingview_run_request");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/render-next-run-request.js", "TradingView Next Run Request");
assertContains("plugins/backtest-skill/skills/tradingview-backtest/scripts/create-blocked-run.js", "credential capture");

const handoffTemplate = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-package-templates/pine-strategy-handoff-template.json");
assert(handoffTemplate.handoff && handoffTemplate.handoff.artifact_type === "pine_strategy", "Pine handoff template must be a pine_strategy handoff");
assert(handoffTemplate.handoff.target_threshold === "20%", "Pine handoff template must preserve the 20% target");
assert(handoffTemplate.handoff.pine_source_path_or_inline_code, "Pine handoff template must expose pine_source_path_or_inline_code");
const browserMetricsTemplate = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-package-templates/browser-metrics-template.json");
assert(browserMetricsTemplate.run_record_seed, "Browser metrics template must include run_record_seed");
assert(browserMetricsTemplate.fields, "Browser metrics template must include Strategy Tester fields");
assert(browserMetricsTemplate.evidence && browserMetricsTemplate.evidence.screenshots, "Browser metrics template must include evidence screenshots");

const { createBlockedRun } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-blocked-run.js"));
const { validateHandoff } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/validate-handoff.js"));
const { createRunSession } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-run-session.js"));
const { renderRunbook } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-runbook.js"));
const { normalizeRunRecord } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/normalize-run-record.js"));
const { completeRunRecord } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/complete-run-record.js"));
const { compareRuns } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/compare-runs.js"));
const { renderReview } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-review.js"));
const { createNextRunRequest } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/create-next-run-request.js"));
const { renderNextRunRequest } = require(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/scripts/render-next-run-request.js"));

const handoffBaseDir = path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/assets/handoff-examples");
const pineHandoff = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/handoff-examples/pine-strategy-handoff.json");
assertHandoffPathInsidePlugin(pineHandoff.handoff, handoffBaseDir, "Pine strategy handoff example");
const pineHandoffResult = validateHandoff(pineHandoff, handoffBaseDir);
assert(pineHandoffResult.ok, "Pine strategy handoff example must validate");
assert(pineHandoffResult.artifact_type === "pine_strategy", "Pine strategy handoff example artifact type mismatch");

const runSessionActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/run-session-examples/.pine-strategy-session-generated.tmp.json";
fs.writeFileSync(path.join(root, runSessionActualPath), JSON.stringify(createRunSession(pineHandoff, { baseDir: handoffBaseDir }), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    runSessionActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/run-session-examples/pine-strategy-session.json",
    "Pine strategy run-session example output must match create-run-session.js"
  );
} finally {
  fs.unlinkSync(path.join(root, runSessionActualPath));
}

const indicatorOnlyHandoff = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/handoff-examples/indicator-only-invalid.json");
assertHandoffPathInsidePlugin(indicatorOnlyHandoff.handoff, handoffBaseDir, "Indicator-only handoff example");
const indicatorOnlyResult = validateHandoff(indicatorOnlyHandoff, handoffBaseDir);
assert(!indicatorOnlyResult.ok, "Indicator-only handoff example must fail validation");
assert(
  indicatorOnlyResult.errors.some((item) => item.includes("strategy(...)")),
  "Indicator-only handoff example must explain missing strategy declaration"
);
const indicatorOnlyRunSession = createRunSession(indicatorOnlyHandoff, { baseDir: handoffBaseDir });
assert(!indicatorOnlyRunSession.ok, "Indicator-only handoff must produce a blocked run session");
assert(indicatorOnlyRunSession.required_next_checkpoint === "complete-handoff-package", "Blocked run session must request complete handoff");

const runbookActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/runbook-examples/.pine-strategy-runbook-generated.tmp.md";
const runSessionExample = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-session-examples/pine-strategy-session.json");
fs.writeFileSync(path.join(root, runbookActualPath), renderRunbook(runSessionExample));
try {
  const actual = fs.readFileSync(path.join(root, runbookActualPath), "utf8");
  const expected = fs.readFileSync(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/assets/runbook-examples/pine-strategy-runbook.md"), "utf8");
  assert(
    normalizeLineEndings(actual) === normalizeLineEndings(expected),
    "Pine strategy Markdown runbook must match render-runbook.js"
  );
} finally {
  fs.unlinkSync(path.join(root, runbookActualPath));
}

const blockedExampleInput = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/blocked-report-render-input.json");
const blockedExampleActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/.blocked-report-render-generated.tmp.json";
fs.writeFileSync(path.join(root, blockedExampleActualPath), JSON.stringify(createBlockedRun(blockedExampleInput), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    blockedExampleActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/blocked-report-render-run.json",
    "Blocked report-render example output must match create-blocked-run.js"
  );
} finally {
  fs.unlinkSync(path.join(root, blockedExampleActualPath));
}

const copiedMetricsCnInput = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/copied-metrics-cn-input.json");
const copiedMetricsCnActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/.copied-metrics-cn-generated.tmp.json";
fs.writeFileSync(path.join(root, copiedMetricsCnActualPath), JSON.stringify(normalizeRunRecord(copiedMetricsCnInput), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    copiedMetricsCnActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/copied-metrics-cn-normalized.json",
    "Chinese copied metrics example output must match normalize-run-record.js"
  );
} finally {
  fs.unlinkSync(path.join(root, copiedMetricsCnActualPath));
}

const browserReportCnInput = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/browser-report-cn-input.json");
const browserReportCnActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/.browser-report-cn-generated.tmp.json";
fs.writeFileSync(path.join(root, browserReportCnActualPath), JSON.stringify(completeRunRecord(browserReportCnInput), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    browserReportCnActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/browser-report-cn-completed.json",
    "Browser report metrics example output must match complete-run-record.js"
  );
} finally {
  fs.unlinkSync(path.join(root, browserReportCnActualPath));
}

const targetIterationRuns = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/target-iteration-runs.json");
const targetIterationComparison = compareRuns(targetIterationRuns);
assert(targetIterationComparison.ok, "Target iteration example must be comparable");
assert(targetIterationComparison.best_run_id === "example-param-b", "Target iteration example best run should be example-param-b");
assert(targetIterationComparison.pass_count === 1, "Target iteration example should have exactly one pass run");

const targetIterationReviewActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/review-examples/.target-iteration-review-generated.tmp.md";
fs.writeFileSync(path.join(root, targetIterationReviewActualPath), renderReview(targetIterationRuns));
try {
  const actual = fs.readFileSync(path.join(root, targetIterationReviewActualPath), "utf8");
  const expected = fs.readFileSync(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/assets/review-examples/target-iteration-review.md"), "utf8");
  assert(
    normalizeLineEndings(actual) === normalizeLineEndings(expected),
    "Target iteration Markdown review must match render-review.js"
  );
} finally {
  fs.unlinkSync(path.join(root, targetIterationReviewActualPath));
}

const targetNextRunActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/.target-iteration-next-run-request-generated.tmp.json";
fs.writeFileSync(path.join(root, targetNextRunActualPath), JSON.stringify(createNextRunRequest(targetIterationRuns), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    targetNextRunActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/target-iteration-next-run-request.json",
    "Target iteration next-run request must match create-next-run-request.js"
  );
} finally {
  fs.unlinkSync(path.join(root, targetNextRunActualPath));
}

const blockedRunRecord = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/blocked-report-render-run.json");
const blockedNextRunActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/.blocked-report-render-next-run-request-generated.tmp.json";
fs.writeFileSync(path.join(root, blockedNextRunActualPath), JSON.stringify(createNextRunRequest(blockedRunRecord), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    blockedNextRunActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/blocked-report-render-next-run-request.json",
    "Blocked report-render next-run request must match create-next-run-request.js"
  );
} finally {
  fs.unlinkSync(path.join(root, blockedNextRunActualPath));
}

const fixtureRejectedRunRecord = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/run-record-examples/browser-report-cn-completed.json");
const fixtureRejectedNextRunActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/.fixture-rejected-next-run-request-generated.tmp.json";
fs.writeFileSync(path.join(root, fixtureRejectedNextRunActualPath), JSON.stringify(createNextRunRequest(fixtureRejectedRunRecord), null, 2) + "\n");
try {
  assertJsonDeepEqual(
    fixtureRejectedNextRunActualPath,
    "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/fixture-rejected-next-run-request.json",
    "Fixture-rejected next-run request must match create-next-run-request.js"
  );
} finally {
  fs.unlinkSync(path.join(root, fixtureRejectedNextRunActualPath));
}

const fixtureRejectedNextRunRequest = readJson("plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/fixture-rejected-next-run-request.json");
const fixtureRejectedNextRunMarkdownActualPath = "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/.fixture-rejected-next-run-request-generated.tmp.md";
fs.writeFileSync(path.join(root, fixtureRejectedNextRunMarkdownActualPath), renderNextRunRequest(fixtureRejectedNextRunRequest));
try {
  const actual = fs.readFileSync(path.join(root, fixtureRejectedNextRunMarkdownActualPath), "utf8");
  const expected = fs.readFileSync(path.join(root, "plugins/backtest-skill/skills/tradingview-backtest/assets/next-run-request-examples/fixture-rejected-next-run-request.md"), "utf8");
  assert(
    normalizeLineEndings(actual) === normalizeLineEndings(expected),
    "Fixture-rejected Markdown next-run request must match render-next-run-request.js"
  );
} finally {
  fs.unlinkSync(path.join(root, fixtureRejectedNextRunMarkdownActualPath));
}

console.log("Validation passed");
