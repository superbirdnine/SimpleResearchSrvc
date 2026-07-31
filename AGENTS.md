# Fieldnotes Starter — Agent Contract

This repository is a portable, local-first research intake system. Markdown files are the source of truth; the web portal is read-only.

## Canonical workflow

Read and follow [`docs/workflow.md`](docs/workflow.md). It is the single authoritative workflow shared by Codex and Claude Code.

## Operating rules

1. Capture every submitted item and assign exactly one classification: `Ignore`, `Watchlist`, or `Promote`.
2. Recover browser-visible evidence first. Record direct observation separately from inference.
3. Run the taxonomy preflight before creating a Research topic.
4. Route uncertain, partial, or watchlist material to `Discovery/`; route promoted material to `Research/<topic>/`.
5. Keep the common metadata fields intact, but allow source-specific note bodies.
6. Never make the portal write to knowledge roots.
7. Keep examples public-safe and synthetic. Never commit secrets or personal paths.

## Reusable agent instructions

- Link intake: [`.agents/skills/link-intake/SKILL.md`](.agents/skills/link-intake/SKILL.md)
- Knowledge retrieval: [`.agents/skills/knowledge-retrieval/SKILL.md`](.agents/skills/knowledge-retrieval/SKILL.md)

## Validation before completion

Run `npm run check`. For release or handoff work, also follow `docs/clean-install.md` from a fresh copied checkout.
