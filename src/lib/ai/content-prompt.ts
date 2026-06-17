import type { OnboardingAnswers } from "../site/onboarding-answers";

/**
 * Build the system + user prompt for MVP content-slot generation (ADR-0010).
 *
 * The model fills the per-therapist *copy* only — the JSON Schema for `zSiteContent` is
 * supplied separately via the StructuredLLM request. It does NOT choose structure, theme,
 * SEO or nav (those are fixed), and it must NOT restate the therapist's name, credentials,
 * location or contact details (those are passed through verbatim by `assembleSite`).
 * Validation/retry live in `generateContent`.
 */
export function buildContentPrompt(answers: OnboardingAnswers): {
  system: string;
  prompt: string;
} {
  const system = [
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
    "- `testimonialQuote` is the THERAPIST'S OWN reflection or philosophy in their voice, NOT a",
    "  quote attributed to a client.",
    "- Do NOT include the therapist's name, credentials, location or contact details in your",
    "  copy fields — those are added separately. Write the prose around them.",
    "- For `siteName` and `specialty`, extract them cleanly from the business/specialty answer.",
    "- Ground the about/bio narrative in what drew them to the work, in the first person.",
    "- Write genuine, specific prose — no lorem ipsum, no placeholders, no '[insert ...]'.",
    "- Match the warmth and tone the therapist asked for.",
  ].join("\n");

  const prompt = [
    "Here is what the therapist told us during onboarding:",
    "",
    `- Business name & specialty: ${answers.businessNameAndSpecialty}`,
    `- Their name: ${answers.practitionerName}`,
    `- Location: ${answers.location}`,
    `- Session format: ${answers.sessionFormat}`,
    `- Who they most enjoy working with: ${answers.idealClient}`,
    `- What drew them to this work: ${answers.background}`,
    `- Qualifications / accreditations: ${answers.credentials}`,
    `- How clients should get in touch: ${answers.contactPreference}`,
    `- How the site should feel: ${answers.tone}`,
    "",
    "Write the website copy as JSON matching the schema. Speak to the kind of client they",
    "most enjoy working with. Make the hero and about narrative specific to this therapist,",
    "and write FAQ answers that are genuinely useful without inventing fees, insurers or",
    "policies they didn't mention.",
  ].join("\n");

  return { system, prompt };
}
