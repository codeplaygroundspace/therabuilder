# TheraBuilder

A guided website builder for therapists. The home page is a calm, conversational
onboarding chat that asks a few questions to set up the user's site.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- React 19 + TypeScript
- Tailwind CSS 4

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Lint with ESLint |

## Structure

```
src/
  app/                  App Router entry, layout, global styles
  components/
    OnboardingChat.tsx  The chat conversation flow
    ChatActions.tsx     The quick-action buttons
```
