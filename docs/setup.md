# Setup and local operation

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Bootstrap

```bash
git clone <your-local-or-hosted-copy> fieldnotes-starter
cd fieldnotes-starter
npm run bootstrap
```

`bootstrap` installs the locked dependencies, creates `.env.local` from `.env.example` when absent, and verifies configured knowledge roots.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `FIELDNOTES_RESEARCH_ROOT` | `./knowledge/Research` | promoted Markdown root |
| `FIELDNOTES_DISCOVERY_ROOT` | `./knowledge/Discovery` | uncertain/watchlist Markdown root |
| `FIELDNOTES_HOST` | `127.0.0.1` | listen address |
| `FIELDNOTES_PORT` | `4210` | listen port |

Relative roots resolve from the repository root. Absolute paths are accepted at runtime but never required or committed.
Both the portal and command-line helpers load `.env.local`; explicitly exported environment variables take precedence.

## Run

```bash
npm run dev
# or
npm run build
npm start
```

The portal reads files at request time. Restarting is unnecessary after note edits; refresh the browser.

## Intake and retrieval

```bash
npm run intake -- --help
node scripts/knowledge-search.mjs "distinctive phrase"
```

The intake helper can be pointed at temporary/test roots with the same environment variables.
