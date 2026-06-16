import type { Section } from "@/lib/site/sections";

type Testimonial = Extract<Section, { type: "testimonial" }>;

export function TestimonialSection({ section }: { section: Testimonial }) {
  const { quote, attribution } = section;
  return (
    <section className="testimonial">
      <div className="wrap testimonial-inner">
        <blockquote className="testimonial-quote">{quote}</blockquote>
        {attribution ? <p className="testimonial-attribution"><cite>{attribution}</cite></p> : null}
      </div>
    </section>
  );
}
