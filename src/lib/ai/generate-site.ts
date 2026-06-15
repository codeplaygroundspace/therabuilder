import { z } from "zod";
import { zSiteDocument, type SiteDocument } from "../site/schema";
import type { OnboardingAnswers } from "../site/onboarding-answers";
import { buildSitePrompt } from "./prompt";
import type { StructuredLLM } from "./provider";

const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Turn onboarding answers into a validated SiteDocument using any StructuredLLM.
 *
 * Provider-agnostic: depends only on the `StructuredLLM` interface (ADR-0008), never on a
 * vendor SDK. Owns the validate-and-retry loop — the provider returns raw output, this
 * validates it against `zSiteDocument` and re-requests (feeding the validation error back)
 * until it conforms or attempts run out.
 */
export async function generateSite(
  answers: OnboardingAnswers,
  llm: StructuredLLM,
  opts: { maxAttempts?: number } = {},
): Promise<SiteDocument> {
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const { system, prompt } = buildSitePrompt(answers);
  const jsonSchema = z.toJSONSchema(zSiteDocument) as Record<string, unknown>;

  let lastErrorText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptPrompt = lastErrorText
      ? `${prompt}\n\nYour previous attempt did not conform to the schema:\n${lastErrorText}\n\nReturn a corrected JSON document.`
      : prompt;

    const raw = await llm.generateStructured({
      system,
      prompt: attemptPrompt,
      jsonSchema,
      schemaName: "site_document",
      schemaDescription: "A complete therapist website (content + theme).",
    });

    const parsed = zSiteDocument.safeParse(raw);
    if (parsed.success) return parsed.data;
    lastErrorText = formatIssues(parsed.error);
  }

  throw new Error(
    `Could not generate a valid SiteDocument after ${maxAttempts} attempt(s). Last validation error:\n${lastErrorText}`,
  );
}

/** Compact, model-readable summary of why validation failed. */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 20)
    .map((issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}
