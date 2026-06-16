import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteFooter } from "./SiteFooter";
import { sarahDemo } from "@/lib/site/reference/sarah-demo";

describe("SiteFooter", () => {
  it("renders site name, location, contact and legal links", () => {
    const html = renderHtml(<SiteFooter document={sarahDemo} />);
    expect(html).toContain("site-footer");
    expect(html).toContain(sarahDemo.meta.siteName);
    expect(html).toContain(sarahDemo.footer.location!);
    expect(html).toContain(`mailto:${sarahDemo.contact.email}`);
    for (const link of sarahDemo.footer.legalLinks) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    }
  });

  it("omits contact rows that are absent", () => {
    const noContact = {
      ...sarahDemo,
      contact: { ...sarahDemo.contact, email: undefined, phone: undefined },
    };
    const html = renderHtml(<SiteFooter document={noContact} />);
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain('href="tel:');
  });
});
