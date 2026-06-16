# Port key sarah-demo sections to React — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Hero, Services, and CTA sections from the `sarah-demo` Astro template to React, plus the styling foundation (tokens, fonts, primitives) they need, preserving the look.

**Architecture:** Two styling surfaces (ADR-0009). The app chrome keeps its existing Tailwind setup untouched. Rendered sites get a `.site-root` wrapper that defines sarah-demo's design tokens as scoped CSS variables; section structure is authored as `@layer components` rules under `.site-root` (one tokenized system — no CSS Modules, no second token source). Section components are pure server components that take a typed `Section` from `src/lib/site/sections.ts`. Image slots render grey placeholders (no real images yet). A dev preview route renders the three sections from the existing `sarahDemo` reference doc for eyeballing against the live template.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind CSS v4 (config-in-CSS), Vitest 4 (node env, `react-dom/server` render-to-string), `next/font/google` (Fraunces + Work Sans).

**Design source:** spec `docs/superpowers/specs/2026-06-16-port-sarah-demo-sections-design.md`; live reference <https://sarah-demo.rosinaaa.workers.dev/>; original CSS in the cloned `sarah-demo` repo (`src/styles/sections.css`, `components.css`, `theme.css`).

---

## File Structure

- `src/app/layout.tsx` — **modify**: load Fraunces + Work Sans via `next/font/google`, expose as CSS variables on `<html>`.
- `src/app/globals.css` — **modify**: register rendered-site color/font tokens in `@theme inline`; `@import "./site.css"`.
- `src/app/site.css` — **create**: `.site-root` token values (verbatim sarah-demo `theme.css`), base typography, and `@layer components` rules for the primitives + the three sections, all scoped under `.site-root`.
- `src/components/site/SiteRoot.tsx` — **create**: the wrapper applying `.site-root`.
- `src/components/site/ImagePlaceholder.tsx` — **create**: grey placeholder box.
- `src/components/site/HeroSection.tsx` — **create**.
- `src/components/site/ServicesSection.tsx` — **create**.
- `src/components/site/CtaSection.tsx` — **create**: branches on `variant` (`contact` | `faq`).
- `src/components/site/render-to-string.ts` — **create**: tiny test helper wrapping `renderToStaticMarkup`.
- `src/components/site/*.test.tsx` — **create**: logic tests per component.
- `src/app/preview/page.tsx` — **create**: dev preview route.
- `vitest.config.ts` — **modify**: broaden `include` to `.tsx`; set esbuild JSX to automatic.

**Type reference (already exist in `src/lib/site/sections.ts`, do not redefine):**
- `Section` = discriminated union on `type`.
- Hero: `{ type: "hero"; eyebrow?: string; heading: string; body: string; cta?: { label: string; href: string }; image?: { src: string; alt: string } }`
- Services: `{ type: "services"; label?: string; heading?: string; body?: string; items: { title: string; copy: string; image?: string; imageAlt?: string }[] }`
- Cta: `{ type: "cta"; variant: "contact" | "faq"; label?: string; heading: string; body?: string; note?: string; button?: { label: string; href: string } }`

Helper to narrow in tests/preview: `Extract<Section, { type: "hero" }>` etc.

---

## Task 1: Styling foundation, fonts, and `SiteRoot`

**Files:**
- Modify: `vitest.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/app/site.css`
- Create: `src/components/site/render-to-string.ts`
- Create: `src/components/site/SiteRoot.tsx`
- Test: `src/components/site/SiteRoot.test.tsx`

- [ ] **Step 1: Enable TSX tests in Vitest**

Replace `vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compile JSX/TSX with the automatic runtime so test files can render components
  // with react-dom/server without importing React explicitly.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: Add the render-to-string test helper**

Create `src/components/site/render-to-string.ts`:

```ts
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

/** Render a component to static HTML for logic assertions (no DOM needed). */
export function renderHtml(element: ReactElement): string {
  return renderToStaticMarkup(element);
}
```

- [ ] **Step 3: Write the failing test for `SiteRoot`**

Create `src/components/site/SiteRoot.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteRoot } from "./SiteRoot";

