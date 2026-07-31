import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function configuredRoot(value: string | undefined, fallback: string) {
  const selected = value || fallback;
  return path.isAbsolute(selected) ? path.normalize(selected) : path.resolve(/* turbopackIgnore: true */ process.cwd(), selected);
}

export function getNoteRoots() {
  return {
    Research: configuredRoot(process.env.FIELDNOTES_RESEARCH_ROOT, "knowledge/Research"),
    Discovery: configuredRoot(process.env.FIELDNOTES_DISCOVERY_ROOT, "knowledge/Discovery"),
  } as const;
}

export type Collection = keyof ReturnType<typeof getNoteRoots>;

export type NoteSummary = {
  id: string;
  collection: Collection;
  relativePath: string;
  title: string;
  excerpt: string;
  searchText: string;
  topic: string;
  date: string | null;
  classification: string | null;
  tags: string[];
  modified: string;
};

export function noteIdFromRoute(collection: string, segments: string[]) {
  if (!(collection in getNoteRoots()) || !segments.length) return null;
  return `${collection}:${segments.join(path.sep)}`;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith(".")) return [];
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && /\.mdx?$/i.test(entry.name) ? [full] : [];
  });
}

function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`#>*_|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).slice(0, 12);
  if (typeof value === "string") return value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
  return [];
}

export function getNoteSummaries(): NoteSummary[] {
  const roots = getNoteRoots();
  return Object.entries(roots).flatMap(([collection, root]) =>
    walk(root).map((file) => {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = matter(raw);
      const relativePath = path.relative(root, file);
      const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
      const fallback = path.basename(file, path.extname(file)).replace(/^\d{4}-\d{2}-\d{2}_?/, "").replace(/[-_]/g, " ");
      const stat = fs.statSync(file);
      const body = plainText(parsed.content);
      const topic = String(parsed.data.topic || relativePath.split(path.sep)[0] || collection);
      const title = String(parsed.data.title || heading || fallback);
      const tags = normalizedTags(parsed.data.tags);
      const dateMatch = relativePath.match(/(\d{4}-\d{2}-\d{2})/);
      const dateValue = parsed.data.capture_date || parsed.data.date;
      return {
        id: `${collection}:${relativePath}`,
        collection: collection as Collection,
        relativePath,
        title,
        excerpt: body.slice(0, 260),
        searchText: `${title} ${topic} ${tags.join(" ")} ${relativePath} ${body}`.toLowerCase(),
        topic,
        date: dateValue ? String(dateValue).slice(0, 10) : dateMatch?.[1] || null,
        classification: parsed.data.classification ? String(parsed.data.classification) : null,
        tags,
        modified: stat.mtime.toISOString(),
      };
    }),
  ).sort((a, b) => (b.date || b.modified).localeCompare(a.date || a.modified));
}

function safeFile(root: string, relativePath: string, extension?: RegExp) {
  const resolvedRoot = path.resolve(root);
  const full = path.resolve(root, relativePath);
  if (!full.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error("Invalid path");
  if (extension && !extension.test(full)) throw new Error("Invalid file type");
  if (!fs.statSync(full).isFile()) throw new Error("Not a file");
  return full;
}

export function readNote(id: string) {
  const separator = id.indexOf(":");
  if (separator < 1) throw new Error("Invalid note id");
  const collection = id.slice(0, separator) as Collection;
  const relativePath = id.slice(separator + 1);
  const root = getNoteRoots()[collection];
  if (!root) throw new Error("Unknown collection");
  const raw = fs.readFileSync(safeFile(root, relativePath, /\.mdx?$/i), "utf8");
  const parsed = matter(raw);
  return { content: parsed.content, metadata: parsed.data };
}

export function resolveAsset(collection: string, segments: string[]) {
  const roots = getNoteRoots();
  if (!(collection in roots) || !segments.length) throw new Error("Unknown asset collection");
  return safeFile(roots[collection as Collection], path.join(...segments));
}
