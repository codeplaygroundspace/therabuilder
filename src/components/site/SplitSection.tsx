import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Split = Extract<Section, { type: "split" }>;

export function SplitSection({ section }: { section: Split }) {
  const { label, heading, paragraphs, image, imagePosition = "right", cta } = section;
  const imageLeft = imagePosition === "left";
  return (
    <section className="split">
      <div className={`wrap split-inner${imageLeft ? " split-image-left" : ""}`}>
        <div className="split-text">
          {label ? <span className="section-label">{label}</span> : null}
          <h2>{heading}</h2>
          <div className="split-body">
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
        <ImagePlaceholder label={image.alt} className="split-portrait" />
      </div>
    </section>
  );
}
