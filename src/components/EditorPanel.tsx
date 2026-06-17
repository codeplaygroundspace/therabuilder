"use client";

import { useState } from "react";
import type { SiteDocument } from "@/lib/site/schema";
import { editableFields } from "@/lib/site/editor/fields";
import { setByPath } from "@/lib/site/editor/update";
import { PRESETS } from "@/lib/site/theme/presets";

type Tab = "content" | "look";

/**
 * The MVP editor (ADR-0004): a schema-driven side panel for text + a theme picker, with
 * real-time preview. Editing is fully controlled — each change produces a new document via
 * the pure `setByPath`, which the parent renders immediately. No save: the document lives in
 * memory only (persistence is Phase 2 / #11), so nothing here claims to be "saved".
 */
export function EditorPanel({
  document,
  onChange,
  onClose,
}: {
  document: SiteDocument;
  onChange: (next: SiteDocument) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const groups = editableFields(document);
  const activeTheme = JSON.stringify(document.theme);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Edit your site</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editor"
          className="rounded-full px-2 py-1 text-sm font-medium text-muted transition hover:text-accent"
        >
          Done
        </button>
      </div>

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {(["content", "look"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-accent text-white"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {t === "content" ? "Text" : "Look"}
          </button>
        ))}
      </div>

      <div className="scroll-soft flex-1 overflow-y-auto px-4 py-4">
        {tab === "content" ? (
          <div className="space-y-7">
            {groups.map((group) => (
              <fieldset key={group.id} className="space-y-3">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {group.title}
                </legend>
                {group.fields.map((field) => (
                  <label key={field.id} className="block">
                    <span className="mb-1 block text-xs font-medium text-muted">
                      {field.label}
                    </span>
                    {field.multiline ? (
                      <textarea
                        value={field.value}
                        rows={3}
                        onChange={(e) =>
                          onChange(setByPath(document, field.path, e.target.value))
                        }
                        className="block w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15"
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          onChange(setByPath(document, field.path, e.target.value))
                        }
                        className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15"
                      />
                    )}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted">
              Pick a palette. It updates the preview instantly.
            </p>
            {PRESETS.map((preset) => {
              const selected = JSON.stringify(preset.theme) === activeTheme;
              const p = preset.theme.palette;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(setByPath(document, ["theme"], preset.theme))}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-accent ring-4 ring-accent/15"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border"
                    aria-hidden
                  >
                    <span className="h-full w-1/3" style={{ background: p.surface }} />
                    <span className="h-full w-1/3" style={{ background: p.accentSoft }} />
                    <span className="h-full w-1/3" style={{ background: p.accent }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {preset.label}
                    </span>
                    <span className="block text-xs leading-snug text-muted">
                      {preset.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
