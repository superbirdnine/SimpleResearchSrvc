#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { knowledgeRoots } from "./lib/roots.mjs";

const query = process.argv.slice(2).join(" ").trim().toLowerCase();
if (!query) {
  console.error("Usage: node scripts/knowledge-search.mjs <URL, title, slug, or phrase>");
  process.exit(1);
}

function walk(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.name.startsWith(".")) return [];
    return entry.isDirectory() ? walk(full) : entry.isFile() && /\.mdx?$/i.test(entry.name) ? [full] : [];
  });
}

const results = [];
for (const [collection, root] of Object.entries(knowledgeRoots())) {
  for (const file of walk(root)) {
    const content = fs.readFileSync(file, "utf8");
    const index = content.toLowerCase().indexOf(query);
    if (index >= 0 || file.toLowerCase().includes(query)) {
      results.push({ collection, file: path.relative(root, file), excerpt: content.slice(Math.max(0, index - 80), Math.max(0, index - 80) + 240).replace(/\s+/g, " ") });
    }
  }
}
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.length ? 0 : 2;
