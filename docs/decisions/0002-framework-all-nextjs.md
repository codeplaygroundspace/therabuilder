# 0002 — One framework: all Next.js / React

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

The published therapist sites want excellent SEO and speed, which made **Astro** attractive
(it ships ~0 JS by default). But the **builder** (onboarding chat, side-panel editor, theme
picker, real-time preview, auth, save-to-DB) is an inherently interactive, stateful app.

We needed real-time editing **and** good SEO **and**, above all, **one framework to maintain**.

## Decision

**Build the entire product — the builder app *and* the published therapist sites — in
Next.js / React.** One framework, one component library, one section codebase.

### Why this and not Astro

The decisive realization: **for this product, "all-Astro" is not actually one framework.**
Astro renders static pages and hands interactivity to a client framework (React) via islands.
The builder is unavoidably a React app. So:

- **all-Next** = React builder **+** React sites → genuinely **one framework, one section codebase.**
- **all-Astro** = React builder (unavoidable) **+** Astro sites → **two frameworks** + a preview
  bridge + migrating the existing chat. Choosing Astro doesn't *buy* one framework; it *costs*
  the second one.
- **Decoupled (React editor + Astro publish)** = explicitly rejected — it means maintaining
  every section's design **twice**, the worst of the maintenance burden.

### The SEO/speed trade we accepted

- Next with **static generation (SSG / static export)** has **good SEO** — fully-rendered HTML,
  full meta/OpenGraph/structured-data support. "Next has bad SEO" is a myth that only applies
  to pure client-side SPAs, which we are not building.
- Next ships more JS than Astro (hydration), so it is **slightly heavier** — measurable in
  Lighthouse and on slow mobile, but for simple therapist marketing sites most visitors on
  decent devices won't consciously notice.

## Alternatives considered

- **All-Astro** — rejected: two frameworks for this product (see above); editor is hostile to
  Astro's islands model.
- **Decoupled React editor + Astro publish** — rejected: duplicate section codebases.
- **Drop the builder app into Astro as a giant React island** — rejected: you're writing React
  anyway, with Astro friction and no Puck/ecosystem benefit.

## Consequences

- Lowest-risk, fastest path to shipping the MVP; reuses the existing Next chat (zero migration).
- Real-time editing is **native** (React state → instant re-render), no bridge to build.
- **The Astro option is deferred, not burned.** Because content is JSON (see
  [0003](0003-content-json-source-of-truth.md)), an **Astro publish target can be added in a
  later phase** if measured mobile performance ever justifies it.
- **The one thing that would have flipped this to Astro:** if *"the fastest sites on the
  market"* were an explicit brand promise. It is currently a preference, not a positioning
  promise. Revisit this record if that changes.
