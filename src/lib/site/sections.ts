import { z } from "zod";

const zImage = z.object({ src: z.string(), alt: z.string() });
const zLink = z.object({ label: z.string(), href: z.string() });

export const zHeroSection = z.object({
  type: z.literal("hero"),
  eyebrow: z.string().optional(),
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
  heading: z.string().optional(),
  paragraphs: z.array(z.string()),
  cta: zLink.optional(),
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
  label: z.string().optional(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
  image: zImage,
  cta: zLink.optional(),
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
  label: z.string().optional(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
  image: zImage,
  imagePosition: z.enum(["left", "right"]).default("right"),
  cta: zLink.optional(),
});

export const zServicesSection = z.object({
  type: z.literal("services"),
  label: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
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
  label: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  methods: z.array(z.string()).optional(),
});

export const zCtaSection = z.object({
  type: z.literal("cta"),
  variant: z.enum(["contact", "faq"]),
  label: z.string().optional(),
  heading: z.string(),
  body: z.string().optional(),
  note: z.string().optional(),
  button: zLink.optional(),
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
