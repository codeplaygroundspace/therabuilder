"use client";

import { useEffect, useRef, useState } from "react";
import ChatActions from "./ChatActions";
import { ChatSummary } from "./ChatSummary";
import { LookSwatches } from "./LookSwatches";
import { FLOW, LOOK_PROMPT, CLOSING } from "@/lib/onboarding-flow";
import { summarize } from "@/lib/site/chat-summary";
import { getPreset } from "@/lib/site/theme/presets";
import {
  answersFromSteps,
  type OnboardingAnswers,
} from "@/lib/site/onboarding-answers";

type Role = "bot" | "user";

type Message = {
  id: number;
  role: Role;
  /** Light lead-in lines shown above the question (bot only). */
  preamble?: string[];
  /** Regular-weight lead-in shown inline before the bold question (bot only). */
  lead?: string;
  /** Muted example line shown under the question (bot only). */
  example?: string;
  text: string;
  /** Rendered in a muted style — used for skipped answers. */
  muted?: boolean;
};

/**
 * "questions" — asking FLOW[step]; the text composer is shown.
 * "look" — the final step: the colour swatches replace the input, then a Generate button.
 */
type Phase = "questions" | "look";

let idCounter = 0;
const nextId = () => ++idCounter;

/** The step index at which the running summary panel starts showing (after Q5). */
const SUMMARY_AFTER_STEP = 5;

