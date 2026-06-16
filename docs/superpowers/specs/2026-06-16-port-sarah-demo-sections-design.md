# Port key sarah-demo sections to React — Design (#5)

- **Date:** 2026-06-16
- **Issue:** #5
- **Decisions it implements:** [0005](../../decisions/0005-template-as-design-source.md) (sarah-demo is the design source), [0009](../../decisions/0009-rendered-site-styling-tailwind-tokens.md) (tokenized Tailwind, `.site-root`)

## Goal

Begin the React section library by porting the three highest-impact `sarah-demo` sections —
**Hero**, **Services**, **CTA** — preserving the look, plus the minimum styling foundation they
need to render faithfully. This is the section library the renderer (#6) and editor (later) will
share.

## Scope

**In:**
- Rendered-site **styling foundation**: the subset of `sarah-demo` design tokens these sections
  need, registered in Tailwind's `@theme`; a `.site-root` wrapper carrying the default
  (sarah-demo) token values; base heading typography; the shared primitives the sections use
  (`btn-primary`, `section-label`, `wrap`, section padding).
- Three **section components**, each consuming its `Section` type from `src/lib/site/sections.ts`:
  `HeroSection`, `ServicesSection`, `CtaSection` (handles **both** schema variants, `contact` and
  `faq`).
- The **FAQ CTA contact form** as **presentational markup only** — no submission wiring.
- A **dev preview route** that renders the three sections from the existing `sarah-demo.ts`
  reference data, for eyeballing against the live reference.
- **Logic tests** (render-to-string).

**Out (explicitly):**
- The renderer that walks a full `SiteDocument` → **#6**.
- Multiple color presets, preset switching, and theme-from-document injection → **#7** (this ships
  one default token set only).
- Remaining sections (about, intro, testimonial, accordion, resources, contact, …) → **#8**.
- Content-slot generation / `assembleSite` / chat wiring → **#9** (per ADR-0010).
- Contact-form submission backend.

## Architecture

Two styling surfaces, per ADR-0009: the app chrome stays as-is; rendered sites are a new surface.

**Styling foundation (the shared layer):**
- **`@theme` token registrations** (in the Tailwind entry CSS): map the token names the sections
  use — colors (`surface`, `surface-muted`, `accent`, `accent-dark`, `accent-soft`, `text`,
  `text-muted`, `border`, `warm`, `warm-text`, `page-bg`), fonts (`display`, `body`), the type
  scale these sections need (`hero`, `h1`, `h2`, `h3`, `lg`, `md`, `sm`, `xs`), and the arch radii
  (`arch-xl`, `arch-md`) + `xl`/`pill`. Each maps to a `var(--…)` so it stays overridable.
- **`.site-root` token values**: a CSS block scoped to `.site-root` that sets those `--…`
  variables to the verbatim `sarah-demo` `theme.css` values (oklch colors, `clamp()` type scale,
  arch radii). Lives in a clearly-separated layer from the app-chrome `:root` tokens so the two
  never collide (app `--accent` = blue; site `--accent` = near-black).
- **Base typography**: `@layer base` rules scoped under `.site-root` — `h1`–`h3` → display font,
  the section heading sizes/line-heights.
- **Shared primitives**: the `btn-primary`, `section-label` (+ `-warm`), `wrap`, and `section`
  vertical-padding patterns the three sections reference. Authored as small component classes
  (`@layer components`) since they recur and carry pseudo-element/gradient detail.

**Components** (`src/components/site/`):
- `SiteRoot.tsx` — presentational wrapper: `<div className="site-root">{children}</div>`. (In #7
  it gains a `preset` prop; here it just applies the default.)
- `HeroSection.tsx` — props: the `hero` section type. Renders eyebrow (optional), heading, body,
  optional CTA button, optional portrait image + the decorative background circles.
- `ServicesSection.tsx` — props: the `services` section type. Renders the header (label, heading,
  body) and the responsive card grid; each card shows optional image, title, copy, and the arch
  motif + hover underline-sweep.
- `CtaSection.tsx` — props: the `cta` section type; branches on `variant`:
  - `contact` → centered label / heading / body / note / button (port of `CtaContact`).
  - `faq` → two-column intro + a presentational `ContactFormFields` (port of `CtaFaq`); the form
    has no `onSubmit` behaviour yet.

Components are **server components** (no client state) and pure functions of their props.

## Data flow

`Section` object (from the schema) → section component → static HTML. The dev preview pulls real
section instances out of `referenceSiteDocument` (`src/lib/site/reference/sarah-demo.ts`) and wraps
them in `SiteRoot`. No fetching, no state.

## Images

Section content images come from the schema (`src`/`alt` strings). Decision deferred to the plan:
`next/image` vs `<img>` — to be settled by reading `node_modules/next/dist/docs/` (Next 16 image
API) and checking the `eslint-config-next` `no-img-element` rule. Default lean: `next/image` if it
imports cleanly with remote/static `src`; otherwise `<img>` with the rule scoped off for
`src/components/site/`. Either way the component contract (takes `src`+`alt`) is unchanged.

## Testing

"Preserving the look" is **visual**, so two layers — and the string test does **not** substitute
for the visual check:

1. **Render-to-string logic tests** (`react-dom/server` `renderToStaticMarkup`, runs in the
   existing node vitest env — no jsdom):
   - Hero renders the eyebrow when present and omits it when absent; renders heading + body; renders
     the CTA only when `cta` is set.
   - Services renders one card per `items` entry (assert count) with each title/copy.
   - CTA `contact` renders the button + note; CTA `faq` renders the form fields and no button.
   - Requires broadening the vitest `include` to `src/**/*.test.{ts,tsx}`.
2. **Visual check**: run the dev preview route and compare the three sections against the live
   reference (<https://sarah-demo.rosinaaa.workers.dev/>). Manual; the acceptance bar for the port.

## Acceptance

- The three sections render from real reference data and visually match the live `sarah-demo` at a
  glance (layout, type, color, the arch motif, card hover).
- Logic tests pass; `pnpm lint` and `pnpm build` are clean.
- App chrome (the onboarding chat) is visually unchanged — the new tokens are scoped to
  `.site-root`.
