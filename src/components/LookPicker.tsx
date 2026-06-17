"use client";

import { useState } from "react";
import { PRESETS, DEFAULT_PRESET_ID } from "@/lib/site/theme/presets";

/**
 * The "pick a look" step (ADR-0010): the user chooses a curated color preset before
 * generation. The AI never chooses colors — this is the only design decision the user makes.
 * MVP ships one template, so only the palette is offered here.
 */
export function LookPicker({
  onGenerate,
  onSample,
  busy,
  error,
}: {
  onGenerate: (presetId: string) => void;
  onSample: (presetId: string) => void;
  busy: boolean;
  error: string | null;
}) {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-5 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-foreground sm:text-3xl">
        Now pick a look for your site.
      </h1>
      <p className="mt-2 text-[17px] leading-relaxed text-muted">
        Choose the palette that feels most like you. You can change it later — and we&apos;ll
        write all the words for you.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRESETS.map((preset) => {
          const selected = preset.id === presetId;
          const p = preset.theme.palette;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPresetId(preset.id)}
              aria-pressed={selected}
              disabled={busy}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
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
                <span className="block text-sm leading-snug text-muted">
                  {preset.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => onGenerate(presetId)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition enabled:hover:bg-accent/90 enabled:active:scale-95 disabled:opacity-60"
        >
          {busy ? "Building your site…" : "Generate my site"}
        </button>
        <button
          type="button"
          onClick={() => onSample(presetId)}
          disabled={busy}
          className="text-sm font-medium text-muted underline-offset-4 transition hover:text-accent hover:underline disabled:opacity-60"
        >
          Or see a sample site
        </button>
      </div>
    </main>
  );
}
