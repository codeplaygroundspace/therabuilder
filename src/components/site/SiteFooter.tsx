import type { SiteDocument } from "@/lib/site/schema";

/** Site footer chrome: brand + tagline/location, contact methods, and legal links. */
export function SiteFooter({ document }: { document: SiteDocument }) {
  const { meta, footer, contact } = document;
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-name">{meta.siteName}</span>
          {footer.tagline ? (
            <p className="site-footer-tagline">{footer.tagline}</p>
          ) : null}
          {footer.location ? (
            <p className="site-footer-location">{footer.location}</p>
          ) : null}
        </div>

        <div className="site-footer-contact">
          {contact.email ? (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          ) : null}
          {contact.phone ? (
            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
          ) : null}
        </div>

        {footer.legalLinks.length > 0 ? (
          <nav className="site-footer-legal" aria-label="Legal">
            {footer.legalLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
