# 0009 — Rendered-site styling: tokenized Tailwind, presets & templates

- **Status:** Accepted
- **Date:** 2026-06-16

## Context

The app chrome (the onboarding chat, the future editor) is already styled with **Tailwind
CSS v4**, configured in `src/app/globals.css`: `:root` CSS variables exposed to Tailwind via
`@theme inline`, so utilities like `bg-accent` resolve to `var(--accent)`.

The **rendered therapist sites** are a separate surface. They must reproduce the look of the
`sarah-demo` template ([0005](0005-template-as-design-source.md)) and be re-themeable
([0004](0004-editor-scope-mvp.md) — MVP editing is text + theme). `sarah-demo`'s look lives in
~150 CSS custom properties (oklch colors, a `clamp()` type scale, fractional-rem spacing, the
"arch" border-radii, shadows) plus structural section CSS.

Two product goals shape the decision: users should **pick from a small curated set of looks**
rather than invent one, and **adding more looks must be cheap** (see [0010](0010-mvp-generation-skeleton-and-curated-look.md)).

## Decision

- **Style rendered sites with the same system as the app chrome** — Tailwind v4 with design
  tokens registered in `@theme`. Port the subset of `sarah-demo` tokens the sections need
  (colors, fonts, type scale, radii incl. the arch radii, spacing) into `@theme`. Do **not**
  introduce a second styling system.
- **A `.site-root` wrapper sets the per-site theme CSS variables** (`--accent`, `--surface`,
  fonts, …). Because `@theme inline` maps `--color-accent` → `var(--accent)`, utilities like
  `bg-accent` follow whatever the wrapper sets. This is the theming engine for both 0004's theme
  editing and for presets below.
- **Color presets = token sets.** A preset is a named map of CSS-variable values applied on
  `.site-root`. Ship ~5 presets for MVP.
- **Templates = skeletons** (see [0010](0010-mvp-generation-skeleton-and-curated-look.md)).
  Multiple templates differ in *structure*, not styling technology; each reuses this token system.
- A thin `@layer base` carries rendered-site heading typography (display font on `h1`–`h3`),
  scoped under `.site-root` so it never leaks into the app chrome.

## Alternatives considered

- **CSS Modules — verbatim port of `theme.css` + each section's CSS.** Highest 1:1 fidelity, but
  a second styling system in the repo (more cognitive load, per-module token drift, weaker
  multi-template story). Rejected: v4's `@theme` absorbs the tokens, so the fidelity gap is small
  and caught by a visual check against the live reference.
- **Global plain CSS.** Same ported CSS but global scope → class-name collisions with the app
  chrome (`.btn-primary`, bare `section {}`). Rejected.
- **CSS-in-JS (styled-components / vanilla-extract).** New dependency and RSC/SSR friction in
  Next 16 for no fidelity gain. Rejected.

## Consequences

- One styling system across the whole product; lower cognitive cost.
- Per-site theming, color presets, and (later) multiple templates all fall out of one mechanism:
  CSS-variable override on `.site-root`.
- **Cost:** `sarah-demo`'s CSS is *re-expressed* as utilities/tokens rather than copied verbatim,
  so subtle visual drift is possible. Mitigated by eyeballing ported sections against the live
  reference (<https://sarah-demo.rosinaaa.workers.dev/>).
- A few structural/decorative bits (the service-card hover underline-sweep, hero background
  circles, `color-mix()` borders) become arbitrary-value utilities or small component classes.
- The content schema's 8-key palette maps to only a *subset* of `sarah-demo`'s color tokens;
  unmapped tokens (`--page-bg`, `--accent-dark`, `--warm-text`, `--border-soft`) ship as fixed
  defaults per preset. Deriving them from the palette, if ever needed, is the theme work's concern.
