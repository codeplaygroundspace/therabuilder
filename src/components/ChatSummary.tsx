import type { SummaryRow } from "@/lib/site/chat-summary";

/**
 * The "here's what we have so far" card shown beside the onboarding chat once enough has been
 * answered. Each row keys off its answer field, so React reuses existing rows and only newly
 * added rows mount with the `animate-msg-in` slide — giving the user a visible sense that the
 * conversation is building something. Purely presentational; the content comes from `summarize`.
 */
export function ChatSummary({
  rows,
  className = "",
}: {
  rows: SummaryRow[];
  className?: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Summary of your answers so far"
      className={`rounded-2xl border border-border bg-white/70 p-5 shadow-[0_8px_30px_-18px_rgba(59,91,255,0.25)] backdrop-blur ${className}`}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Here&apos;s what we have so far
      </h2>
      <dl className="mt-4 space-y-3.5">
        {rows.map((row) => (
          <div key={row.key} className="animate-msg-in">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted/70">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-[13.5px] leading-snug text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
