import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/site/schema";

/**
 * Font display-name → next/font CSS-variable stack. Only families actually loaded
 * via next/font in src/app/layout.tsx render with their optimized webfont; any other
 * name falls back to a system stack (see fontStack). When a preset introduces a new
 * font (#9 / Phase 2), it must also be registered in layout.tsx and added here.
 */
const FONT_VARS: Record<string, string> = {
  "Work Sans": "var(--font-work-sans)",
  Fraunces: "var(--font-fraunces)",
  Mulish: "var(--font-mulish)",
};

function fontStack(name: string, fallback: string): string {
  const loaded = FONT_VARS[name];
  return loaded ? `${loaded}, ${fallback}` : `"${name}", ${fallback}`;
}

/**
 * Map the document theme onto the subset of site.css's CSS variables that the
 * palette covers (ADR-0009). Unmapped tokens (--page-bg, --accent-dark, --warm-text,
 * --border-soft) stay as the fixed defaults declared on `.site-root` in site.css.
 * Note: `--warm` is mapped for completeness but currently inert — site.css reads
 * the fixed `--warm-text` for the visible warm color, not `--warm`.
 */
function themeVars(theme: Theme): CSSProperties {
  const { palette, fonts } = theme;
  return {
    "--accent": palette.accent,
    "--accent-soft": palette.accentSoft,
    "--surface": palette.surface,
    "--surface-muted": palette.surfaceMuted,
    "--text": palette.text,
    "--text-muted": palette.textMuted,
    "--border": palette.border,
    "--warm": palette.warm,
    "--font-body-stack": fontStack(fonts.body, "system-ui, sans-serif"),
    "--font-display-stack": fontStack(fonts.display, "Georgia, serif"),
  } as CSSProperties;
}

/**
 * Wrapper for rendered therapist-site content. Carries the `.site-root` class, which
 * scopes the sarah-demo design tokens (see src/app/site.css). When a `theme` is given,
 * its palette + fonts override the matching tokens inline, so different documents render
 * with different looks; without one, the site.css defaults apply.
 */
export function SiteRoot({
  theme,
  children,
}: {
  theme?: Theme;
  children: ReactNode;
}) {
  return (
    <div className="site-root" style={theme ? themeVars(theme) : undefined}>
      {children}
    </div>
  );
}
