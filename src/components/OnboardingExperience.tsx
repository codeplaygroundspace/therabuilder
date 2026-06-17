"use client";

import { useState } from "react";
import OnboardingChat from "./OnboardingChat";
import { LookPicker } from "./LookPicker";
import { GeneratedSitePreview } from "./GeneratedSitePreview";
import { assembleSite } from "@/lib/site/template/assemble";
import { sampleContent } from "@/lib/site/content";
import { sampleAnswers, type OnboardingAnswers } from "@/lib/site/onboarding-answers";
import type { SiteDocument, Page } from "@/lib/site/schema";

type Stage = "chat" | "look" | "preview";

/**
 * The MVP loop (#9): onboarding chat → pick a look → generate → see the rendered site.
 *
 * Generation is home-first (ADR-0011): the first call builds just the home (+ contact) page so
 * the user can judge it before paying for the rest; "Build the rest" generates about/therapy/faq
 * on request. When AI is unavailable (no API key) the sample fixture renders a complete site.
 * The generated document lives in memory only; saving/returning is Phase 2 (#11).
 */
export default function OnboardingExperience() {
  const [stage, setStage] = useState<Stage>("chat");
  const [runId, setRunId] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [site, setSite] = useState<SiteDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Whether the deferred pages (about/therapy/faq) have been generated yet.
  const [restBuilt, setRestBuilt] = useState(false);
  const [buildingRest, setBuildingRest] = useState(false);
  const [restError, setRestError] = useState<string | null>(null);

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
        body: JSON.stringify({ scope: "home", answers, presetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error ??
            "Something went wrong while building your home page. Please try again.",
        );
      }
      setSite(data.document as SiteDocument);
      setRestBuilt(false);
      setRestError(null);
      setStage("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while building your home page.",
      );
    } finally {
      setBusy(false);
    }
  };

  // Phase 2: generate the remaining pages and splice them into the live document by slug, so
  // any edits the user made to the home page are preserved. Seeded with the decided
  // name/specialty/tagline (read from the current document) to stay consistent.
  const buildRest = async () => {
    if (!site || !answers || buildingRest) return;
    setBuildingRest(true);
    setRestError(null);
    try {
      const seed = {
        siteName: site.meta.siteName,
        specialty: site.practitioner.specialty,
        tagline: site.footer.tagline ?? site.meta.defaultDescription,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope: "rest", answers, seed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error ?? "Something went wrong while building the rest. Please try again.",
        );
      }
      const bySlug = new Map((data.pages as Page[]).map((p) => [p.slug, p]));
      setSite((prev) =>
        prev ? { ...prev, pages: prev.pages.map((p) => bySlug.get(p.slug) ?? p) } : prev,
      );
      setRestBuilt(true);
    } catch (err) {
      setRestError(
        err instanceof Error ? err.message : "Something went wrong while building the rest.",
      );
    } finally {
      setBuildingRest(false);
    }
  };

  // Render a sample site from the bundled fixture (no API key needed). Uses the fixture's
  // own answers so the demo copy and facts stay coherent; the sample is already complete.
  const showSample = (presetId: string) => {
    setSite(assembleSite(sampleContent, sampleAnswers, { presetId }));
    setRestBuilt(true);
    setError(null);
    setRestError(null);
    setStage("preview");
  };

  const restart = () => {
    setSite(null);
    setAnswers(null);
    setError(null);
    setRestError(null);
    setRestBuilt(false);
    setStage("chat");
    setRunId((n) => n + 1); // remount the chat fresh
  };

  if (stage === "preview" && site) {
    return (
      <GeneratedSitePreview
        site={site}
        onRestart={restart}
        onChange={setSite}
        onBuildRest={restBuilt ? undefined : buildRest}
        buildingRest={buildingRest}
        restError={restError}
      />
    );
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
