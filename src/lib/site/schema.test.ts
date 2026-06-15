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
    {
      slug: "home",
      seoTitle: "Home",
      seoDescription: "Welcome",
      sections: [{ type: "hero", eyebrow: "e", heading: "h", body: "b" }],
    },
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
    const broken = {
      ...minimalDoc,
      pages: [{ seoTitle: "x", seoDescription: "y", sections: [] }],
    };
    expect(() => zSiteDocument.parse(broken)).toThrow();
  });

  it("treats fees/insurers/testimonials as not-required (a doc without them is valid)", () => {
    expect(() => zSiteDocument.parse(minimalDoc)).not.toThrow();
  });
});
