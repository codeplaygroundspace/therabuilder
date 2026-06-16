# Renderer — content+theme JSON → rendered site (#6)

- **Date:** 2026-06-16
- **Issue:** #6 (refs `docs/decisions/0003`, `0005`, `0009`, `0010`)
- **Branch:** `feat/6-renderer`

## Goal

Given one `SiteDocument` (the JSON source of truth, `src/lib/site/schema.ts`), render the
full therapist site. **Section selection and order are driven entirely by the document** —
the renderer reads `pages[].sections[]` and dispatches each section to its React component
in order.

This is the renderer *mechanism*. It is deliberately scoped to stay separate from #8 (porting
the remaining section components): only `hero`, `services`, and `cta` components exist today;
the other 10 section types render gracefully empty until #8 ports them.

## Scope

**In scope**

1. **Section dispatch** (`SectionRenderer`) — a typed registry mapping each section `type` to
   its component, rendering in document order, degrading gracefully for unported types.
2. **Page chrome** owned by the renderer — `SiteHeader` (from `nav` + site name) and
   `SiteFooter` (from `footer` + `contact`), with new token-styled CSS.
3. **Top-level renderer** (`SiteRenderer`) — resolves a page by slug, wraps in `SiteRoot`,
   renders header → sections → footer.
4. **Preview route** — render the real reference document end-to-end, per page.
5. **Tests** for dispatch, graceful degradation, chrome, and full-page assembly.

**Out of scope**

- Porting the 10 remaining section components (`logoStrip`, `intro`, `infoCards`, `about`,
  `richText`, `split`, `accordion`, `testimonial`, `resourcesGrid`, `contact`) — that is **#8**.
- Theming / color presets / per-site CSS-variable overrides — that is **#7**.
- AI generation wiring and the "pick a look" step — that is **#9**.
- Form submission / interactive behavior.

## Architecture

All components are React Server Components (no `"use client"`) — the rendered site is static
output from a data document, consistent with `0003` (renderer is a swappable consumer of the
document).

### 1. `SectionRenderer` — the dispatch seam

`src/components/site/SectionRenderer.tsx`

```ts
const RENDERERS: {
  [K in Section["type"]]?: (section: Extract<Section, { type: K }>) => ReactNode;
} = {
  hero:     (s) => <HeroSection section={s} />,
  services: (s) => <ServicesSection section={s} />,
  cta:      (s) => <CtaSection section={s} />,
};

export function SectionRenderer({ section }: { section: Section }) {
  const render = RENDERERS[section.type] as
    | ((s: Section) => ReactNode)
    | undefined;
  if (!render) {
    // Unported type: render nothing in production. Optional dev-only stub.
    return process.env.NODE_ENV === "development"
      ? <UnrenderedSection type={section.type} />
      : null;
  }
  return render(section);
}
```

- The mapped type gives **per-entry type safety**: each registry function receives the
  correctly narrowed section. A single contained cast lives at the lookup site.
- **Optional keys** model "only some types are ported" — exactly Option A. An unported type
  falls through to graceful-empty; it must **never throw**.
- **#8's contract:** porting a section = add one registry line + its component, and it renders
  in document order. No other file changes.

### 2. Page chrome

The document carries `nav`, `footer`, and `contact` at the top level (not as sections), so the
renderer — not the section library — owns the chrome.

- **`SiteHeader`** (`src/components/site/SiteHeader.tsx`) — site/practitioner name as the brand
  + `nav[]` links. Token-styled, eyeballed against the live sarah-demo, not pixel-gated.
- **`SiteFooter`** (`src/components/site/SiteFooter.tsx`) — `footer.tagline`/`footer.location`,
  `footer.legalLinks[]`, and `contact` details where present. Same styling bar.
- New CSS for both lands in `src/app/site.css`, scoped under `.site-root` (consistent with
  `0009` — one styling system, tokens in `@theme`, no second styling system).

### 3. `SiteRenderer` — top level

`src/components/site/SiteRenderer.tsx`

```ts
export function SiteRenderer({ document, slug }: { document: SiteDocument; slug: string }) {
  const page = document.pages.find((p) => p.slug === slug) ?? document.pages[0];
  return (
    <SiteRoot>
      <SiteHeader document={document} />
      <main>
        {page.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </main>
      <SiteFooter document={document} />
    </SiteRoot>
  );
}
```

Unknown slug falls back to the first page (home). Section keys are positional indices —
acceptable; sections have no stable ids in the schema.

### 4. Preview route

Replace the current hand-picked `src/app/preview/page.tsx` with an optional catch-all
`src/app/preview/[[...slug]]/page.tsx`:

- `/preview` → home page of the reference document.
- `/preview/about`, `/preview/therapy`, … → the matching page by slug.

**Next 16 note:** `params` is async in Next 15+/16. The implementation reads the relevant guide
in `node_modules/next/dist/docs/` before writing the route (per `AGENTS.md`), rather than
relying on remembered APIs.

The reference document `sarahDemo` (`src/lib/site/reference/sarah-demo.ts`) is the data source
for the preview — no new fixture needed.

## Data flow

```
SiteDocument (sarah-demo reference / later: AI-assembled)
  └─ SiteRenderer(document, slug)
       ├─ SiteHeader(document.nav, meta/practitioner)
       ├─ page.sections[] ─ for each ─ SectionRenderer(section)
       │                                   └─ registry[type] → <XSection section/>  (or empty)
       └─ SiteFooter(document.footer, document.contact)
```

## Error handling / degradation

- **Unported section type:** renders empty in production (dev-only stub optional). Never throws.
  This is the property that makes Option A safe and is explicitly tested.
- **Unknown page slug:** falls back to the first page rather than 404-ing the preview.
- **Optional fields absent** (no tagline, no phone, etc.): the chrome omits them, mirroring how
  the existing section components already guard optional props.

## Testing (Vitest + `renderHtml`, following existing patterns)

- **`SectionRenderer`**
  - dispatches each ported type (`hero`, `services`, `cta`) to the right component;
  - **an unported type (e.g. `about`) does not throw and renders empty** — certifies the seam.
- **`SiteRenderer`** — renders header + footer + all home sections of the reference doc, in
  document order; unknown slug falls back to home.
- **`SiteHeader`** — renders all `nav[]` links and the brand name.
- **`SiteFooter`** — renders legal links and footer/contact content present in the document.

## Acceptance

- Visiting `/preview` renders the reference home page: header, the ported sections (hero,
  services where present, cta) in document order, footer — no crashes on unported types.
- Per-page preview works for each slug in the reference document.
- Adding a section component in #8 requires only a new registry entry to make it render.
```
