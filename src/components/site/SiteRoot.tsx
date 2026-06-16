import type { ReactNode } from "react";

/**
 * Wrapper for rendered therapist-site content. Carries the `.site-root` class, which
 * scopes the sarah-demo design tokens (see src/app/site.css). In #7 this gains a
 * `preset` prop to swap token sets; for now it applies the single default preset.
 */
export function SiteRoot({ children }: { children: ReactNode }) {
  return <div className="site-root">{children}</div>;
}
