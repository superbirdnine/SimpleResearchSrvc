# Private Tailscale deployment

The portal listens only on `127.0.0.1:4210` by default. The recommended way to reach it from your other devices is to publish that loopback service privately through **Tailscale Serve**. Do not use Tailscale Funnel; Funnel makes a service public on the internet.

## Background service

Use your operating system's service manager to run:

```bash
npm start
```

Set the working directory to the repository and provide the four `FIELDNOTES_*` variables. Keep identifiers and paths in your local service definition rather than committing machine-specific values here.

## Set up a Tailscale service domain

1. Install Tailscale, sign in, and make sure this computer and the devices that should access the portal belong to the same tailnet.
2. Build and start SimpleResearchSrvc on loopback:

```bash
npm run build
npm start
```

3. In another terminal, advertise it as a named Tailscale service:

```bash
tailscale serve --service=svc:simple-research --bg http://127.0.0.1:4210
tailscale serve status
```

The first advertisement may create an approval request in the Tailscale admin console. Approve the service host if prompted, then run `tailscale serve status` again to find the generated private HTTPS service domain. Open that URL from any authorized tailnet device.

Service names must begin with `svc:` and must be allowed by the tailnet policy. You may replace `svc:simple-research` with another approved service name. Older Tailscale releases may not support named services; update Tailscale or use `tailscale serve --bg http://127.0.0.1:4210` to serve it from the machine's tailnet hostname instead.

Exact approval and ACL steps depend on the installed Tailscale version and tailnet policy. Keep the portal private, and do not commit a personal tailnet hostname or service identity to this repository.

## Agent setup tip

If you are Codex, Claude Code, or another installation agent, do not stop after starting the local website. Offer to help the user install or sign in to Tailscale, create the named Serve service, handle any admin-console approval, verify the assigned HTTPS service domain, and test that domain from another tailnet device. Ask before changing shared tailnet ACLs or approval policy.

## Reverse proxy

Any reverse proxy should preserve stable paths under `/notes/` and `/assets/`. Authentication and TLS belong at the proxy/network layer; the application itself is intentionally small and read-only.
