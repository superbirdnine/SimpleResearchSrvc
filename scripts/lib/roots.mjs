import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(REPO_ROOT, ".env.local"), quiet: true });
dotenv.config({ path: path.join(REPO_ROOT, ".env"), quiet: true });

export function resolveConfiguredPath(value, fallback) {
  const selected = value || fallback;
  return path.isAbsolute(selected) ? path.normalize(selected) : path.resolve(REPO_ROOT, selected);
}

export function knowledgeRoots(env = process.env) {
  return {
    Research: resolveConfiguredPath(env.FIELDNOTES_RESEARCH_ROOT, "knowledge/Research"),
    Discovery: resolveConfiguredPath(env.FIELDNOTES_DISCOVERY_ROOT, "knowledge/Discovery"),
  };
}
