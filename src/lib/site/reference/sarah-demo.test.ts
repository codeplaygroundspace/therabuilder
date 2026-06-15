import { describe, it, expect } from "vitest";
import { zSiteDocument } from "../schema";
import { sarahDemo } from "./sarah-demo";

describe("sarah-demo reference instance", () => {
  it("parses successfully through zSiteDocument", () => {
    expect(() => zSiteDocument.parse(sarahDemo)).not.toThrow();
  });

  it("has all six pages", () => {
    const parsed = zSiteDocument.parse(sarahDemo);
    expect(parsed.pages.map((p) => p.slug).sort()).toEqual([
      "about",
      "contact",
      "faq",
      "home",
      "resources",
      "therapy",
    ]);
  });

  it("includes the FAQ accordion with ten items", () => {
    const parsed = zSiteDocument.parse(sarahDemo);
    const faq = parsed.pages.find((p) => p.slug === "faq")!;
    const accordion = faq.sections.find((s) => s.type === "accordion");
    expect(
      accordion && accordion.type === "accordion" && accordion.items.length,
    ).toBe(10);
  });
});
