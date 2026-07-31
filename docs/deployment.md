# Optional deployment

The default is local-only on `127.0.0.1:4210`.

## Background service

Use your operating system's service manager to run:

```bash
npm start
```

Set the working directory to the repository and provide the four `FIELDNOTES_*` variables. Keep identifiers and paths in your local service definition rather than committing machine-specific values here.

## Optional Tailscale example

After building and starting Fieldnotes on loopback, an operator may expose it privately with Tailscale Serve:

```bash
tailscale serve --bg http://127.0.0.1:4210
tailscale serve status
```

Exact syntax and ACL policy depend on the installed Tailscale version and your tailnet. Review the current Tailscale documentation, keep access private, and do not hard-code tailnet hostnames or service identities in this repository.

## Reverse proxy

Any reverse proxy should preserve stable paths under `/notes/` and `/assets/`. Authentication and TLS belong at the proxy/network layer; the application itself is intentionally small and read-only.
