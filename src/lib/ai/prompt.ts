import type { OnboardingAnswers } from "../site/onboarding-answers";

/**
 * Build the system + user prompt that turns onboarding answers into a SiteDocument.
 *
 * The JSON Schema contract is supplied separately to the model (via the StructuredLLM
 * request); this prompt describes the *task and voice*. Validation/retry happen in
 * `generateSite`, not here.
 */
export function buildSitePrompt(answers: OnboardingAnswers): {
  system: string;
  prompt: string;
} {
  const system = [
    "You are an expert web copywriter and information architect who builds websites for",
    "private therapists. You write in a warm, human, grounded voice — never corporate,",
    "never salesy, never clinical. Your copy sounds like a thoughtful therapist talking to",
    "a nervous prospective client.",
    "",
    "You will be given a few facts a therapist provided during onboarding, and you must",
    "produce a complete multi-page website as a single structured JSON document that",
    "conforms exactly to the provided schema.",
    "",
    "Hard rules:",
    "- Do NOT fabricate or invent facts the therapist did not give you. In particular, never",
    "  make up fees/prices, insurer or payment-provider names, testimonials or client quotes,",
    "  or credentials/qualifications beyond what was stated. Omit those rather than invent them.",
    "- Use the therapist's real name, location, specialty and credentials exactly as given.",
    "- Choose sections from the schema's section types only; never invent new section types or",
    "  layouts. Vary which sections appear and in what order to suit this therapist.",
    "- Write genuine, specific prose — no lorem ipsum, no placeholder text, no '[insert ...]'.",
    "- Match the colour palette and font choice to the requested tone.",
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
    "Produce a complete website as a JSON document with multiple pages — at least a home",
    "page, an about page, a therapy/services page, an FAQ page, and a contact page. Each",
    "page is an ordered list of sections drawn from the schema's section types. Write a",
    "compelling hero, a warm about narrative grounded in what drew them to this work,",
    "service/specialty sections reflecting who they help, and a realistic FAQ. Fill the SEO",
    "title and description for every page, and choose a theme (palette + fonts) that fits the",
    "requested tone.",
  ].join("\n");

  return { system, prompt };
}
