import type { OnboardingAnswers } from "../site/onboarding-answers";
import type { RestSeed } from "../site/template/assemble";

/**
 * Build the system + user prompt for MVP content-slot generation (ADR-0010, ADR-0011).
 *
 * Generation is phased: `"home"` writes the home + contact copy (and extracts
 * siteName/specialty/tagline); `"rest"` writes the about/therapy/faq copy later, seeded with
 * the already-decided site name/specialty/tagline so it stays consistent; `"full"` is the
 * one-shot/sample path. The matching JSON Schema is supplied separately by the StructuredLLM
 * request; the model never chooses structure, theme, SEO or nav, and must not restate the
 * therapist's verbatim facts (name, credentials, location, contact) — those are passed through
 * by `assembleSite`. Validation/retry live in `generate-content`.
 */
export type ContentScope = "home" | "rest" | "full";

const SYSTEM = [
  "You are an expert web copywriter who writes websites for private therapists. You write",
  "in a warm, human, grounded voice — never corporate, never salesy, never clinical. Your",
  "copy sounds like a thoughtful therapist talking to a nervous prospective client.",
  "",
  "You are given a few facts from a therapist's onboarding and must return ONLY the website",
  "copy, as a structured JSON object matching the provided schema. The site's structure,",
  "colours and fonts are already decided — your job is the words.",
  "",
  "Hard rules:",
  "- Never invent facts the therapist did not give you: no fees or prices, no insurer or",
  "  payment-provider names, no testimonials or client quotes, no qualifications beyond what",
  "  was stated. If you don't have it, write around it — do not make it up.",
  "- `testimonialQuote` (when present in the schema) is the THERAPIST'S OWN reflection or",
  "  philosophy in their voice, NOT a quote attributed to a client.",
  "- Do NOT include the therapist's name, credentials, location or contact details in your",
  "  copy fields — those are added separately. Write the prose around them.",
  "- Write genuine, specific prose — no lorem ipsum, no placeholders, no '[insert ...]'.",
  "- Match the warmth and tone the therapist asked for.",
].join("\n");

function factsBlock(answers: OnboardingAnswers): string {
  return [
    `- Business name & specialty: ${answers.businessNameAndSpecialty}`,
    `- Their name: ${answers.practitionerName}`,
    `- Location: ${answers.location}`,
    `- Session format: ${answers.sessionFormat}`,
    `- Who they most enjoy working with: ${answers.idealClient}`,
    `- What drew them to this work: ${answers.background}`,
    `- Qualifications / accreditations: ${answers.credentials}`,
    `- How clients should get in touch: ${answers.contactPreference}`,
    `- How the site should feel: ${answers.tone}`,
  ].join("\n");
}

function taskFor(scope: ContentScope, seed?: RestSeed): string {
  if (scope === "home") {
    return [
      "Write the HOME page copy plus a short CONTACT page heading + intro, as JSON matching the",
      "schema. Also extract `siteName`, `specialty` and a one-line `tagline` cleanly from the",
      "business/specialty answer.",
      "Focus on a compelling hero, a warm welcome intro, the info cards, the home 'about' teaser,",
      "a testimonial-style reflection in the therapist's own voice, and the home call-to-action.",
      "Speak to the kind of client they most enjoy working with.",
    ].join("\n");
  }
  if (scope === "rest") {
    return [
      `This is the same therapist whose home page is already written. Their site is "${seed?.siteName ?? ""}"`,
      `— ${seed?.specialty ?? ""}. Tagline: "${seed?.tagline ?? ""}". Stay consistent with that in tone`,
      "and framing; do not contradict it, and do not restate the site name or specialty as facts.",
      "",
      "Write the ABOUT, THERAPY and FAQ page copy as JSON matching the schema: the bio narrative",
      "(grounded in what drew them to the work, first person), how they work, the therapy intro",
      "and modality, the areas they support, the services, and genuinely useful FAQ answers —",
      "without inventing fees, insurers or policies they didn't mention.",
    ].join("\n");
  }
  return [
    "Write the website copy as JSON matching the schema. Speak to the kind of client they",
    "most enjoy working with. Make the hero and about narrative specific to this therapist,",
    "and write FAQ answers that are genuinely useful without inventing fees, insurers or",
    "policies they didn't mention. Extract `siteName` and `specialty` cleanly from the answer.",
  ].join("\n");
}

export function buildContentPrompt(
  answers: OnboardingAnswers,
  scope: ContentScope = "full",
  seed?: RestSeed,
): { system: string; prompt: string } {
  const prompt = [
    "Here is what the therapist told us during onboarding:",
    "",
    factsBlock(answers),
    "",
    taskFor(scope, seed),
  ].join("\n");

  return { system: SYSTEM, prompt };
}
