import type { SiteDocument } from "@/lib/site/schema";

/** Map a published-site path to its dev-preview equivalent. `/about/` → `/preview/about`. */
function toPreviewHref(href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href; // external / non-page links
  const segment = href.replace(/^\/+|\/+$/g, "").split("/")[0];
  return segment ? `/preview/${segment}` : "/preview";
}

/**
 * Deep-clone the document, rewriting every `href` so the dev preview is navigable
 * (the real document keeps published-site paths). Only `href` keys are touched —
 * image `src` and post `slug` fields are left intact.
 */
function rewrite<T>(value: T): T {
  if (Array.isArray(value)) return value.map(rewrite) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] =
        key === "href" && typeof v === "string" ? toPreviewHref(v) : rewrite(v);
    }
    return out as T;
  }
  return value;
}

export function withPreviewLinks(document: SiteDocument): SiteDocument {
  return rewrite(document);
}
