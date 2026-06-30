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
git status --short
```

## Browser Automation Policy

Browser automation must be user-mediated for login and account-sensitive actions. Ask the user to open or authenticate TradingView themselves when needed, then operate only within visible, user-approved pages. Never persist credentials or session cookies.

