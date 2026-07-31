# Clean-install acceptance

Run this from a fresh copied checkout with no `node_modules` or `.next` directory:

```bash
npm ci
npm run lint
npm test
npm run build
FIELDNOTES_HOST=127.0.0.1 FIELDNOTES_PORT=4321 npm start
```

Then verify:

```bash
curl --fail http://127.0.0.1:4321/
curl --fail http://127.0.0.1:4321/notes/Research/browser-recovery/2026-01-15_resilient-source-recovery.md
curl --fail http://127.0.0.1:4321/assets/Research/browser-recovery/assets/recovery-ladder.svg
```

Stop the server after the smoke check. `npm run check` provides the regular in-place lint/test/build gate.
