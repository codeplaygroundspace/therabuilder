import { sarahDemo } from "@/lib/site/reference/sarah-demo";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { withPreviewLinks } from "../preview-links";

// Rewrite the reference doc's links to /preview/* once, so navigation stays inside
// the preview. Done at module load (the fixture is static).
const previewDoc = withPreviewLinks(sarahDemo);

/**
 * Dev preview of the renderer against the sarah-demo reference document.
 *   /preview            → home
 *   /preview/about      → about page, etc.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const pageSlug = slug?.[0] ?? "home";
  return (
    <SiteRenderer document={previewDoc} slug={pageSlug} homeHref="/preview" />
  );
}
