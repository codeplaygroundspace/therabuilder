import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type LogoStrip = Extract<Section, { type: "logoStrip" }>;

export function LogoStripSection({ section }: { section: LogoStrip }) {
  const { label, logos } = section;
  return (
    <section className="logo-strip">
      <div className="wrap">
        <span className="section-label">{label}</span>
        <div className="logo-strip-row">
          {logos.map((logo, i) => (
            <ImagePlaceholder key={i} label={logo.alt} className="logo-img" />
          ))}
        </div>
      </div>
    </section>
  );
}
