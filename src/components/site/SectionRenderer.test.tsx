import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SectionRenderer } from "./SectionRenderer";
import type { Section } from "@/lib/site/sections";

const hero: Extract<Section, { type: "hero" }> = {
  type: "hero",
  heading: "Therapy for overwhelmed professionals.",
  body: "You might look like you're coping.",
};

const cta: Extract<Section, { type: "cta" }> = {
  type: "cta",
  variant: "contact",
  heading: "Unsure if counselling is right for you?",
};

// A type that has NO component yet (ported in #8). Casting through unknown keeps the
// test honest: SectionRenderer must handle every union member at runtime.
const unported = { type: "about", heading: "About", paragraphs: ["x"], image: { src: "", alt: "" } } as unknown as Section;

describe("SectionRenderer", () => {
  it("dispatches a ported type to its component", () => {
    const html = renderHtml(<SectionRenderer section={hero} />);
    expect(html).toContain("hero-h1");
    expect(html).toContain("Therapy for overwhelmed professionals.");
  });

  it("dispatches cta to the CTA component", () => {
    const html = renderHtml(<SectionRenderer section={cta} />);
    expect(html).toContain("contact-cta");
  });

  it("renders an unported type without throwing, and never mis-dispatches (the #8 seam)", () => {
    let html = "";
    expect(() => {
      html = renderHtml(<SectionRenderer section={unported} />);
    }).not.toThrow();
    // Whatever it renders (empty in prod/test, a dev stub in development), it must NOT
    // have rendered a real section component for a type it has no renderer for.
    expect(html).not.toContain("hero-h1");
    expect(html).not.toContain("contact-cta");
    expect(html).not.toContain("services-grid");
  });
});
