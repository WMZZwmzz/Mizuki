# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

If the project has no test infrastructure and the task is exploratory, state success criteria in plain language instead (e.g., "verify: running curl /api/users returns 200 with expected JSON").

### 5. Security Baseline

**Never commit keys or sensitive credentials to the repository.**

- All API keys, tokens, passwords, private keys, database connection strings, and similar secrets **must** be managed via environment variables or `.env` files.
- Ensure `.env` is added to `.gitignore`.
- **If any sensitive information needs to be included in the code to function, you must ask me first before committing. Do not decide on your own.**
- If you discover sensitive data that has already been committed, immediately alert me so I can rotate the key and clean up the Git history.

## 6. Project-Specific Conventions (docs/rule/)

**Before writing or refactoring project code, follow the conventions in [`docs/rule/`](./docs/rule/README.md).** These are Mizuki-specific and take precedence over generic habits.

- [Component architecture](./docs/rule/01-component-architecture.md) - layering (atoms/molecules/organisms), naming, code organization.
- [Component split guide](./docs/rule/02-component-split-guide.md) - when and how to split oversized components.
- [File organization](./docs/rule/03-file-organization-architecture.md) - directory structure, file naming, module boundaries.
- [CSS style guide](./docs/rule/04-css-style-guide.md) - no `!important` (except Twikoo), use CSS variables / Tailwind, dark-theme rules.
- [Atom component usage](./docs/rule/05-atom-component-usage.md) - prefer existing `atoms/` and `misc/` components; extract when UI repeats.
- [Sidebar widget dev](./docs/rule/06-sidebar-widget-dev.md) - the 3 required steps to register a sidebar widget (componentMap is easy to miss).
- [Icon usage](./docs/rule/07-icon-usage-specification.md) - the 3 standard Iconify usages; never use raw `<iconify-icon>` in business code.

See the [code review checklist](./docs/rule/README.md#代码审查检查清单) in the README before submitting changes.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.