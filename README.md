# TradingView AI Skill Marketplace

This repository is an unofficial, public AI workflow marketplace for TradingView-related research and backtesting.

It is not affiliated with, endorsed by, or operated by TradingView. It does not provide a hidden TradingView API, an official TradingView ChatGPT Skill, or a way to bypass TradingView account, data, alert, or subscription limits.

## Positioning

The repository is a marketplace named `tradingview`. It is intended to host multiple AI-agent plugins for TradingView workflows. The first plugin is:

| Plugin | Purpose |
| --- | --- |
| `backtest-skill` | Convert trading ideas into runnable Pine strategies, operate TradingView Strategy Tester with browser/manual workflows, audit results, and migrate validated logic to local backtesting frameworks. |

## Value

TradingView is strong as a strategy expression, chart review, and signal alert layer. It is weaker as a bulk public trade-record database or a local offline backtesting engine. This marketplace focuses on the practical bridge:

1. Turn a strategy idea into Pine Script v6 `strategy()` code.
2. Run or guide the run inside TradingView Strategy Tester.
3. Check repaint, lookahead, timeframe, commission, slippage, and fill assumptions.
4. Extract or summarize Strategy Tester results.
5. Convert promising logic to Python, Freqtrade, Backtrader, vectorbt, or another local backtesting stack.
6. Produce alert and webhook payload templates when the strategy is ready for forward testing.

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

- "Turn this idea into a Pine v6 strategy and run it in TradingView."
- "Check whether this Pine strategy repaints before I trust the backtest."
- "Use the browser to open TradingView, add the strategy, and collect Strategy Tester results."
- "Analyze my exported Strategy Tester CSV."
- "Convert this TradingView strategy to Freqtrade or vectorbt."
- "Generate alert and webhook JSON for this strategy."

The skill is deliberately workflow-first. It can use browser automation when the host provides browser tools, but it always keeps a manual fallback path because TradingView UI, account state, and subscriptions vary.

## Public Repository Policy

- Do not commit TradingView credentials, broker credentials, webhook secrets, exchange API keys, screenshots containing private account data, or private exported trade reports.
- Do not present generated Pine code as financial advice.
- Do not claim official TradingView, OpenAI, Anthropic, Codex, or Claude Code endorsement.
- Prefer reproducible artifacts: Pine source, settings, symbol, timeframe, date range, commission/slippage assumptions, result exports, and local backtest notebooks/scripts.

## References

- TradingView Pine Script docs: https://www.tradingview.com/pine-script-docs/
- TradingView Strategy Tester docs: https://www.tradingview.com/support/categories/strategy-tester/
- TradingView webhook alert docs: https://www.tradingview.com/support/solutions/43000529348-how-to-configure-webhook-alerts/
- Agent Skills reference: https://agentskills.io/

