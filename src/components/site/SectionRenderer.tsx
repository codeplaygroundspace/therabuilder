import type { ReactNode } from "react";
import type { Section } from "@/lib/site/sections";
import { HeroSection } from "./HeroSection";
import { ServicesSection } from "./ServicesSection";
import { CtaSection } from "./CtaSection";

/**
 * Maps each section `type` to a renderer. Optional keys model "only some types are
 * ported yet" — the other 10 (#8) are simply absent and fall through to empty.
 * The mapped type narrows each entry's `section` argument to the matching member.
 *
 * #8 contract: porting a section = add one line here + its component. Nothing else.
 */
const RENDERERS: {
  [K in Section["type"]]?: (section: Extract<Section, { type: K }>) => ReactNode;
} = {
  hero: (s) => <HeroSection section={s} />,
  services: (s) => <ServicesSection section={s} />,
  cta: (s) => <CtaSection section={s} />,
};

/** Dev-only marker so the preview surfaces gaps; never shown in production. */
function UnrenderedSection({ type }: { type: string }) {
  return (
    <section
      data-unrendered={type}
      style={{ padding: "1rem 2rem", color: "#999", fontFamily: "monospace" }}
    >
      ⬚ section &quot;{type}&quot; not yet ported (#8)
    </section>
  );
}

export function SectionRenderer({ section }: { section: Section }) {
  // Cast is sound: the lookup key is `section.type`, the same discriminant that
  // narrows `section`, so the looked-up renderer always matches this `section`.
  const render = RENDERERS[section.type] as
    | ((s: Section) => ReactNode)
    | undefined;
  if (!render) {
    return process.env.NODE_ENV === "development" ? (
      <UnrenderedSection type={section.type} />
    ) : null;
  }
  return render(section);
}
