import type { Section } from "@/lib/site/sections";

type Cta = Extract<Section, { type: "cta" }>;

/**
 * CTA — ports sarah-demo CtaContact.astro (variant "contact") and CtaFaq.astro (variant "faq").
 * The faq form is presentational only (no submission wiring — out of #5 scope).
 */
export function CtaSection({ section }: { section: Cta }) {
  if (section.variant === "faq") {
    return <FaqCta section={section} />;
  }
  return <ContactCta section={section} />;
}

function ContactCta({ section }: { section: Cta }) {
  const { label, heading, body, note, button } = section;
  return (
    <section className="contact-cta">
      <div className="wrap">
        {label ? <span className="section-label section-label-warm">{label}</span> : null}
        <h2>{heading}</h2>
        {body ? <p>{body}</p> : null}
        {note ? <p className="contact-cta-note">{note}</p> : null}
        {button ? (
          <a href={button.href} className="btn-primary">
            {button.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function FaqCta({ section }: { section: Cta }) {
  const { label, heading, body } = section;
  return (
    <section className="faq-cta-section">
      <div className="wrap faq-cta-grid">
        <div className="faq-cta-intro">
          {label ? <span className="section-label">{label}</span> : null}
          <h2>{heading}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        {/* Presentational only — no submission in #5. */}
        <form className="faq-cta-form" aria-label="Contact form">
          <label className="faq-field">
            <span>Name</span>
            <input type="text" name="name" autoComplete="name" />
          </label>
          <label className="faq-field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" />
          </label>
          <label className="faq-field">
            <span>Your question</span>
            <textarea name="message" rows={4} placeholder="What would you like to know?" />
          </label>
          <button type="button" className="btn-form">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
