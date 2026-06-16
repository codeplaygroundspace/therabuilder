import { sarahDemo } from "@/lib/site/reference/sarah-demo";
import { SiteRenderer } from "@/components/site/SiteRenderer";

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
  return <SiteRenderer document={sarahDemo} slug={pageSlug} />;
}
