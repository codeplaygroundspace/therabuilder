import type { SiteDocument } from "@/lib/site/schema";

/**
 * Site header chrome: brand (site name) + primary nav, from the document.
 *
 * Links are plain `<a>` because they target the therapist's (future) published site,
 * not this app's routes — same as the ported section components. The brand's `/` is
 * suppressed below: it coincides with this app's home route, so `next/link`'s page-link
 * rule misfires, but `next/link` would wrongly navigate to the onboarding chat.
 */
export function SiteHeader({ document }: { document: SiteDocument }) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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
