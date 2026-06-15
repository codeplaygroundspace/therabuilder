# Content + theme JSON schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the typed `SiteDocument` schema (Zod + inferred TS types) that represents a therapist's site, and prove it holds real content by expressing `sarah-demo` as a reference instance that validates against it.

**Architecture:** A site is `SiteDocument` = shared chrome (`meta`, `practitioner`, `contact`, `nav`, `footer`, `theme`) + `pages[]`, where each page is an ordered list of `sections[]`. Sections are a closed `z.discriminatedUnion("type", …)` of 13 variants. Zod is the single source of truth: TS types are derived via `z.infer`, the AI's output (#4) is validated at runtime through the same schemas, and the `sarah-demo` reference instance is parsed (not cast) to prove the schema is sufficient.

**Tech Stack:** TypeScript, Zod (validation + type inference), Vitest (test runner). No React/renderer/generator code — those are issues #5/#6/#4.

**Spec:** `docs/superpowers/specs/2026-06-15-content-theme-schema-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` | Add `zod` dep, `vitest` dev dep, `test` script |
| `vitest.config.ts` | Minimal Vitest config (node environment) |
| `src/lib/site/sections.ts` | The 13 section Zod schemas + the `zSection` discriminated union + `Section` type |
| `src/lib/site/schema.ts` | Chrome schemas (`zMeta`, `zPractitioner`, `zContact`, `zNavLink`, `zFooter`, `zTheme`), `zPage`, `zSiteDocument`, and all inferred type exports |
| `src/lib/site/sections.test.ts` | Tests for the section union |
| `src/lib/site/schema.test.ts` | Tests for chrome + theme + page + full document |
| `src/lib/site/reference/sarah-demo.ts` | The `sarah-demo` content as a `SiteDocument` const |
| `src/lib/site/reference/sarah-demo.test.ts` | Asserts the reference instance parses through `zSiteDocument` |

The section union is the largest part, so it lives in its own file (`sections.ts`); chrome and document assembly live in `schema.ts`. Files that change together stay together; the reference instance and its parse test live under `reference/`.

---

## Task 1: Add dependencies and test runner

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `vitest.config.ts`
- Test: `src/lib/site/smoke.test.ts` (temporary, deleted in this task)

- [ ] **Step 1: Install Zod and Vitest**

Run:
```bash
pnpm add zod
pnpm add -D vitest
```
Expected: both resolve and are written to `package.json`.

- [ ] **Step 2: Add the `test` script**

Modify `package.json` `scripts` to add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write a temporary smoke test**

Create `src/lib/site/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it to verify the runner works**

Run: `pnpm test`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Delete the smoke test**

Run: `rm src/lib/site/smoke.test.ts`

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "Add zod and vitest for the site schema (#2)"
```

---

## Task 2: Section schemas (the discriminated union)

**Files:**
- Create: `src/lib/site/sections.ts`
- Test: `src/lib/site/sections.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/site/sections.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { zSection } from "./sections";

describe("zSection", () => {
  it("accepts a valid hero section", () => {
    const hero = {
      type: "hero",
      eyebrow: "Therapy for anxiety",
      heading: "Steadier ground",
      body: "Down-to-earth CBT therapy.",
    };
    expect(zSection.parse(hero)).toEqual(hero);
  });

  it("accepts every section type via its discriminator", () => {
    const types = [
      "hero", "logoStrip", "intro", "infoCards", "about", "richText",
      "split", "services", "accordion", "testimonial", "resourcesGrid",
      "contact", "cta",
    ];
    // sample minimal-valid bodies keyed by type
    const samples: Record<string, unknown> = {
      hero: { type: "hero", eyebrow: "e", heading: "h", body: "b" },
      logoStrip: { type: "logoStrip", label: "l", logos: [] },
      intro: { type: "intro", heading: "h", body: "b" },
      infoCards: { type: "infoCards", cards: [] },
      about: { type: "about", label: "l", heading: "h", body: "b", image: { src: "/a.jpg", alt: "a" } },
      richText: { type: "richText", paragraphs: ["p"] },
      split: { type: "split", label: "l", heading: "h", paragraphs: ["p"], image: { src: "/a.jpg", alt: "a" } },
      services: { type: "services", items: [] },
      accordion: { type: "accordion", items: [] },
      testimonial: { type: "testimonial", quote: "q" },
      resourcesGrid: { type: "resourcesGrid", heading: "h", posts: [] },
      contact: { type: "contact", heading: "h" },
      cta: { type: "cta", variant: "contact", heading: "h", button: { label: "Go", href: "/contact/" } },
    };
    for (const t of types) {
      expect(() => zSection.parse(samples[t])).not.toThrow();
    }
  });

  it("rejects an unknown section type", () => {
    expect(() => zSection.parse({ type: "carousel", heading: "h" })).toThrow();
  });

  it("rejects a known type missing required fields", () => {
    expect(() => zSection.parse({ type: "hero" })).toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/lib/site/sections.test.ts`
