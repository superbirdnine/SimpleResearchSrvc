import fs from "node:fs";
import path from "node:path";
import { knowledgeRoots } from "./roots.mjs";

export const CLASSIFICATIONS = ["Watchlist", "Promote"];

export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "untitled-source";
}

function markdownFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.name.startsWith(".")) return [];
    return entry.isDirectory() ? markdownFiles(full) : entry.isFile() && /\.mdx?$/i.test(entry.name) ? [full] : [];
  });
}

export function taxonomyPreflight({ url, title, topic, roots = knowledgeRoots() }) {
  const terms = [url, title, slugify(title), topic].filter(Boolean).map((value) => value.toLowerCase());
  const matches = [];
  for (const [collection, root] of Object.entries(roots)) {
    for (const file of markdownFiles(root)) {
      const haystack = `${file}\n${fs.readFileSync(file, "utf8")}`.toLowerCase();
      if (terms.some((term) => haystack.includes(term))) matches.push({ collection, file });
    }
  }
  const researchTopics = fs.existsSync(roots.Research)
    ? fs.readdirSync(roots.Research, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).sort()
    : [];
  return { matches, researchTopics };
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

export function renderNote(item) {
  return `---
title: ${yamlString(item.title)}
source_url: ${yamlString(item.url)}
capture_date: ${yamlString(item.captureDate)}
classification: ${yamlString(item.classification)}
topic: ${yamlString(item.topic)}
recovery_method: ${yamlString(item.recoveryMethod)}
---

# ${item.title}

## Direct observation

${item.observed || "- No source content was directly recoverable."}

## Inference

${item.inference || "- No inference recorded."}

## Uncertainty / gaps

${item.uncertainty || "- None recorded."}
`;
}

function confined(root, ...segments) {
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(root, ...segments);
  if (target !== resolvedRoot && !target.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error("Destination escapes configured knowledge root");
  return target;
}

export function captureItem(input, options = {}) {
  const roots = options.roots || knowledgeRoots(options.env);
  const item = {
    ...input,
    captureDate: input.captureDate || new Date().toISOString().slice(0, 10),
    topic: slugify(input.topic || "uncategorized"),
    recoveryMethod: input.recoveryMethod || "not-recovered",
  };
  if (!item.url || !item.title) throw new Error("url and title are required");
  if (!CLASSIFICATIONS.includes(item.classification)) throw new Error(`classification must be exactly one of: ${CLASSIFICATIONS.join(", ")}`);

  const preflight = taxonomyPreflight({ ...item, roots });
  let destination;
  if (item.classification === "Watchlist") {
    destination = confined(roots.Discovery, "quick-scans", `${item.captureDate}_${slugify(item.title)}.md`);
  } else {
    if (!item.topic || item.topic === "uncategorized") throw new Error("Promote requires an explicit topic after taxonomy preflight");
    destination = confined(roots.Research, item.topic, `${item.captureDate}_${slugify(item.title)}.md`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, renderNote(item), { flag: options.overwrite ? "w" : "wx" });

  if (item.classification === "Watchlist") {
    const watchlist = confined(roots.Discovery, "quick-scans", "WATCHLIST.md");
    fs.mkdirSync(path.dirname(watchlist), { recursive: true });
    if (!fs.existsSync(watchlist)) fs.writeFileSync(watchlist, "# Watchlist\n\n");
    fs.appendFileSync(watchlist, `- [${item.title}](${path.basename(destination)}) — captured ${item.captureDate}.\n`);
  }
  return { classification: item.classification, destination, preflight };
}
