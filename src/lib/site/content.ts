import { z } from "zod";

/**
 * The AI's OUTPUT for MVP generation (ADR-0010): the per-therapist *copy* slots that fill
 * the fixed template, plus the two values worth extracting from the one compound free-text
 * answer (`businessNameAndSpecialty` → siteName + specialty).
 *
 * Deliberately small and flat: the model never emits structure, ordering, theme, SEO, nav,
 * or the verbatim facts (name, location, credentials, contact) — those are passed through
 * deterministically from the onboarding answers in `assembleSite`. Keeping the AI surface this
 * narrow is the cost/predictability win of ADR-0010 and the faithfulness guard of the prompt's
 * hard rules (no invented fees, insurers, testimonials or credentials).
 */

const zCard = z.object({ title: z.string(), body: z.string() });
const zArea = z.object({ title: z.string(), body: z.string() });
const zService = z.object({ title: z.string(), copy: z.string() });
const zFaq = z.object({ question: z.string(), answer: z.string() });

/**
 * Phase-1 content (ADR-0011): everything needed to build the **home page** plus the standard
 * **contact page**. This is all the AI generates up front — the home-first slice the user can
 * judge before paying to generate the rest. Contact copy lives here (not phase 2) so the home
 * page's primary "Get in touch" CTA resolves to a real page immediately.
 */
export const zHomeContent = z.object({
  // ── Extracted facts (the only place AI touches "facts" — a compound field) ──
  /** Practice / business name, e.g. "Calm Harbor Therapy". */
  siteName: z.string(),
  /** Short specialty phrase, e.g. "CBT therapy for anxiety, burnout & stress". */
  specialty: z.string(),

  // ── Site-wide ──
  /** One-line tagline for the footer and meta description seed. */
  tagline: z.string(),

  // ── Home ──
  heroEyebrow: z.string(),
  heroHeading: z.string(),
  heroBody: z.string(),
  introHeading: z.string().optional(),
  introParagraphs: z.array(z.string()).min(2).max(4),
  infoCards: z.array(zCard).min(2).max(3),
  aboutHeading: z.string(),
  aboutParagraphs: z.array(z.string()).min(2).max(3),
  /** The therapist's own reflection/philosophy — NOT a fabricated client quote. */
  testimonialQuote: z.string(),
  homeCtaHeading: z.string(),
  homeCtaBody: z.string(),
  homeCtaNote: z.string().optional(),

  // ── Contact page (standard/generic — built in phase 1) ──
  contactHeading: z.string(),
  contactIntro: z.string(),
});

/**
 * Phase-2 content (ADR-0011): the **about, therapy and FAQ** pages, generated only when the
 * user is happy with the home page and asks to build the rest.
 */
export const zRestContent = z.object({
  // ── About page ──
  bioHeading: z.string(),
  /** The personal narrative, grounded in what drew them to the work. */
  bioParagraphs: z.array(z.string()).min(2).max(4),
  approachHeading: z.string().optional(),
  approachParagraphs: z.array(z.string()).min(1).max(3),

  // ── Therapy / services page ──
  therapyIntroHeading: z.string(),
  therapyIntroParagraphs: z.array(z.string()).min(1).max(2),
  modalityHeading: z.string(),
  modalityParagraphs: z.array(z.string()).min(1).max(3),
  areasHeading: z.string(),
  areas: z.array(zArea).min(3).max(6),
  servicesHeading: z.string(),
  servicesBody: z.string().optional(),
  services: z.array(zService).min(2).max(3),

  // ── FAQ page ──
  faqHeading: z.string(),
  faqIntro: z.string(),
  faqs: z.array(zFaq).min(4).max(8),
});

/**
 * The complete content payload, composed from the two phases so the full set is partitioned by
 * construction (home ∪ rest = full, no overlap). The one-shot/sample path still uses this.
 */
export const zSiteContent = z.object({
  ...zHomeContent.shape,
  ...zRestContent.shape,
});

export type HomeContent = z.infer<typeof zHomeContent>;
export type RestContent = z.infer<typeof zRestContent>;
export type SiteContent = z.infer<typeof zSiteContent>;

