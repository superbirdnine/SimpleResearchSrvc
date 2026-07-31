#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT, knowledgeRoots } from "./lib/roots.mjs";

const envFile = path.join(REPO_ROOT, ".env.local");
if (!fs.existsSync(envFile)) fs.copyFileSync(path.join(REPO_ROOT, ".env.example"), envFile);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const install = spawnSync(npmCommand, [fs.existsSync(path.join(REPO_ROOT, "package-lock.json")) ? "ci" : "install"], { cwd: REPO_ROOT, stdio: "inherit" });
if (install.status !== 0) process.exit(install.status ?? 1);
for (const root of Object.values(knowledgeRoots())) fs.mkdirSync(root, { recursive: true });
console.log(`Fieldnotes is ready. Run npm run dev (default: http://127.0.0.1:4210).`);
