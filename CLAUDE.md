# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The import above carries a critical warning: this is **Next.js 16**, which has breaking
> changes from earlier versions. Before writing framework code, read the relevant guide in
> `node_modules/next/dist/docs/` rather than relying on memory of older Next.js APIs.

## Project

TheraBuilder is a guided website builder for therapists. The product's home page is a
conversational onboarding chat that collects a few answers to set up the user's site.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml` — do not use npm/yarn).

```bash
pnpm dev      # dev server (Turbopack) at http://localhost:3000
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # ESLint (eslint-config-next)
```

There is no test runner configured yet.

## Architecture

- **App Router**, React Server Components by default. `src/app/page.tsx` renders the whole
  experience by mounting a single client component — the home page *is* the onboarding chat.
- **Client-side scripted flow.** `src/components/OnboardingChat.tsx` is a `"use client"`
  state machine driven by a `step` index and message list. There is **no backend or LLM** —
  answers advance a local script with a simulated typing delay.
- **Content is separate from logic.** The questions live in `src/lib/onboarding-flow.ts`
  (the `FLOW` array: question + optional `preamble`/`lead` + `hint` per step, plus the
  `CLOSING` message). Editing or reordering questions means changing that file only — never
  the component.
- **Component split.** Chat conversation lives in `OnboardingChat.tsx`; the quick-action
  buttons (Help me answer / Skip question / End chat & continue) are a separate presentational
  component, `src/components/ChatActions.tsx`, wired via callbacks (`onHelp`, `onSkip`, `onEnd`).
- **Import alias:** `@/*` → `./src/*` (e.g. `import OnboardingChat from "@/components/OnboardingChat"`).

## Styling (Tailwind CSS v4)

- Tailwind v4 is configured entirely in `src/app/globals.css` — there is no `tailwind.config`.
- Custom theme colors (`accent`, `surface`, `muted`, `border`, `accent-soft`) are defined as
  `:root` CSS variables and exposed to Tailwind via the `@theme inline` block, which is what
  makes utilities like `bg-accent` / `text-muted` work.
- **Gotcha:** if custom color utilities silently stop applying (e.g. an icon renders dark
  instead of accent-blue), it is usually a stale Turbopack cache. Fix with
  `rm -rf .next && pnpm build`, then restart the dev server.
