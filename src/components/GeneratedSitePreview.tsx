"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteDocument } from "@/lib/site/schema";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { EditorPanel } from "@/components/EditorPanel";

/** Map an in-document href ("/about/") to its page slug ("about"); "" / "/" → "home". */
function slugForHref(href: string): string {
  const segment = href.replace(/^\/+|\/+$/g, "").split("/")[0];
  return segment || "home";
}

/**
 * Full-screen preview of a generated SiteDocument. Renders the real site components
 * (SiteRenderer is presentational, safe in a client subtree) and turns the document's
 * internal links into client-side page switches — there's no server route per generated
 * site in the MVP (persistence/publishing are Phase 2). External links pass through.
 *
 * When `onChange` is given, an Edit panel (text + theme, ADR-0004) opens alongside the preview
 * and edits re-render it in real time. Edits live in memory only — nothing is persisted (#11).
 */
export function GeneratedSitePreview({
  site,
  onRestart,
  onChange,
  onBuildRest,
  buildingRest = false,
  restError = null,
}: {
  site: SiteDocument;
  onRestart: () => void;
  onChange?: (next: SiteDocument) => void;
  /** When given, the other pages aren't built yet — offer to generate them (ADR-0011). */
  onBuildRest?: () => void;
  buildingRest?: boolean;
  restError?: string | null;
}) {
  const [slug, setSlug] = useState("home");
  const [editing, setEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [slug]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return; // external — let it be
    e.preventDefault();
    setSlug(slugForHref(href));
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="z-10 flex items-center justify-between gap-4 border-b border-border bg-white/80 px-5 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          {editing ? "Editing" : "Preview"} — {site.meta.siteName}
        </div>
        <div className="flex items-center gap-2">
          {restError && (
            <span className="hidden text-sm text-red-600 sm:inline">{restError}</span>
          )}
          {onBuildRest && (
            <button
              type="button"
              onClick={onBuildRest}
              disabled={buildingRest}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-accent/90 enabled:active:scale-95 disabled:opacity-60"
            >
              {buildingRest ? "Building the rest…" : "Build the rest of my site"}
            </button>
          )}
          {onChange && (
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              aria-pressed={editing}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                editing
                  ? "border-accent bg-accent text-white"
                  : "border-border text-foreground hover:border-accent/60 hover:text-accent"
              }`}
            >
              {editing ? "Done editing" : "Edit site"}
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-accent/60 hover:text-accent"
          >
            Start over
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {editing && onChange && (
          <div className="w-80 shrink-0 sm:w-96">
            <EditorPanel
              document={site}
              onChange={onChange}
              onClose={() => setEditing(false)}
            />
          </div>
        )}
        <div
          ref={scrollRef}
          onClickCapture={handleClick}
          className="min-w-0 flex-1 overflow-y-auto"
        >
          <SiteRenderer document={site} slug={slug} homeHref="/" />
        </div>
      </div>
    </div>
  );
}
