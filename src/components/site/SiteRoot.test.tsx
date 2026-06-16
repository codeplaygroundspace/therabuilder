import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteRoot } from "./SiteRoot";

describe("SiteRoot", () => {
  it("wraps children in a .site-root element", () => {
    const html = renderHtml(<SiteRoot><p>hello</p></SiteRoot>);
    expect(html).toContain('class="site-root"');
    expect(html).toContain("<p>hello</p>");
  });
});