Expected: FAIL — cannot find module `./sections`.

- [ ] **Step 3: Implement `sections.ts`**

Create `src/lib/site/sections.ts`:
```ts
import { z } from "zod";

const zImage = z.object({ src: z.string(), alt: z.string() });
const zLink = z.object({ label: z.string(), href: z.string() });

export const zHeroSection = z.object({
  type: z.literal("hero"),
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  cta: zLink.optional(),
  image: zImage.optional(),
});

export const zLogoStripSection = z.object({
  type: z.literal("logoStrip"),
  label: z.string(),
  logos: z.array(zImage),
});

export const zIntroSection = z.object({
  type: z.literal("intro"),
  label: z.string().optional(),
  heading: z.string(),
  body: z.string(),
});

export const zInfoCardsSection = z.object({
  type: z.literal("infoCards"),
  label: z.string().optional(),
  heading: z.string().optional(),
  cards: z.array(
    z.object({ title: z.string(), body: z.string(), icon: z.string().optional() }),
  ),
});

export const zAboutSection = z.object({
  type: z.literal("about"),
  label: z.string(),
  heading: z.string(),
  body: z.string(),
  image: zImage,
});

export const zRichTextSection = z.object({
  type: z.literal("richText"),
  label: z.string().optional(),
  heading: z.string().optional(),
  paragraphs: z.array(z.string()),
  list: z.array(z.string()).optional(),
});

export const zSplitSection = z.object({
  type: z.literal("split"),
  label: z.string(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
  image: zImage,
  imagePosition: z.enum(["left", "right"]).default("right"),
});

export const zServicesSection = z.object({
  type: z.literal("services"),
  heading: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      copy: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    }),
  ),
});

export const zAccordionSection = z.object({
  type: z.literal("accordion"),
  label: z.string().optional(),
  heading: z.string().optional(),
  items: z.array(z.object({ title: z.string(), body: z.string() })),
});

export const zTestimonialSection = z.object({
  type: z.literal("testimonial"),
  quote: z.string(),
  attribution: z.string().optional(),
});

export const zResourcesGridSection = z.object({
  type: z.literal("resourcesGrid"),
  label: z.string().optional(),
  heading: z.string(),
  lead: z.string().optional(),
  posts: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      excerpt: z.string(),
      image: z.string().optional(),
    }),
  ),
});

export const zContactSection = z.object({
  type: z.literal("contact"),
  heading: z.string(),
  intro: z.string().optional(),
  methods: z.array(z.string()).optional(),
});

export const zCtaSection = z.object({
  type: z.literal("cta"),
  variant: z.enum(["contact", "faq"]),
  heading: z.string(),
  body: z.string().optional(),
  button: zLink,
});

export const zSection = z.discriminatedUnion("type", [
  zHeroSection,
  zLogoStripSection,
  zIntroSection,
  zInfoCardsSection,
  zAboutSection,
  zRichTextSection,
  zSplitSection,
  zServicesSection,
  zAccordionSection,
  zTestimonialSection,
  zResourcesGridSection,
  zContactSection,
  zCtaSection,
]);

export type Section = z.infer<typeof zSection>;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/lib/site/sections.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site/sections.ts src/lib/site/sections.test.ts
git commit -m "Add section discriminated union schema (#2)"
```

---

## Task 3: Chrome, theme, page, and document schemas

