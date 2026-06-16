import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type About = Extract<Section, { type: "about" }>;

export function AboutSection({ section }: { section: About }) {
  const { label, heading, paragraphs, image, cta } = section;
  return (
    <section className="about">
      <div className="wrap about-inner">
        <div className="about-text">
          {label ? <span className="section-label">{label}</span> : null}
          <h2>{heading}</h2>
          <div className="about-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {cta ? (
            <a href={cta.href} className="btn-primary">
              {cta.label}
            </a>
          ) : null}
        </div>
        <ImagePlaceholder label={image.alt} className="about-portrait" />
      </div>
    </section>
  );
}
