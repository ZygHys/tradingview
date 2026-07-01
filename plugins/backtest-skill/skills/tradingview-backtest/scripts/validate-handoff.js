#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const allowedArtifactTypes = new Set([
  "pine_strategy",
  "saved_tradingview_strategy",
  "parameter_set",
  "tester_result",
]);

function usage() {
  return [
    "Usage:",
    "  node scripts/validate-handoff.js <handoff.json>",
    "  node scripts/validate-handoff.js -  # read JSON from stdin",
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

function hasStrategyDeclaration(source) {
  return /\bstrategy\s*\(/i.test(source);
}

function hasIndicatorDeclaration(source) {
  return /\bindicator\s*\(/i.test(source);
}

function readPineSource(value, baseDir) {
  const text = asText(value);
  if (!text) {
    return "";
  }
  const candidate = path.resolve(baseDir, text);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return fs.readFileSync(candidate, "utf8");
  }
  return text;
}

function requireField(errors, handoff, field) {
  if (!asText(handoff[field])) {
    errors.push(`Missing required field: handoff.${field}`);
  }
}

function validateHandoff(raw, baseDir) {
  const handoff = raw && typeof raw === "object" && raw.handoff ? raw.handoff : raw;
  const errors = [];
  const warnings = [];

  if (!handoff || typeof handoff !== "object" || Array.isArray(handoff)) {
    return { ok: false, errors: ["Input must be a JSON object or an object with a handoff property."], warnings };
  }

  const artifactType = asText(handoff.artifact_type);
  if (!allowedArtifactTypes.has(artifactType)) {
    errors.push(`handoff.artifact_type must be one of: ${Array.from(allowedArtifactTypes).join(", ")}`);
  }

  for (const field of ["symbol", "exchange", "timeframe", "target_metric", "target_threshold"]) {
    if (!asText(handoff[field])) {
      warnings.push(`Recommended field is empty: handoff.${field}`);
    }
  }

  if (artifactType === "pine_strategy") {
    requireField(errors, handoff, "strategy_name");
    requireField(errors, handoff, "pine_source_path_or_inline_code");
    const source = readPineSource(handoff.pine_source_path_or_inline_code, baseDir);
    if (!hasStrategyDeclaration(source)) {
      errors.push("Pine handoff must contain a strategy(...) declaration.");
    }
    if (hasIndicatorDeclaration(source) && !hasStrategyDeclaration(source)) {
      errors.push("Indicator-only Pine scripts are not executable handoff packages for this skill.");
    }
  }

  if (artifactType === "saved_tradingview_strategy") {
    requireField(errors, handoff, "strategy_name");
  }

  if (artifactType === "parameter_set") {
    requireField(errors, handoff, "strategy_name");
    const sets = Array.isArray(handoff.parameter_sets) ? handoff.parameter_sets : [];
    if (sets.length === 0) {
      errors.push("parameter_set handoff requires at least one handoff.parameter_sets entry.");
    }
    for (const [index, item] of sets.entries()) {
      if (!item || typeof item !== "object") {
        errors.push(`handoff.parameter_sets[${index}] must be an object.`);
        continue;
      }
      if (!asText(item.name)) {
        errors.push(`handoff.parameter_sets[${index}].name is required.`);
      }
      if (!item.values || typeof item.values !== "object" || Array.isArray(item.values)) {
        errors.push(`handoff.parameter_sets[${index}].values must be an object.`);
      }
    }
  }

  if (artifactType === "tester_result") {
    const hasEvidence =
      asText(handoff.screenshot_path) ||
      asText(handoff.export_path) ||
      asText(handoff.copied_table_path) ||
      asText(handoff.result_notes);
    if (!hasEvidence) {
      errors.push("tester_result handoff requires screenshot_path, export_path, copied_table_path, or result_notes.");
    }
  }

  return {
    ok: errors.length === 0,
    artifact_type: artifactType || null,
    errors,
    warnings,
  };
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
  const result = validateHandoff(parsed, baseDir);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { validateHandoff };
