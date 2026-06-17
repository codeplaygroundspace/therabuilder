import type { SiteDocument } from "@/lib/site/schema";
import { SiteRoot } from "./SiteRoot";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SectionRenderer } from "./SectionRenderer";

/**
 * Renders one page of a SiteDocument: header → sections (in document order) → footer,
 * scoped inside SiteRoot. Unknown slug falls back to the first page.
 */
export function SiteRenderer({
  document,
  slug,
  homeHref,
}: {
  document: SiteDocument;
  slug: string;
  /** Where the brand/logo links. Defaults to "/" (published-site home). */
  homeHref?: string;
}) {
  const page = document.pages.find((p) => p.slug === slug) ?? document.pages[0];

  return (
    <SiteRoot theme={document.theme}>
      <SiteHeader document={document} homeHref={homeHref} />
      <main>
        {page.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </main>
      <SiteFooter document={document} />
    </SiteRoot>
  );
}
