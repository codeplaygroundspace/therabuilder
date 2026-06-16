import type { SiteDocument } from "@/lib/site/schema";

/**
 * Site header chrome: brand (site name) + primary nav, from the document.
 *
 * Links are plain `<a>` because they target the therapist's (future) published site,
 * not this app's routes — same as the ported section components. The brand defaults
 * to `/` (published-site home); the dev preview overrides `homeHref` to `/preview`.
 */
export function SiteHeader({
  document,
  homeHref = "/",
}: {
  document: SiteDocument;
  homeHref?: string;
}) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <a className="site-brand" href={homeHref}>
          {document.meta.siteName}
        </a>
        <nav className="site-nav" aria-label="Primary">
          {document.nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
