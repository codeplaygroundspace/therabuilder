import type { ZodType } from "zod";

/**
 * Provider-agnostic structured-output interface (see ADR-0008).
 *
 * All AI model access goes through this interface so the provider (Anthropic today,
 * Google/Gemini or others later) is swappable WITHOUT touching call sites. Vendor SDKs
 * live only inside implementations of this interface — never in the site generator or
 * any other consumer.
 */
export interface StructuredLLM {
  /**
   * Generate a value that conforms to `request.schema`.
   *
   * The implementation is responsible for prompting the model for structured output,
   * parsing the response, and validating it against the schema (retrying on validation
   * failure up to its own limit). Resolves with the validated value, or rejects if it
   * cannot produce conforming output.
   */
  generateStructured<T>(request: StructuredRequest<T>): Promise<T>;
}

/** A single structured-generation request. */
export interface StructuredRequest<T> {
  /** High-level instructions / role for the model (the "system" prompt). */
  system?: string;
  /** The task prompt — e.g. the onboarding answers plus what to produce. */
  prompt: string;
  /**
   * The Zod schema the output must satisfy. Used both to validate the model's output
   * and (by implementations) to derive the structured-output contract sent to the model.
   */
  schema: ZodType<T>;
  /** Optional cap on output tokens. */
  maxTokens?: number;
  /** Optional sampling temperature (0–1). */
  temperature?: number;
}
