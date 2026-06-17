import { z } from "zod";
import {
  zSiteContent,
  zHomeContent,
  zRestContent,
  type SiteContent,
  type HomeContent,
  type RestContent,
} from "../site/content";
import type { OnboardingAnswers } from "../site/onboarding-answers";
import type { RestSeed } from "../site/template/assemble";
import { buildContentPrompt } from "./content-prompt";
import type { StructuredLLM } from "./provider";

const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Generate per-therapist content slots (ADR-0010/0011) with any StructuredLLM, validating
 * against the given Zod schema and retrying with the validation error fed back until it
 * conforms. Provider-agnostic (ADR-0008): depends only on the StructuredLLM interface.
 *
 * Phased (ADR-0011): {@link generateHomeContent} writes home + contact up front;
 * {@link generateRestContent} writes about/therapy/faq later, on request, seeded with the
 * already-decided site name/specialty/tagline. {@link generateContent} is the one-shot path.
 */
async function generateValidated<T>(
  schema: z.ZodType<T>,
  base: { system: string; prompt: string },
  schemaName: string,
  schemaDescription: string,
  llm: StructuredLLM,
  maxAttempts: number,
): Promise<T> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;

  let lastErrorText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const prompt = lastErrorText
      ? `${base.prompt}\n\nYour previous attempt did not conform to the schema:\n${lastErrorText}\n\nReturn corrected JSON.`
      : base.prompt;

    const raw = await llm.generateStructured({
      system: base.system,
      prompt,
      jsonSchema,
      schemaName,
      schemaDescription,
    });

    const parsed = schema.safeParse(raw);
    if (parsed.success) return parsed.data;
    lastErrorText = formatIssues(parsed.error);
  }

  throw new Error(
    `Could not generate valid ${schemaName} after ${maxAttempts} attempt(s). Last validation error:\n${lastErrorText}`,
  );
}

/** Phase 1: the home + contact copy (and extracted siteName/specialty/tagline). */
export function generateHomeContent(
  answers: OnboardingAnswers,
  llm: StructuredLLM,
  opts: { maxAttempts?: number } = {},
): Promise<HomeContent> {
  return generateValidated(
    zHomeContent,
    buildContentPrompt(answers, "home"),
    "home_content",
    "The home + contact page copy for the therapist's site.",
    llm,
    opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
  );
}

/** Phase 2: the about/therapy/faq copy, seeded with the decided site name/specialty/tagline. */
export function generateRestContent(
  answers: OnboardingAnswers,
  seed: RestSeed,
  llm: StructuredLLM,
  opts: { maxAttempts?: number } = {},
): Promise<RestContent> {
  return generateValidated(
    zRestContent,
    buildContentPrompt(answers, "rest", seed),
    "rest_content",
    "The about, therapy and FAQ page copy for the therapist's site.",
    llm,
    opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
  );
}

/** One-shot: the complete content payload (sample/demo path). */
export function generateContent(
  answers: OnboardingAnswers,
  llm: StructuredLLM,
  opts: { maxAttempts?: number } = {},
): Promise<SiteContent> {
  return generateValidated(
    zSiteContent,
    buildContentPrompt(answers, "full"),
    "site_content",
    "The per-therapist website copy slots.",
    llm,
    opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
  );
}

/** Compact, model-readable summary of why validation failed. */
function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 20)
    .map((issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}
