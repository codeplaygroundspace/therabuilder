import type { SiteDocument, Page } from "../schema";
import type { Section } from "../sections";
import type { SiteContent } from "../content";
import type { OnboardingAnswers } from "../onboarding-answers";
import { getPreset } from "../theme/presets";

/**
 * Merge AI-generated content slots onto the fixed MVP template to produce a complete,
 * schema-valid {@link SiteDocument} (ADR-0010). Pure and deterministic.
 *
 * Division of responsibility:
 * - **Structure** (pages, section types, order, labels, nav, image placeholders) is fixed
 *   here — the one MVP template.
 * - **Copy** comes from `content` (the AI's only job).
 * - **Verbatim facts** (name, credentials, location, session format, contact details) are
 *   passed through from `answers` untouched — never routed through the model, so the hard
 *   rule "use them exactly as given" holds.
 * - **Theme** is the user's chosen preset.
 *
 * The template deliberately OMITS sarah-demo's insurer logo strip, fee/insurance FAQs, and
 * blog/resources page: onboarding collects none of that, so carrying those slots would invite
 * fabrication (the prompt forbids invented fees, insurers and testimonials).
 */
export function assembleSite(
  content: SiteContent,
  answers: OnboardingAnswers,
  opts: { presetId?: string; templateId?: string } = {},
): SiteDocument {
  const theme = getPreset(opts.presetId).theme;

  const name = answers.practitionerName.trim();
  const credentials = parseCredentials(answers.credentials);
  const locations = parseLocations(answers.location);
  const availability = answers.sessionFormat.trim();
  const email = extractEmail(answers.contactPreference);
  const phone = extractPhone(answers.contactPreference);
  const bookingUrl = extractUrl(answers.contactPreference);
  const ctaHref = bookingUrl ?? "/contact/";
  const methods = deriveContactMethods(answers.contactPreference);

  const { siteName, specialty, tagline } = content;
  const locationLine = locations.join(" · ");

  /** Standard "get in touch" CTA reused at the foot of several pages. */
  const contactCta: Section = {
    type: "cta",
    variant: "contact",
    label: "Get in touch",
    heading: content.homeCtaHeading,
    body: content.homeCtaBody,
    ...(content.homeCtaNote ? { note: content.homeCtaNote } : {}),
    button: { label: "Get in touch", href: ctaHref },
  };

  const home: Page = {
    slug: "home",
    seoTitle: `${siteName} — ${specialty}`,
    seoDescription: tagline,
    sections: [
      {
        type: "hero",
        eyebrow: content.heroEyebrow,
        heading: content.heroHeading,
        body: content.heroBody,
        cta: { label: "Get in touch", href: ctaHref },
        image: { src: "", alt: `${name}, ${specialty}` },
      },
      {
        type: "intro",
        label: "Welcome",
        ...(content.introHeading ? { heading: content.introHeading } : {}),
        paragraphs: content.introParagraphs,
        cta: { label: "Explore therapy", href: "/therapy/" },
      },
      {
        type: "infoCards",
        cards: content.infoCards,
      },
      {
        type: "about",
        label: `About ${name}`,
        heading: content.aboutHeading,
        paragraphs: content.aboutParagraphs,
        image: { src: "", alt: `${name}, ${specialty}` },
        cta: { label: "Read more about me", href: "/about/" },
      },
      {
        type: "testimonial",
        quote: content.testimonialQuote,
        attribution: name,
      },
      contactCta,
    ],
  };

  const aboutSections: Section[] = [
    {
      type: "richText",
      label: `About ${name}`,
      heading: content.bioHeading,
      paragraphs: content.bioParagraphs,
    },
  ];
  if (credentials.length > 0) {
    aboutSections.push({
      type: "richText",
      heading: "Qualifications and registrations",
      paragraphs: [],
      list: credentials,
    });
  }
  aboutSections.push({
    type: "richText",
    ...(content.approachHeading ? { heading: content.approachHeading } : {}),
    label: "How I work",
    paragraphs: content.approachParagraphs,
  });
  aboutSections.push(contactCta);

  const about: Page = {
    slug: "about",
    seoTitle: `About ${name} — ${siteName}`,
    seoDescription: `Learn about ${name}, ${specialty}. ${tagline}`,
    sections: aboutSections,
  };

  const therapy: Page = {
    slug: "therapy",
    seoTitle: `${specialty} — ${siteName}`,
    seoDescription: tagline,
    sections: [
      {
        type: "split",
        label: "Psychotherapy",
        heading: content.therapyIntroHeading,
        paragraphs: content.therapyIntroParagraphs,
        image: { src: "", alt: "A calm, quiet space for reflection and conversation" },
        imagePosition: "right",
        cta: { label: "Get in touch", href: ctaHref },
      },
      {
        type: "split",
        label: "How it works",
        heading: content.modalityHeading,
        paragraphs: content.modalityParagraphs,
        image: { src: "", alt: "Notes and quiet focus — the practical side of therapy" },
        imagePosition: "left",
      },
      {
        type: "accordion",
        label: "Areas of support",
        heading: content.areasHeading,
        items: content.areas.map((a) => ({ title: a.title, body: a.body })),
      },
      {
        type: "services",
        label: "Approach and specialties",
        heading: content.servicesHeading,
        ...(content.servicesBody ? { body: content.servicesBody } : {}),
        items: content.services.map((s) => ({
          title: s.title,
          copy: s.copy,
          imageAlt: s.title,
        })),
      },
      contactCta,
    ],
  };

  const faq: Page = {
    slug: "faq",
    seoTitle: `FAQ — ${siteName}`,
    seoDescription: `Common questions about starting therapy with ${name}. ${tagline}`,
    sections: [
      {
        type: "richText",
        label: "FAQ",
        heading: content.faqHeading,
        paragraphs: [content.faqIntro],
      },
      {
        type: "accordion",
        items: content.faqs.map((f) => ({ title: f.question, body: f.answer })),
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

  const contact: Page = {
    slug: "contact",
    seoTitle: `Contact ${name} — ${siteName}`,
    seoDescription: `Get in touch with ${name} to ask about availability or book a first conversation.`,
    sections: [
      {
        type: "contact",
        label: "Contact",
        heading: content.contactHeading,
        intro: content.contactIntro,
        methods,
      },
    ],
  };

  return {
    schemaVersion: 1,
    meta: {
      siteName,
      defaultTitle: `${siteName} — ${specialty}`,
      defaultDescription: tagline,
    },
    practitioner: {
      name,
      specialty,
      title: specialty,
      eyebrow: content.heroEyebrow,
      heroSummary: content.heroBody,
      bio: content.bioParagraphs[0] ?? content.aboutParagraphs[0] ?? "",
      credentials,
    },
    contact: {
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(bookingUrl ? { bookingUrl } : {}),
      locations,
      availability,
    },
    nav: [
      { href: "/about/", label: "About" },
      { href: "/therapy/", label: "Therapy" },
      { href: "/faq/", label: "FAQ" },
      { href: "/contact/", label: "Contact" },
    ],
    footer: {
      tagline,
      ...(locationLine ? { location: locationLine } : {}),
      legalLinks: [],
    },
    theme,
    pages: [home, about, therapy, faq, contact],
  };
}

/* ── Deterministic parsers for the verbatim onboarding facts ──────────────────── */

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
