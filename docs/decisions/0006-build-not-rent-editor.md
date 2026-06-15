# 0006 — Build our own editor, don't rent a visual CMS

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

Mature visual editing is a solved product. Options to "build on top of" existing tools:

- **Builder.io** — visual headless CMS; drag-and-drop on your own components, JSON storage,
  Astro support with zero client JS, even AI section generation from chat prompts. Very close
  to our concept, but generic and marketing-team oriented.
- **Storyblok / DatoCMS / Sanity / TinaCMS** — headless CMSs with live/visual editing and Astro
  integrations.
- **Puck** — open-source (MIT), self-hosted React visual editor; the "open-source Builder.io".

## Decision

**Build our own focused editor.** Do **not** sit the product on a rented visual CMS as the
editing layer.

### Why

- **Per-seat economics break for a builder-for-others.** These tools price per *editor seat* /
  usage because they're designed for *one company with a few editors*. TheraBuilder is the
  opposite: **many end-customers each editing their own site.** Standard plans often don't even
  permit that multi-tenant "reselling editing", and per-seat costs scale with every therapist.
  This is precisely why Wix/Squarespace/Framer built their own editors — when editing *is* the
  product, you can't rent it per seat.
- **Our differentiator is the therapist-niche AI onboarding + curated template**, not "a better
  visual editor than Wix." We should spend effort there.
- **Our MVP editor is small** — text + theme only (see [0004](0004-editor-scope-mvp.md)) — so
  building it focused is *less* work than adopting, constraining, and paying for a generic tool
  we'd hide 90% of.

## Alternatives considered

- **Embed/white-label a visual CMS** — rejected: per-seat cost + lock-in + wrong audience shape.
- **Headless CMS as hidden backend** — rejected for MVP: still build our own UI, and we add a
  vendor dependency for little gain over our own DB.
- **Puck as the editor foundation** — **not now, but on the table later.** Puck is React + MIT +
  no per-seat fees, and fits if/when we add section drag-drop (deferred item (c) in
  [0004](0004-editor-scope-mvp.md)). For text+theme, schema-driven forms are simpler.

## Consequences

- We own the editor, its data, and its costs — no vendor lock-in.
- We learn the proven architecture (JSON source of truth + one renderer) from these tools
  without renting it.
- We are responsible for building editing UX ourselves; kept tractable by the narrow MVP scope.
