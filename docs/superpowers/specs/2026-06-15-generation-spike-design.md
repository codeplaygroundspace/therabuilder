# AI generation spike — design spec

- **Date:** 2026-06-15
- **Issue:** [#4 — AI generation spike (judge quality early)](https://github.com/codeplaygroundspace/therabuilder/issues/4)
- **Branch:** `feat/4-generation-spike` (stacked on `feat/3-ai-provider`)
- **Relevant decisions:** [0001](../../decisions/0001-product-and-architecture.md),
  [0003](../../decisions/0003-content-json-source-of-truth.md),
  [0008](../../decisions/0008-ai-provider-anthropic.md)
- **Depends on:** #2 (`zSiteDocument`), #3 (`StructuredLLM` interface)

## Purpose

Prove — early and cheaply — that an LLM can turn the onboarding answers into a **validated
`SiteDocument`** good enough to clear the `sarah-demo` quality bar ([0001](../../decisions/0001-product-and-architecture.md)).
This is the riskiest part of the product, so we de-risk it before investing in the renderer (#6)
or wiring the chat (#9).

## Scope

**In:**
- A typed `OnboardingAnswers` input (the 9 questions from `onboarding-flow.ts`) + a realistic sample.
- A **prompt builder** that turns answers into a system + user prompt instructing the model to fill
  the schema in a warm therapist voice, within bounded structure.
- A provider-agnostic **`generateSite(answers, llm)`** that owns the validate-and-retry loop:
  it derives a JSON Schema from `zSiteDocument` (`z.toJSONSchema`), calls
  `StructuredLLM.generateStructured`, validates the raw result with `zSiteDocument`, and
  re-requests (bounded, feeding the validation error back) on failure.
- A **thin Anthropic adapter** (`AnthropicStructuredLLM`) implementing `StructuredLLM` via the
  `@anthropic-ai/sdk` — tool-use to constrain output to the JSON Schema, returning the raw
  tool input. It does **not** validate or retry (that's the caller, per ADR-0008).
- A **runnable spike script** gated on `ANTHROPIC_API_KEY` that generates a site from the sample
  answers and reports validity + a quality checklist.
- **Mock-based tests** for the generator + prompt builder (no network, no key).

**Out (explicitly):**
- Wiring the onboarding chat to capture/forward real answers — that is #9. The spike uses a sample.
- The renderer (#6) — the spike judges the JSON, not a rendered page.
- Persistence, accounts, editor.
- Production hardening of the adapter (rate limits, streaming, cost tracking).

## How the riskiest unknown gets judged

Two things only a real run (your API key) can answer, captured as the spike's **quality checklist**:
1. **Validity** — does the model's output parse through `zSiteDocument` first try, or only after retries?
2. **Quality** — is the prose warm and human; are sections sensibly chosen per page; did it respect
   "do not fabricate fees/insurers/credentials beyond the answers" ([0008](../../decisions/0008-ai-provider-anthropic.md))?

Everything else (plumbing, validation, retry) is proven by the mock tests without a key.

## Architecture

```
OnboardingAnswers ──▶ buildSitePrompt() ──▶ { system, prompt }
                                              │
                                              ▼
   generateSite(answers, llm):  jsonSchema = z.toJSONSchema(zSiteDocument)
                                 loop (bounded):
                                   raw = llm.generateStructured({ system, prompt, jsonSchema })  ──▶ (Anthropic adapter OR mock)
                                   parsed = zSiteDocument.safeParse(raw)
                                   if ok ──▶ return parsed.data
                                   else ──▶ append validation error to prompt, retry
```

- **`generateSite` depends only on `StructuredLLM`** — never on a vendor SDK. This is the swap
  boundary from [0008](../../decisions/0008-ai-provider-anthropic.md). Tests inject a mock; the
  spike script injects `AnthropicStructuredLLM`.
- **Validation + retry live in `generateSite`, not the adapter** (per [0008](../../decisions/0008-ai-provider-anthropic.md)).
  Because the mock provider *is* the interface, a mock returning bad-then-good data genuinely
  exercises the retry loop with no network — the whole reason the loop sits above the interface.
- **Structured output via tool-use:** the adapter exposes the supplied JSON Schema as a single
  forced tool and returns the tool-use input verbatim (raw, unvalidated).

## Files

| File | Responsibility |
|------|----------------|
| `src/lib/site/onboarding-answers.ts` | `OnboardingAnswers` type + `sampleAnswers` fixture |
| `src/lib/ai/prompt.ts` | `buildSitePrompt(answers)` → `{ system, prompt }` |
| `src/lib/ai/generate-site.ts` | `generateSite(answers, llm)` → `Promise<SiteDocument>` |
| `src/lib/ai/anthropic.ts` | `AnthropicStructuredLLM` (vendor SDK isolated here) |
| `src/lib/ai/*.test.ts` | mock-based tests for prompt + generator |
| `scripts/spike-generate.ts` | runnable spike (needs `ANTHROPIC_API_KEY`) |

## Decisions / assumptions

- **Whole-document generation in one call** for the spike (simplest feasibility test). If output
  quality or token limits make this weak, the next iteration generates per-page; the spike will
  surface that.
- **No key handling by the agent.** The adapter reads `process.env.ANTHROPIC_API_KEY`; the key is
  supplied by the user's environment, never committed or entered by Claude.
- **Sample answers, not live chat.** Real capture is #9; the spike must not depend on it.

## Acceptance criteria

- [ ] `generateSite` is provider-agnostic (typed against `StructuredLLM`, no SDK import).
- [ ] Mock-based tests prove: prompt includes the answers; `generateSite` returns a schema-valid
      document; a mock that returns invalid data triggers a retry then surfaces a clear error.
- [ ] `AnthropicStructuredLLM` compiles and is isolated (only this file imports the SDK).
- [ ] The spike script runs with a key and prints validity + the quality checklist; without a key it
      exits with a clear instruction (no crash, no key prompt).
- [ ] `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint` all pass (mock tests only; no network in CI).
