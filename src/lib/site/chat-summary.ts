import type { OnboardingAnswers } from "./onboarding-answers";

/**
 * Builds the "here's what we have so far" summary shown beside the onboarding chat.
 *
 * Deliberately deterministic and local (no LLM): it runs instantly, costs nothing, and works
 * with no API key — keeping the chat true to its "no backend during the conversation" design
 * (see CLAUDE.md). It exists mainly to show the user that something is happening as they answer.
 * If we later want a genuinely AI-written summary, this is the single seam to swap: same input
 * (the answers so far), same {@link SummaryRow}[] output.
 */
export type SummaryRow = {
  /** Stable key (the answer field, or "look") — used as the React key so only new rows animate. */
  key: string;
  /** Short label shown above the value. */
  label: string;
  /** The user's answer, tidied for display. */
  value: string;
};

/** Max characters shown per row in the compact panel; longer answers are softly truncated. */
const MAX_VALUE_LENGTH = 160;

const ROWS: { key: keyof OnboardingAnswers; label: string }[] = [
  { key: "businessNameAndSpecialty", label: "Practice" },
  { key: "practitionerName", label: "Name" },
  { key: "location", label: "Location" },
  { key: "sessionFormat", label: "Sessions" },
  { key: "idealClient", label: "Clients" },
  { key: "background", label: "What drew you in" },
  { key: "credentials", label: "Qualifications" },
  { key: "contactPreference", label: "Getting in touch" },
  { key: "tone", label: "Feel" },
];

/**
 * Turn the answers gathered so far (plus an optional chosen look) into display rows.
 * Empty/skipped answers are omitted, so the panel grows as the conversation progresses.
 */
export function summarize(
  answers: Partial<OnboardingAnswers>,
  presetLabel?: string,
): SummaryRow[] {
  const rows: SummaryRow[] = [];
  for (const { key, label } of ROWS) {
    const value = tidy(answers[key]);
    if (value) rows.push({ key, label, value });
  }
  if (presetLabel) rows.push({ key: "look", label: "Look", value: presetLabel });
  return rows;
}

/** Collapse whitespace and softly truncate so a long paragraph stays panel-sized. */
function tidy(raw: string | undefined): string {
  const value = (raw ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= MAX_VALUE_LENGTH) return value;
  return `${value.slice(0, MAX_VALUE_LENGTH).trimEnd()}…`;
}
