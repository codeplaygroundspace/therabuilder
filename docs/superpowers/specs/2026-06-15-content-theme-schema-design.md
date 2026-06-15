# Content + theme JSON schema — design spec

- **Date:** 2026-06-15
- **Issue:** [#2 — Define the content + theme JSON schema](https://github.com/codeplaygroundspace/therabuilder/issues/2)
- **Branch:** `feat/2-content-theme-schema`
- **Relevant decisions:** [0001](../../decisions/0001-product-and-architecture.md),
  [0003](../../decisions/0003-content-json-source-of-truth.md),
  [0004](../../decisions/0004-editor-scope-mvp.md),
  [0005](../../decisions/0005-template-as-design-source.md)

## Purpose

Define the single typed document that represents a therapist's site. Per ADR-0003 this
document — not any framework or rendered output — is the **source of truth**: the AI
**generates** it, the editor **edits** it, the renderer **renders** it. Every later piece
(generation #4, section porting #5, renderer #6, theme #7, wiring #9) depends on this schema,
so it is the foundational task.

## Scope (bounded — read this first)

This issue delivers **two artifacts and nothing more**:

1. **The schema** — Zod schemas plus the TypeScript types derived from them (`z.infer`).
2. **One reference instance** — `sarah-demo`'s real content expressed as a `SiteDocument`
   JSON value that validates against the schema.

**Explicitly NOT in #2:**

- Porting `.astro` sections to React components — that is #5 (key sections) and #8 (the rest).
- Building the renderer (#6), the generator (#4), or any editor UI (Phase 2).

The reference instance is the valuable proof: it demonstrates the schema can hold a complete,
real multi-page site, and it becomes the fixture that #4 (generation target) and #5 (porting)
build against.

## Decisions baked into this design

Three forks were resolved with the user (2026-06-15):

1. **Plain content values — no per-field provenance.** Content fields are plain
   strings/objects, not `{ value, source }` wrappers. The expanded onboarding now collects the
   facts that most needed flagging (name, location, credentials), so there is far less
   AI-invention to mark. A "needs review" UX, if wanted, is a Phase-2 editor concern handled
   outside the schema.
2. **Facts the AI cannot know are optional, populate-policy deferred.** Fees, named insurers,
   and testimonials are **optional** in the schema. Whether the generator fills them with
   plausible placeholders or leaves them blank is decided in #4, not forced by the schema.
3. **Theme stores resolved values, not preset IDs.** The theme holds actual colour and font
   values so the renderer stays dumb (values → CSS variables) and the AI can generate freely.
   ADR-0004's "small set of palettes" becomes a Phase-2 *editor-UX* constraint, not a schema
   constraint.

## Inputs: what the onboarding chat now collects

The 9-question flow (`src/lib/onboarding-flow.ts`) defines which fields are **user-given**. The
rest is **AI-generated** within the bounds of these facts.

| # | Question | Feeds (user-given) |
|---|----------|--------------------|
| 1 | Business name + specialty | `meta.siteName`, `practitioner.specialty` |
| 2 | Your name | `practitioner.name` |
| 3 | Location | `contact.locations` |
| 4 | In-person / online / both | `contact.availability` |
| 5 | Who you help | audience → AI tailors hero/services copy |
| 6 | What drew you to this work | seed for AI-written `practitioner.bio` / About page |
| 7 | Qualifications / accreditations | `practitioner.credentials[]` (AI must not invent) |
| 8 | How clients reach you | `contact.email` / `contact.phone` / `contact.bookingUrl` |
| 9 | How the site should feel | tone → AI picks `theme` + copy voice |

Everything else (bio narrative, FAQ answers, service descriptions, the therapy-page prose) is
AI-generated. Fees, insurers, and testimonials are **not collected** → optional in the schema.

## Schema shape

A site is a tree: **`SiteDocument`** → shared chrome + **`pages[]`** → each page is an ordered
list of **`sections[]`**, and each section is a member of a **discriminated union on `type`**.
The renderer maps `section.type` → a React component (the registry built in #5/#8).

```
SiteDocument
├─ schemaVersion: number              // for future migrations
├─ meta        { siteName, siteUrl, defaultTitle, defaultDescription, ogImage? }
├─ practitioner{ name, specialty, title, eyebrow, heroSummary, bio, credentials[] }
├─ contact     { email?, phone?, bookingUrl?, locations[], availability }
├─ nav         NavLink[]   { href, label }
├─ footer      { tagline?, location?, legalLinks[] }
├─ theme       Theme
└─ pages       Page[]

Page { slug, seoTitle, seoDescription, sections: Section[] }

Theme {
  palette { accent, accentSoft, surface, surfaceMuted, text, textMuted, border, warm }  // colour strings
  fonts   { body, display }                                                              // family names
}
```

### Section discriminated union

Derived from the section types actually used across `sarah-demo`'s pages. Each variant carries
only the content fields it needs; structural craft (spacing, radii, line-heights) stays in the
fixed template CSS, never in the schema.

| `type` | Source in template | Key fields |
|--------|--------------------|-----------|
| `hero` | Hero | `eyebrow`, `heading`, `body`, `cta {label, href}`, `image {src, alt}` |
| `logoStrip` | index logo-strip | `label`, `logos[] {src, alt}` |
| `intro` | IntroSection | `label?`, `heading`, `body` |
| `infoCards` | InfoCardsSection | `label?`, `heading?`, `cards[] {title, body, icon?}` |
| `about` | About (home) | `label`, `heading`, `body`, `image {src, alt}` |
| `richText` | about-page prose, credentials | `label?`, `heading?`, `paragraphs[]`, `list?` |
| `split` | therapy-split | `label`, `heading`, `paragraphs[]`, `image {src, alt}`, `imagePosition` |
| `services` | Services | `heading?`, `items[] {title, copy, image, imageAlt}` |
| `accordion` | FAQs, therapy supportAreas | `label?`, `heading?`, `items[] {title, body}` |
| `testimonial` | Testimonial | `quote`, `attribution`, optional (AI can't source real ones) |
| `resourcesGrid` | resources/blog grid | `label?`, `heading`, `lead?`, `posts[] {slug, title, excerpt, image}` |
| `contact` | Contact | `heading`, `intro?`, `methods[]` |
| `cta` | CtaContact / CtaFaq | `variant` (`"contact"` or `"faq"`), `heading`, `body?`, `button {label, href}` |

The **page section list is where "bounded structure variation" (ADR-0001) lives**: the AI
chooses which sections appear, in what order, and how many items each holds — but never invents
new section *types* or layouts. The union is closed.

### Pages in the reference instance (Option B — full multi-page site)

`home`, `about`, `therapy`, `faq`, `resources`, `contact` — matching `sarah-demo`. Each is a
`Page` with its real content mapped onto the section union. (Blog post detail pages and legal
pages are out of scope for the reference instance; the schema does not preclude adding them.)

## Validation approach

- **Zod is the single source.** Define `zSiteDocument` (and the nested z-schemas); derive types
  with `type SiteDocument = z.infer<typeof zSiteDocument>`. No hand-written duplicate types.
- This gives **runtime validation of the AI's output** (#4 parses the model's JSON through the
  schema and retries on failure) *and* compile-time types for the renderer/editor — one source,
  no drift.
- Section union modelled with `z.discriminatedUnion("type", [...])`.

## Proposed file layout

```
src/lib/site/
├─ schema.ts        # all Zod schemas + inferred type exports (the deliverable)
├─ sections.ts      # the section discriminated-union schemas (kept separate; it is the largest part)
└─ reference/
   └─ sarah-demo.ts # the reference SiteDocument instance, validated at module load in a test/assertion
```

(Exact split can be refined during implementation; the constraint is that types are *derived
from* Zod, and the reference instance is *validated against* the schema, not hand-asserted.)

## Acceptance criteria

- [ ] `zSiteDocument` exists; `SiteDocument` (and nested types) are derived via `z.infer`.
- [ ] The section union is a closed `z.discriminatedUnion("type", …)` covering the 13 types above.
- [ ] `theme` stores resolved colour + font values (no preset IDs).
- [ ] Fees / insurers / testimonials are optional.
- [ ] A `sarah-demo` reference `SiteDocument` exists and **parses successfully** through
      `zSiteDocument` (proven by a runtime parse assertion, not a cast).
- [ ] `pnpm lint` and `tsc` pass.
- [ ] No React components, renderer, or generator code is added (those are #5/#6/#4).

## Deferred / out of scope

- Section show/hide/reorder editing, image upload, per-section regen (ADR-0004 (c)/(d)/(e)).
- Blog post detail + legal pages in the reference instance.
- Provenance / "needs review" metadata (Phase-2 editor concern).
- Palette-preset constraint on the editor (Phase-2 editor-UX, ADR-0004).
