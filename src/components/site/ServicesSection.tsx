import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Services = Extract<Section, { type: "services" }>;

/** Services — ported from sarah-demo Services.astro. Card images render as placeholders. */
export function ServicesSection({ section }: { section: Services }) {
  const { label, heading, body, items } = section;
  return (
    <section className="services">
      <div className="wrap">
        <div className="services-header">
          {label ? <span className="section-label">{label}</span> : null}
          <div className="services-header-row">
            {heading ? <h2>{heading}</h2> : null}
            {body ? <p>{body}</p> : null}
          </div>
        </div>
        <div className="services-grid">
          {items.map((item, i) => (
            <div className="service-card" key={i}>
              <div className="service-arch" aria-hidden="true" />
              <ImagePlaceholder label={item.imageAlt} className="service-image" />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
