"use client";

type ChatActionsProps = {
  onHelp: () => void;
  onSkip: () => void;
  onEnd: () => void;
  /** Disable answer-related actions while the assistant is responding. */
  busy?: boolean;
  /** The conversation has finished. */
  done?: boolean;
};

/** The quick-action buttons shown above the chat composer. */
export default function ChatActions({
  onHelp,
  onSkip,
  onEnd,
  busy = false,
  done = false,
}: ChatActionsProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-2.5">
      <ActionButton onClick={onHelp} disabled={busy || done}>
        Help me answer
      </ActionButton>
      <ActionButton onClick={onSkip} disabled={busy || done}>
        Skip question
      </ActionButton>
      <ActionButton onClick={onEnd} disabled={done}>
        <ExternalLinkIcon className="h-[1.05em] w-[1.05em]" />
        End chat &amp; continue
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-[15px] font-semibold text-foreground/80 shadow-sm transition hover:bg-border/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
