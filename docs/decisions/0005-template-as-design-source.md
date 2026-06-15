# 0005 — `sarah-demo` is the design source, ported to React

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

The existing template lives at <https://github.com/codeplaygroundspace/sarah-demo> — a polished
**Astro** therapist site. Its structure is favorable for an AI builder: **content is fully
externalized into typed data files** (`src/data/{site,home,practitioner,blog}.ts`), and styling
is modular CSS with **design tokens in `theme.css`** (colors, fonts, shadows as CSS variables).

We are building all-React (see [0002](0002-framework-all-nextjs.md)), so the literal Astro
template cannot be the renderer.

## Decision

Treat `sarah-demo` as the **design source**, not the runtime engine:

- **Port its sections to React** components (hero, services, testimonial, CTA, etc.), preserving
  the look. This becomes the section library the renderer and editor share.
- **Reuse its design tokens** — `theme.css`'s CSS variables map directly onto our theme system,
  so theme editing (see [0004](0004-editor-scope-mvp.md)) = swapping those variables.
- **Reuse its data shape** — its `src/data/*.ts` files inform the content schema in
  [0003](0003-content-json-source-of-truth.md).

## Consequences

- One-time porting cost (Astro `.astro` → React `.tsx`), but afterward **one section codebase**.
- The template defines the quality bar; the AI fills content within these sections rather than
  inventing layouts.
- If we later add an Astro publish target ([0002](0002-framework-all-nextjs.md)), the original
  `sarah-demo` components are the natural basis for it — the design already exists in Astro form.
