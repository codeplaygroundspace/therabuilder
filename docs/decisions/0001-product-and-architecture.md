# 0001 — Product shape & end-to-end architecture

- **Status:** Accepted
- **Date:** 2026-06-15

## Context

TheraBuilder is an AI-assisted website builder **for therapists**. The existing repo only
contains the onboarding chat (a front-end-only scripted flow). We needed to define what the
full product actually does, end to end, before building further.

## Decision

The product is a pipeline from a guided conversation to an editable, publishable website:

1. **Onboarding chat** (already built) collects a few answers from the therapist.
2. **AI generation** turns those answers into a **first-draft site** — copy, services, bio,
   section selection/order, theme, imagery — filling a known template's shape. The AI varies
   *content within a curated design*, it does **not** generate layout/components from scratch
   (see below).
3. **Editable live preview.** The therapist sees their generated site and refines it.
4. **Persistence.** Sites are saved; therapists log in and **return any time to edit**. This
   means accounts + a database are part of the product, not optional.
5. **Publish** (later phase) produces the live, SEO-strong site.

### Generation scope: "creative range within a baseline", not full codegen

We explicitly chose the middle of three options:
- *Content only* — too rigid.
- **Content + bounded structure (CHOSEN)** — AI varies content, which sections appear and
  their order, theme (colors/fonts), and imagery, using `sarah-demo` as the **quality
  baseline**. Outputs resemble the template but differ per therapist.
- *Full generative codegen* — rejected for the MVP: expensive, fragile, slow, and it throws
  away the polished template we already have.

## Consequences

- The AI's job is **structured content generation into a typed schema**, which is far cheaper
  and more reliable than generating code.
- Accounts, persistence, and an editor are core MVP concerns (see [0003](0003-content-json-source-of-truth.md),
  [0004](0004-editor-scope-mvp.md)).
- Publishing/hosting and multi-tenancy are real but **deferred** — the first milestone is
  "generate → preview → edit → save" (see [0007](0007-open-questions.md)).
