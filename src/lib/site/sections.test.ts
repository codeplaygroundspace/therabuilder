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
    const samples: Record<string, unknown> = {
      hero: { type: "hero", eyebrow: "e", heading: "h", body: "b" },
      logoStrip: { type: "logoStrip", label: "l", logos: [] },
      intro: { type: "intro", paragraphs: ["p"] },
      infoCards: { type: "infoCards", cards: [] },
      about: { type: "about", heading: "h", paragraphs: ["p"], image: { src: "/a.jpg", alt: "a" } },
      richText: { type: "richText", paragraphs: ["p"] },
      split: { type: "split", label: "l", heading: "h", paragraphs: ["p"], image: { src: "/a.jpg", alt: "a" } },
      services: { type: "services", items: [] },
      accordion: { type: "accordion", items: [] },
      testimonial: { type: "testimonial", quote: "q" },
      resourcesGrid: { type: "resourcesGrid", heading: "h", posts: [] },
      contact: { type: "contact", heading: "h" },
      cta: { type: "cta", variant: "contact", heading: "h", button: { label: "Go", href: "/contact/" } },
    };
    for (const sample of Object.values(samples)) {
      expect(() => zSection.parse(sample)).not.toThrow();
    }
  });

  it("rejects an unknown section type", () => {
    expect(() => zSection.parse({ type: "carousel", heading: "h" })).toThrow();
  });

  it("rejects a known type missing required fields", () => {
    expect(() => zSection.parse({ type: "hero" })).toThrow();
  });
});
