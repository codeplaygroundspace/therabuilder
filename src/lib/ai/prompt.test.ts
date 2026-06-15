import { describe, it, expect } from "vitest";
import { buildSitePrompt } from "./prompt";
import { sampleAnswers } from "../site/onboarding-answers";

describe("buildSitePrompt", () => {
  const { system, prompt } = buildSitePrompt(sampleAnswers);

  it("includes every onboarding answer in the prompt", () => {
    for (const value of Object.values(sampleAnswers)) {
      expect(prompt).toContain(value);
    }
  });

  it("instructs a warm therapist voice in the system prompt", () => {
    expect(system.toLowerCase()).toContain("therapist");
    expect(system.toLowerCase()).toMatch(/warm|human|voice/);
  });

  it("tells the model not to fabricate facts the user did not give", () => {
    expect(system.toLowerCase()).toMatch(/fabricat|invent|made up|do not make up/);
    // fees / insurers / testimonials are the named no-go facts (ADR-0008)
    expect(system.toLowerCase()).toMatch(/fee|insurer|testimonial/);
  });

  it("references the multi-page structure it should produce", () => {
    expect(prompt.toLowerCase()).toMatch(/page|section/);
  });
});