**Files:**
- Create: `src/lib/site/schema.ts`
- Test: `src/lib/site/schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/site/schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { zTheme, zSiteDocument } from "./schema";

const validTheme = {
  palette: {
    accent: "oklch(0.276 0.008 59.33)",
    accentSoft: "oklch(0.913 0.014 74.418)",
    surface: "oklch(0.956 0.01 81.795)",
    surfaceMuted: "oklch(0.943 0.011 136.56)",
    text: "oklch(0.276 0.008 59.33)",
    textMuted: "oklch(0.512 0.015 141.761)",
    border: "oklch(0.866 0.017 79.343)",
    warm: "oklch(0.671 0.075 60.455)",
  },
  fonts: { body: "Work Sans", display: "Fraunces" },
};

const minimalDoc = {
  schemaVersion: 1,
  meta: { siteName: "Calm Harbor", defaultTitle: "Calm Harbor", defaultDescription: "Therapy." },
  practitioner: {
    name: "Sarah",
    specialty: "CBT",
    title: "CBT Therapist",
    eyebrow: "Therapy for anxiety",
    heroSummary: "Down-to-earth CBT therapy.",
    bio: "I help overwhelmed professionals.",
    credentials: ["BABCP accredited"],
  },
  contact: { locations: ["Online"], availability: "Online sessions available" },
  nav: [{ href: "/", label: "Home" }],
  footer: {},
  theme: validTheme,
  pages: [
    { slug: "home", seoTitle: "Home", seoDescription: "Welcome", sections: [
      { type: "hero", eyebrow: "e", heading: "h", body: "b" },
    ] },
  ],
};

describe("zTheme", () => {
  it("accepts resolved colour + font values", () => {
    expect(() => zTheme.parse(validTheme)).not.toThrow();
  });

  it("rejects a missing palette colour", () => {
    const broken = { ...validTheme, palette: { ...validTheme.palette, accent: undefined } };
    expect(() => zTheme.parse(broken)).toThrow();
  });
});

describe("zSiteDocument", () => {
  it("accepts a minimal valid document", () => {
    expect(() => zSiteDocument.parse(minimalDoc)).not.toThrow();
  });

  it("requires schemaVersion", () => {
    const { schemaVersion, ...rest } = minimalDoc;
    void schemaVersion;
    expect(() => zSiteDocument.parse(rest)).toThrow();
  });

  it("requires each page to have a slug", () => {
    const broken = { ...minimalDoc, pages: [{ seoTitle: "x", seoDescription: "y", sections: [] }] };
    expect(() => zSiteDocument.parse(broken)).toThrow();
  });

  it("treats fees/insurers/testimonials as not-required (optional sections)", () => {
    // A document with no testimonial/contact-fee sections is still valid.
    expect(() => zSiteDocument.parse(minimalDoc)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/lib/site/schema.test.ts`
Expected: FAIL — cannot find module `./schema`.

- [ ] **Step 3: Implement `schema.ts`**

