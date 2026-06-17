"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteDocument } from "@/lib/site/schema";
import { SiteRenderer } from "@/components/site/SiteRenderer";

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
 */
export function GeneratedSitePreview({
  site,
  onRestart,
}: {
  site: SiteDocument;
  onRestart: () => void;
}) {
  const [slug, setSlug] = useState("home");
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
    <div className="flex min-h-dvh flex-col">
      <header className="z-10 flex items-center justify-between gap-4 border-b border-border bg-white/80 px-5 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Preview — {site.meta.siteName}
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-accent/60 hover:text-accent"
        >
          Start over
        </button>
      </header>
      <div
        ref={scrollRef}
        onClickCapture={handleClick}
        className="flex-1 overflow-y-auto"
      >
        <SiteRenderer document={site} slug={slug} homeHref="/" />
      </div>
    </div>
  );
}
