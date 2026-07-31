# Canonical research workflow

This document is authoritative for Codex, Claude Code, and human operators.

## 1. Ingest

Treat each submitted URL or source as one captured item. Every submitted resource must be saved; never discard it as low-signal or irrelevant. One note per source URL is the default.

## 2. Recover from the source

Use this browser-first order:

1. Open the exact URL in a real browser.
2. Read the page body or a deep accessibility snapshot.
3. If UI chrome obscures the source, retry with a deeper body-text read.
4. If text is still inaccessible, use a screenshot/OCR pass.
5. Only then use a cached copy, search result, API, or other fallback.

Stop when evidence is sufficient. Record the actual recovery method. Never represent a search snippet, inference, or remembered claim as directly observed source text.

## 3. Separate evidence from reasoning

Every substantive capture should distinguish:

- **Direct observation:** facts visible in or mechanically extracted from the source.
- **Inference:** interpretations, implications, hypotheses, or extrapolations.
- **Uncertainty / gaps:** blocked regions, missing context, or claims not verified.

## 4. Run taxonomy preflight

Before choosing a destination:

1. Search both configured roots for the exact URL, title, slug, and distinctive phrases.
2. List existing first-level folders under `Research/`.
3. Prefer the best matching existing Research topic.
4. Create a new Research topic only when classification is `Promote`, evidence is strong, and no existing topic fits.

The intake CLI performs this preflight and reports its matches. The operator remains responsible for a sensible semantic choice.

## 5. Choose exactly one classification

| Classification | Use when | Default route |
| --- | --- | --- |
| `Watchlist` | promising but incomplete, partially recovered, uncertain, or not yet attached to a Research topic | `Discovery/quick-scans/YYYY-MM-DD_<slug>.md` and `WATCHLIST.md` |
| `Promote` | evidence is strong enough to become durable topic knowledge now | `Research/<best-existing-topic>/YYYY-MM-DD_<slug>.md` |

When a resource does not justify promotion, classify it as `Watchlist` so the user's reason for submitting it is preserved. `Promote` means write the Research artifact now; it is not a suggestion for a future step.

## 6. Write the routed artifact

Use the loose common header:

- title
- source URL
- capture date
- classification
- topic
- recovery method

Bodies may vary by source, but preserve provenance, direct observation, inference, uncertainty, and useful next questions. Start from `templates/note.md` when helpful.

## 7. Retrieve prior knowledge

For requests about existing material:

1. Search exact URL/title/slug/distinctive phrase across both roots.
2. Prefer Research as the curated answer surface and Discovery as supporting provenance.
3. Open matched files before summarizing.
4. Report concrete file paths and distinguish direct hits from related matches.
5. Do not mutate notes during retrieval unless explicitly asked.

Use `scripts/knowledge-search.mjs <terms>` for portable local search.

## 8. Completion evidence

Report the destination path, the single classification, the recovery method, taxonomy matches considered, and any concrete gaps. A claim that material was captured requires an actual file write in the same run.
