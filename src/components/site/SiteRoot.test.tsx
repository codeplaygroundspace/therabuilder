import { describe, it, expect } from "vitest";
import { renderHtml } from "./render-to-string";
import { SiteRoot } from "./SiteRoot";
import { sarahDemo } from "@/lib/site/reference/sarah-demo";
import type { Theme } from "@/lib/site/schema";

describe("SiteRoot", () => {
  it("wraps children in a .site-root element", () => {
    const html = renderHtml(
      <SiteRoot>
        <p>hello</p>
      </SiteRoot>,
    );
    expect(html).toContain('class="site-root"');
    expect(html).toContain("<p>hello</p>");
  });

  it("renders no inline style when no theme is given", () => {
    const html = renderHtml(
      <SiteRoot>
        <p>hello</p>
      </SiteRoot>,
    );
    expect(html).not.toContain("style=");
  });

  it("applies the document theme palette as CSS variables", () => {
    const html = renderHtml(
      <SiteRoot theme={sarahDemo.theme}>
        <p>hi</p>
      </SiteRoot>,
    );
    expect(html).toContain("--accent:oklch(0.276 0.008 59.33)");
    expect(html).toContain("--accent-soft:oklch(0.913 0.014 74.418)");
    expect(html).toContain("--surface:oklch(0.956 0.01 81.795)");
    expect(html).toContain("--surface-muted:oklch(0.943 0.011 136.56)");
    expect(html).toContain("--text:oklch(0.276 0.008 59.33)");
    expect(html).toContain("--text-muted:oklch(0.512 0.015 141.761)");
    expect(html).toContain("--border:oklch(0.866 0.017 79.343)");
    expect(html).toContain("--warm:oklch(0.671 0.075 60.455)");
  });

  it("maps known fonts to their next/font stacks, matching site.css defaults", () => {
    // No-regression anchor: rendering the reference theme reproduces site.css's
    // hardcoded font stacks exactly, so the reference site is a visual no-op.
    const html = renderHtml(
      <SiteRoot theme={sarahDemo.theme}>
        <p>hi</p>
      </SiteRoot>,
    );
    expect(html).toContain(
      "--font-body-stack:var(--font-work-sans), system-ui, sans-serif",
    );
    expect(html).toContain(
      "--font-display-stack:var(--font-fraunces), Georgia, serif",
    );
  });

  it("varies the look when a different palette is supplied", () => {
    const altTheme: Theme = {
      palette: {
        accent: "oklch(0.55 0.2 25)",
        accentSoft: "oklch(0.9 0.05 25)",
        surface: "oklch(0.98 0.01 25)",
        surfaceMuted: "oklch(0.95 0.01 25)",
        text: "oklch(0.2 0.02 25)",
        textMuted: "oklch(0.5 0.02 25)",
        border: "oklch(0.85 0.02 25)",
        warm: "oklch(0.7 0.1 25)",
      },
      fonts: { body: "Mulish", display: "Fraunces" },
    };
    const html = renderHtml(
      <SiteRoot theme={altTheme}>
        <p>hi</p>
      </SiteRoot>,
    );
    expect(html).toContain("--accent:oklch(0.55 0.2 25)");
    expect(html).toContain(
      "--font-body-stack:var(--font-mulish), system-ui, sans-serif",
    );
  });

  it("falls back to a system stack for fonts not loaded in layout.tsx", () => {
    const altTheme: Theme = {
      ...sarahDemo.theme,
      fonts: { body: "Inter", display: "Lora" },
    };
    const html = renderHtml(
      <SiteRoot theme={altTheme}>
        <p>hi</p>
      </SiteRoot>,
    );
    expect(html).toContain('--font-body-stack:&quot;Inter&quot;, system-ui, sans-serif');
    expect(html).toContain('--font-display-stack:&quot;Lora&quot;, Georgia, serif');
  });
});
