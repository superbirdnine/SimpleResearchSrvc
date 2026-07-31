"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BookOpen, CaretRight, FileText, Folder, MagnifyingGlass, Moon, SidebarSimple, Sun, X } from "@phosphor-icons/react";
import type { NoteSummary } from "@/lib/notes";

type Filter = { collection?: string; topic?: string };

export function noteHref(note: Pick<NoteSummary, "collection" | "relativePath">, filter: Filter = {}) {
  const segments = note.relativePath.split(/[\\/]/).map(encodeURIComponent);
  const params = new URLSearchParams();
  if (filter.collection) params.set("collection", filter.collection);
  if (filter.topic) params.set("topic", filter.topic);
  return `/notes/${encodeURIComponent(note.collection)}/${segments.join("/")}${params.size ? `?${params}` : ""}`;
}

export function Library({ notes, initialSelectedId = "", initialFilter = {} }: { notes: NoteSummary[]; initialSelectedId?: string; initialFilter?: Filter }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [selected, setSelected] = useState(initialSelectedId);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(initialSelectedId));
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navOpen, setNavOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(Boolean(initialSelectedId));

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => counts.set(`${note.collection}:${note.topic}`, (counts.get(`${note.collection}:${note.topic}`) || 0) + 1));
    return [...counts.entries()].map(([key, count]) => {
      const [collection, ...rest] = key.split(":");
      return { collection, topic: rest.join(":"), count };
    }).sort((a, b) => a.collection.localeCompare(b.collection) || a.topic.localeCompare(b.topic));
  }, [notes]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (filter.collection && note.collection !== filter.collection) return false;
      if (filter.topic && note.topic !== filter.topic) return false;
      return !term || note.searchText.includes(term);
    });
  }, [notes, query, filter]);

  const active = notes.find((note) => note.id === selected);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    fetch(`/api/note?id=${encodeURIComponent(selected)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("read failed")))
      .then((data) => setContent(data.content))
      .catch(() => { if (!controller.signal.aborted) setContent("# Note unavailable\n\nThe source file could not be read."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected]);

  function selectNote(id: string) {
    const note = notes.find((item) => item.id === id);
    setReaderOpen(true);
    if (note) router.push(noteHref(note, filter), { scroll: false });
    if (id === selected) return;
    setLoading(true);
    setSelected(id);
  }

  function markdownUrl(url: string) {
    if (!active || /^(?:[a-z]+:|\/|#)/i.test(url)) return url;
    const resolved: string[] = [];
    const noteDirectory = active.relativePath.split(/[\\/]/).slice(0, -1);
    for (const segment of [...noteDirectory, ...url.split("/")]) {
      if (!segment || segment === ".") continue;
      if (segment === "..") resolved.pop();
      else resolved.push(segment);
    }
    return `/assets/${encodeURIComponent(active.collection)}/${resolved.map(encodeURIComponent).join("/")}`;
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <aside className={`sidebar ${navOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><BookOpen weight="duotone" /></span>
          <div><strong>Fieldnotes</strong><small>Local research</small></div>
          <button className="icon-button theme-button" aria-label="Toggle color theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon /> : <Sun />}</button>
        </div>
        <button className="all-notes" onClick={() => { setFilter({}); setNavOpen(false); }} data-active={!filter.collection}><FileText /> All notes <b>{notes.length}</b></button>
        {(["Research", "Discovery"] as const).map((collection) => (
          <section className="nav-group" key={collection}>
            <button className="collection" onClick={() => { setFilter({ collection }); setNavOpen(false); }}><span><Folder weight="fill" /> {collection}</span><b>{notes.filter((note) => note.collection === collection).length}</b></button>
            <div className="topic-list">
              {topics.filter((item) => item.collection === collection).map((item) => (
                <button key={`${collection}:${item.topic}`} data-active={filter.collection === collection && filter.topic === item.topic} onClick={() => { setFilter({ collection, topic: item.topic }); setNavOpen(false); }}><span>{item.topic.replace(/[-_]/g, " ")}</span><b>{item.count}</b></button>
              ))}
            </div>
          </section>
        ))}
        <div className="sidebar-footer">Read-only · Markdown is authoritative</div>
      </aside>

      <section className="index-pane">
        <header className="toolbar">
          <button className="icon-button mobile-only" aria-label="Open collections" onClick={() => setNavOpen(!navOpen)}><SidebarSimple /></button>
          <div className="search"><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search full note text" aria-label="Search full note text" /><button aria-label="Clear search" data-visible={Boolean(query)} onClick={() => setQuery("")}><X /></button></div>
        </header>
        <div className="list-heading"><div><span>{filter.topic ? filter.topic.replace(/[-_]/g, " ") : filter.collection || "Library"}</span><small>{filtered.length} notes</small></div></div>
        <div className="note-list">
          {filtered.length ? filtered.map((note) => (
            <Link className="note-row" data-active={note.id === selected} key={note.id} href={noteHref(note, filter)} scroll={false} onClick={(event) => { event.preventDefault(); selectNote(note.id); }}>
              <div className="row-meta"><span>{note.classification || note.collection}</span><time>{note.date || new Date(note.modified).toLocaleDateString()}</time></div>
              <h2>{note.title}</h2><p>{note.excerpt || "No preview available."}</p>
              <div className="row-path">{note.collection} / {note.relativePath}<CaretRight /></div>
            </Link>
          )) : <div className="empty"><MagnifyingGlass /><h2>No matching notes</h2><p>Try a broader phrase or another topic.</p></div>}
        </div>
      </section>

      <article className={`reader ${readerOpen ? "reader-open" : ""}`}>
        {active ? <>
          <header className="reader-header"><div><button className="reader-back" onClick={() => setReaderOpen(false)}><ArrowLeft /> Library</button><span>{active.collection} / {active.topic.replace(/[-_]/g, " ")}</span><h1>{active.title}</h1><p>{active.relativePath}</p></div></header>
          {loading ? <div className="reader-loading"><i /><i /><i /><i /></div> : <div className="markdown"><ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={markdownUrl}
            components={{
              a: ({ href, ...props }) => {
                const external = Boolean(href && /^(?:https?:)?\/\//i.test(href));
                return <a href={href} {...props} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} />;
              },
            }}
          >{content}</ReactMarkdown></div>}
        </> : <div className="empty reader-empty"><BookOpen /><h2>Select a note</h2><p>Choose a document from the library.</p></div>}
      </article>
      {navOpen && <button className="backdrop" aria-label="Close collections" onClick={() => setNavOpen(false)} />}
    </main>
  );
}
