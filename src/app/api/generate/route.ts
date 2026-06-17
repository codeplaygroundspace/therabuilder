import { z } from "zod";
import { zOnboardingAnswers } from "@/lib/site/onboarding-answers";
import { generateContent } from "@/lib/ai/generate-content";
import { assembleSite } from "@/lib/site/template/assemble";
import { AnthropicStructuredLLM } from "@/lib/ai/anthropic";

// The Anthropic SDK needs the Node.js runtime, and generation is per-request (never cached).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zBody = z.object({
  answers: zOnboardingAnswers,
  presetId: z.string().optional(),
});

/**
 * POST /api/generate — the MVP generation loop (ADR-0010):
 * onboarding answers → AI content slots → `assembleSite` → a complete SiteDocument.
 *
 * Returns 400 on a malformed body, 503 when no ANTHROPIC_API_KEY is configured (so the UI
 * can offer the sample preview instead), and 502 if generation/validation fails.
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

  const { answers, presetId } = parsed.data;
  try {
    const llm = new AnthropicStructuredLLM();
    const content = await generateContent(answers, llm);
    const document = assembleSite(content, answers, { presetId });
    return Response.json({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
