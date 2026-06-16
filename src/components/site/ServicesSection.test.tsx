import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { ServicesSection } from "./ServicesSection";
import type { Section } from "@/lib/site/sections";

type Services = Extract<Section, { type: "services" }>;

const section: Services = {
  type: "services",
  label: "Approach and specialties",
  heading: "A practical toolbox for lasting change.",
  body: "Sarah works with a practical, conversational approach.",
  items: [
    { title: "Anxiety and overwhelm", copy: "Slow the spiral." },
    { title: "Burnout and stress", copy: "Rebuild space and boundaries." },
    { title: "Confidence and life transitions", copy: "Find firmer ground." },
  ],
};

describe("ServicesSection", () => {
  it("renders the label, heading and body", () => {
    const html = renderHtml(<ServicesSection section={section} />);
    expect(html).toContain("Approach and specialties");
    expect(html).toContain("A practical toolbox for lasting change.");
    expect(html).toContain("Sarah works with a practical");
  });

  it("renders one card per item with its title and copy, each with a placeholder", () => {
    const html = renderHtml(<ServicesSection section={section} />);
    const cardCount = (html.match(/service-card/g) ?? []).length;
    expect(cardCount).toBe(3);
    expect(html).toContain("Anxiety and overwhelm");
    expect(html).toContain("Burnout and stress");
    expect(html).toContain("Confidence and life transitions");
    expect(html).toContain("Find firmer ground.");
    const placeholderCount = (html.match(/role="img"/g) ?? []).length;
    expect(placeholderCount).toBe(3);
    expect(html).not.toContain("<img");
  });
});
