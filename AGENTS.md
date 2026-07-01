# Agent Instructions

This repository is an unofficial TradingView AI skill marketplace.

## Scope

- Keep the repository marketplace-oriented: root marketplace manifests, plugin folders, and one skill folder per reusable workflow.
- The marketplace name is `tradingview`.
- The first plugin is `backtest-skill`.
- The first skill is `tradingview-backtest`.

## AME Compatibility Rules

- Use kebab-case for marketplace, plugin, command, and skill identifiers.
- Keep plugin manifests semver-compatible.
- Keep `SKILL.md` concise and move detailed workflow material to one-hop files under `references/`.
- Commands must stay thin. They declare intent and delegate to the skill instead of duplicating workflow logic.
- Do not add credentials, account cookies, private TradingView exports, broker data, or exchange keys.
- Do not claim this is an official TradingView plugin or official TradingView skill.

## Validation

Before publishing changes, run:

```bash
node plugins/backtest-skill/scripts/validate.js
python <skill-creator>/scripts/quick_validate.py plugins/backtest-skill/skills/tradingview-backtest
python <plugin-creator>/scripts/validate_plugin.py plugins/backtest-skill
git status --short
```

The repository validator is the required marketplace/configuration gate. Host-specific CLI validation can be run separately when available, but it is not required for this repository's marketplace configuration check.

## Path Boundary Policy

Keep every plugin resource needed at runtime under `plugins/backtest-skill/`. Handoff examples may reference sibling files inside the skill assets tree, but they must not rely on repository-external or parent-directory files after Claude Code or Codex copies the plugin to a cache.

## Browser Automation Policy

Browser automation must be user-mediated for login and account-sensitive actions. Ask the user to open or authenticate TradingView themselves when needed, then operate only within visible, user-approved pages. Never persist credentials or session cookies.
