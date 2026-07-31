#!/usr/bin/env node
import { spawn } from "node:child_process";

const port = String(4400 + Math.floor(Math.random() * 300));
const env = { ...process.env, FIELDNOTES_HOST: "127.0.0.1", FIELDNOTES_PORT: port };
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npmCommand, ["start"], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
  shell: process.platform === "win32",
  detached: process.platform !== "win32",
});
let logs = "";
child.stdout.on("data", (chunk) => { logs += chunk; });
child.stderr.on("data", (chunk) => { logs += chunk; });

async function waitFor(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready:\n${logs}`);
}

try {
  const base = `http://127.0.0.1:${port}`;
  const home = await waitFor(base);
  const homeText = await home.text();
  if (!homeText.includes("Fieldnotes")) throw new Error("Home page missing Fieldnotes marker");

  const stable = await fetch(`${base}/notes/Research/browser-recovery/2026-01-15_resilient-source-recovery.md`);
  if (!stable.ok) throw new Error(`Stable note URL returned ${stable.status}`);
  const api = await fetch(`${base}/api/note?id=${encodeURIComponent("Research:browser-recovery/2026-01-15_resilient-source-recovery.md")}`);
  const payload = await api.json();
  if (!api.ok || !payload.content.includes("resilient source-recovery ladder")) throw new Error("Note API did not render source Markdown");
  const asset = await fetch(`${base}/assets/Research/browser-recovery/assets/recovery-ladder.svg`);
  if (!asset.ok || !String(asset.headers.get("content-type")).includes("image/svg+xml")) throw new Error("Local asset route failed");
  const traversal = await fetch(`${base}/assets/Research/%2E%2E/package.json`);
  if (traversal.ok) throw new Error("Asset traversal was not rejected");
  console.log(`Live portal smoke passed on ${base}`);
} finally {
  if (process.platform === "win32") child.kill("SIGTERM");
  else {
    try { process.kill(-child.pid, "SIGTERM"); } catch {}
  }
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 3000);
    child.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}
