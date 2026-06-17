import { z } from "zod";

/**
 * The facts collected by the onboarding chat (`src/lib/onboarding-flow.ts`), shaped as a
 * typed object. This is the AI generator's INPUT — everything the user actually told us,
 * which the model must respect and must not contradict or fabricate around.
 *
 * Capturing these from the live chat is #9; the spike (#4) uses the `sampleAnswers` fixture.
 */
export type OnboardingAnswers = {
  /** Q1 — business name + type of therapy. */
  businessNameAndSpecialty: string;
  /** Q2 — the practitioner's own name, as shown on the site. */
  practitionerName: string;
  /** Q3 — where they are based (or "online only"). */
  location: string;
  /** Q4 — in-person, online, or both. */
  sessionFormat: string;
  /** Q5 — who they most enjoy working with (ideal client). */
  idealClient: string;
  /** Q6 — what drew them to this work (seed for the bio). */
  background: string;
  /** Q7 — qualifications / accreditations (must not be invented by the AI). */
  credentials: string;
  /** Q8 — how new clients should reach them. */
  contactPreference: string;
  /** Q9 — how the site should feel (tone → theme + copy voice). */
  tone: string;
};

/**
 * The OnboardingAnswers keys in the exact order the chat asks them (`FLOW` in
 * `src/lib/onboarding-flow.ts`). The chat captures answers by step index and maps them back
 * to fields through this array, so question order and field order stay in lockstep.
 */
export const ANSWER_KEYS: (keyof OnboardingAnswers)[] = [
  "businessNameAndSpecialty",
  "practitionerName",
  "location",
  "sessionFormat",
  "idealClient",
  "background",
  "credentials",
  "contactPreference",
  "tone",
];

/** An OnboardingAnswers with every field blank — the starting point before the chat runs. */
export function emptyAnswers(): OnboardingAnswers {
  return {
    businessNameAndSpecialty: "",
    practitionerName: "",
    location: "",
    sessionFormat: "",
    idealClient: "",
    background: "",
    credentials: "",
    contactPreference: "",
    tone: "",
  };
}

/**
 * Runtime validation for the onboarding answers (e.g. the generation API request body).
 * Every field is a non-empty string; the chat may submit "" for skipped questions, which the
 * generator should still tolerate, so empty strings are allowed.
 */
export const zOnboardingAnswers = z.object({
  businessNameAndSpecialty: z.string(),
  practitionerName: z.string(),
  location: z.string(),
  sessionFormat: z.string(),
  idealClient: z.string(),
  background: z.string(),
  credentials: z.string(),
  contactPreference: z.string(),
  tone: z.string(),
}) satisfies z.ZodType<OnboardingAnswers>;

/**
 * A realistic sample, loosely modelled on the `sarah-demo` practitioner, used by the spike
 * so it does not depend on the live chat (#9). Deliberately gives the AI only what a real
 * onboarding would: no fees, no insurer names, no testimonials.
 */
export const sampleAnswers: OnboardingAnswers = {
  businessNameAndSpecialty:
    "Calm Harbor Therapy — I'm a CBT therapist specialising in anxiety, burnout and stress.",
  practitionerName: "Dr. Maya Ellis",
  location: "Brighton, and online across the UK.",
  sessionFormat: "Both — in-person in Brighton and online video calls.",
  idealClient:
    "Overwhelmed professionals who look like they're coping but feel exhausted underneath.",
  background:
    "After years in a high-pressure NHS leadership role I burned out myself, which reshaped how I help others slow down and rebuild.",
  credentials:
    "BABCP-accredited CBT therapist, PG Dip in Cognitive Behavioural Therapy, HCPC registered.",
  contactPreference:
    "A simple contact form, plus my email and a link to my online booking page.",
  tone: "Warm and reassuring, calm and grounded.",
};
