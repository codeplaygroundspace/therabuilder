import type { Section } from "@/lib/site/sections";

type Contact = Extract<Section, { type: "contact" }>;

export function ContactSection({ section }: { section: Contact }) {
  const { label, heading, intro, methods } = section;
  return (
    <section className="contact-section">
      <div className="wrap">
        {label ? <span className="section-label">{label}</span> : null}
        <h2>{heading}</h2>
        {intro ? <p className="contact-intro">{intro}</p> : null}
        {methods && methods.length > 0 ? (
          <ul className="contact-methods">
            {methods.map((method, i) => (
              <li key={i} className="contact-method-chip">{method}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
