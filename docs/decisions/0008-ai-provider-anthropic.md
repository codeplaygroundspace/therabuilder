# 0008 — AI provider: Anthropic (Claude), behind a swappable interface

- **Status:** Accepted
- **Date:** 2026-06-15
- **Resolves:** the "AI provider" open question in [0007](0007-open-questions.md)

## Context

The generation step turns the onboarding answers into a validated `SiteDocument`
([0003](0003-content-json-source-of-truth.md)). That document is heavy on **warm,
therapist-voice prose** — bios, FAQ answers, service descriptions — constrained to our Zod
schema. [0007](0007-open-questions.md) left the provider undecided (Anthropic vs Google). We
need a concrete default to build the generation spike (#4) against, without locking in.

## Decision

**Start with Anthropic (Claude).** Abstract all model access behind a **provider-agnostic
structured-output interface** (`StructuredLLM`, see [below](#the-swappable-boundary)) so the
provider is swappable (Google/Gemini, others) **without touching call sites**. The site
generator (#4) depends only on the interface — never on a vendor SDK directly.

### Why

- **Copy quality is the differentiator** ([0006](0006-build-not-rent-editor.md)). Claude's
  strength is natural, warm, human long-form prose — exactly what makes a generated therapist
  site feel real rather than templated.
- **Structured output fits our schema.** Claude produces schema-constrained JSON via tool use;
  we validate it through the same Zod schema ([0003](0003-content-json-source-of-truth.md)) and
  retry on failure. One schema, used for the AI contract, the renderer, and the editor.
- **Swappability preserves leverage.** If a cheaper provider proves equal on prose, we swap the
  default behind the interface — a config change, not a rewrite.

### What would flip the default

If generation cost at scale starts to dominate **and** a cheaper provider (e.g. Gemini Flash)
matches prose quality in a real bake-off, switch the default. Because everything goes through
`StructuredLLM`, that is a single-implementation change.

### The swappable boundary

A minimal, Zod-agnostic interface: given a prompt and a JSON Schema, return the model's **raw
(unvalidated) structured output**. Vendor SDKs live **only** inside implementations of this
interface. Crucially, **validation and retry are the caller's concern**, not the provider's —
the caller owns the Zod schema, validates the returned value, and re-requests on failure. This
keeps adapters dumb and makes the validate/retry loop testable with a mock (no network).

```ts
interface StructuredLLM {
  // returns parsed-but-UNVALIDATED JSON; the caller validates against its Zod schema
  generateStructured(request: StructuredRequest): Promise<unknown>;
}
```

Defined in `src/lib/ai/provider.ts`. The Anthropic-backed implementation and the site generator
that owns validation/retry are built in #4.

## Alternatives considered

- **Google (Gemini)** — native `responseSchema` JSON, cheaper Flash tier, large context.
  **Not burned** — kept as a first-class swap target. Rejected as the *starting* default: prose
  voice is slightly less distinctive for warm human copy, which is our differentiator.
- **Decide only after a bake-off in #4** — deferred. We want a concrete default to build the
  spike against; the interface still lets #4 compare providers head-to-head later.
- **Call the Anthropic SDK directly (no abstraction)** — rejected. It would scatter vendor
  lock-in across call sites and contradict the swappable intent that makes the provider question
  low-stakes.

## Consequences

- #4 implements an Anthropic-backed `StructuredLLM` and judges output quality against the real
  schema + a sample onboarding input.
- Requires an Anthropic API key supplied via environment variable — a deployment/config concern,
  never committed.
- Adding a second provider later means implementing the same interface; call sites are unchanged.
- Cost per generated site is small (one generation is a bounded number of tokens). Revisit only
  if volume changes the calculus — see "What would flip the default".
