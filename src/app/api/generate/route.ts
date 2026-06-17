import { z } from "zod";
import { zOnboardingAnswers } from "@/lib/site/onboarding-answers";
import { generateHomeContent, generateRestContent } from "@/lib/ai/generate-content";
import { assembleHome, buildRestPages } from "@/lib/site/template/assemble";
import { AnthropicStructuredLLM } from "@/lib/ai/anthropic";

// The Anthropic SDK needs the Node.js runtime, and generation is per-request (never cached).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zSeed = z.object({
  siteName: z.string(),
  specialty: z.string(),
  tagline: z.string(),
});

const zBody = z.object({
  /** Home-first generation (ADR-0011): "home" up front, "rest" only when the user asks. */
  scope: z.enum(["home", "rest"]).default("home"),
  answers: zOnboardingAnswers,
  presetId: z.string().optional(),
  /** Required for scope "rest": the decided site name/specialty/tagline, for consistency. */
  seed: zSeed.optional(),
});

/**
 * POST /api/generate — home-first generation (ADR-0010/0011):
 * - scope "home" → onboarding answers → home + contact copy → `assembleHome` → a full
 *   SiteDocument whose about/therapy/faq pages are present but empty. Returns `{ document }`.
 * - scope "rest" → answers + seed → about/therapy/faq copy → `buildRestPages`. Returns
 *   `{ pages }` for the client to splice into the live document (preserving any home edits).
 *
 * Returns 400 on a malformed body, 503 when no ANTHROPIC_API_KEY is configured (so the UI can
 * offer the sample preview instead), and 502 if generation/validation fails.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = zBody.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Generation is not configured (ANTHROPIC_API_KEY is missing)." },
      { status: 503 },
    );
  }

  const { scope, answers, presetId, seed } = parsed.data;

  if (scope === "rest" && !seed) {
    return Response.json(
      { error: "A seed (siteName, specialty, tagline) is required to build the rest." },
      { status: 400 },
    );
  }

  try {
    const llm = new AnthropicStructuredLLM();

    if (scope === "rest") {
      const rest = await generateRestContent(answers, seed!, llm);
      const pages = buildRestPages(rest, answers, seed!);
      return Response.json({ pages });
    }

    const home = await generateHomeContent(answers, llm);
    const document = assembleHome(home, answers, { presetId });
    return Response.json({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
