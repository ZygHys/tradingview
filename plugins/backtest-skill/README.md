# Backtest Skill Plugin

`backtest-skill` is the first plugin in the unofficial `tradingview` marketplace.

It packages one reusable Agent Skill:

```text
skills/tradingview-backtest/SKILL.md
```

## Goal

Help an AI agent move from a strategy idea to a TradingView Strategy Tester run and then to a reproducible local backtest path.

The plugin solves these recurring gaps:

- Which language to use for each step.
- How to write Pine Script v6 strategy code that can run in TradingView.
- How to operate the TradingView UI or guide the user manually.
- How to collect and audit Strategy Tester results.
- How to detect repaint and lookahead risk.
- How to generate alert webhook payloads.
- How to migrate validated strategy logic to Python, Freqtrade, Backtrader, or vectorbt.

## Components

| Path | Purpose |
| --- | --- |
| `.codebuddy-plugin/plugin.json` | AME / CodeBuddy-compatible plugin manifest |
| `.codex-plugin/plugin.json` | Codex plugin manifest |
| `.claude-plugin/plugin.json` | Claude Code-compatible plugin manifest |
| `commands/backtest.md` | Thin command entry that delegates to the skill |
| `skills/tradingview-backtest/SKILL.md` | Core skill workflow |
| `skills/tradingview-backtest/references/` | One-hop references loaded as needed |
| `scripts/validate.js` | Deterministic repository validation |

## Use

Ask the agent to use `$tradingview-backtest`, or install the `backtest-skill` plugin from the `tradingview` marketplace and ask naturally:

```text
Use the TradingView backtest skill to turn this breakout idea into a Pine v6 strategy, run it in TradingView, and produce a migration plan for Freqtrade.
```

