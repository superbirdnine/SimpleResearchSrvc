import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("portal indexes full body text and emits stable note routes", () => {
  const notes = read("src/lib/notes.ts");
  const library = read("src/components/library.tsx");
  assert.match(notes, /searchText: `\$\{title\}[\s\S]*\$\{body\}`\.toLowerCase\(\)/);
  assert.match(library, /`\/notes\/\$\{encodeURIComponent\(note\.collection\)\}\/\$\{segments\.join\("\/"\)\}/);
  assert.match(library, /note\.searchText\.includes\(term\)/);
});

test("Markdown links and local assets follow the portal contract", () => {
  const library = read("src/components/library.tsx");
  assert.match(library, /target=\{external \? "_blank"/);
  assert.match(library, /rel=\{external \? "noopener noreferrer"/);
  assert.match(library, /`\/assets\/\$\{encodeURIComponent\(active\.collection\)\}/);
});

test("portal exposes no write route", () => {
  const routes = fs.readdirSync(path.join(root, "src/app/api"), { recursive: true }).map(String);
  assert.deepEqual(routes.filter((entry) => /route\.ts$/.test(entry)), [path.join("note", "route.ts")]);
  assert.doesNotMatch(read("src/app/api/note/route.ts"), /export async function (POST|PUT|PATCH|DELETE)/);
});

test("example capture is public-safe and uses the loose common header", () => {
  const note = read("knowledge/Research/browser-recovery/2026-01-15_resilient-source-recovery.md");
  for (const key of ["title", "source_url", "capture_date", "classification", "topic", "recovery_method"]) assert.match(note, new RegExp(`^${key}:`, "m"));
  assert.doesNotMatch(note, /\/Users\/|\.ts\.net|com\.[a-z0-9.-]+\.(?:plist|service)/i);
});
