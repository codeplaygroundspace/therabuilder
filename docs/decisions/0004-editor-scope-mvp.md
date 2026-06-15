# 0004 — MVP editing scope: text + theme only

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

After the AI generates a draft, therapists must be able to refine it and return later to edit.
Editing could span text, theme, section show/hide/reorder, images, and per-section AI
re-generation. Trying to ship all of it at once would blow the MVP.

## Decision

For the MVP, therapists can edit:

- **(a) Text content** — headlines, bio, service descriptions, taglines.
- **(b) Theme** — colors and fonts (e.g. choose from a small set of palettes).

**Deferred (explicitly out of MVP scope):**

- **(c)** Section show/hide and reorder.
- **(d)** Image upload / swap.
- **(e)** Per-section AI re-generation ("rewrite this warmer").

Note: the **AI** may still *choose* sections and imagery when generating the first draft
(see [0001](0001-product-and-architecture.md)); what's deferred is letting the *user manually
edit* those after generation.

## Consequences

- The editor can start as a **schema-driven side panel** (form fields bound to the content
  JSON) plus a **theme picker** — no drag-and-drop needed yet.
- Because we're all-React (see [0002](0002-framework-all-nextjs.md)), editing is **real-time
  by default**: form state updates the content document and the preview re-renders instantly.
  Theme edits map directly to CSS variables.
- A heavier visual-editor foundation (e.g. **Puck**) is **not required** for text+theme, but is
  a candidate if/when we add section drag-drop (c). See [0006](0006-build-not-rent-editor.md).
