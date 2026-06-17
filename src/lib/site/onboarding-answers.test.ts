import { describe, it, expect } from "vitest";
import {
  ANSWER_KEYS,
  answersFromSteps,
  emptyAnswers,
  zOnboardingAnswers,
} from "./onboarding-answers";
import { FLOW } from "../onboarding-flow";

describe("onboarding answer capture", () => {
  it("has one answer key per chat question, in lockstep", () => {
    // The chat captures answers by step index and maps them through ANSWER_KEYS; if a
    // question is added/removed/reordered in FLOW without updating ANSWER_KEYS, the mapping
    // silently misaligns. This invariant is the guard.
    expect(ANSWER_KEYS.length).toBe(FLOW.length);
  });

  it("maps step answers to fields in order, trimming whitespace", () => {
    const steps = ANSWER_KEYS.map((_, i) => `  answer ${i}  `);
    const answers = answersFromSteps(steps);
    ANSWER_KEYS.forEach((key, i) => {
      expect(answers[key]).toBe(`answer ${i}`);
    });
    expect(zOnboardingAnswers.safeParse(answers).success).toBe(true);
  });

  it("fills missing/skipped steps with empty strings", () => {
    const answers = answersFromSteps(["only the first"]);
    expect(answers[ANSWER_KEYS[0]]).toBe("only the first");
    expect(answers[ANSWER_KEYS[1]]).toBe("");
    expect(answers).toEqual({
      ...emptyAnswers(),
      [ANSWER_KEYS[0]]: "only the first",
    });
  });
});
