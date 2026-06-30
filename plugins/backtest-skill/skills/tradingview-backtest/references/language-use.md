# Language and Artifact Use

Use this reference when deciding which language, file type, or surface belongs to each part of a TradingView run.

## Boundaries

This skill does not construct a strategy. It only runs, verifies, and reviews a supplied TradingView strategy or saved TradingView strategy version.

Allowed:

- Compile or lightly repair supplied Pine code when the intent is clear and the change is only needed to run the supplied strategy.
- Compare user-provided script versions.
- Compare user-provided Strategy Tester input sets.
- Explain which artifact should be used for the next run.

Not allowed in this skill:

- Invent entry or exit rules.
- Convert an indicator into a strategy.
- Build a strategy from public accounts, screenshots, or vague market ideas.
- Use another runtime as the target execution engine.

## Language Map

| Need | Use | Notes |
| --- | --- | --- |
| TradingView execution | Pine Script v6 | Requires a `strategy()` script for Strategy Tester. |
| Browser operation | Host browser tools or manual UI steps | Never store credentials or cookies. |
| Result export | CSV, copied table, screenshot, or JSON notes | Use whatever TradingView exposes for the account/plan. |
| Result analysis | Markdown report plus optional calculations | Annualized return can be calculated from net return and date range. |
| Alert payload | JSON | Only after a supplied strategy has been tested. |

## Pine Handling

If the user provides Pine:

1. Confirm it is a `strategy()` script, not only an `indicator()`.
2. Preserve the strategy logic.
3. Only make compile/run fixes that do not change trading logic, and call them out.
4. If the script is only an indicator, ask for a strategy version or route to a future strategy-construction skill.