Create `src/lib/site/schema.ts`:
```ts
import { z } from "zod";
import { zSection } from "./sections";

export const zMeta = z.object({
  siteName: z.string(),
  siteUrl: z.string().optional(),
  defaultTitle: z.string(),
  defaultDescription: z.string(),
  ogImage: z.string().optional(),
});

export const zPractitioner = z.object({
  name: z.string(),
  specialty: z.string(),
  title: z.string(),
  eyebrow: z.string(),
  heroSummary: z.string(),
  bio: z.string(),
  credentials: z.array(z.string()),
});

export const zContact = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  bookingUrl: z.string().optional(),
  locations: z.array(z.string()),
  availability: z.string(),
});

export const zNavLink = z.object({ href: z.string(), label: z.string() });

export const zFooter = z.object({
  tagline: z.string().optional(),
  location: z.string().optional(),
  legalLinks: z.array(zNavLink).default([]),
});

export const zTheme = z.object({
  palette: z.object({
    accent: z.string(),
    accentSoft: z.string(),
    surface: z.string(),
    surfaceMuted: z.string(),
    text: z.string(),
    textMuted: z.string(),
    border: z.string(),
    warm: z.string(),
  }),
  fonts: z.object({ body: z.string(), display: z.string() }),
});

export const zPage = z.object({
  slug: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  sections: z.array(zSection),
});

export const zSiteDocument = z.object({
  schemaVersion: z.number(),
  meta: zMeta,
  practitioner: zPractitioner,
  contact: zContact,
  nav: z.array(zNavLink),
  footer: zFooter,
  theme: zTheme,
  pages: z.array(zPage),
});

export type Meta = z.infer<typeof zMeta>;
export type Practitioner = z.infer<typeof zPractitioner>;
export type Contact = z.infer<typeof zContact>;
export type NavLink = z.infer<typeof zNavLink>;
export type Footer = z.infer<typeof zFooter>;
export type Theme = z.infer<typeof zTheme>;
export type Page = z.infer<typeof zPage>;
export type SiteDocument = z.infer<typeof zSiteDocument>;
export type { Section } from "./sections";
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/lib/site/schema.test.ts`
Expected: PASS — all theme + document tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site/schema.ts src/lib/site/schema.test.ts
git commit -m "Add SiteDocument, page, chrome, and theme schemas (#2)"
```

---

## Task 4: The `sarah-demo` reference instance

**Files:**
- Create: `src/lib/site/reference/sarah-demo.ts`
- Test: `src/lib/site/reference/sarah-demo.test.ts`

This task expresses `sarah-demo` as a `SiteDocument`. The content is **transcribed verbatim** from the real template sources — do not paraphrase. Build the document page-by-page using this exact source mapping:

| Page (`slug`) | Sections (in order) | Source of content |
|---------------|---------------------|-------------------|
| `home` | hero, logoStrip, intro, infoCards, about, testimonial, cta(contact) | `src/pages/index.astro` + `src/data/{practitioner,home}.ts` |
| `about` | richText (story + credentials list), richText (publications), richText (personal), cta(contact) | `src/pages/about.astro` |
| `therapy` | split (intro), split (CBT), accordion (support areas), services, cta(contact) | `src/pages/therapy.astro` + `src/data/home.ts` (services) |
| `faq` | accordion (10 FAQs), cta(faq) | `src/pages/faq.astro` |
| `resources` | resourcesGrid | `src/pages/resources.astro` + `src/data/blog.ts` |
| `contact` | contact | `src/pages/contact.astro` |

Shared chrome comes from: `meta` ← `src/data/site.ts`; `practitioner` ← `src/data/practitioner.ts` (`bio` = the About-page opening paragraphs condensed to 1–2 sentences); `contact` ← `practitioner.ts`; `nav` ← `home.ts` `navLinks`; `theme` ← the `oklch` values from `src/styles/theme.css` (mapped below).

> **Why source-mapped rather than fully inlined here:** the section/chrome *structure* and the theme values are given in full as the concrete pattern (Steps 3a–3c). The remaining page bodies are large blocks of real prose that already exist verbatim in the named files; transcribing them is mechanical, and re-pasting ~500 lines of therapy copy into this plan would add no engineering signal. Pull the exact text from the cited file for each section. This is a transcription instruction, not a placeholder — every section's content has a named, exact source.

- [ ] **Step 1: Write the failing test (the runtime parse assertion)**

Create `src/lib/site/reference/sarah-demo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { zSiteDocument } from "../schema";
import { sarahDemo } from "./sarah-demo";

