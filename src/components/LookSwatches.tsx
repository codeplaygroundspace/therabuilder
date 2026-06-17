"use client";

import { PRESETS } from "@/lib/site/theme/presets";

/**
 * The curated colour-preset swatches (ADR-0009 / ADR-0010). Presentational and reusable: the
 * onboarding chat renders this as its final step in place of the text input. The AI never
 * chooses colours — this is the only design decision the user makes.
 */
export function LookSwatches({
  value,
  onSelect,
  disabled,
}: {
  /** Currently selected preset id, or null before any pick. */
  value: string | null;
  onSelect: (presetId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PRESETS.map((preset) => {
        const selected = preset.id === value;
        const p = preset.theme.palette;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            aria-pressed={selected}
            disabled={disabled}
            className={`flex items-center gap-4 rounded-2xl border bg-white/70 p-4 text-left transition disabled:opacity-60 ${
              selected
                ? "border-accent ring-4 ring-accent/15"
                : "border-border hover:border-accent/50"
            }`}
          >
            <span
              className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border"
              aria-hidden
            >
              <span className="h-full w-1/3" style={{ background: p.surface }} />
              <span className="h-full w-1/3" style={{ background: p.accentSoft }} />
              <span className="h-full w-1/3" style={{ background: p.accent }} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">{preset.label}</span>
              <span className="block text-sm leading-snug text-muted">{preset.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
