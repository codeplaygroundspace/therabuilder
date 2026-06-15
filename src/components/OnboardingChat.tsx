"use client";

import { useEffect, useRef, useState } from "react";
import ChatActions from "./ChatActions";

type Role = "bot" | "user";

type Message = {
  id: number;
  role: Role;
  /** Light lead-in lines shown above the question (bot only). */
  preamble?: string[];
  text: string;
  /** Rendered in a muted style — used for skipped answers. */
  muted?: boolean;
};

/** The scripted onboarding flow for a therapist's website. */
const FLOW: { question: string; preamble?: string[]; hint: string }[] = [
  {
    preamble: ["Hi,", "Let's get started with your site setup."],
    question:
      "First, what's your business name, and what type of therapy do you specialize in?",
    hint: "Calm Harbor Therapy — I specialize in anxiety, trauma recovery, and couples counseling.",
  },
  {
    question: "Do you see clients in person, online, or both — and where are you based?",
    hint: "Both — online across the state, and in person in Austin, TX.",
  },
  {
    question: "And how would you like new clients to reach you?",
    hint: "A simple contact form plus a link to my online booking page.",
  },
];

const CLOSING =
  "Perfect — that's everything I need for now. I'll start putting your site together and you can refine it next.";

let idCounter = 0;
const nextId = () => ++idCounter;

export default function OnboardingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "bot",
      preamble: FLOW[0].preamble,
      text: FLOW[0].question,
    },
  ]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [done, setDone] = useState(false);

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

  const pushBot = (text: string) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId(), role: "bot", text }]);
      setIsTyping(false);
    }, 700);
  };

  const advance = () => {
    const next = step + 1;
    setStep(next);
    if (next < FLOW.length) {
      pushBot(FLOW[next].question);
    } else {
      pushBot(CLOSING);
      setDone(true);
    }
  };

  const send = () => {
    const value = draft.trim();
    if (!value || isTyping || done) return;
    setMessages((m) => [...m, { id: nextId(), role: "user", text: value }]);
    setDraft("");
    advance();
  };

  const handleSkip = () => {
    if (isTyping || done) return;
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "user", text: "Skipped", muted: true },
    ]);
    advance();
  };

  const handleHelp = () => {
    if (isTyping || done) return;
    setDraft(FLOW[step]?.hint ?? "");
    textareaRef.current?.focus();
  };

  const handleEnd = () => {
    if (done) return;
    setDone(true);
    setStep(FLOW.length);
    pushBot(CLOSING);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Soft bottom glow — the calm atmosphere from the mockup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] bg-[radial-gradient(120%_100%_at_50%_120%,var(--accent-soft)_0%,rgba(238,241,255,0.35)_38%,transparent_72%)]"
      />

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="scroll-soft relative z-10 flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-2xl px-5 pt-16 pb-8 sm:px-6 sm:pt-24">
          <div className="space-y-7">
            {messages.map((msg) =>
              msg.role === "bot" ? (
                <BotMessage key={msg.id} preamble={msg.preamble} text={msg.text} />
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
          {/* Quick actions */}
          <ChatActions
            onHelp={handleHelp}
            onSkip={handleSkip}
            onEnd={handleEnd}
            busy={isTyping}
            done={done}
          />

          {/* Input */}
          <div className="group rounded-[26px] border border-border bg-white/70 p-2.5 shadow-[0_8px_30px_-12px_rgba(59,91,255,0.18)] backdrop-blur transition-colors focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10">
            <div className="rounded-[18px] bg-white px-4 py-3.5 shadow-sm">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={done}
                rows={1}
                placeholder={done ? "Setup complete" : "Write your answer"}
                className="block w-full resize-none bg-transparent text-[17px] leading-relaxed text-foreground placeholder:text-muted/70 focus:outline-none disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs font-medium text-muted/80">
                {done
                  ? "Thanks — we've got what we need."
                  : `Question ${Math.min(step + 1, FLOW.length)} of ${FLOW.length}`}
              </span>
              <button
                type="button"
                onClick={send}
                disabled={!draft.trim() || isTyping || done}
                aria-label="Send answer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm transition enabled:hover:scale-105 enabled:hover:bg-accent/90 enabled:active:scale-95 disabled:bg-surface disabled:text-muted/60"
              >
                <ArrowUpIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BotMessage({
  preamble,
  text,
}: {
  preamble?: string[];
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
        <p className="font-extrabold tracking-[-0.01em]">{text}</p>
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
