# Backtest Skill Plugin

`backtest-skill` is the first plugin in the unofficial `tradingview` marketplace.

It packages one reusable Agent Skill:

```text
skills/tradingview-backtest/SKILL.md
```

## Goal

Help an AI agent operate TradingView well enough to run a supplied strategy in Strategy Tester, collect results, review the evidence, and iterate supplied versions or parameters toward a target metric such as 20% annualized return.

The plugin solves these recurring gaps:

- Which language or surface to use for each step.
- How to load, compile, and run an existing Pine Script v6 `strategy()` in TradingView.
- How to operate the TradingView UI or guide the user manually.
- How to collect and audit Strategy Tester results.
- How to detect repaint and lookahead risk.
- How to generate alert webhook payloads.
- How to compare runs and iterate user-provided versions or parameter sets without inventing strategy logic.

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
Use the TradingView backtest skill to run this existing Pine strategy in TradingView, collect Strategy Tester results, and review whether parameter set B improves annualized return toward 20%.
```
