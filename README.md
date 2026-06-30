# TradingView AI Skill Marketplace

This repository is an unofficial, public AI workflow marketplace for TradingView usage workflows.

It is not affiliated with, endorsed by, or operated by TradingView. It does not provide a hidden TradingView API, an official TradingView ChatGPT Skill, or a way to bypass TradingView account, data, alert, or subscription limits.

## Positioning

The repository is a marketplace named `tradingview`. It is intended to host multiple AI-agent plugins for TradingView workflows. The first plugin is:

| Plugin | Purpose |
| --- | --- |
| `backtest-skill` | Run supplied TradingView strategies in the browser, operate Strategy Tester, collect results, review evidence, and iterate user-provided versions or parameters toward a target metric. |

## Value

TradingView is strong as a strategy expression, chart review, and signal alert layer. It is weaker as a bulk public trade-record database or a local offline backtesting engine. This marketplace focuses on using TradingView correctly:

1. Decide which language or surface is used for each step: Pine for existing TradingView strategies, browser automation for UI operation, CSV/JSON for result artifacts, and Markdown for review notes.
2. Run a supplied `strategy()` script, built-in/public strategy, or saved TradingView strategy version inside Strategy Tester.
3. Check setup assumptions: symbol, timeframe, chart type, date range, commission, slippage, sizing, pyramiding, plan/data limitations, repaint, and lookahead risk.
4. Extract or summarize Strategy Tester results from the UI, screenshots, copied tables, or exported files.
5. Compare runs and iterate user-provided strategy versions or input parameters toward an explicit target such as annualized return >= 20%, without inventing new trading logic.
6. Produce alert and webhook payload templates when the already-tested strategy is ready for forward testing.

## Repository Layout

```text
tradingview/
├── .codebuddy-plugin/
│   └── marketplace.json
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── backtest-skill/
│       ├── .codebuddy-plugin/plugin.json
│       ├── .codex-plugin/plugin.json
│       ├── .claude-plugin/plugin.json
│       ├── commands/
│       ├── skills/
│       │   └── tradingview-backtest/
│       │       ├── SKILL.md
│       │       ├── agents/openai.yaml
│       │       └── references/
│       └── scripts/
└── AGENTS.md
```

## Compatibility Targets

- AME plugin marketplace structure: `.codebuddy-plugin/marketplace.json` plus `plugins/<plugin-name>/`.
- Codex repo-scoped marketplace structure: `.agents/plugins/marketplace.json` plus `.codex-plugin/plugin.json`.
- Claude Code plugin-compatible structure: `.claude-plugin/marketplace.json` plus `.claude-plugin/plugin.json`.
- Agent Skills structure: `skills/<skill-name>/SKILL.md` with `name` and `description` frontmatter.

## Install Notes

### CodeBuddy or AME-style plugin host

Add this repository as a plugin marketplace, then install `backtest-skill`.

```text
/plugin marketplace add ZygHys/tradingview
/plugin install backtest-skill@tradingview
```

### Codex

Open this repository in Codex so the repo-scoped marketplace at `.agents/plugins/marketplace.json` can be discovered, then install `backtest-skill` from the plugin directory.

If the marketplace is not discovered automatically, use the host's plugin marketplace diagnostics from the repository root.

### Claude Code

Use the Claude Code plugin marketplace flow for this repository and install `backtest-skill`. The plugin includes a `.claude-plugin/plugin.json` manifest and a standard Agent Skill folder.

## Backtest Skill Scope

The `tradingview-backtest` skill helps an AI agent answer requests such as:

- "Use the browser to run this Pine strategy in TradingView Strategy Tester."
- "Check whether this Pine strategy repaints before I trust the backtest."
- "Use the browser to open TradingView, add the strategy, and collect Strategy Tester results."
- "Analyze my copied or exported Strategy Tester results."
- "Compare these parameter runs and tell me whether annualized return can reach 20% with acceptable drawdown."
- "Generate alert and webhook JSON for this strategy."

The skill is deliberately workflow-first. It can use browser automation when the host provides browser tools, but it always keeps a manual fallback path because TradingView UI, account state, and subscriptions vary. It does not build strategies from indicators, public accounts, or vague trading ideas; those belong in separate future plugins.

## Public Repository Policy

- Do not commit TradingView credentials, broker credentials, webhook secrets, exchange API keys, screenshots containing private account data, or private exported trade reports.
- Do not present Pine code, backtest metrics, or parameter choices as financial advice.
- Do not claim official TradingView, OpenAI, Anthropic, Codex, or Claude Code endorsement.
- Prefer reproducible artifacts: Pine source, settings, symbol, timeframe, date range, commission/slippage assumptions, screenshots, copied Strategy Tester tables, and result exports.

## References

- TradingView Pine Script docs: https://www.tradingview.com/pine-script-docs/
- TradingView Strategy Tester docs: https://www.tradingview.com/support/categories/strategy-tester/
- TradingView webhook alert docs: https://www.tradingview.com/support/solutions/43000529348-how-to-configure-webhook-alerts/
- Agent Skills reference: https://agentskills.io/
