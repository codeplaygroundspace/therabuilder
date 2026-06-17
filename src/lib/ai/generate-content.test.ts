import { describe, it, expect } from "vitest";
import {
  generateContent,
  generateHomeContent,
  generateRestContent,
} from "./generate-content";
import type { StructuredLLM, StructuredRequest } from "./provider";
import { sampleAnswers } from "../site/onboarding-answers";
import { sampleContent, zHomeContent, zRestContent } from "../site/content";

/** A scripted StructuredLLM: returns the next canned response per call, records requests. */
class MockLLM implements StructuredLLM {
  readonly calls: StructuredRequest[] = [];
  constructor(private readonly responses: unknown[]) {}
  async generateStructured(request: StructuredRequest): Promise<unknown> {
    this.calls.push(request);
    const i = Math.min(this.calls.length - 1, this.responses.length - 1);
    return this.responses[i];
  }
}

const validContent = JSON.parse(JSON.stringify(sampleContent));
const invalidContent = { siteName: "x" }; // missing required slots

describe("generateContent", () => {
  it("returns validated content when the model output is valid", async () => {
    const llm = new MockLLM([validContent]);
    const result = await generateContent(sampleAnswers, llm);
    expect(result.siteName).toBe(sampleContent.siteName);
    expect(result.faqs.length).toBeGreaterThan(0);
    expect(llm.calls.length).toBe(1);
  });

  it("passes a JSON Schema and the built prompt to the provider", async () => {
    const llm = new MockLLM([validContent]);
    await generateContent(sampleAnswers, llm);
    const req = llm.calls[0];
    expect(req.jsonSchema).toBeTypeOf("object");
    expect(req.prompt).toContain(sampleAnswers.businessNameAndSpecialty);
    expect(req.system).toBeTruthy();
  });

  it("retries on invalid output, feeding the error back, then succeeds", async () => {
    const llm = new MockLLM([invalidContent, validContent]);
    const result = await generateContent(sampleAnswers, llm);
    expect(result.siteName).toBe(sampleContent.siteName);
    expect(llm.calls.length).toBe(2);
    expect(llm.calls[1].prompt).not.toBe(llm.calls[0].prompt);
  });

  it("throws a clear error after exhausting attempts", async () => {
    const llm = new MockLLM([invalidContent]);
    await expect(
      generateContent(sampleAnswers, llm, { maxAttempts: 2 }),
    ).rejects.toThrow(/valid site_content/i);
    expect(llm.calls.length).toBe(2);
  });
});

const validHome = zHomeContent.parse(sampleContent);
const validRest = zRestContent.parse(sampleContent);

describe("generateHomeContent (phase 1)", () => {
  it("returns validated home content and asks for the home_content schema", async () => {
    const llm = new MockLLM([validHome]);
    const result = await generateHomeContent(sampleAnswers, llm);
    expect(result.siteName).toBe(sampleContent.siteName);
    expect(result.contactHeading).toBeTruthy();
    expect(llm.calls[0].schemaName).toBe("home_content");
    // home payload must NOT carry phase-2 fields
    expect((result as Record<string, unknown>).faqs).toBeUndefined();
  });

  it("rejects a payload missing required home slots", async () => {
    const llm = new MockLLM([{ siteName: "x" }]);
    await expect(
      generateHomeContent(sampleAnswers, llm, { maxAttempts: 1 }),
    ).rejects.toThrow(/valid home_content/i);
  });
});

describe("generateRestContent (phase 2)", () => {
  const seed = {
    siteName: sampleContent.siteName,
    specialty: sampleContent.specialty,
    tagline: sampleContent.tagline,
  };

  it("returns validated rest content and seeds the prompt for consistency", async () => {
    const llm = new MockLLM([validRest]);
    const result = await generateRestContent(sampleAnswers, seed, llm);
    expect(result.faqs.length).toBeGreaterThan(0);
    expect(result.areas.length).toBeGreaterThan(0);
    expect(llm.calls[0].schemaName).toBe("rest_content");
    expect(llm.calls[0].prompt).toContain(seed.siteName); // seeded with the decided name
  });
});
