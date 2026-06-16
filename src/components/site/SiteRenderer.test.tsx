import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteRenderer } from "./SiteRenderer";
import { sarahDemo } from "@/lib/site/reference/sarah-demo";

describe("SiteRenderer", () => {
  it("wraps the page in site-root with header and footer", () => {
    const html = renderHtml(<SiteRenderer document={sarahDemo} slug="home" />);
    expect(html).toContain('class="site-root"');
    expect(html).toContain("site-header");
    expect(html).toContain("site-footer");
  });

  it("renders home sections in document order (hero before cta)", () => {
    const html = renderHtml(<SiteRenderer document={sarahDemo} slug="home" />);
    const heroAt = html.indexOf("hero-h1");
    const ctaAt = html.indexOf("contact-cta");
    expect(heroAt).toBeGreaterThanOrEqual(0);
    expect(ctaAt).toBeGreaterThan(heroAt);
  });

  it("does not throw on a page containing unported section types", () => {
    // The "about" page is entirely richText (+cta) — richText is unported.
    expect(() =>
      renderHtml(<SiteRenderer document={sarahDemo} slug="about" />),
    ).not.toThrow();
  });

  it("falls back to the first page for an unknown slug", () => {
    const html = renderHtml(<SiteRenderer document={sarahDemo} slug="nope" />);
    // First page is "home" → hero present.
    expect(html).toContain("hero-h1");
  });
});
