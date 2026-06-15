# 0003 — Content + theme JSON is the source of truth

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

We studied how real builders (Wix, Webflow, Framer, Squarespace) work. The universal pattern:
**none of them keep two renderers.** A site is a **structured data document** (content +
theme), and **one runtime** consumes that document for both editing and publishing.

## Decision

A therapist's site is represented as a **typed JSON document**: a **content** part (headlines,
bio, services, taglines, which sections appear and in what order) plus a **theme** part (colors,
fonts). This document — **not** any framework or rendered output — is the **single source of
truth**, stored in the database.

- The AI **generates** this document from the onboarding answers.
- The editor **edits** this document.
- The renderer **renders** this document.

## Consequences

- **The renderer is a swappable detail.** This is what makes the Astro publish target in
  [0002](0002-framework-all-nextjs.md) a cheap future option rather than a rewrite.
- We need **one typed schema** for the document. Defining it well is foundational work — the AI
  output, the editor forms, and the renderer all depend on the same types.
- Persistence + accounts follow directly: the document is a saved record a therapist returns to.
- `sarah-demo`'s existing data files (`src/data/{site,home,practitioner,blog}.ts`) are a strong
  starting reference for the schema's shape (see [0005](0005-template-as-design-source.md)).