/**
 * A realistic fixture for the `sampleAnswers` therapist (Calm Harbor / Dr. Maya Ellis).
 * Lets the chat → assembleSite → render loop be exercised end-to-end WITHOUT an API key
 * (the `?demo` path and tests use it). Contains no fees, insurer names, testimonials, or
 * credentials beyond what onboarding collected — the same bar the live model must meet.
 */
export const sampleContent: SiteContent = {
  siteName: "Calm Harbor Therapy",
  specialty: "CBT therapy for anxiety, burnout & stress",
  tagline:
    "Thoughtful CBT therapy for overwhelmed professionals — in Brighton and online across the UK.",

  heroEyebrow: "Therapy for anxiety, burnout & stress",
  heroHeading: "Therapy for when you're coping on the outside, exhausted underneath.",
  heroBody:
    "You hold a lot together every day and most people would never guess how tired you feel. Therapy is a place to slow down, make sense of the pressure, and find steadier ways to carry it.",
  introHeading: "A calmer way to work through what's weighing on you.",
  introParagraphs: [
    "Maybe the overthinking has started to shape your days, or the drive that once felt useful now leaves you depleted. You may look capable on the outside while feeling stretched thin underneath.",
    "Therapy offers a confidential space to understand what's happening, why it keeps returning, and what you'd actually like to change — at a pace that feels manageable.",
    "Below are a few of the ways we might begin working together.",
  ],
  infoCards: [
    {
      title: "A free first conversation",
      body: "We start with a short introductory call so you can ask questions, share a little about what's going on, and get a feel for whether we'd work well together — with no pressure to continue.",
    },
    {
      title: "How therapy can help",
      body: "When you feel stuck, anxious or burnt out, CBT can help you notice the patterns keeping you there and practise steadier, more sustainable ways of responding in everyday life.",
    },
  ],
  aboutHeading: "Grounded, thoughtful and easy to talk to.",
  aboutParagraphs: [
    "I work with adults who want therapy that feels calm, intelligent and human — with room for reflection as well as practical steps when you need them.",
    "People often come to me carrying a lot quietly: work pressure, anxious thinking, perfectionism, or the sense that something isn't quite working anymore.",
    "Sessions are available in person in Brighton and online for clients across the UK who prefer to meet from home.",
  ],
  testimonialQuote:
    "Therapy doesn't have to be dramatic to change things. Often it begins with having one place where you can slow down and tell the truth.",
  homeCtaHeading: "Not sure if therapy is the right step?",
  homeCtaBody:
    "Let's have a short, no-pressure conversation about what brought you here and what you're hoping for.",
  homeCtaNote: "There's no obligation to continue.",

  bioHeading: "Behind the calm exterior, I know how burnout feels.",
  bioParagraphs: [
    "Before opening my private practice, I spent years in a high-pressure NHS leadership role. On paper things looked steady — a senior position, real responsibility, expectations met. Inside, I was running on empty.",
    "For a long time I kept going by pushing harder, overlooking the signs that I needed to slow down. Reaching my own burnout was the turning point that reshaped how I understand pressure, recovery and what sustainable work can look like.",
    "Today I help others slow down and rebuild — not always through drastic change, but through stronger self-awareness, steadier boundaries and renewed confidence. I don't believe doing well should cost you your wellbeing.",
  ],
  approachHeading: "How I work",
  approachParagraphs: [
    "I work in a gentle, unhurried way. My aim is to make the therapy room a place where whatever you're carrying can be explored without judgement, and where progress can happen at a pace that feels right for you.",
    "Equality and respect are central to how I work. I want every client to feel their story is met with care and without assumption, so trust can grow on your terms.",
  ],

  therapyIntroHeading: "CBT therapy for anxiety, burnout and feeling stuck.",
  therapyIntroParagraphs: [
    "Therapy with me is collaborative, practical and paced around what feels most useful to you. We focus on understanding your experience from your perspective while building clearer, steadier ways of responding to pressure and worry.",
  ],
  modalityHeading: "A practical space to understand patterns and make change.",
  modalityParagraphs: [
    "CBT can help you notice the links between thoughts, feelings, body sensations and behaviour — especially useful if you're used to pushing through, overthinking decisions or holding yourself to impossible standards.",
    "Sessions aren't about being told what to do. They're a place to explore what's keeping you stuck, reconnect with your values, and practise changes that feel realistic in your work and relationships.",
  ],
  areasHeading: "Topics clients often work through.",
  areas: [
    {
      title: "Overthinking and anxiety",
      body: "When the mind keeps running scenarios and scanning for what could go wrong, sleep and focus suffer. We look at what feeds the loop and practise grounded ways to step out of it.",
    },
    {
      title: "Burnout and work pressure",
      body: "High-functioning burnout often looks like still showing up while feeling flat and depleted underneath. Therapy makes space to recover capacity and rebuild a sustainable relationship with work.",
    },
    {
      title: "Self doubt and perfectionism",
      body: "When good enough never feels good enough, achievement stops feeling like reward. We look at where the standards came from and what changes when self-worth stops depending on output.",
    },
    {
      title: "Boundaries and confidence",
      body: "If you tend to over-give or stay quiet to keep the peace, boundaries can feel risky. Therapy supports you to recognise your needs and hold a position without spiralling into guilt.",
    },
    {
      title: "Stress held in the body",
      body: "Tight shoulders, shallow breath, a knot before meetings — stress lives in the body long after the moment passes. We work on noticing these signals earlier and responding sooner.",
    },
  ],
  servicesHeading: "A practical toolbox for lasting change.",
  servicesBody:
    "I blend reflective therapy with useful strategies you can take back into daily life — work especially suited to people who look capable on the outside but feel overextended underneath.",
  services: [
    {
      title: "Anxiety and overwhelm",
      copy: "When your mind is always racing, even simple things feel heavy. Together we slow the spiral, understand what's driving it, and build steadier ways of responding.",
    },
    {
      title: "Burnout and stress",
      copy: "Stress has a way of shrinking your world. We look at pressure, perfectionism and exhaustion, then begin rebuilding space, boundaries and recovery.",
    },
    {
      title: "Confidence and life transitions",
      copy: "If you're navigating change or feeling disconnected from who you used to be, therapy can help you find firmer ground and move forward with more self-trust.",
    },
  ],

  faqHeading: "Questions about therapy",
  faqIntro:
    "If you're thinking about starting therapy, these answers cover the practical questions people often ask before getting in touch.",
  faqs: [
    {
      question: "How does therapy work?",
      answer:
        "Therapy gives you a regular, confidential space to understand what's happening beneath the surface and practise different ways of responding. I work collaboratively, combining CBT with a grounded, practical style.",
    },
    {
      question: "Will therapy help?",
      answer:
        "Therapy can't promise a quick fix, but it can help you feel less alone with what you're carrying. If you feel overwhelmed, anxious or burnt out, sessions can help you understand the cycle you're in and build steadier ways forward.",
    },
    {
      question: "How many sessions will I need, and how often?",
      answer:
        "Many people begin with weekly sessions so there's enough consistency to build momentum. How long the work continues depends on your goals and what feels useful, and we review it together as we go.",
    },
    {
      question: "Can anyone come to therapy?",
      answer:
        "Yes. You don't need to wait until things feel unmanageable. Therapy can help if you're struggling day to day, but also if you're functioning outwardly while feeling anxious or exhausted inside.",
    },
    {
      question: "Is therapy confidential?",
      answer:
        "Yes. I'll talk through confidentiality at the start, including the limited situations where there may be a duty to act if there's a serious risk of harm.",
    },
    {
      question: "Do you offer online sessions?",
      answer:
        "Yes. I see clients in person in Brighton and online by video for clients across the UK who prefer to meet from home.",
    },
  ],

  contactHeading: "Get in touch.",
  contactIntro:
    "I offer sessions in person in Brighton and online across the UK. Reach out using whatever feels easiest and I'll get back to you.",
};
