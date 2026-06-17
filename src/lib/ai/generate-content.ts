import { z } from "zod";
import { zSiteContent, type SiteContent } from "../site/content";
import type { OnboardingAnswers } from "../site/onboarding-answers";
import { buildContentPrompt } from "./content-prompt";
import type { StructuredLLM } from "./provider";

const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Generate the per-therapist content slots (ADR-0010) using any StructuredLLM, then validate
 * against `zSiteContent`, retrying with the validation error fed back until it conforms.
 *
 * Mirrors `generateSite` but targets the small flat content payload rather than a whole
 * SiteDocument — far cheaper, fewer retries. Provider-agnostic (ADR-0008): depends only on
 * the StructuredLLM interface. `assembleSite` turns the result into a SiteDocument.
 */
export async function generateContent(
  answers: OnboardingAnswers,
  llm: StructuredLLM,
  opts: { maxAttempts?: number } = {},
): Promise<SiteContent> {
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const { system, prompt } = buildContentPrompt(answers);
  const jsonSchema = z.toJSONSchema(zSiteContent) as Record<string, unknown>;

  let lastErrorText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptPrompt = lastErrorText
      ? `${prompt}\n\nYour previous attempt did not conform to the schema:\n${lastErrorText}\n\nReturn corrected JSON.`
      : prompt;

    const raw = await llm.generateStructured({
      system,
      prompt: attemptPrompt,
      jsonSchema,
      schemaName: "site_content",
      schemaDescription: "The per-therapist website copy slots.",
    });

    const parsed = zSiteContent.safeParse(raw);
    if (parsed.success) return parsed.data;
    lastErrorText = formatIssues(parsed.error);
  }

  throw new Error(
    `Could not generate valid site content after ${maxAttempts} attempt(s). Last validation error:\n${lastErrorText}`,
  );
}

/** Compact, model-readable summary of why validation failed. */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 20)
    .map((issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}
