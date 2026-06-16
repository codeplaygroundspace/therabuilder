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
