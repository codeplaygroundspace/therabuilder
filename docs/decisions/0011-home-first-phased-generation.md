# 0011 — Home-first, phased generation

- **Status:** Accepted
- **Date:** 2026-06-17

## Context

[0010](0010-mvp-generation-skeleton-and-curated-look.md) settled that the AI fills content slots
on a fixed skeleton; the first implementation generated **all** of a site's copy (home, about,
therapy, faq, contact) in a single call, then assembled all five pages.

Two product observations pushed against generating everything up front:

- **Users don't want to wait for, or pay for, a whole site they haven't judged yet.** The
  onboarding is a short chat; making the user then wait while the AI writes five pages of copy —
  before they've seen whether they even like the result — is a poor first experience.
- **The home page is what the user decides on.** If the home page lands, they'll want the rest;
  if it doesn't, the other four pages were wasted tokens.

## Decision

Generate **home-first, in two phases**, keeping everything else from [0010](0010-mvp-generation-skeleton-and-curated-look.md)
(fixed skeleton, content slots, curated look) unchanged.

- **Phase 1 — home (+ contact).** One AI call (`generateHomeContent`) writes the home-page copy
  and extracts `siteName`/`specialty`/`tagline`. `assembleHome` builds the **full five-page
  skeleton with the full nav**, but only the home page and the **contact** page are populated;
  about/therapy/faq exist in the menu and render a placeholder until built. The user sees and can
  edit ([0004](0004-editor-scope-mvp.md)) the home page immediately.
  - The **contact page is built in phase 1** deliberately: it's standard/generic (a heading +
    intro + the contact methods derived from the answers), and it makes the home page's primary
    "Get in touch" CTA resolve to a real page instead of a dead link.
- **Phase 2 — the rest, on request.** When the user is happy, "Build the rest of my site"
  triggers a second call (`generateRestContent`) for about/therapy/faq. `buildRestPages` returns
  those three pages and the client **splices them into the live document by slug**, so any home
  edits are preserved. Phase 2 is seeded only with `siteName`/`specialty`/`tagline` (read from
  the current document) for consistency — it needs no phase-1 copy.

The content schema is split `zHomeContent` / `zRestContent`, and the full `zSiteContent` is
composed from both, so `home ∪ rest = full` by construction. `assembleSite` (the one-shot/sample
path) is redefined as `assembleHome` + spliced `buildRestPages`, so phased and one-shot outputs
are **identical by construction** (there's a test asserting the deep equality).

## Consequences — and the honest tradeoff

- **This is a bet on bounce rate, not a pure saving.** For a user who *completes* the full site,
  two calls cost **more** total than one (the second call re-pays the system prompt + answers
  context). The win is real only for users who **leave after seeing the home page** — they never
  pay for the other four pages. We're betting enough users stop at home (or churn) that the
  average cost drops. If most users always build the full site, revisit this.
- **Much faster, cheaper first result**, which is the actual UX goal — the user judges a home
  page in one short call instead of waiting for five pages.
- **Coherence risk** between two independent calls is bounded: both calls see the same `answers`
  (the source facts), and phase 2 is seeded with the decided name/specialty/tagline.
- Empty about/therapy/faq pages render a placeholder line until built. There is no publish step
  yet ([0007](0007-open-questions.md)/#12), so a never-completed site never ships a placeholder.

## Alternatives considered

- **Keep one-shot generation** (the [0010](0010-mvp-generation-skeleton-and-curated-look.md)
  implementation). Simplest and cheapest *per completed site*, but forces the wait-for-the-whole-
  site experience and pays for pages the user may never want. Kept as the sample/demo path.
- **Generate home only and append the rest as new pages later** (no skeleton up front). Rejected:
  the user wanted the full menu present from the start, and a missing contact page leaves the home
  CTA dead. Building the empty skeleton in phase 1 keeps the menu and the CTA working.
- **Per-page on-demand generation** (generate each page the first time it's visited). More
  granular saving, but more calls, more orchestration, and a janky "this page is loading" feel on
  navigation. Deferred — the home/rest split captures most of the benefit simply.
