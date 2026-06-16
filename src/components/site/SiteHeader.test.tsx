import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteHeader } from "./SiteHeader";
import { sarahDemo } from "@/lib/site/reference/sarah-demo";

describe("SiteHeader", () => {
  it("renders the site name and every nav link", () => {
    const html = renderHtml(<SiteHeader document={sarahDemo} />);
    expect(html).toContain("site-header");
    expect(html).toContain(sarahDemo.meta.siteName);
    for (const link of sarahDemo.nav) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    }
  });
});
