# Backup and restore

Markdown and adjacent local assets are the only irreplaceable data. Application builds and dependencies are reproducible.

## Recommended backup

Back up both configured roots with a tool appropriate to your platform (filesystem snapshots, encrypted cloud backup, `rsync`, or version control when the content is suitable).

Example local snapshot:

```bash
mkdir -p backups
rsync -a --delete knowledge/ backups/knowledge-latest/
```

Do not use `--delete` until the source and destination are verified. For an append-only dated copy, omit it.

## Restore verification

1. Restore `Research/` and `Discovery/` into a new directory.
2. Point `.env.local` at those roots.
3. Run `npm run build && npm start`.
4. Verify topic counts, a full-text query, a stable note URL, and at least one local asset.

The portal holds no separate database or search index that must be backed up.
