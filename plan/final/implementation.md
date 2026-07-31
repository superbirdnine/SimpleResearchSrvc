# Final implementation architecture

## Authority

Markdown under the configured `Research` and `Discovery` roots is authoritative. The portal derives its index at request time and never writes.

## Components

- `docs/workflow.md`: canonical agent workflow
- `.agents/skills/` and `.claude/skills/`: tool-specific entry points referencing the canonical workflow
- `scripts/intake.mjs`: validated capture/routing helper
- `scripts/bootstrap.mjs`: dependency/config bootstrap
- `src/lib/notes.ts`: root resolution, indexing, reading, stable IDs, asset confinement
- `src/app` and `src/components`: read-only Fieldnotes web portal
- `templates/` and `knowledge/`: portable templates and synthetic examples
- `tests/`: intake and portal contract tests

## Trust boundaries

- Environment variables select roots and listen address.
- All resolved note/asset paths must remain within their selected root.
- The browser UI can read notes/assets only; it exposes no mutation endpoints.
- External Markdown links open in a new tab with `noopener noreferrer`.

## Acceptance

`npm run check` must pass. A clean copied checkout must complete `npm ci`, tests, lint, build, and a live HTTP smoke check.