describe("SiteRoot", () => {
  it("wraps children in a .site-root element", () => {
    const html = renderHtml(<SiteRoot><p>hello</p></SiteRoot>);
    expect(html).toContain('class="site-root"');
    expect(html).toContain("<p>hello</p>");
  });
});
```

- [ ] **Step 4: Run the test, verify it fails**

Run: `pnpm test SiteRoot`
Expected: FAIL — cannot resolve `./SiteRoot`.

- [ ] **Step 5: Implement `SiteRoot`**

Create `src/components/site/SiteRoot.tsx`:

```tsx
import type { ReactNode } from "react";

/**
 * Wrapper for rendered therapist-site content. Carries the `.site-root` class, which
 * scopes the sarah-demo design tokens (see src/app/site.css). In #7 this gains a
 * `preset` prop to swap token sets; for now it applies the single default preset.
 */
export function SiteRoot({ children }: { children: ReactNode }) {
  return <div className="site-root">{children}</div>;
}
```

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm test SiteRoot`
Expected: PASS.

- [ ] **Step 7: Load the template fonts**

In `src/app/layout.tsx`, add Fraunces + Work Sans alongside the existing Mulish import and attach their variables to `<html>`. Replace the font import block and the `<html>` tag:

```tsx
import { Mulish, Fraunces, Work_Sans } from "next/font/google";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

Then update the `<html>` className to include all three variables:

```tsx
    <html
      lang="en"
      className={`${mulish.variable} ${fraunces.variable} ${workSans.variable} h-full antialiased`}
    >
```

- [ ] **Step 8: Register rendered-site tokens in Tailwind `@theme`**

In `src/app/globals.css`, after the existing `@theme inline { … }` block, add the rendered-site color + font token registrations (so `bg-surface`, `font-display`, etc. are available and stay overridable), then import the site stylesheet. Add at the end of the `@theme inline` block (before its closing `}`):

```css
  /* rendered-site tokens (scoped values live under .site-root in site.css) */
  --color-page-bg: var(--page-bg);
  --color-surface-muted: var(--surface-muted);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);
  --color-accent-dark: var(--accent-dark);
  --color-warm: var(--warm);
  --color-warm-text: var(--warm-text);
  --font-display: var(--font-display-stack);
  --font-body: var(--font-body-stack);
```

And add this import near the top of `globals.css`, immediately after `@import "tailwindcss";`:

```css
@import "./site.css";
```

- [ ] **Step 9: Create the rendered-site stylesheet (tokens + base + primitives)**

Create `src/app/site.css`. This is ported from the `sarah-demo` `theme.css` / `components.css` / `sections.css`, scoped under `.site-root`. (Section-specific rules are added in later tasks.)

```css
/* Rendered therapist-site styling. Scoped to .site-root so it never touches app chrome.
   Tokens are verbatim from sarah-demo's theme.css; structure is ported from its section CSS. */

.site-root {
  /* colors */
  --page-bg: oklch(0.992 0.005 78.298);
  --surface: oklch(0.956 0.01 81.795);
  --surface-muted: oklch(0.943 0.011 136.56);
  --text: oklch(0.276 0.008 59.33);
  --text-muted: oklch(0.512 0.015 141.761);
  --accent: oklch(0.276 0.008 59.33);
  --accent-dark: oklch(0.199 0.006 56);
  --accent-soft: oklch(0.913 0.014 74.418);
  --border: oklch(0.866 0.017 79.343);
  --border-soft: oklch(0.508 0.042 156.949 / 0.24);
  --warm: oklch(0.671 0.075 60.455);
  --warm-text: oklch(0.508 0.06 57.511);
  --shadow-soft: 0 1.125rem 2.75rem var(--border-soft);

  /* font stacks (families loaded in layout.tsx via next/font) */
  --font-display-stack: var(--font-fraunces), Georgia, serif;
  --font-body-stack: var(--font-work-sans), system-ui, sans-serif;

  /* type scale */
  --fs-hero: clamp(2.625rem, 5.5vw, 4.25rem);
  --fs-h2: clamp(1.75rem, 3.5vw, 2.5rem);
  --fs-h3: clamp(1.25rem, 2.5vw, 1.625rem);
  --fs-lg: 1.0625rem;
  --fs-md: 1rem;
  --fs-sm: 0.875rem;
  --fs-form-message: 0.9375rem;
  --fs-xs: 0.6875rem;
  --lh-hero: 1.05;
  --lh-heading: 1.18;
  --lh-heading-relaxed: 1.3;
  --lh-intro: 1.75;

  /* radii */
  --radius-xl: 1.25rem;
  --radius-pill: 999rem;
  --radius-arch-xl: 1.5rem 1.5rem 7.5rem 1.5rem;
  --radius-arch-md: 1.25rem 1.25rem 5rem 1.25rem;

  /* layout */
  --max-w: 71.25rem;
  --space-section: 7rem;
  --space-section-mobile: 4.5rem;

  background: var(--page-bg);
  color: var(--text);
  font-family: var(--font-body-stack);
  font-size: var(--fs-md);
  line-height: 1.65;
}

