"use client";

import { useState } from "react";
import OnboardingChat from "./OnboardingChat";
import { LookPicker } from "./LookPicker";
import { GeneratedSitePreview } from "./GeneratedSitePreview";
import { assembleSite } from "@/lib/site/template/assemble";
import { sampleContent } from "@/lib/site/content";
import { sampleAnswers, type OnboardingAnswers } from "@/lib/site/onboarding-answers";
import type { SiteDocument } from "@/lib/site/schema";

type Stage = "chat" | "look" | "preview";

/**
 * The MVP loop (#9): onboarding chat → pick a look → generate → see the rendered site.
 *
 * Generation calls POST /api/generate (real AI). When that's unavailable (no API key) the
 * user can preview a sample site assembled from the bundled fixture — so the loop is always
 * demonstrable. The generated document lives in memory only; saving/returning is Phase 2.
 */
export default function OnboardingExperience() {
  const [stage, setStage] = useState<Stage>("chat");
  const [runId, setRunId] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [site, setSite] = useState<SiteDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = (a: OnboardingAnswers) => {
    setAnswers(a);
    setStage("look");
  };

  const generate = async (presetId: string) => {
    if (!answers) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, presetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error ??
            "Something went wrong while building your site. Please try again.",
        );
      }
      setSite(data.document as SiteDocument);
      setStage("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while building your site.",
      );
    } finally {
      setBusy(false);
    }
  };

  // Render a sample site from the bundled fixture (no API key needed). Uses the fixture's
  // own answers so the demo copy and facts stay coherent.
  const showSample = (presetId: string) => {
    setSite(assembleSite(sampleContent, sampleAnswers, { presetId }));
    setError(null);
    setStage("preview");
  };

  const restart = () => {
    setSite(null);
    setAnswers(null);
    setError(null);
    setStage("chat");
    setRunId((n) => n + 1); // remount the chat fresh
  };

  if (stage === "preview" && site) {
    return <GeneratedSitePreview site={site} onRestart={restart} />;
  }

  if (stage === "look") {
    return (
      <LookPicker
        onGenerate={generate}
        onSample={showSample}
        busy={busy}
        error={error}
      />
    );
  }

  return <OnboardingChat key={runId} onComplete={handleComplete} />;
}
