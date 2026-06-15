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
    question: "And what's your name, as you'd like it to appear on your site?",
    hint: "Sarah Bennett — most clients just call me Sarah.",
  },
  {
    question: "Whereabouts are you based?",
    hint: "Blackheath, London — and I also see clients in Sevenoaks, Kent. (Or just 'online only'.)",
  },
  {
    lead: "Perfect.",
    question: "Do you currently see clients in-person, online, or both?",
    hint: "Both — in-person sessions and online video calls.",
  },
  {
    question: "Who do you most enjoy working with?",
    hint: "Overwhelmed professionals navigating anxiety, burnout and stress.",
  },
  {
    question: "In a sentence or two, what drew you to this work?",
    hint: "After years in demanding clinical leadership roles I burned out myself — and it reshaped how I help others.",
  },
  {
    question:
      "What qualifications or accreditations would you like clients to see?",
    hint: "BABCP-accredited CBT therapist, PG Dip in CBT, HCPC registered.",
  },
  {
    question: "And how would you like new clients to reach you?",
    hint: "A contact form, plus my email (hello@calmharbor.co.uk) and a link to my online booking page.",
  },
  {
    lead: "Last one.",
    question: "How would you like your site to feel?",
    hint: "Warm and reassuring; calm and grounded.",
  },
];

/** Shown once every question has been answered or the chat is ended early. */
export const CLOSING =
  "Perfect — that's everything I need for now. I'll start putting your site together and you can refine it next.";
