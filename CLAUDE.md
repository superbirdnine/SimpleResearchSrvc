# Claude Code entry point

Use [`AGENTS.md`](AGENTS.md) as the repository agent contract and [`docs/workflow.md`](docs/workflow.md) as the canonical intake/retrieval workflow.

Claude-specific reusable commands live under `.claude/skills/`; they are thin adapters to the same canonical workflow and must not fork its rules.
