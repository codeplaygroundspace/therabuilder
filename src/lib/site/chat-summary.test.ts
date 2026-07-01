import { describe, it, expect } from "vitest";
import { summarize } from "./chat-summary";
import { emptyAnswers, sampleAnswers } from "./onboarding-answers";

describe("summarize (onboarding chat panel)", () => {
  it("returns no rows when nothing has been answered", () => {
    expect(summarize(emptyAnswers())).toEqual([]);
  });

  it("includes only answered fields, in flow order, so the panel grows as you go", () => {
    const rows = summarize({
      businessNameAndSpecialty: "Calm Harbor Therapy — CBT for anxiety",
      practitionerName: "Maya",
      location: "Brighton",
    });
    expect(rows.map((r) => r.key)).toEqual([
      "businessNameAndSpecialty",
      "practitionerName",
      "location",
    ]);
    expect(rows[0].label).toBe("Practice");
  });

  it("skips blank/whitespace answers (skipped questions)", () => {
    const rows = summarize({ practitionerName: "Maya", location: "   " });
    expect(rows.map((r) => r.key)).toEqual(["practitionerName"]);
  });

  it("appends a Look row only when a preset has been chosen", () => {
    expect(summarize({ practitionerName: "Maya" }).some((r) => r.key === "look")).toBe(false);
    const withLook = summarize({ practitionerName: "Maya" }, "Harbor Blue");
    const look = withLook.find((r) => r.key === "look")!;
    expect(look.value).toBe("Harbor Blue");
  });

  it("tidies whitespace and softly truncates very long answers", () => {
    const long = "word ".repeat(80); // 400 chars
    const [row] = summarize({ idealClient: `  lots\n\nof   space  ` });
    expect(row.value).toBe("lots of space");

    const [truncated] = summarize({ idealClient: long });
    expect(truncated.value.length).toBeLessThanOrEqual(161); // 160 + ellipsis
    expect(truncated.value.endsWith("…")).toBe(true);
  });

  it("summarises a full, realistic answer set", () => {
    const rows = summarize(sampleAnswers, "Sage & Stone");
    expect(rows).toHaveLength(10); // 9 answers + look
    expect(rows.at(-1)).toEqual({ key: "look", label: "Look", value: "Sage & Stone" });
  });
});
