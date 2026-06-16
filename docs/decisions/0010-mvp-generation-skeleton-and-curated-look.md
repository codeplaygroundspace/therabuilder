# 0010 — MVP generation: fixed skeleton, AI fills content, curated look

- **Status:** Accepted
- **Date:** 2026-06-16

## Context

The onboarding chat collects a few answers; from those we generate a site
([0001](0001-product-and-architecture.md), [0003](0003-content-json-source-of-truth.md)). The
first generation core (issues #3/#4) had the AI produce a **full `SiteDocument`** — pages,
sections, ordering, theme, and all copy — in one structured call.

Two problems with generating the whole document every time:

- **Cost and brittleness.** Output tokens scale with the entire nested multi-page JSON, not just
  the new copy. The full discriminated-union JSON Schema as a tool `input_schema` is the untested
  risk flagged in `src/lib/ai/anthropic.ts`, and every validation-retry re-spends the whole
  generation.
- **Predictability.** Letting the model choose layout and theme yields variable, sometimes
  off-brand results.

Two product observations: **all MVP sites share essentially the same layout**, and **users
generally don't know what they want** — offering a few good choices beats asking them to specify
a design.

## Decision

- **Structure is a fixed skeleton, not AI-generated.** A canonical `SiteDocument` skeleton (the
  `sarah-demo` structure already in `src/lib/site/reference/sarah-demo.ts`) defines pages,
  sections, and order.
- **The AI generates content slots only** — the per-therapist copy (hero heading/sub, service
  titles + copy, about paragraphs, CTA text, …) as a small flat payload. A pure
  `assembleSite(content, skeleton)` merges the slots onto the skeleton to produce the full
  `SiteDocument`, which remains the source of truth for rendering and editing
  ([0003](0003-content-json-source-of-truth.md)).
- **The look is a curated user choice, not AI-generated.** The user picks a **template** + a
  **color preset** from small curated sets ([0009](0009-rendered-site-styling-tailwind-tokens.md)).
  The AI never chooses layout or color.
- **MVP ships one template + ~5 color presets.** Build the multi-template *seam* (templates =
  skeletons) but populate it with one template for now; add templates and presets later cheaply.

## Alternatives considered

- **AI generates the whole `SiteDocument`** (the original #4 approach). Most flexible and varied
  output, but highest token cost, highest validation/retry risk, and least predictable look.
  Rejected for MVP — the slot model is strictly cheaper and the assembled document is identical in
  shape.
- **AI also chooses the theme (colors/fonts).** More personalization, more tokens, risk of
  off-brand results — and unnecessary when curated presets look better and cost nothing. Rejected.
- **Multiple templates at MVP.** More demoable variety, but multiplies the porting work before
  there are users. Deferred — the seam is built, not populated.

## Consequences

- A large cut in tokens/cost per generation and fewer retries — the structural answer to the
  per-user rate/cost concern (better than per-minute throttling alone).
- Predictable, on-brand output; the AI's job narrows to what it does best (copy).
- Keeps prior work: 0003's schema still describes the skeleton, and #4's validate-and-retry still
  guards the assembled document.
- New pieces to build: a content-slot schema + `assembleSite` (a refinement of issue #4), and a
  "pick a look" step in the onboarding chat (issue #9).
- Layout variety is bounded by the template set — acceptable, and on-purpose, for a guided builder.
