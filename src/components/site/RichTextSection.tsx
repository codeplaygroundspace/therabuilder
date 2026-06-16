import type { Section } from "@/lib/site/sections";

type RichText = Extract<Section, { type: "richText" }>;

export function RichTextSection({ section }: { section: RichText }) {
  const { label, heading, paragraphs, list } = section;
  return (
    <section className="rich-text">
      <div className="wrap rich-text-inner">
        {label ? <span className="section-label">{label}</span> : null}
        {heading ? <h2>{heading}</h2> : null}
        <div className="rich-text-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {list && list.length > 0 ? (
            <ul className="rich-text-list">
              {list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
