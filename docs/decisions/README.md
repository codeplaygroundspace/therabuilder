# Architecture Decision Records

This folder is the **source of truth for *why* TheraBuilder is built the way it is.**
Each file records one decision: the context, the choice we made, the alternatives we
rejected, and the consequences.

## READ THIS BEFORE WRITING ANY CODE

> **If you are an AI agent (Claude Code or otherwise) about to work in this repo: read
> every file in `docs/decisions/` first.** These decisions were made deliberately, often
> after rejecting the "obvious" approach for a specific reason. Do not re-litigate a
> settled decision or contradict it without explicitly flagging it to the user. If a task
> conflicts with a decision here, stop and surface the conflict.

## Status legend

- **Accepted** — decided, build to this.
- **Open** — not yet decided; do not assume an answer.
- **Superseded** — replaced by a later record (linked).

## Index

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-product-and-architecture.md) | Product shape & end-to-end architecture | Accepted |
| [0002](0002-framework-all-nextjs.md) | One framework: all Next.js / React | Accepted |
| [0003](0003-content-json-source-of-truth.md) | Content + theme JSON is the source of truth | Accepted |
| [0004](0004-editor-scope-mvp.md) | MVP editing scope: text + theme only | Accepted |
| [0005](0005-template-as-design-source.md) | `sarah-demo` is the design source, ported to React | Accepted |
| [0006](0006-build-not-rent-editor.md) | Build our own editor, don't rent a visual CMS | Accepted |
| [0007](0007-open-questions.md) | Open questions (DB/auth, hosting) | Open |
| [0008](0008-ai-provider-anthropic.md) | AI provider: Anthropic (Claude), swappable interface | Accepted |
| [0009](0009-rendered-site-styling-tailwind-tokens.md) | Rendered-site styling: tokenized Tailwind, presets & templates | Accepted |
| [0010](0010-mvp-generation-skeleton-and-curated-look.md) | MVP generation: fixed skeleton, AI fills content, curated look | Accepted |
| [0011](0011-home-first-phased-generation.md) | Home-first, phased generation (home now, rest on request) | Accepted |

## How to add a decision

Copy the format of an existing record: a short title, **Status**, **Date**, **Context**,
**Decision**, **Alternatives considered**, **Consequences**. Keep each file focused on a
single decision. Add a row to the index above.
