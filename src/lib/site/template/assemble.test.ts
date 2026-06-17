import { describe, it, expect } from "vitest";
import { assembleSite } from "./assemble";
import { sampleContent, zSiteContent } from "../content";
import { sampleAnswers } from "../onboarding-answers";
import { zSiteDocument } from "../schema";
import { getPreset, PRESETS } from "../theme/presets";

describe("assembleSite", () => {
  const doc = assembleSite(sampleContent, sampleAnswers);

  it("produces a schema-valid SiteDocument", () => {
    expect(zSiteDocument.safeParse(doc).success).toBe(true);
  });

  it("uses the fixed 5-page structure (no logoStrip / blog page)", () => {
    expect(doc.pages.map((p) => p.slug)).toEqual([
      "home",
      "about",
      "therapy",
      "faq",
      "contact",
    ]);
    const types = doc.pages.flatMap((p) => p.sections.map((s) => s.type));
    expect(types).not.toContain("logoStrip");
    expect(types).not.toContain("resourcesGrid");
  });

  it("passes verbatim facts through from answers, untouched", () => {
    expect(doc.practitioner.name).toBe("Dr. Maya Ellis");
    expect(doc.practitioner.credentials).toEqual([
      "BABCP-accredited CBT therapist",
      "PG Dip in Cognitive Behavioural Therapy",
      "HCPC registered",
    ]);
    expect(doc.contact.locations.length).toBeGreaterThan(0);
    expect(doc.contact.availability).toBe(sampleAnswers.sessionFormat.trim());
  });

  it("uses AI-extracted siteName/specialty for the brand", () => {
    expect(doc.meta.siteName).toBe(sampleContent.siteName);
    expect(doc.practitioner.specialty).toBe(sampleContent.specialty);
  });

  it("attributes the testimonial to the therapist, not an invented client", () => {
    const t = doc.pages[0].sections.find((s) => s.type === "testimonial");
    expect(t).toBeTruthy();
    if (t?.type === "testimonial") expect(t.attribution).toBe("Dr. Maya Ellis");
  });

  it("applies the chosen preset's theme", () => {
    const themed = assembleSite(sampleContent, sampleAnswers, { presetId: "harbor" });
    expect(themed.theme).toEqual(getPreset("harbor").theme);
    expect(themed.theme).not.toEqual(getPreset("sage").theme);
  });

  it("FAITHFULNESS: invents no fees, insurers, or unstated credentials", () => {
    const serialized = JSON.stringify(doc);
    for (const banned of [
      "£",
      "Aviva",
      "AXA",
      "BUPA",
      "Bupa",
      "Vitality",
      "WPA",
      "EMDR",
    ]) {
      expect(serialized).not.toContain(banned);
    }
  });

  it("omits contact email/booking when the answer provides none", () => {
    // sampleAnswers.contactPreference mentions a form/email/booking generically but no
    // concrete address or URL — so the optional fields must stay empty.
    const noContact = { ...sampleAnswers, contactPreference: "A simple contact form." };
    const d = assembleSite(sampleContent, noContact);
    expect(d.contact.email).toBeUndefined();
    expect(d.contact.bookingUrl).toBeUndefined();
  });

  it("populates contact email/booking when present in the answer", () => {
    const withContact = {
      ...sampleAnswers,
      contactPreference: "Email me at hi@calmharbor.co.uk or book at https://book.example.com/maya",
    };
    const d = assembleSite(sampleContent, withContact);
    expect(d.contact.email).toBe("hi@calmharbor.co.uk");
    expect(d.contact.bookingUrl).toBe("https://book.example.com/maya");
  });
});

describe("content + presets", () => {
  it("the sample fixture conforms to zSiteContent", () => {
    expect(zSiteContent.safeParse(sampleContent).success).toBe(true);
  });

  it("every preset has a unique id and an 8-key palette", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRESETS) {
      expect(Object.keys(p.theme.palette)).toHaveLength(8);
      expect(p.theme.fonts.display).toBeTruthy();
      expect(p.theme.fonts.body).toBeTruthy();
    }
  });
});
