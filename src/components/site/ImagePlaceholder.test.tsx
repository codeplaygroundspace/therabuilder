import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { ImagePlaceholder } from "./ImagePlaceholder";

describe("ImagePlaceholder", () => {
  it("renders a labelled placeholder and never an <img> with a real src", () => {
    const html = renderHtml(<ImagePlaceholder label="Portrait of Sarah" className="hero-portrait" />);
    expect(html).toContain('aria-label="Portrait of Sarah"');
    expect(html).toContain("site-img");
    expect(html).toContain("hero-portrait");
    expect(html).not.toContain("<img");
  });
});
