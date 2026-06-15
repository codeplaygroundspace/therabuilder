# 0007 — Open questions (not yet decided)

- **Status:** Open
- **Date:** 2026-06-15

> These are **not decided.** Do not assume an answer or build as if one were chosen. When one is
> resolved, promote it to its own Accepted record and link it here.

## AI provider

Anthropic (Claude) vs Google (Gemini), or another.

- Lean: **abstract the provider behind an interface** so it is swappable, and start with
  whichever gives the best **structured / schema-constrained output** for filling the content
  JSON ([0003](0003-content-json-source-of-truth.md)).
- To size: token cost per generated site, latency, structured-output reliability.
- **Decision needed before** building the generation step.

## Database + auth

Therapists must log in and return to edit ([0001](0001-product-and-architecture.md)), so we need
persistence + accounts. Not chosen yet (e.g. Postgres/Supabase for data; Clerk/NextAuth/Supabase
Auth for auth).

- **Decision needed before** building persistence.

## Publishing / hosting & multi-tenancy

How a saved site becomes a live, public site, and how many-tenants map to URLs (subdomains?
custom domains?).

- Deferred: the first milestone is **generate → preview → edit → save**, no public hosting yet.
- This is also where the deferred **Astro publish target** ([0002](0002-framework-all-nextjs.md))
  would land if performance ever warrants it.

## Editor foundation for later phases

Whether to adopt **Puck** when section drag-drop ([0004](0004-editor-scope-mvp.md) item c) is
added, vs. extending our own forms-based editor.