export default function OnboardingChat({
  onGenerate,
  onSample,
  busy = false,
  error = null,
}: {
  /** Start generating the home page with the captured answers + chosen look. */
  onGenerate: (answers: OnboardingAnswers, presetId: string) => void;
  /** Show the bundled sample site instead (no API key needed). */
  onSample: (answers: OnboardingAnswers, presetId: string) => void;
  /** Generation is in flight (driven by the parent). */
  busy?: boolean;
  /** A generation error to surface near the Generate button. */
  error?: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "bot",
      preamble: FLOW[0].preamble,
      example: FLOW[0].example,
      text: FLOW[0].question,
    },
  ]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("questions");
  // Answers captured by step index; drives the live summary and the final OnboardingAnswers.
  const [steps, setSteps] = useState<string[]>([]);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep the conversation pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Auto-grow the textarea with its content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [draft]);

  const pushBot = (
    text: string,
    opts: { lead?: string; example?: string } = {},
  ) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "bot", text, lead: opts.lead, example: opts.example },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const enterLookPhase = () => {
    setPhase("look");
    pushBot(LOOK_PROMPT.question, {
      lead: LOOK_PROMPT.lead,
      example: LOOK_PROMPT.example,
    });
  };

  // Record the current question's answer (or "" for a skip) and move to the next step,
  // entering the look phase once the questions run out.
  const recordAnswer = (value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
    const nextStep = step + 1;
    if (nextStep < FLOW.length) {
      setStep(nextStep);
      pushBot(FLOW[nextStep].question, {
        lead: FLOW[nextStep].lead,
        example: FLOW[nextStep].example,
      });
    } else {
      setStep(nextStep);
      enterLookPhase();
    }
  };

  const send = () => {
    const value = draft.trim();
    if (!value || isTyping || phase !== "questions") return;
    setMessages((m) => [...m, { id: nextId(), role: "user", text: value }]);
    setDraft("");
    recordAnswer(value);
  };

  const handleSkip = () => {
    if (isTyping || phase !== "questions") return;
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "user", text: "Skipped", muted: true },
    ]);
    recordAnswer("");
  };

  const handleHelp = () => {
    if (isTyping || phase !== "questions") return;
    setDraft(FLOW[step]?.hint ?? "");
    textareaRef.current?.focus();
  };

  // "End chat & continue" — skip any remaining questions and go straight to the look step,
  // so every path still picks a look before generating.
  const handleEnd = () => {
    if (phase !== "questions") return;
    enterLookPhase();
  };

  const handlePickLook = (id: string) => {
    if (busy) return;
    const firstPick = presetId === null;
    setPresetId(id);
    if (firstPick) pushBot(CLOSING);
  };

  const answers = answersFromSteps(steps);
  const summaryRows = summarize(
    answers,
    presetId ? getPreset(presetId).label : undefined,
  );
  const showSummary = step >= SUMMARY_AFTER_STEP || phase === "look";
  const hasSummary = showSummary && summaryRows.length > 0;
  // The Generate / sample actions appear once a look is chosen and the closing line has landed.
  const readyToGenerate = phase === "look" && presetId !== null && !isTyping;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      {/* Soft bottom glow — the calm atmosphere from the mockup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] bg-[radial-gradient(120%_100%_at_50%_120%,var(--accent-soft)_0%,rgba(238,241,255,0.35)_38%,transparent_72%)]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl lg:gap-10 lg:px-6">
        {/* Summary panel — its own scrolling column on desktop. */}
        {hasSummary && (
          <aside className="hidden lg:block lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:px-1 lg:pt-24 lg:pb-8">
            <ChatSummary rows={summaryRows} />
          </aside>
        )}

        {/* Chat column */}
        <main className="flex h-full min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="scroll-soft min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-5 pt-16 pb-8 sm:px-6 sm:pt-24">
              {/* Summary card on mobile (no room for a sidebar). */}
              {hasSummary && <ChatSummary rows={summaryRows} className="mb-8 lg:hidden" />}

              <div className="space-y-7">
                {messages.map((msg) =>
                  msg.role === "bot" ? (
                    <BotMessage
                      key={msg.id}
                      preamble={msg.preamble}
                      lead={msg.lead}
                      example={msg.example}
                      text={msg.text}
                    />
                  ) : (
                    <UserMessage key={msg.id} text={msg.text} muted={msg.muted} />
                  )
                )}
                {isTyping && <TypingIndicator />}
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="relative z-10">
            <div className="mx-auto w-full max-w-2xl px-5 pb-7 sm:px-6">
              {phase === "questions" ? (
                <>
                  <ChatActions
                    onHelp={handleHelp}
                    onSkip={handleSkip}
                    onEnd={handleEnd}
                    busy={isTyping}
                  />
                  <div className="group rounded-[26px] border border-border bg-white/70 p-2.5 shadow-[0_8px_30px_-12px_rgba(59,91,255,0.18)] backdrop-blur transition-colors focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10">
                    <div className="rounded-[18px] bg-white px-4 py-3.5 shadow-sm">
                      <textarea
                        ref={textareaRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={1}
                        placeholder="Write your answer"
                        className="block w-full resize-none bg-transparent text-[17px] leading-relaxed text-foreground placeholder:text-muted/70 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between px-2 pt-2">
                      <span className="text-xs font-medium text-muted/80">
                        {`Question ${Math.min(step + 1, FLOW.length)} of ${FLOW.length}`}
                      </span>
                      <button
                        type="button"
                        onClick={send}
                        disabled={!draft.trim() || isTyping}
                        aria-label="Send answer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm transition enabled:hover:scale-105 enabled:hover:bg-accent/90 enabled:active:scale-95 disabled:bg-surface disabled:text-muted/60"
                      >
                        <ArrowUpIcon className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <LookStep
                  presetId={presetId}
                  onPick={handlePickLook}
                  ready={readyToGenerate}
                  busy={busy}
                  error={error}
                  onGenerate={() => presetId && onGenerate(answers, presetId)}
                  onSample={() => presetId && onSample(answers, presetId)}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LookStep({
  presetId,
  onPick,
  ready,
  busy,
  error,
  onGenerate,
  onSample,
}: {
  presetId: string | null;
  onPick: (id: string) => void;
  ready: boolean;
  busy: boolean;
  error: string | null;
  onGenerate: () => void;
  onSample: () => void;
}) {
  return (
    <div className="space-y-5">
      <LookSwatches value={presetId} onSelect={onPick} disabled={busy} />

      {error && (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      {ready && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onGenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition enabled:hover:bg-accent/90 enabled:active:scale-95 disabled:opacity-60"
          >
            {busy ? "Building your home page…" : "Generate my site"}
          </button>
          <button
            type="button"
            onClick={onSample}
            disabled={busy}
            className="text-sm font-medium text-muted underline-offset-4 transition hover:text-accent hover:underline disabled:opacity-60"
          >
            Or see a sample site
          </button>
        </div>
      )}
    </div>
  );
}

function BotMessage({
  preamble,
  lead,
  example,
  text,
}: {
  preamble?: string[];
  lead?: string;
  example?: string;
  text: string;
}) {
  return (
    <div className="animate-msg-in flex gap-3.5">
      <SparkleIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
      <div className="space-y-1 text-[19px] leading-snug text-foreground">
        {preamble?.map((line, i) => (
          <p key={i} className="font-normal text-foreground/90">
            {line}
          </p>
        ))}
        <p className="font-extrabold tracking-[-0.01em]">
          {lead && (
            <span className="font-normal text-foreground/90">{lead} </span>
          )}
          {text}
        </p>
        {example && (
          <p className="text-[15px] font-normal text-muted">{example}</p>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className="animate-msg-in flex justify-end">
      <p
        className={`max-w-[80%] rounded-2xl rounded-tr-md px-4 py-2.5 text-[16px] leading-relaxed ${
          muted
            ? "bg-surface italic text-muted"
            : "bg-accent text-white shadow-sm"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-msg-in flex gap-3.5">
      <SparkleIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
      <div className="flex items-center gap-1.5 pt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot h-2 w-2 rounded-full bg-accent/60"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5c.3 3.4 1.6 5.6 3.6 6.9 1.1.7 2.4 1.1 3.9 1.4-1.5.3-2.8.7-3.9 1.4-2 1.3-3.3 3.5-3.6 6.9-.3-3.4-1.6-5.6-3.6-6.9-1.1-.7-2.4-1.1-3.9-1.4 1.5-.3 2.8-.7 3.9-1.4 2-1.3 3.3-3.5 3.6-6.9Z" />
      <path d="M19 3c.13 1.3.66 2.1 1.5 2.6.46.28 1 .45 1.6.57-.6.12-1.14.29-1.6.57-.84.5-1.37 1.3-1.5 2.6-.13-1.3-.66-2.1-1.5-2.6-.46-.28-1-.45-1.6-.57.6-.12 1.14-.29 1.6-.57.84-.5 1.37-1.3 1.5-2.6Z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
