/**
 * Content for the onboarding chat. This is intentionally separate from the
 * component logic so the questions can be edited freely without touching the
 * conversation state machine in `OnboardingChat`.
 */

export type FlowStep = {
  /** The bold question shown to the user. */
  question: string;
  /** Light lead-in lines shown on their own rows above the question. */
  preamble?: string[];
  /** Regular-weight lead-in shown inline before the bold question. */
  lead?: string;
  /** Suggested answer used by the "Help me answer" action. */
  hint: string;
};

/** The ordered questions the assistant asks during site setup. */
export const FLOW: FlowStep[] = [
  {
    preamble: ["Hi,", "Let's get started with your site setup."],
    question:
      "First, what's your business name, and what type of therapy do you specialize in?",
    hint: "Calm Harbor Therapy — I specialize in anxiety, trauma recovery, and couples counseling.",
  },
  {
    lead: "Perfect.",
    question: "Do you currently see clients in-person, online, or both?",
    hint: "Both — in-person sessions and online video calls.",
  },
  {
    question: "And how would you like new clients to reach you?",
    hint: "A simple contact form plus a link to my online booking page.",
  },
];

/** Shown once every question has been answered or the chat is ended early. */
export const CLOSING =
  "Perfect — that's everything I need for now. I'll start putting your site together and you can refine it next.";
