import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

/** Render a component to static HTML for logic assertions (no DOM needed). */
export function renderHtml(element: ReactElement): string {
  return renderToStaticMarkup(element);
}
