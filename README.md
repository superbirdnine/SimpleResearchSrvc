# Fieldnotes Starter

A standalone, local-first research intake repository for **Codex and Claude Code**, with a read-only web portal for Markdown knowledge libraries.

## What it provides

- one canonical intake/classification workflow shared by both agents
- `Discovery/` for uncertain, partial, and watchlist material
- `Research/<topic>/` for promoted knowledge
- browser-first provenance with direct observation separated from inference
- exactly one classification per item: `Ignore`, `Watchlist`, or `Promote`
- taxonomy-aware routing before new Research topics are created
- Fieldnotes portal with collection/topic browsing, full-text search, stable note URLs, Markdown rendering, local assets, and safe external links
- configurable roots, host, and port
- synthetic examples, templates, setup/backup/deployment docs, and automated acceptance tests

## Quick start

```bash
npm run bootstrap
npm run dev
```

Open `http://127.0.0.1:4210` by default.

To use existing Markdown roots, copy `.env.example` to `.env.local` and change `FIELDNOTES_RESEARCH_ROOT` and `FIELDNOTES_DISCOVERY_ROOT`. Relative paths resolve from the repository root.

## Intake helper

```bash
npm run intake -- \
  --url https://example.org/article \
  --title "Example article" \
  --classification Watchlist \
  --topic browser-recovery \
  --recovery-method browser-body-text \
  --observed "The page explicitly describes a retry sequence." \
  --inference "The sequence may generalize to other dynamic sites."
```

The helper validates classification and routing. Browser recovery itself remains an agent/browser responsibility; the CLI records recovered evidence without pretending to browse.

## Main documents

- [`docs/workflow.md`](docs/workflow.md) — canonical workflow
- [`docs/setup.md`](docs/setup.md) — configuration and local use
- [`docs/backup.md`](docs/backup.md) — Markdown-first backups
- [`docs/deployment.md`](docs/deployment.md) — optional service/Tailscale guidance
- [`docs/clean-install.md`](docs/clean-install.md) — release verification
- [`plan/final/implementation.md`](plan/final/implementation.md) — architecture and acceptance shape

## Safety and portability

The portal performs no writes. Asset and note routes reject path traversal. No remote, hosted dependency, service name, private archive, or machine-specific absolute path is required.
