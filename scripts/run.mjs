#!/usr/bin/env node
import { spawn } from "node:child_process";

const mode = process.argv[2] === "dev" ? "dev" : "start";
const host = process.env.FIELDNOTES_HOST || "127.0.0.1";
const port = process.env.FIELDNOTES_PORT || "4210";
const nextBin = process.platform === "win32" ? "next.cmd" : "next";
const child = spawn(nextBin, [mode, "--hostname", host, "--port", port], { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
