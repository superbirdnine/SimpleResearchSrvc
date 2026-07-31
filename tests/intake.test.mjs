import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { captureItem, taxonomyPreflight } from "../scripts/lib/intake.mjs";

function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "fieldnotes-intake-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const roots = { Research: path.join(base, "Research"), Discovery: path.join(base, "Discovery") };
  fs.mkdirSync(path.join(roots.Research, "existing-topic"), { recursive: true });
  fs.mkdirSync(roots.Discovery, { recursive: true });
  fs.writeFileSync(path.join(roots.Research, "existing-topic", "prior.md"), "# Prior\n\nhttps://example.org/prior distinctive phrase\n");
  return roots;
}

const baseItem = {
  url: "https://example.org/new",
  title: "Synthetic source",
  captureDate: "2026-02-01",
  topic: "existing-topic",
  recoveryMethod: "browser-body-text",
  observed: "A directly visible sentence.",
  inference: "A labeled interpretation.",
};

test("classification is exactly one allowed value", (t) => {
  const roots = fixture(t);
  assert.throws(() => captureItem({ ...baseItem, classification: "Watchlist, Promote" }, { roots }), /exactly one/);
  assert.throws(() => captureItem({ ...baseItem, classification: "Unknown" }, { roots }), /exactly one/);
});

test("Ignore records a decision without writing a durable note", (t) => {
  const roots = fixture(t);
  const before = fs.readdirSync(roots.Research, { recursive: true }).length;
  const result = captureItem({ ...baseItem, classification: "Ignore" }, { roots });
  assert.equal(result.destination, null);
  assert.equal(fs.readdirSync(roots.Research, { recursive: true }).length, before);
});

test("Watchlist routes to Discovery and updates the watchlist", (t) => {
  const roots = fixture(t);
  const result = captureItem({ ...baseItem, classification: "Watchlist" }, { roots });
  assert.match(result.destination, /Discovery[/\\]quick-scans[/\\]2026-02-01_synthetic-source\.md$/);
  const note = fs.readFileSync(result.destination, "utf8");
  assert.match(note, /classification: "Watchlist"/);
  assert.match(note, /## Direct observation[\s\S]*directly visible/);
  assert.match(note, /## Inference[\s\S]*labeled interpretation/);
  assert.match(fs.readFileSync(path.join(roots.Discovery, "quick-scans", "WATCHLIST.md"), "utf8"), /Synthetic source/);
});

test("Promote routes to Research topic after taxonomy preflight", (t) => {
  const roots = fixture(t);
  const result = captureItem({ ...baseItem, url: "https://example.org/prior", classification: "Promote" }, { roots });
  assert.match(result.destination, /Research[/\\]existing-topic[/\\]2026-02-01_synthetic-source\.md$/);
  assert.ok(result.preflight.matches.some((match) => match.file.endsWith("prior.md")));
  assert.deepEqual(result.preflight.researchTopics, ["existing-topic"]);
});

test("taxonomy preflight searches both roots", (t) => {
  const roots = fixture(t);
  fs.writeFileSync(path.join(roots.Discovery, "breadcrumb.md"), "https://example.org/discovery-hit");
  const result = taxonomyPreflight({ url: "https://example.org/discovery-hit", title: "Other", topic: "new-topic", roots });
  assert.ok(result.matches.some((match) => match.collection === "Discovery"));
});
