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
