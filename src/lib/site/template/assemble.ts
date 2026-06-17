import type { SiteDocument, Page } from "../schema";
import type { Section } from "../sections";
import type { HomeContent, RestContent, SiteContent } from "../content";
import type { OnboardingAnswers } from "../onboarding-answers";
import { getPreset } from "../theme/presets";

/**
 * Merge AI-generated content slots onto the fixed MVP template to produce a complete,
 * schema-valid {@link SiteDocument} (ADR-0010). Pure and deterministic.
 *
 * Generation is **home-first** (ADR-0011): {@link assembleHome} builds the chrome, the home
 * page and the standard contact page, leaving about/therapy/faq present in the nav but empty;
 * {@link buildRestPages} fills those three later, on request. {@link assembleSite} composes both
 * for the one-shot/sample path, so the phased and one-shot outputs are identical by construction.
 *
 * Division of responsibility:
 * - **Structure** (pages, section types, order, labels, nav, image placeholders) is fixed here.
 * - **Copy** comes from the content payload (the AI's only job).
 * - **Verbatim facts** (name, credentials, location, session format, contact details) are passed
 *   through from `answers` untouched — never routed through the model.
 * - **Theme** is the user's chosen preset.
 *
 * The template deliberately OMITS sarah-demo's insurer logo strip, fee/insurance FAQs, and
 * blog/resources page: onboarding collects none of that, so carrying those slots would invite
 * fabrication (the prompt forbids invented fees, insurers and testimonials).
 */

type AssembleOpts = { presetId?: string; templateId?: string };

/** The AI-derived, page-spanning strings needed to build the about/therapy/faq pages later. */
export type RestSeed = { siteName: string; specialty: string; tagline: string };

/** The three pages deferred to phase 2 (present in the nav from phase 1, filled on request). */
type RestSlug = "about" | "therapy" | "faq";

/* ── Phase 1: chrome + home + contact, with the rest of the nav present but empty ─────── */

/**
 * Build the full site shell from phase-1 content: chrome (meta/practitioner/contact/nav/footer/
 * theme), the home page, and the standard contact page. The about/therapy/faq pages exist in the
 * nav so the menu and the home CTA work, but render a placeholder until {@link buildRestPages}
 * fills them.
 */
export function assembleHome(
  home: HomeContent,
  answers: OnboardingAnswers,
  opts: AssembleOpts = {},
): SiteDocument {
  const theme = getPreset(opts.presetId).theme;
  const facts = deriveFacts(answers);
  const seed: RestSeed = { siteName: home.siteName, specialty: home.specialty, tagline: home.tagline };

  return {
    ...buildChrome(home, facts, theme),
    pages: [
      buildHomePage(home, facts),
      emptyPage("about", restPageMeta("about", seed, facts), "About"),
      emptyPage("therapy", restPageMeta("therapy", seed, facts), home.specialty),
      emptyPage("faq", restPageMeta("faq", seed, facts), "Frequently asked questions"),
      buildContactPage(home, facts),
    ],
  };
}

/* ── Phase 2: the about / therapy / faq pages, generated only when the user asks ──────── */

/**
 * Build the three deferred pages from phase-2 content. Returns them in document order; the
 * caller splices them into the live document by slug, so any edits to the home page survive.
 */
export function buildRestPages(
  rest: RestContent,
  answers: OnboardingAnswers,
  seed: RestSeed,
): Page[] {
  const facts = deriveFacts(answers);
  return [
    buildAboutPage(rest, facts, seed),
    buildTherapyPage(rest, facts, seed),
    buildFaqPage(rest, facts, seed),
  ];
}

/* ── One-shot: the complete site from full content (sample/demo/tests) ────────────────── */

export function assembleSite(
  content: SiteContent,
  answers: OnboardingAnswers,
  opts: AssembleOpts = {},
): SiteDocument {
  const shell = assembleHome(content, answers, opts);
  const seed: RestSeed = {
    siteName: content.siteName,
    specialty: content.specialty,
    tagline: content.tagline,
  };
  const filled = new Map(buildRestPages(content, answers, seed).map((p) => [p.slug, p]));
  return { ...shell, pages: shell.pages.map((p) => filled.get(p.slug) ?? p) };
}

/* ── Chrome ───────────────────────────────────────────────────────────────────────────── */

