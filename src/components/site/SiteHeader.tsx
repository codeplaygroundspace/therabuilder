import type { SiteDocument } from "@/lib/site/schema";

/** Site header chrome: brand (site name) + primary nav, from the document. */
export function SiteHeader({ document }: { document: SiteDocument }) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <a className="site-brand" href="/">
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
