import { describe, it, expect } from "vitest";
import { assembleHome, buildRestPages, assembleSite, type RestSeed } from "./assemble";
import { sampleContent, zHomeContent, zRestContent, zSiteContent } from "../content";
import { sampleAnswers } from "../onboarding-answers";
import { zSiteDocument } from "../schema";

// Zod strips unknown keys, so parsing the full fixture yields clean phase-1 / phase-2 payloads.
const home = zHomeContent.parse(sampleContent);
const rest = zRestContent.parse(sampleContent);
const seed: RestSeed = {
  siteName: sampleContent.siteName,
  specialty: sampleContent.specialty,
  tagline: sampleContent.tagline,
};

describe("content schema partition (ADR-0011)", () => {
  it("home and rest keys are disjoint and together equal the full schema", () => {
    const homeKeys = Object.keys(zHomeContent.shape);
    const restKeys = Object.keys(zRestContent.shape);
    expect(homeKeys.filter((k) => restKeys.includes(k))).toEqual([]); // no overlap
    expect(new Set([...homeKeys, ...restKeys])).toEqual(new Set(Object.keys(zSiteContent.shape)));
  });
});

describe("assembleHome (phase 1)", () => {
  const doc = assembleHome(home, sampleAnswers, { presetId: "harbor" });

  it("is schema-valid with the full 5-page structure and nav", () => {
    expect(zSiteDocument.safeParse(doc).success).toBe(true);
    expect(doc.pages.map((p) => p.slug)).toEqual(["home", "about", "therapy", "faq", "contact"]);
    expect(doc.nav.map((n) => n.href)).toEqual(["/about/", "/therapy/", "/faq/", "/contact/"]);
  });

  it("builds the home and contact pages immediately", () => {
    const homePage = doc.pages.find((p) => p.slug === "home")!;
    expect(homePage.sections.some((s) => s.type === "hero")).toBe(true);
    expect(homePage.sections.some((s) => s.type === "testimonial")).toBe(true);
    const contact = doc.pages.find((p) => p.slug === "contact")!;
    expect(contact.sections.some((s) => s.type === "contact")).toBe(true);
  });

  it("leaves about/therapy/faq as single placeholders until the rest is built", () => {
    for (const slug of ["about", "therapy", "faq"]) {
      const page = doc.pages.find((p) => p.slug === slug)!;
      expect(page.sections).toHaveLength(1);
      expect(page.sections[0].type).toBe("richText"); // placeholder, not real content
      expect(page.seoTitle).toBeTruthy(); // SEO still set so the page isn't broken
    }
  });

  it("the home CTA targets the contact page, which exists in phase 1", () => {
    const cta = doc.pages[0].sections.find((s) => s.type === "cta");
    if (cta?.type === "cta") expect(cta.button?.href).toBe("/contact/");
    expect(doc.pages.some((p) => p.slug === "contact")).toBe(true);
  });
});

describe("buildRestPages (phase 2)", () => {
  const pages = buildRestPages(rest, sampleAnswers, seed);

  it("returns the three deferred pages, filled with real content", () => {
    expect(pages.map((p) => p.slug)).toEqual(["about", "therapy", "faq"]);
    const therapy = pages.find((p) => p.slug === "therapy")!;
    expect(therapy.sections.some((s) => s.type === "accordion")).toBe(true);
    expect(therapy.sections.some((s) => s.type === "services")).toBe(true);
    const faq = pages.find((p) => p.slug === "faq")!;
    expect(faq.sections.some((s) => s.type === "accordion")).toBe(true);
  });

  it("needs no phase-1 copy — only verbatim facts + the small seed", () => {
    // Smoke: building with just rest content, answers and seed must not throw or reference home.
    expect(() => buildRestPages(rest, sampleAnswers, seed)).not.toThrow();
  });
});

describe("phased output == one-shot output (composition invariant)", () => {
  it("assembleHome + spliced buildRestPages deep-equals assembleSite", () => {
    const shell = assembleHome(home, sampleAnswers, { presetId: "harbor" });
    const filled = new Map(buildRestPages(rest, sampleAnswers, seed).map((p) => [p.slug, p]));
    const merged = { ...shell, pages: shell.pages.map((p) => filled.get(p.slug) ?? p) };
    const oneShot = assembleSite(sampleContent, sampleAnswers, { presetId: "harbor" });
    expect(merged).toEqual(oneShot);
  });
});
