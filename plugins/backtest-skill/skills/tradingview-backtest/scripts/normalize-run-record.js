#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const aliases = {
  net_profit: ["net profit", "net pnl", "\u603b\u635f\u76ca", "\u51c0\u5229\u6da6"],
  max_drawdown: ["max drawdown", "\u6700\u5927\u56de\u64a4"],
  total_trades: ["total trades", "closed trades", "\u603b\u4ea4\u6613", "\u4ea4\u6613\u6570"],
  win_rate: ["win rate", "percent profitable", "\u80dc\u7387", "\u76c8\u5229\u4ea4\u6613"],
  profit_factor: ["profit factor", "\u76c8\u5229\u56e0\u5b50"],
  average_trade: ["average trade", "avg trade", "\u5e73\u5747\u76c8\u4e8f"],
  sharpe: ["sharpe", "\u590f\u666e\u6bd4\u7387"],
};

function usage() {
  return [
    "Usage:",
    "  node scripts/normalize-run-record.js <input.json>",
    "  node scripts/normalize-run-record.js -  # read JSON from stdin",
    "",
    "Input shape:",
    "  { \"run_record\": {...}, \"fields\": { \"total pnl\": \"...\" } }",
    "  { \"run_record\": {...}, \"raw_text\": \"copied Strategy Tester text\" }",
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

function lower(value) {
  return String(value || "").toLowerCase();
}

function findByFields(fields, names) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return "";
  }
  const entries = Object.entries(fields);
  for (const name of names) {
    const needle = lower(name);
    const found = entries.find(([key]) => {
      const haystack = lower(key).replace(/\s+/g, " ").trim();
      return haystack.includes(needle) || needle.includes(haystack);
    });
    if (found) {
      return String(found[1]).trim();
    }
  }
  return "";
}

function findByRawText(rawText, names) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const comparable = lower(line);
    for (const name of names) {
      const needle = lower(name);
      const at = comparable.indexOf(needle);
      if (at === -1) {
        continue;
      }
      const tail = line.slice(at + name.length).replace(/^[:\uFF1A\s|\-]+/, "").trim();
      if (tail) {
        return tail;
      }
      return lines[index + 1] || "";
    }
  }
  return "";
}

function firstValue(source, names) {
  return findByFields(source.fields, names) || findByRawText(source.raw_text, names);
}

function firstPercent(value) {
  const match = String(value || "").match(/[+-]?\d[\d,]*(?:\.\d+)?\s*%/);
  return match ? match[0].replace(/\s+/g, "") : "";
}

function firstRatioTotal(value) {
  const match = String(value || "").match(/\b\d+\s*\/\s*(\d+)\b/);
  return match ? match[1] : "";
}

function firstNumber(value) {
  const match = String(value || "").match(/[+-]?\d[\d,]*(?:\.\d+)?/);
  return match ? match[0] : "";
}

function normalizeRunRecord(input) {
  const record = clone(input.run_record || {});
  record.target = record.target || clone(input.target);
  record.strategy = record.strategy || clone(input.strategy);
  record.market = record.market || clone(input.market);
  record.properties = record.properties || clone(input.properties);
  record.inputs = record.inputs || clone(input.inputs);
  record.metrics = record.metrics || {};
  record.evidence = record.evidence || {};
  record.analysis = record.analysis || {};

  const netProfitRaw = firstValue(input, aliases.net_profit);
  if (netProfitRaw && !record.metrics.net_profit) {
    record.metrics.net_profit = netProfitRaw;
  }
  if (netProfitRaw && !record.metrics.net_return) {
    record.metrics.net_return = firstPercent(netProfitRaw);
  }

  const drawdownRaw = firstValue(input, aliases.max_drawdown);
  if (drawdownRaw && !record.metrics.max_drawdown) {
    record.metrics.max_drawdown = firstPercent(drawdownRaw) || drawdownRaw;
  }

  const totalTradesRaw = firstValue(input, aliases.total_trades);
  const winRateRaw = firstValue(input, aliases.win_rate);
  const totalTrades = firstNumber(totalTradesRaw) || firstRatioTotal(winRateRaw);
  if (totalTrades && !record.metrics.total_trades) {
    record.metrics.total_trades = totalTrades;
  }
  const winRate = firstPercent(winRateRaw);
  if (winRate && !record.metrics.win_rate) {
    record.metrics.win_rate = winRate;
  }

  const profitFactorRaw = firstValue(input, aliases.profit_factor);
  if (profitFactorRaw && !record.metrics.profit_factor) {
    record.metrics.profit_factor = firstNumber(profitFactorRaw);
  }

  const averageTradeRaw = firstValue(input, aliases.average_trade);
  if (averageTradeRaw && !record.metrics.average_trade) {
    record.metrics.average_trade = averageTradeRaw;
  }

  const sharpeRaw = firstValue(input, aliases.sharpe);
  if (sharpeRaw && !record.metrics.sharpe) {
    record.metrics.sharpe = firstNumber(sharpeRaw);
  }

  if (input.raw_text && !record.evidence.copied_tables) {
    record.evidence.copied_tables = ["raw_text"];
  } else if (input.fields && !record.evidence.copied_tables) {
    record.evidence.copied_tables = ["fields"];
  }

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
  console.log(JSON.stringify(normalizeRunRecord(parsed), null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { normalizeRunRecord };