function buildChrome(home: HomeContent, facts: Facts, theme: SiteDocument["theme"]) {
  const { siteName, specialty, tagline } = home;
  return {
    schemaVersion: 1,
    meta: {
      siteName,
      defaultTitle: `${siteName} — ${specialty}`,
      defaultDescription: tagline,
    },
    practitioner: {
      name: facts.name,
      specialty,
      title: specialty,
      eyebrow: home.heroEyebrow,
      heroSummary: home.heroBody,
      bio: home.aboutParagraphs[0] ?? "",
      credentials: facts.credentials,
    },
    contact: {
      ...(facts.email ? { email: facts.email } : {}),
      ...(facts.phone ? { phone: facts.phone } : {}),
      ...(facts.bookingUrl ? { bookingUrl: facts.bookingUrl } : {}),
      locations: facts.locations,
      availability: facts.availability,
    },
    nav: [
      { href: "/about/", label: "About" },
      { href: "/therapy/", label: "Therapy" },
      { href: "/faq/", label: "FAQ" },
      { href: "/contact/", label: "Contact" },
    ],
    footer: {
      tagline,
      ...(facts.locationLine ? { location: facts.locationLine } : {}),
      legalLinks: [],
    },
    theme,
  } satisfies Omit<SiteDocument, "pages">;
}

/* ── Page builders ────────────────────────────────────────────────────────────────────── */

function buildHomePage(home: HomeContent, facts: Facts): Page {
  return {
    slug: "home",
    seoTitle: `${home.siteName} — ${home.specialty}`,
    seoDescription: home.tagline,
    sections: [
      {
        type: "hero",
        eyebrow: home.heroEyebrow,
        heading: home.heroHeading,
        body: home.heroBody,
        cta: { label: "Get in touch", href: facts.ctaHref },
        image: { src: "", alt: `${facts.name}, ${home.specialty}` },
      },
      {
        type: "intro",
        label: "Welcome",
        ...(home.introHeading ? { heading: home.introHeading } : {}),
        paragraphs: home.introParagraphs,
        cta: { label: "Explore therapy", href: "/therapy/" },
      },
      { type: "infoCards", cards: home.infoCards },
      {
        type: "about",
        label: `About ${facts.name}`,
        heading: home.aboutHeading,
        paragraphs: home.aboutParagraphs,
        image: { src: "", alt: `${facts.name}, ${home.specialty}` },
        cta: { label: "Read more about me", href: "/about/" },
      },
      { type: "testimonial", quote: home.testimonialQuote, attribution: facts.name },
      homeContactCta(home, facts),
    ],
  };
}

function buildContactPage(home: HomeContent, facts: Facts): Page {
  return {
    slug: "contact",
    seoTitle: `Contact ${facts.name} — ${home.siteName}`,
    seoDescription: `Get in touch with ${facts.name} to ask about availability or book a first conversation.`,
    sections: [
      {
        type: "contact",
        label: "Contact",
        heading: home.contactHeading,
        intro: home.contactIntro,
        methods: facts.methods,
      },
    ],
  };
}

function buildAboutPage(rest: RestContent, facts: Facts, seed: RestSeed): Page {
  const sections: Section[] = [
    {
      type: "richText",
      label: `About ${facts.name}`,
      heading: rest.bioHeading,
      paragraphs: rest.bioParagraphs,
    },
  ];
  if (facts.credentials.length > 0) {
    sections.push({
      type: "richText",
      heading: "Qualifications and registrations",
      paragraphs: [],
      list: facts.credentials,
    });
  }
  sections.push({
    type: "richText",
    ...(rest.approachHeading ? { heading: rest.approachHeading } : {}),
    label: "How I work",
    paragraphs: rest.approachParagraphs,
  });
  sections.push(subContactCta(facts));

  return { slug: "about", ...restPageMeta("about", seed, facts), sections };
}

function buildTherapyPage(rest: RestContent, facts: Facts, seed: RestSeed): Page {
  return {
    slug: "therapy",
    ...restPageMeta("therapy", seed, facts),
    sections: [
      {
        type: "split",
        label: "Psychotherapy",
        heading: rest.therapyIntroHeading,
        paragraphs: rest.therapyIntroParagraphs,
        image: { src: "", alt: "A calm, quiet space for reflection and conversation" },
        imagePosition: "right",
        cta: { label: "Get in touch", href: facts.ctaHref },
      },
      {
        type: "split",
        label: "How it works",
        heading: rest.modalityHeading,
        paragraphs: rest.modalityParagraphs,
        image: { src: "", alt: "Notes and quiet focus — the practical side of therapy" },
        imagePosition: "left",
      },
      {
        type: "accordion",
        label: "Areas of support",
        heading: rest.areasHeading,
        items: rest.areas.map((a) => ({ title: a.title, body: a.body })),
      },
      {
        type: "services",
        label: "Approach and specialties",
        heading: rest.servicesHeading,
        ...(rest.servicesBody ? { body: rest.servicesBody } : {}),
        items: rest.services.map((s) => ({ title: s.title, copy: s.copy, imageAlt: s.title })),
      },
      subContactCta(facts),
    ],
  };
}