describe("sarah-demo reference instance", () => {
  it("parses successfully through zSiteDocument", () => {
    expect(() => zSiteDocument.parse(sarahDemo)).not.toThrow();
  });

  it("has all six pages", () => {
    const parsed = zSiteDocument.parse(sarahDemo);
    expect(parsed.pages.map((p) => p.slug).sort()).toEqual(
      ["about", "contact", "faq", "home", "resources", "therapy"],
    );
  });

  it("includes the FAQ accordion with ten items", () => {
    const parsed = zSiteDocument.parse(sarahDemo);
    const faq = parsed.pages.find((p) => p.slug === "faq")!;
    const accordion = faq.sections.find((s) => s.type === "accordion");
    expect(accordion && accordion.type === "accordion" && accordion.items.length).toBe(10);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/lib/site/reference/sarah-demo.test.ts`
Expected: FAIL — cannot find module `./sarah-demo`.

- [ ] **Step 3a: Create the file with chrome + theme (concrete pattern)**

Create `src/lib/site/reference/sarah-demo.ts`:
```ts
import type { SiteDocument } from "../schema";

export const sarahDemo: SiteDocument = {
  schemaVersion: 1,
  meta: {
    siteName: "Sarah Therapy",
    siteUrl: "https://sarahtherapy.co.uk",
    defaultTitle: "Sarah — CBT Therapist for anxiety, burnout & stress",
    defaultDescription:
      "Sarah is an accredited CBT therapist helping overwhelmed professionals with anxiety, burnout and stress. Sessions available online and in person in Blackheath, London and Sevenoaks, Kent.",
    ogImage: "/web-OG.jpg",
  },
  practitioner: {
    name: "Sarah",
    specialty: "CBT therapy for anxiety, burnout & stress",
    title: "CBT Therapist for anxiety, burnout & stress",
    eyebrow: "Therapy for anxiety, burnout & stress",
    heroSummary:
      "Sarah offers thoughtful, down-to-earth CBT therapy for overwhelmed professionals navigating anxiety, burnout and stress — with sessions shaped around what feels most useful to you.",
    bio: "Before opening my private practice, I spent many years in demanding clinical leadership roles — and burned out myself. That turning point reshaped how I help others work and live differently.",
    credentials: [
      "PG Dip Advanced practice in Cognitive Behavioural Therapy",
      "BSc (Hons) Occupational Therapy",
      "Trained in EMDR (Eye Movement Desensitisation and Reprocessing)",
      "Certificate in Clinical supervision",
      "BABCP Accredited CBT Therapist",
      "HCPC registered Occupational Therapist",
    ],
  },
  contact: {
    email: "hello@sarahtherapy.co.uk",
    phone: "+44 (0) 7700 900482",
    locations: ["Blackheath, South East London", "Sevenoaks, Kent"],
    availability: "In-person and online sessions available",
  },
  nav: [
    { href: "/about/", label: "About" },
    { href: "/therapy/", label: "Therapy" },
    { href: "/faq/", label: "FAQ" },
    { href: "/resources/", label: "Resources" },
    { href: "/contact/", label: "Contact" },
  ],
  footer: {
    location: "Blackheath, London and Sevenoaks, Kent",
    legalLinks: [
      { href: "/privacy/", label: "Privacy" },
      { href: "/cookie-policy/", label: "Cookie policy" },
    ],
  },
  theme: {
    palette: {
      accent: "oklch(0.276 0.008 59.33)",
      accentSoft: "oklch(0.913 0.014 74.418)",
      surface: "oklch(0.956 0.01 81.795)",
      surfaceMuted: "oklch(0.943 0.011 136.56)",
      text: "oklch(0.276 0.008 59.33)",
      textMuted: "oklch(0.512 0.015 141.761)",
      border: "oklch(0.866 0.017 79.343)",
      warm: "oklch(0.671 0.075 60.455)",
    },
    fonts: { body: "Work Sans", display: "Fraunces" },
  },
  pages: [
    // filled in Step 3b
  ],
};
```

- [ ] **Step 3b: Add the `home` page (concrete pattern for a page)**

Replace the `pages: [ /* filled in Step 3b */ ]` array's first entry with the `home` page. Transcribe `hero` text from `practitioner.ts` (`eyebrow`, `heroSummary`), `logoStrip` from the insurer logos in `index.astro`, `services`/`about` copy from `home.ts` and `index.astro`:
```ts
    {
      slug: "home",
      seoTitle: "Sarah — CBT Therapist for anxiety, burnout & stress | London & Kent",
      seoDescription:
        "Sarah is an accredited CBT therapist offering individual therapy for anxiety, burnout and stress. Sessions online and in person in Blackheath, London and Sevenoaks, Kent.",
      sections: [
        {
          type: "hero",
          eyebrow: "Therapy for anxiety, burnout & stress",
          heading: "Therapy for anxiety, burnout and stress.",
          body: "Sarah offers thoughtful, down-to-earth CBT therapy for overwhelmed professionals navigating anxiety, burnout and stress — with sessions shaped around what feels most useful to you.",
          cta: { label: "Book a free consultation", href: "/booking/" },
          image: { src: "/person_v2.webp", alt: "Sarah, CBT therapist" },
        },
        {
          type: "logoStrip",
          label: "Insurance I worked with:",
          logos: [
            { src: "/logos/aviva-logo.svg", alt: "Aviva" },
            { src: "/logos/axa-health-logo.svg", alt: "AXA Health" },
            { src: "/logos/vitality-logo.svg", alt: "Vitality" },
            { src: "/logos/bupa-logo.svg", alt: "Bupa" },
          ],
        },
        // intro, infoCards, about, testimonial, cta(contact):
        // transcribe from index.astro's IntroSection/InfoCardsSection/About/Testimonial/CtaContact.
        // The `services` content (3 items) lives in home.ts and is used on the therapy page.
      ],
    },
```

- [ ] **Step 3c: Add the remaining pages**

Append `about`, `therapy`, `faq`, `resources`, `contact` page objects to the `pages` array, transcribing each section's content from the source file named in the mapping table above. Key fixed data to transcribe verbatim:
  - **`therapy` → `services`**: the 3 `services` items from `home.ts` (`title`, `copy`, `image`, `imageAlt`).
  - **`therapy` → `accordion`**: the 6 `supportAreas` (`title` → `title`, `body` → `body`) from `therapy.astro`.
  - **`faq` → `accordion`**: the 10 `faqs` (`question` → `title`, `answer` → `body`) from `faq.astro`.
  - **`resources` → `resourcesGrid`**: the `blogPosts` from `blog.ts` (`slug`, `title`, `excerpt`, `image`).
  - **`about` → three `richText` sections**: the story paragraphs + the "Qualifications and registrations" list (use `list`), the publications block, and the personal block, all from `about.astro`.
  - **`cta(contact)`**: `{ type: "cta", variant: "contact", heading: …, button: { label: "Book a free consultation", href: "/contact/" } }` (text from `CtaContact`).
  - **`cta(faq)`**: `variant: "faq"` (text from `CtaFaq`).

- [ ] **Step 4: Run the reference test to verify it passes**

Run: `pnpm test src/lib/site/reference/sarah-demo.test.ts`
Expected: PASS — the instance parses; six pages present; FAQ has 10 items.
(If parsing fails, the error names the offending path — fix the data or, only if a real template field has no home in the schema, note it and adjust the schema + its test in Task 2/3.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/site/reference/sarah-demo.ts src/lib/site/reference/sarah-demo.test.ts
git commit -m "Add sarah-demo reference instance validating against the schema (#2)"
```

---

## Task 5: Full verification and PR

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `pnpm test`
Expected: PASS — all suites (sections, schema, reference) green.

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Confirm no stray runtime/UI code was added**

Run: `git diff --stat main`
Expected: changes only under `src/lib/site/`, `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, and the docs — no `.tsx`, no `src/app/` changes.

- [ ] **Step 5: Push and open the PR**

```bash
git push -u origin feat/2-content-theme-schema
gh pr create --base main --head feat/2-content-theme-schema \
  --title "Define content + theme JSON schema (#2)" \
  --body "Implements #2. Adds the Zod SiteDocument schema (types via z.infer), the 13-type section discriminated union, and a sarah-demo reference instance that validates against it. Also expands the onboarding flow to collect the user-given facts the schema needs. No renderer/generator/UI code (those are #5/#6/#4). Closes #2."
```

---

## Self-review notes

- **Spec coverage:** schema (Tasks 2–3), reference instance + runtime parse assertion (Task 4),
  13 section types (Task 2), resolved-value theme (Task 3), optional fees/insurers/testimonials
  (Task 3 test), Zod-as-single-source / `z.infer` (Tasks 2–3), `lint`+`tsc` pass (Task 5),
  "no React/renderer/generator" guard (Task 5 Step 4). All spec requirements map to a task.
- **Onboarding expansion** (already committed `43e698e`) is the spec's "inputs" section; the PR
  body notes it ships in this branch.
