import { sarahDemo } from "@/lib/site/reference/sarah-demo";
import type { Section } from "@/lib/site/sections";
import { SiteRoot } from "@/components/site/SiteRoot";
import { HeroSection } from "@/components/site/HeroSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { CtaSection } from "@/components/site/CtaSection";

/** Dev-only harness for eyeballing the ported sections against the live sarah-demo. */
function find<T extends Section["type"]>(
  type: T,
  predicate?: (s: Extract<Section, { type: T }>) => boolean,
): Extract<Section, { type: T }> {
  for (const page of sarahDemo.pages) {
    for (const section of page.sections) {
      if (section.type === type) {
        const narrowed = section as Extract<Section, { type: T }>;
        if (!predicate || predicate(narrowed)) return narrowed;
      }
    }
  }
  throw new Error(`No ${type} section found in reference doc`);
}

export default function PreviewPage() {
  const hero = find("hero");
  const services = find("services");
  const contactCta = find("cta", (s) => s.variant === "contact");
  const faqCta = find("cta", (s) => s.variant === "faq");

  return (
    <SiteRoot>
      <HeroSection section={hero} />
      <ServicesSection section={services} />
      <CtaSection section={contactCta} />
      <CtaSection section={faqCta} />
    </SiteRoot>
  );
}
