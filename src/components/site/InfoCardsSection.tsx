import type { Section } from "@/lib/site/sections";

type InfoCards = Extract<Section, { type: "infoCards" }>;

export function InfoCardsSection({ section }: { section: InfoCards }) {
  const { label, heading, cards } = section;
  return (
    <section className="info-cards">
      <div className="wrap">
        {label || heading ? (
          <div className="info-cards-header">
            {label ? <span className="section-label">{label}</span> : null}
            {heading ? <h2>{heading}</h2> : null}
          </div>
        ) : null}
        <div className="info-cards-grid">
          {cards.map((card, i) => (
            <div className="info-card" key={i}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
