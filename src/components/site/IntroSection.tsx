import type { Section } from "@/lib/site/sections";

type Intro = Extract<Section, { type: "intro" }>;

export function IntroSection({ section }: { section: Intro }) {
  const { label, heading, paragraphs, cta } = section;
  return (
    <section className="intro">
      <div className="wrap intro-inner">
        {label ? <span className="section-label">{label}</span> : null}
        {heading ? <h2>{heading}</h2> : null}
        <div className="intro-body">
          {paragraphs.map((p, i) => (
            <p key={i} className="intro-p">
              {p}
            </p>
          ))}
        </div>
        {cta ? (
          <a href={cta.href} className="btn-primary">
            {cta.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}