/* base typography */
.site-root h1,
.site-root h2,
.site-root h3 {
  font-family: var(--font-display-stack);
  font-weight: 400;
  color: var(--text);
  margin: 0;
}
.site-root h2 {
  font-size: var(--fs-h2);
  line-height: var(--lh-heading);
}
.site-root h3 {
  font-size: var(--fs-h3);
  line-height: var(--lh-heading-relaxed);
}
.site-root p {
  margin: 0;
}

/* layout primitives */
.site-root .wrap {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 2rem;
}
.site-root section {
  padding: var(--space-section) 0;
}

/* buttons */
.site-root .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-dark);
  color: var(--page-bg);
  font-family: var(--font-body-stack);
  font-size: var(--fs-sm);
  font-weight: 500;
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-pill);
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.site-root .btn-primary:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

/* section label (eyebrow) */
.site-root .section-label {
  font-size: var(--fs-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--warm-text);
  font-weight: 500;
  margin-bottom: 1.25rem;
  display: block;
}

/* image placeholder */
.site-root .site-img {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  display: block;
}

@media (max-width: 48rem) {
  .site-root section {
    padding: var(--space-section-mobile) 0;
  }
  .site-root .wrap {
    padding: 0 1.25rem;
  }
}
```

- [ ] **Step 10: Verify build + existing tests still pass**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; build succeeds. (Confirms fonts, the new `@import`, and `@theme` additions compile.)

- [ ] **Step 11: Commit**

```bash
git add vitest.config.ts src/app/layout.tsx src/app/globals.css src/app/site.css src/components/site/
git commit -m "feat(#5): rendered-site styling foundation, fonts, SiteRoot"
```

---

## Task 2: `ImagePlaceholder`

**Files:**
- Create: `src/components/site/ImagePlaceholder.tsx`
- Test: `src/components/site/ImagePlaceholder.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/site/ImagePlaceholder.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { ImagePlaceholder } from "./ImagePlaceholder";

