/**
 * Runnable AI generation spike (#4).
 *
 * Generates a full SiteDocument from the sample onboarding answers using the real Anthropic
 * provider, then prints the document and a quality checklist. This is the one step that needs
 * a real key — it is never run automatically.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... pnpm spike:generate
 *   ANTHROPIC_API_KEY=sk-ant-... ANTHROPIC_MODEL=claude-opus-4-8 pnpm spike:generate
 */
import { generateSite } from "../src/lib/ai/generate-site";
import { AnthropicStructuredLLM } from "../src/lib/ai/anthropic";
import { sampleAnswers } from "../src/lib/site/onboarding-answers";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set.\n" +
        "Run:  ANTHROPIC_API_KEY=sk-ant-... pnpm spike:generate",
    );
    process.exitCode = 1;
    return;
  }

  const started = Date.now();
  const llm = new AnthropicStructuredLLM();
  console.error("Generating a site from the sample onboarding answers…\n");

  // generateSite validates against zSiteDocument internally and retries on failure.
  const doc = await generateSite(sampleAnswers, llm);

  // The validated document (pipe to a file to inspect: `... pnpm spike:generate > site.json`).
  console.log(JSON.stringify(doc, null, 2));

  // Quality checklist — judge by eye against the sarah-demo bar.
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.error(`\n──── spike result (${seconds}s) ────`);
  console.error(`✓ output validated against zSiteDocument`);
  console.error(`pages (${doc.pages.length}): ${doc.pages.map((p) => p.slug).join(", ")}`);
  for (const page of doc.pages) {
    console.error(`  • ${page.slug}: ${page.sections.map((s) => s.type).join(", ")}`);
  }
  console.error(
    `theme: accent=${doc.theme.palette.accent}  fonts=${doc.theme.fonts.display}/${doc.theme.fonts.body}`,
  );
  console.error(
    "\nJudge by eye:\n" +
      "  - Is the prose warm and human (not corporate/templated)?\n" +
      "  - Are sections sensibly chosen and ordered per page?\n" +
      "  - Did it avoid inventing fees, insurer names, testimonials, or extra credentials?",
  );
}

main().catch((err) => {
  console.error("\nSpike failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
