/**
 * Provider-agnostic structured-output interface (see ADR-0008).
 *
 * All AI model access goes through this interface so the provider (Anthropic today,
 * Google/Gemini or others later) is swappable WITHOUT touching call sites. Vendor SDKs
 * live only inside implementations of this interface — never in the site generator or
 * any other consumer.
 *
 * The interface is deliberately Zod-agnostic: it speaks JSON Schema (a universal contract)
 * and returns the model's raw structured output. **Validation and retry are the caller's
 * concern**, not the provider's — the caller owns the Zod schema, validates the result, and
 * re-requests on failure. This keeps adapters dumb (tool-use in, parsed JSON out) and makes
 * the validate/retry loop testable with a mock, no network required.
 */
export interface StructuredLLM {
  /**
   * Ask the model for output conforming to `request.jsonSchema` and return the parsed-but-
   * UNVALIDATED structured value. Implementations do not validate against the schema or
   * retry on semantic mismatch — they only guarantee a parsed JSON value (or reject on a
   * transport/parse error). Callers must validate the returned `unknown`.
   */
  generateStructured(request: StructuredRequest): Promise<unknown>;
}

/** A single structured-generation request. */
export interface StructuredRequest {
  /** High-level instructions / role for the model (the "system" prompt). */
  system?: string;
  /** The task prompt — e.g. the onboarding answers plus what to produce. */
  prompt: string;
  /**
   * JSON Schema describing the required output shape. Derive it from the caller's Zod
   * schema with `z.toJSONSchema(...)`. Implementations use it to constrain the model's
   * structured output (e.g. as a tool's `input_schema`).
   */
  jsonSchema: Record<string, unknown>;
  /** Optional name for the output contract (some providers expose it as a tool name). */
  schemaName?: string;
  /** Optional description of the output contract. */
  schemaDescription?: string;
  /** Optional cap on output tokens. */
  maxTokens?: number;
  /** Optional sampling temperature (0–1). */
  temperature?: number;
}