describe("ImagePlaceholder", () => {
  it("renders a labelled placeholder and never an <img> with a real src", () => {
    const html = renderHtml(<ImagePlaceholder label="Portrait of Sarah" className="hero-portrait" />);
    expect(html).toContain('aria-label="Portrait of Sarah"');
    expect(html).toContain("site-img");
    expect(html).toContain("hero-portrait");
    expect(html).not.toContain("<img");
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm test ImagePlaceholder`
Expected: FAIL — cannot resolve `./ImagePlaceholder`.

- [ ] **Step 3: Implement `ImagePlaceholder`**

Create `src/components/site/ImagePlaceholder.tsx`:

```tsx
/**
 * Grey placeholder occupying an image slot (no real images in MVP — see ADR-0010).
 * Shape (aspect ratio, radius) comes from the caller's className; `label` describes
 * what will eventually sit here.
 */
export function ImagePlaceholder({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={className ? `site-img ${className}` : "site-img"}
    />
  );
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `pnpm test ImagePlaceholder`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/site/ImagePlaceholder.tsx src/components/site/ImagePlaceholder.test.tsx
git commit -m "feat(#5): grey ImagePlaceholder for image slots"
```

---

## Task 3: `HeroSection`

**Files:**
- Create: `src/components/site/HeroSection.tsx`
- Modify: `src/app/site.css` (append hero rules)
- Test: `src/components/site/HeroSection.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/site/HeroSection.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { HeroSection } from "./HeroSection";
import type { Section } from "@/lib/site/sections";

type Hero = Extract<Section, { type: "hero" }>;

const base: Hero = {
  type: "hero",
  heading: "Therapy for overwhelmed professionals.",
  body: "You might look like you're coping on the outside.",
};

describe("HeroSection", () => {
  it("renders heading and body", () => {
    const html = renderHtml(<HeroSection section={base} />);
    expect(html).toContain("Therapy for overwhelmed professionals.");
    expect(html).toContain("You might look like you&#x27;re coping");
  });

  it("renders the eyebrow only when present", () => {
    expect(renderHtml(<HeroSection section={base} />)).not.toContain("section-label");
    const withEyebrow = renderHtml(<HeroSection section={{ ...base, eyebrow: "Welcome" }} />);
    expect(withEyebrow).toContain("section-label");
    expect(withEyebrow).toContain("Welcome");
  });

  it("renders the CTA button only when present", () => {
    expect(renderHtml(<HeroSection section={base} />)).not.toContain("btn-primary");
    const withCta = renderHtml(
      <HeroSection section={{ ...base, cta: { label: "Book now", href: "/booking/" } }} />,
    );
    expect(withCta).toContain("btn-primary");
    expect(withCta).toContain('href="/booking/"');
    expect(withCta).toContain("Book now");
  });

  it("renders an image placeholder (never a real <img>) using the image alt", () => {
    const withImg = renderHtml(
      <HeroSection section={{ ...base, image: { src: "/x.webp", alt: "Portrait of Sarah" } }} />,
    );
    expect(withImg).toContain('aria-label="Portrait of Sarah"');
    expect(withImg).not.toContain("<img");
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `pnpm test HeroSection`
Expected: FAIL — cannot resolve `./HeroSection`.

- [ ] **Step 3: Implement `HeroSection`**

Create `src/components/site/HeroSection.tsx`:

```tsx
import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Hero = Extract<Section, { type: "hero" }>;

/** Hero — ported from sarah-demo Hero.astro. Portrait renders as a placeholder. */
export function HeroSection({ section }: { section: Hero }) {
  const { eyebrow, heading, body, cta, image } = section;
  return (
    <section className="hero">
      <div className="hero-bg-circle hero-bg-circle-left" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-text">
            {eyebrow ? <span className="section-label">{eyebrow}</span> : null}
            <h1 className="hero-h1">{heading}</h1>
            <p className="hero-sub">{body}</p>
            {cta ? (
              <div className="hero-actions">
                <a href={cta.href} className="btn-primary">
                  {cta.label}
                </a>
              </div>
            ) : null}
          </div>
          <div className="hero-portrait">
            <div className="hero-bg-circle hero-bg-circle-right" aria-hidden="true" />
            <ImagePlaceholder label={image?.alt} className="hero-portrait-img" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `pnpm test HeroSection`
Expected: PASS (all four).

- [ ] **Step 5: Append hero CSS to `src/app/site.css`**

Ported from sarah-demo `sections.css`:

```css
/* ── Hero ── */
.site-root .hero {
  background: var(--surface);
  padding: 5rem 0 6.25rem;
  position: relative;
  overflow: hidden;
}
.site-root .hero .wrap {
  position: relative;
  z-index: 1;
}
.site-root .hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.site-root .hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.site-root .hero-h1 {
  font-family: var(--font-display-stack);
  font-size: var(--fs-hero);
  line-height: var(--lh-hero);
  color: var(--text);
  font-weight: 400;
  margin: 0;
}
.site-root .hero-sub {
  font-size: var(--fs-lg);
  color: var(--text-muted);
  max-width: 44ch;
  line-height: var(--lh-intro);
}
.site-root .hero-actions {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}
.site-root .hero-portrait {
  position: relative;
  border-radius: var(--radius-arch-xl);
  aspect-ratio: 4 / 5;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}
.site-root .hero-portrait-img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: relative;
  z-index: 1;
}
.site-root .hero-bg-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.site-root .hero-bg-circle-left {
  width: clamp(13.75rem, 28vw, 23.75rem);
  aspect-ratio: 1;
  left: max(-8.75rem, -8vw);
  bottom: 2.75rem;
  border: 1px solid color-mix(in srgb, var(--text-muted) 22%, transparent);
}
.site-root .hero-bg-circle-right {
  width: clamp(7.5rem, 28vw, 23.75rem);
  aspect-ratio: 1;
  right: 46%;
  bottom: -18%;
  background-color: var(--accent-soft);
}
@media (max-width: 48rem) {
  .site-root .hero-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .site-root .hero-portrait {
    max-height: 20rem;
    border-radius: var(--radius-arch-md);
  }
  .site-root .hero {
    padding: 3rem 0 4.5rem;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/site/HeroSection.tsx src/components/site/HeroSection.test.tsx src/app/site.css
git commit -m "feat(#5): port Hero section"
```

---

## Task 4: `ServicesSection`

**Files:**
- Create: `src/components/site/ServicesSection.tsx`
- Modify: `src/app/site.css` (append services rules)
- Test: `src/components/site/ServicesSection.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/site/ServicesSection.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { ServicesSection } from "./ServicesSection";
import type { Section } from "@/lib/site/sections";

type Services = Extract<Section, { type: "services" }>;

const section: Services = {
  type: "services",
  label: "Approach and specialties",
  heading: "A practical toolbox for lasting change.",
  body: "Sarah works with a practical, conversational approach.",
  items: [
    { title: "Anxiety and overwhelm", copy: "Slow the spiral." },
    { title: "Burnout and stress", copy: "Rebuild space and boundaries." },
    { title: "Confidence and life transitions", copy: "Find firmer ground." },
  ],
};

describe("ServicesSection", () => {
  it("renders the label, heading and body", () => {
    const html = renderHtml(<ServicesSection section={section} />);
    expect(html).toContain("Approach and specialties");
    expect(html).toContain("A practical toolbox for lasting change.");
    expect(html).toContain("Sarah works with a practical");
  });

  it("renders one card per item with its title and copy, each with a placeholder", () => {
    const html = renderHtml(<ServicesSection section={section} />);
    const cardCount = (html.match(/service-card/g) ?? []).length;
    expect(cardCount).toBe(3);
    expect(html).toContain("Anxiety and overwhelm");
    expect(html).toContain("Burnout and stress");
    expect(html).toContain("Confidence and life transitions");
    expect(html).toContain("Find firmer ground.");
    const placeholderCount = (html.match(/role="img"/g) ?? []).length;
    expect(placeholderCount).toBe(3);
    expect(html).not.toContain("<img");
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `pnpm test ServicesSection`
Expected: FAIL — cannot resolve `./ServicesSection`.

- [ ] **Step 3: Implement `ServicesSection`**

Create `src/components/site/ServicesSection.tsx`:

```tsx
import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Services = Extract<Section, { type: "services" }>;

/** Services — ported from sarah-demo Services.astro. Card images render as placeholders. */
export function ServicesSection({ section }: { section: Services }) {
  const { label, heading, body, items } = section;
  return (
    <section className="services">
      <div className="wrap">
        <div className="services-header">
          {label ? <span className="section-label">{label}</span> : null}
          <div className="services-header-row">
            {heading ? <h2>{heading}</h2> : null}
            {body ? <p>{body}</p> : null}
          </div>
        </div>
        <div className="services-grid">
          {items.map((item, i) => (
            <div className="service-card" key={i}>
              <div className="service-arch" aria-hidden="true" />
              <ImagePlaceholder label={item.imageAlt} className="service-image" />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `pnpm test ServicesSection`
Expected: PASS (both).

- [ ] **Step 5: Append services CSS to `src/app/site.css`**

Ported from sarah-demo `sections.css`:

```css
/* ── Services ── */
.site-root .services-header {
  margin-bottom: 4rem;
}
.site-root .services-header h2 {
  max-width: 18ch;
}
.site-root .services-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}
.site-root .services-header-row p {
  max-width: 44ch;
  font-size: var(--fs-md);
  color: var(--text-muted);
}
.site-root .services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.site-root .service-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}
.site-root .service-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.1875rem;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.18s ease;
}
.site-root .service-card:hover {
  box-shadow: var(--shadow-soft);
  transform: translateY(-0.125rem);
}
.site-root .service-card:hover::after {
  transform: scaleX(1);
}
.site-root .service-image {
  width: 100%;
  max-width: 8rem;
  aspect-ratio: 1;
  align-self: flex-start;
  margin-bottom: 0.5rem;
  border-radius: var(--radius-xl);
}
.site-root .service-arch {
  position: absolute;
  top: -1.875rem;
  right: -1.875rem;
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  border: 1px solid var(--border-soft);
  pointer-events: none;
}
.site-root .service-card p {
  font-size: var(--fs-form-message);
  line-height: var(--lh-intro);
  color: var(--text-muted);
}
@media (max-width: 48rem) {
  .site-root .services-grid {
    grid-template-columns: 1fr;
  }
  .site-root .services-header-row {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/site/ServicesSection.tsx src/components/site/ServicesSection.test.tsx src/app/site.css
git commit -m "feat(#5): port Services section"
```

---

## Task 5: `CtaSection` (both variants)

**Files:**
- Create: `src/components/site/CtaSection.tsx`
- Modify: `src/app/site.css` (append CTA rules)
- Test: `src/components/site/CtaSection.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/site/CtaSection.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { CtaSection } from "./CtaSection";
import type { Section } from "@/lib/site/sections";

type Cta = Extract<Section, { type: "cta" }>;

const contact: Cta = {
  type: "cta",
  variant: "contact",
  label: "Contact Sarah",
  heading: "Unsure if counselling is right for you?",
  body: "Let's have a chat.",
  note: "There is no obligation to commit!",
  button: { label: "Book a free consultation", href: "/booking/" },
};

const faq: Cta = {
  type: "cta",
  variant: "faq",
  label: "Get in touch",
  heading: "Did not find what you're looking for?",
  body: "I'll happily answer any questions.",
};

describe("CtaSection", () => {
  it("contact variant renders heading, note and the button", () => {
    const html = renderHtml(<CtaSection section={contact} />);
    expect(html).toContain("contact-cta");
    expect(html).toContain("Unsure if counselling is right for you?");
    expect(html).toContain("There is no obligation to commit!");
    expect(html).toContain("btn-primary");
    expect(html).toContain('href="/booking/"');
  });

  it("faq variant renders the form fields and no booking button", () => {
    const html = renderHtml(<CtaSection section={faq} />);
    expect(html).toContain("faq-cta-section");
    expect(html).toContain("Did not find what you&#x27;re looking for?");
    expect(html).toContain("<form");
    expect(html).toContain('type="email"');
    expect(html).toContain("<textarea");
    expect(html).not.toContain("btn-primary");
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `pnpm test CtaSection`
Expected: FAIL — cannot resolve `./CtaSection`.

- [ ] **Step 3: Implement `CtaSection`**

Create `src/components/site/CtaSection.tsx`:

```tsx
import type { Section } from "@/lib/site/sections";

type Cta = Extract<Section, { type: "cta" }>;

/**
 * CTA — ports sarah-demo CtaContact.astro (variant "contact") and CtaFaq.astro (variant "faq").
 * The faq form is presentational only (no submission wiring — out of #5 scope).
 */
export function CtaSection({ section }: { section: Cta }) {
  if (section.variant === "faq") {
    return <FaqCta section={section} />;
  }
  return <ContactCta section={section} />;
}

function ContactCta({ section }: { section: Cta }) {
  const { label, heading, body, note, button } = section;
  return (
    <section className="contact-cta">
      <div className="wrap">
        {label ? <span className="section-label section-label-warm">{label}</span> : null}
        <h2>{heading}</h2>
        {body ? <p>{body}</p> : null}
        {note ? <p className="contact-cta-note">{note}</p> : null}
        {button ? (
          <a href={button.href} className="btn-primary">
            {button.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function FaqCta({ section }: { section: Cta }) {
  const { label, heading, body } = section;
  return (
    <section className="faq-cta-section">
      <div className="wrap faq-cta-grid">
        <div className="faq-cta-intro">
          {label ? <span className="section-label">{label}</span> : null}
          <h2>{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        {/* Presentational only — no submission in #5. */}
        <form className="faq-cta-form" aria-label="Contact form">
          <label className="faq-field">
            <span>Name</span>
            <input type="text" name="name" autoComplete="name" />
          </label>
          <label className="faq-field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" />
          </label>
          <label className="faq-field">
            <span>Your question</span>
            <textarea name="message" rows={4} placeholder="What would you like to know?" />
          </label>
          <button type="button" className="btn-form">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `pnpm test CtaSection`
Expected: PASS (both). Note the `faq` test asserts `btn-primary` is absent — the form's submit uses `btn-form`, so this holds.

- [ ] **Step 5: Append CTA CSS to `src/app/site.css`**

Ported from sarah-demo `sections.css` (contact-cta + faq-cta), with form-field styling:

```css
/* ── Contact CTA ── */
.site-root .contact-cta {
  text-align: center;
  position: relative;
  overflow: hidden;
}
.site-root .contact-cta .wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}
.site-root .contact-cta h2 {
  max-width: 22ch;
}
.site-root .contact-cta p {
  max-width: 44ch;
  font-size: var(--fs-md);
  color: var(--text-muted);
}
.site-root .contact-cta .contact-cta-note {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  font-style: italic;
}
.site-root .section-label-warm {
  color: var(--warm-text);
}

/* ── FAQ CTA ── */
.site-root .faq-cta-grid {
  display: grid;
  grid-template-columns: minmax(15rem, 1fr) 1fr;
  gap: clamp(2.75rem, 7vw, 6rem);
  align-items: start;
}
.site-root .faq-cta-intro h2 {
  max-width: 18ch;
}
.site-root .faq-cta-intro p {
  margin-top: 0.75rem;
  color: var(--text-muted);
}
.site-root .faq-cta-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.site-root .faq-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
.site-root .faq-field input,
.site-root .faq-field textarea {
  font-family: var(--font-body-stack);
  font-size: var(--fs-md);
  color: var(--text);
  background: var(--page-bg);
  border: 1.5px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
}
.site-root .btn-form {
  align-self: flex-start;
  background: var(--accent-dark);
  color: var(--page-bg);
  font-family: var(--font-body-stack);
  font-size: var(--fs-sm);
  font-weight: 500;
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
}
@media (max-width: 48rem) {
  .site-root .faq-cta-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/site/CtaSection.tsx src/components/site/CtaSection.test.tsx src/app/site.css
git commit -m "feat(#5): port CTA section (contact + faq variants)"
```

---

## Task 6: Dev preview route + visual check

**Files:**
- Create: `src/app/preview/page.tsx`

- [ ] **Step 1: Implement the preview page**

Create `src/app/preview/page.tsx`. It pulls the real hero/services/CTA instances out of `sarahDemo` and renders them inside `SiteRoot`.

```tsx
import { sarahDemo } from "@/lib/site/reference/sarah-demo";
import type { Section } from "@/lib/site/sections";
import { SiteRoot } from "@/components/site/SiteRoot";
import { HeroSection } from "@/components/site/HeroSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { CtaSection } from "@/components/site/CtaSection";

/** Dev-only harness for eyeballing the ported sections against the live sarah-demo. */
function find<T extends Section["type"]>(
  type: T,
  predicate?: (s: Extract<Section, { type: T }>) => boolean,
): Extract<Section, { type: T }> {
  for (const page of sarahDemo.pages) {
    for (const section of page.sections) {
      if (section.type === type) {
        const narrowed = section as Extract<Section, { type: T }>;
        if (!predicate || predicate(narrowed)) return narrowed;
      }
    }
  }
  throw new Error(`No ${type} section found in reference doc`);
}

export default function PreviewPage() {
  const hero = find("hero");
  const services = find("services");
  const contactCta = find("cta", (s) => s.variant === "contact");
  const faqCta = find("cta", (s) => s.variant === "faq");

  return (
    <SiteRoot>
      <HeroSection section={hero} />
      <ServicesSection section={services} />
      <CtaSection section={contactCta} />
      <CtaSection section={faqCta} />
    </SiteRoot>
  );
}
```

- [ ] **Step 2: Full check — tests, lint, build**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all tests PASS; lint clean (no `<img>`, so `no-img-element` does not fire); build succeeds.

- [ ] **Step 3: Visual check against the live reference**

Run: `pnpm dev`, open <http://localhost:3000/preview>, and compare side-by-side with <https://sarah-demo.rosinaaa.workers.dev/> (and `/contact`, `/faq` for the CTAs). Confirm: hero two-column layout + background circles + arch portrait frame; services 3-card grid with arch motif and hover underline-sweep; contact CTA centered; faq CTA two-column with the form. Placeholders (grey arch/box shapes) stand in for photos — expected. Note any drift to fix before finishing.

- [ ] **Step 4: Commit**

```bash
git add src/app/preview/page.tsx
git commit -m "feat(#5): dev preview route for ported sections"
```

---

## Done

When all tasks are complete and verified, use **superpowers:finishing-a-development-branch** to wrap up (verify tests, then open a PR for #5).