function buildFaqPage(rest: RestContent, facts: Facts, seed: RestSeed): Page {
  return {
    slug: "faq",
    ...restPageMeta("faq", seed, facts),
    sections: [
      {
        type: "richText",
        label: "FAQ",
        heading: rest.faqHeading,
        paragraphs: [rest.faqIntro],
      },
      {
        type: "accordion",
        items: rest.faqs.map((f) => ({ title: f.question, body: f.answer })),
      },
      {
        type: "cta",
        variant: "faq",
        label: "Get in touch",
        heading: "Didn't find what you're looking for?",
        body: "I'm happy to answer any questions or concerns you may have.",
      },
    ],
  };
}

/** A page that exists in the nav but has no generated content yet (home-first phase 1). */
function emptyPage(
  slug: RestSlug,
  meta: { seoTitle: string; seoDescription: string },
  heading: string,
): Page {
  return {
    slug,
    ...meta,
    sections: [
      {
        type: "richText",
        heading,
        paragraphs: ["This page will be created when you build the rest of your site."],
      },
    ],
  };
}

/* ── Shared bits ──────────────────────────────────────────────────────────────────────── */

/** The standard "get in touch" CTA from the home content, used on the home page. */
function homeContactCta(home: HomeContent, facts: Facts): Section {
  return {
    type: "cta",
    variant: "contact",
    label: "Get in touch",
    heading: home.homeCtaHeading,
    body: home.homeCtaBody,
    ...(home.homeCtaNote ? { note: home.homeCtaNote } : {}),
    button: { label: "Get in touch", href: facts.ctaHref },
  };
}

/**
 * A deterministic CTA reused at the foot of the about/therapy pages. Independent of the home
 * content so phase 2 needs no phase-1 copy — only the verbatim facts.
 */
function subContactCta(facts: Facts): Section {
  return {
    type: "cta",
    variant: "contact",
    label: "Get in touch",
    heading: "Ready to take the first step?",
    body: `Reach out to ${facts.name || "me"} to ask a question or arrange a first conversation.`,
    button: { label: "Get in touch", href: facts.ctaHref },
  };
}

function restPageMeta(
  slug: RestSlug,
  seed: RestSeed,
  facts: Facts,
): { seoTitle: string; seoDescription: string } {
  switch (slug) {
    case "about":
      return {
        seoTitle: `About ${facts.name} — ${seed.siteName}`,
        seoDescription: `Learn about ${facts.name}, ${seed.specialty}. ${seed.tagline}`,
      };
    case "therapy":
      return { seoTitle: `${seed.specialty} — ${seed.siteName}`, seoDescription: seed.tagline };
    case "faq":
      return {
        seoTitle: `FAQ — ${seed.siteName}`,
        seoDescription: `Common questions about starting therapy with ${facts.name}. ${seed.tagline}`,
      };
  }
}

/* ── Deterministic facts derived from the onboarding answers ──────────────────────────── */

type Facts = {
  name: string;
  credentials: string[];
  locations: string[];
  locationLine: string;
  availability: string;
  email?: string;
  phone?: string;
  bookingUrl?: string;
  ctaHref: string;
  methods: string[];
};

function deriveFacts(answers: OnboardingAnswers): Facts {
  const locations = parseLocations(answers.location);
  const bookingUrl = extractUrl(answers.contactPreference);
  return {
    name: answers.practitionerName.trim(),
    credentials: parseCredentials(answers.credentials),
    locations,
    locationLine: locations.join(" · "),
    availability: answers.sessionFormat.trim(),
    email: extractEmail(answers.contactPreference),
    phone: extractPhone(answers.contactPreference),
    bookingUrl,
    ctaHref: bookingUrl ?? "/contact/",
    methods: deriveContactMethods(answers.contactPreference),
  };
}

/** Split a free-text credentials answer into a clean list (comma-separated). */
function parseCredentials(raw: string): string[] {
  return raw
    .split(/[,\n]+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

/** Split a location answer into individual places (commas / "and" / semicolons). */
function parseLocations(raw: string): string[] {
  const parts = raw
    .split(/[,;]+|\band\b/i)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
  return parts.length > 0 ? parts : [raw.trim()];
}

function extractEmail(raw: string): string | undefined {
  return raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
}

function extractPhone(raw: string): string | undefined {
  return raw.match(/(?:\+?\d[\d\s()-]{7,}\d)/)?.[0]?.trim();
}

function extractUrl(raw: string): string | undefined {
  return raw.match(/https?:\/\/[^\s,)]+/)?.[0];
}

/** Map keywords in the contact answer to human-readable contact methods. */
function deriveContactMethods(raw: string): string[] {
  const lower = raw.toLowerCase();
  const methods: string[] = [];
  if (/\bform\b/.test(lower)) methods.push("Contact form");
  if (/\bemail\b|@/.test(lower)) methods.push("Email");
  if (/\bphone\b|\bcall\b/.test(lower)) methods.push("Phone call");
  if (/\btext\b|\bsms\b|\bwhatsapp\b/.test(lower)) methods.push("Text message");
  if (/\bbook/.test(lower)) methods.push("Online booking");
  return methods.length > 0 ? methods : ["Email"];
}
