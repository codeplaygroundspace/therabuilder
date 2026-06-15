import { describe, it, expect } from "vitest";
import { generateSite } from "./generate-site";
import type { StructuredLLM, StructuredRequest } from "./provider";
import { sampleAnswers } from "../site/onboarding-answers";
import { sarahDemo } from "../site/reference/sarah-demo";

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

// A valid raw response: the reference instance is a known-good SiteDocument.
const validDoc = JSON.parse(JSON.stringify(sarahDemo));
const invalidDoc = { schemaVersion: 1, pages: "not an array" };

describe("generateSite", () => {
  it("returns a schema-valid document when the model output is valid", async () => {
    const llm = new MockLLM([validDoc]);
    const result = await generateSite(sampleAnswers, llm);
    expect(result.pages.length).toBeGreaterThan(0);
    expect(llm.calls.length).toBe(1);
  });

  it("passes a JSON Schema and the built prompt to the provider", async () => {
    const llm = new MockLLM([validDoc]);
    await generateSite(sampleAnswers, llm);
    const req = llm.calls[0];
    expect(req.jsonSchema).toBeTypeOf("object");
    expect(req.prompt).toContain(sampleAnswers.practitionerName);
    expect(req.system).toBeTruthy();
  });

  it("retries when the first output fails validation, then succeeds", async () => {
    const llm = new MockLLM([invalidDoc, validDoc]);
    const result = await generateSite(sampleAnswers, llm);
    expect(result.pages.length).toBeGreaterThan(0);
    expect(llm.calls.length).toBe(2);
    // the retry should feed the validation error back into the prompt
    expect(llm.calls[1].prompt).not.toBe(llm.calls[0].prompt);
  });

  it("throws a clear error after exhausting attempts", async () => {
    const llm = new MockLLM([invalidDoc]);
    await expect(generateSite(sampleAnswers, llm, { maxAttempts: 2 })).rejects.toThrow(
      /valid SiteDocument/i,
    );
    expect(llm.calls.length).toBe(2);
  });
});
