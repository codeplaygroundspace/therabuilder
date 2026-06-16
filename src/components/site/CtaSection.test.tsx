import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { CtaSection } from "./CtaSection";
import type { Section } from "@/lib/site/sections";

type Cta = Extract<Section, { type: "cta" }>;

const contact: Cta = {
  type: "cta",
  variant: "contact",
  label: "Contact Sarah",
  heading: "Unsure if counselling is right for you?",
  body: "Let's have a chat.",
  note: "There is no obligation to commit!",
  button: { label: "Book a free consultation", href: "/booking/" },
};

const faq: Cta = {
  type: "cta",
  variant: "faq",
  label: "Get in touch",
  heading: "Did not find what you're looking for?",
  body: "I'll happily answer any questions.",
};

describe("CtaSection", () => {
  it("contact variant renders heading, note and the button", () => {
    const html = renderHtml(<CtaSection section={contact} />);
    expect(html).toContain("contact-cta");
    expect(html).toContain("Unsure if counselling is right for you?");
    expect(html).toContain("There is no obligation to commit!");
    expect(html).toContain("btn-primary");
    expect(html).toContain('href="/booking/"');
  });

  it("faq variant renders the form fields and no booking button", () => {
    const html = renderHtml(<CtaSection section={faq} />);
    expect(html).toContain("faq-cta-section");
    expect(html).toContain("Did not find what you&#x27;re looking for?");
    expect(html).toContain("<form");
    expect(html).toContain('type="email"');
    expect(html).toContain("<textarea");
    expect(html).not.toContain("btn-primary");
  });
});
