"use client";

import { useEffect, useState } from "react";
import type { SummaryRow } from "@/lib/site/chat-summary";

/**
 * The "here's what we have so far" card shown beside the onboarding chat once enough has been
 * answered. The card and labels fade in first (so it doesn't pop in as a surprise), then each
 * value is "typed" out — a deterministic, local effect that gives the deliberately no-API
 * summary (see chat-summary.ts) the feel of being written for the user.
 *
 * Rows key off their answer field, so React reuses existing rows: only a freshly-added row
 * mounts and animates. The value's `startDelay` cascades by row index, so the initial batch
 * (after Q5) writes itself out line by line.
 */
const TYPE_BASE_DELAY_MS = 260; // let the panel + label fade in before typing starts
const TYPE_STAGGER_MS = 130; // cascade between rows
const TYPE_CHAR_MS = 14;

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
      className={`animate-msg-in rounded-2xl border border-border bg-white/70 p-5 shadow-[0_8px_30px_-18px_rgba(59,91,255,0.25)] backdrop-blur ${className}`}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Here&apos;s what we have so far
      </h2>
      <dl className="mt-4 space-y-3.5">
        {rows.map((row, i) => (
          <div key={row.key} className="animate-msg-in">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted/70">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-[13.5px] leading-snug text-foreground">
              <Typewriter text={row.value} startDelay={TYPE_BASE_DELAY_MS + i * TYPE_STAGGER_MS} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Reveals `text` one character at a time after `startDelay`, with a blinking caret while it
 * writes. Each row's value is stable in the chat flow, so the effect runs once on mount and a
 * later parent re-render (a new answer appearing) never restarts an already-typed row. Honours
 * prefers-reduced-motion by showing the full text immediately.
 */
function Typewriter({
  text,
  startDelay = 0,
  charMs = TYPE_CHAR_MS,
}: {
  text: string;
  startDelay?: number;
  charMs?: number;
}) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text.length : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return; // already shown in full

    let i = 0;
    let timer: number;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < text.length) timer = window.setTimeout(tick, charMs);
    };
    const start = window.setTimeout(tick, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [text, charMs, startDelay]);

  const done = shown >= text.length;
  return (
    <>
      {text.slice(0, shown)}
      {!done && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[2px] animate-pulse bg-accent/70 align-baseline"
        />
      )}
    </>
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
