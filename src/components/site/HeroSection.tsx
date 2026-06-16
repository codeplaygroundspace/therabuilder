import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Hero = Extract<Section, { type: "hero" }>;

/** Hero — ported from sarah-demo Hero.astro. Portrait renders as a placeholder. */
export function HeroSection({ section }: { section: Hero }) {
  const { eyebrow, heading, body, cta, image } = section;
  return (
    <section className="hero">
      <div className="hero-bg-circle hero-bg-circle-left" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-text">
            {eyebrow ? <span className="section-label">{eyebrow}</span> : null}
            <h1 className="hero-h1">{heading}</h1>
            <p className="hero-sub">{body}</p>
            {cta ? (
              <div className="hero-actions">
                <a href={cta.href} className="btn-primary">
                  {cta.label}
                </a>
              </div>
            ) : null}
          </div>
          <div className="hero-portrait">
            <div className="hero-bg-circle hero-bg-circle-right" aria-hidden="true" />
            <ImagePlaceholder label={image?.alt} className="hero-portrait-img" />
          </div>
        </div>
      </div>
    </section>
  );
}
