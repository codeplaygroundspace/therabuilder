import { describe, it, expect } from "vitest";
import { setByPath, getString } from "./update";
import { editableFields } from "./fields";
import { assembleSite } from "../template/assemble";
import { sampleContent } from "../content";
import { sampleAnswers } from "../onboarding-answers";
import { PRESETS } from "../theme/presets";
import { zSiteDocument } from "../schema";

const doc = () => assembleSite(sampleContent, sampleAnswers, { presetId: "sage" });

describe("setByPath", () => {
  it("sets a nested scalar without mutating the original", () => {
    const before = doc();
    const after = setByPath(before, ["meta", "siteName"], "New Name");
    expect(after.meta.siteName).toBe("New Name");
    expect(before.meta.siteName).not.toBe("New Name"); // original untouched
    expect(after).not.toBe(before);
    expect(after.pages).toBe(before.pages); // structural sharing off the path
  });

  it("sets an array element by index", () => {
    const before = doc();
    const path = ["pages", 0, "sections", 1, "paragraphs", 0];
    const after = setByPath(before, path, "Rewritten intro.");
    expect(getString(after, path)).toBe("Rewritten intro.");
    expect(getString(before, path)).not.toBe("Rewritten intro.");
  });

  it("swaps the whole theme via path ['theme']", () => {
    const before = doc();
    const harbor = PRESETS.find((p) => p.id === "harbor")!;
    const after = setByPath(before, ["theme"], harbor.theme);
    expect(after.theme).toEqual(harbor.theme);
    expect(before.theme).not.toEqual(harbor.theme);
  });

  it("keeps the document schema-valid after an edit", () => {
    const after = setByPath(doc(), ["meta", "siteName"], "Edited");
    expect(zSiteDocument.safeParse(after).success).toBe(true);
  });
});

describe("editableFields", () => {
  it("exposes the site-details chrome and known section copy", () => {
    const groups = editableFields(doc());
    const site = groups.find((g) => g.id === "site")!;
    expect(site.fields.map((f) => f.label)).toContain("Site name");

    const allLabels = groups.flatMap((g) => g.fields.map((f) => f.label));
    expect(allLabels).toContain("Heading"); // the hero heading, at least
    expect(groups.length).toBeGreaterThan(1); // chrome + sections
  });

  it("reads current values live from the document", () => {
    const d = doc();
    const groups = editableFields(d);
    const siteName = groups
      .flatMap((g) => g.fields)
      .find((f) => f.label === "Site name")!;
    expect(siteName.value).toBe(d.meta.siteName);
  });

  it("FAIL-CLOSED: never exposes a structural field", () => {
    // The discriminating safety check — if any of these became editable, a user edit could
    // break the discriminated-union schema or the renderer (broken href/src/slug).
    const forbidden = new Set([
      "type",
      "href",
      "src",
      "alt",
      "slug",
      "variant",
      "imagePosition",
      "icon",
      "schemaVersion",
    ]);
    for (const group of editableFields(doc())) {
      for (const f of group.fields) {
        for (const segment of f.path) {
          expect(forbidden.has(String(segment))).toBe(false);
        }
      }
    }
  });

  it("every derived field path resolves to a string in the document", () => {
    const d = doc();
    for (const group of editableFields(d)) {
      for (const f of group.fields) {
        // chrome optional fields (email/phone/location) may be absent → getString gives ""
        expect(typeof getString(d, f.path)).toBe("string");
      }
    }
  });

  it("round-trips: editing a derived field changes only that field's value", () => {
    const d = doc();
    const target = editableFields(d)
      .flatMap((g) => g.fields)
      .find((f) => f.label === "Heading" && f.path.includes("sections"))!;
    const edited = setByPath(d, target.path, "A brand new heading");
    const after = editableFields(edited)
      .flatMap((g) => g.fields)
      .find((f) => f.id === target.id)!;
    expect(after.value).toBe("A brand new heading");
  });
});
