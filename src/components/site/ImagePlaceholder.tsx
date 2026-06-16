/**
 * Grey placeholder occupying an image slot (no real images in MVP — see ADR-0010).
 * Shape (aspect ratio, radius) comes from the caller's className; `label` describes
 * what will eventually sit here.
 */
export function ImagePlaceholder({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={className ? `site-img ${className}` : "site-img"}
    />
  );
}
