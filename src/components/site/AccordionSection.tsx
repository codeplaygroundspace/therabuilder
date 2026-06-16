import type { Section } from "@/lib/site/sections";

type Accordion = Extract<Section, { type: "accordion" }>;

export function AccordionSection({ section }: { section: Accordion }) {
  const { label, heading, items } = section;
  return (
    <section className="accordion-section">
      <div className="wrap">
        {label || heading ? (
          <div className="accordion-header">
            {label ? <span className="section-label">{label}</span> : null}
            {heading ? <h2>{heading}</h2> : null}
          </div>
        ) : null}
        <div className="accordion-list">
          {items.map((item, i) => (
            <details className="accordion-item" key={i}>
              <summary className="accordion-summary">{item.title}</summary>
              <p className="accordion-body">{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
