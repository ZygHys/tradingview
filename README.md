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

1. Stabilize the TradingView operating loop first: browser access, layout handling, Pine Editor or saved strategy loading, Strategy Tester refresh, evidence capture, result analysis, and next-run handoff.
2. Decide which language or surface is used for each step: Pine for existing TradingView strategies, browser automation for UI operation, CSV/JSON for result artifacts, and Markdown for review notes.
3. Write a supplied Pine `strategy()` into Pine Editor, save it, add it to chart, and run it through Strategy Tester.
4. Check setup assumptions: symbol, timeframe, chart type, date range, commission, slippage, sizing, pyramiding, plan/data limitations, repaint, and lookahead risk.
5. Extract or summarize Strategy Tester results from the UI, screenshots, copied tables, or exported files.
6. Only after the operating loop is stable, compare runs and iterate user-provided strategy versions or input parameters toward an explicit target such as annualized return >= 20%, without inventing new trading logic.
7. Accept a strategy handoff package from users or future strategy-construction plugins before browser execution.
8. Provide fill-in run-package templates for real strategy handoffs and browser-captured Strategy Tester metrics.
9. Turn an executable handoff into a browser run package and checklist before touching TradingView, with generated example packages that show exactly what the browser operator receives.
10. Render Markdown browser/manual runbooks from handoffs, run sessions, or browser run packages so execution can be delegated without losing required evidence.
11. Complete browser-captured Strategy Tester metrics into scored run records from run-session seeds.
12. Render portable Markdown review reports from Strategy Tester run records and supplied run sets.
13. Emit structured next-run requests so browser or manual execution can continue from pass, watch, iterate, blocked states, fixture-rejected states, or fixture-visible/no-real-handoff states.
14. Render Markdown next-run handoff requests for users or browser operators.
15. Produce blocked-run records when TradingView account, layout, plan, browser, or report-rendering state prevents auditable metrics.
16. Produce alert and webhook payload templates when the already-tested strategy is ready for forward testing.

## Repository Layout

```text
tradingview/
|-- .codebuddy-plugin/
|   `-- marketplace.json
|-- .github/
|   `-- workflows/validate.yml
|-- .agents/
|   `-- plugins/
|       `-- marketplace.json
|-- .claude-plugin/
|   `-- marketplace.json
|-- plugins/
|   `-- backtest-skill/
|       |-- .codebuddy-plugin/plugin.json
|       |-- .codex-plugin/plugin.json
|       |-- .claude-plugin/plugin.json
|       |-- commands/
|       |-- skills/
|       |   `-- tradingview-backtest/
|       |       |-- SKILL.md
|       |       |-- agents/openai.yaml
|       |       |-- references/
|       |       |-- scripts/
|       |       `-- assets/
|       `-- scripts/
`-- AGENTS.md
```

## Compatibility Targets

- AME plugin marketplace structure: `.codebuddy-plugin/marketplace.json` plus `plugins/<plugin-name>/`.
- Codex repo-scoped marketplace structure: `.agents/plugins/marketplace.json` plus `.codex-plugin/plugin.json`.
- Claude Code plugin-compatible structure: `.claude-plugin/marketplace.json` plus `.claude-plugin/plugin.json`.
- Agent Skills structure: `skills/<skill-name>/SKILL.md` with `name` and `description` frontmatter.
- Plugin resources stay inside the plugin tree so cached plugin installs do not depend on repository-external paths.

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

## Validation

Run the repository validator before publishing. It checks marketplace manifests, plugin manifests, paths, versions, required files, and generated example artifacts.

GitHub Actions runs the same validator on pushes and pull requests so public marketplace changes stay installable.

```bash
node plugins/backtest-skill/scripts/validate.js
```

For Codex skill/plugin compatibility, run the local creator validators when those tool bundles are available:

```bash
python <skill-creator>/scripts/quick_validate.py plugins/backtest-skill/skills/tradingview-backtest
python <plugin-creator>/scripts/validate_plugin.py plugins/backtest-skill
```

## Backtest Skill Scope

The `tradingview-backtest` skill helps an AI agent answer requests such as:

- "Use the browser to run this Pine strategy in TradingView Strategy Tester."
- "Check whether this Pine strategy repaints before I trust the backtest."
- "Use the browser to open TradingView, add the strategy, and collect Strategy Tester results."
- "Analyze my copied or exported Strategy Tester results."
- "Compare these parameter runs and tell me whether annualized return can reach 20% with acceptable drawdown."
- "Generate alert and webhook JSON for this strategy."

The skill is deliberately workflow-first. It can use browser automation when the host provides browser tools, but it always keeps a manual fallback path because TradingView UI, account state, and subscriptions vary. It does not build strategies from indicators, public accounts, or vague trading ideas; those belong in separate future plugins.

The baseline objective is stable TradingView design, test, evidence, analysis, and iteration. Annualized return targets such as 20% are evaluated only after that loop is repeatable and a real supplied strategy or supplied parameter set exists.

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
- Claude Code plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Claude Code plugins reference: https://code.claude.com/docs/en/plugins-reference
