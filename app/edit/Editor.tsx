"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Every write-up in content/site.json as an open text box, with the live site beside it.
   Typing saves to the file after a short pause; the preview picks the change up on its own. */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };
type Path = (string | number)[];

// Not writing: links, images, ids and colours stay out of the form.
const SKIP = new Set(["href", "logo", "brand", "img", "video", "src", "id", "tint", "art", "mark", "halo", "w", "h"]);

const SECTIONS: [string, string][] = [
  ["intro", "Intro"], ["nav", "Nav slate"], ["hero", "Hero"], ["showreel", "Showreel"], ["crafts", "Crafts marquee"], ["work", "The work"],
  ["story", "Backstory"], ["films", "Films"], ["closing", "Closing"], ["footer", "Footer"],
];

const LABELS: Record<string, string> = {
  eyebrows: "Titles above the name (one per line, in order)", lead: "Lead line", intro: "Intro",
  meta: "Small line on top", hook: "Hook", big: "Big number", bigCaption: "Big number caption",
  brief: "The situation", did: "What I did", result: "What happened", credits: "Credits",
  crafts: "Crafts", when: "Dates", org: "Company", role: "Role", body: "Text",
  posts: "Post cards", ctas: "Buttons", links: "Links", videos: "Videos", shot: "Picture",
  caption: "Caption", note: "Caption under it", platform: "Tag on the card", alt: "Image description (for screen readers)",
  heading: "Heading", label: "Small label", readMore: "Card button", situation: "Story heading 1",
  numbersLabel: "Numbers label", stats: "Numbers", n: "Number", p: "What it counts",
  projects: "Projects", beats: "Rows", feature: "Feature film", shorts: "Shorts", items: "Posts",
  left: "Left", right: "Right", slate: "Slate text", hint: "Hint under it", resume: "Resume button",
  scenes: "Scenes: top, work, backstory, films, closing",
};

// The story dialog's three headings share keys with project fields, so name them by place.
const labelFor = (key: string, parent: Path) => {
  if (parent.length === 1 && parent[0] === "work") {
    if (key === "did") return "Story heading 2";
    if (key === "result") return "Story heading 3";
  }
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

const itemName = (v: Json, i: number) => {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Obj;
    for (const k of ["name", "org", "title", "label", "n"]) if (typeof o[k] === "string" && o[k]) return o[k] as string;
  }
  return `#${i + 1}`;
};

const hasSkipped = (v: Json): boolean =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).some((k) => SKIP.has(k));

const blank = (v: Json): Json =>
  typeof v === "string" ? "" : Array.isArray(v) ? [] : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : v;

function setIn(root: Json, path: Path, value: Json): Json {
  if (!path.length) return value;
  const [k, ...rest] = path;
  if (Array.isArray(root)) { const a = [...root]; a[k as number] = setIn(a[k as number], rest, value); return a; }
  const o = { ...(root as Obj) }; o[k as string] = setIn(o[k as string], rest, value); return o;
}

function Area({ value, onChange, list }: { value: string; onChange: (v: string) => void; list?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; } }, [value]);
  return <textarea ref={ref} rows={1} value={value} spellCheck onChange={(e) => onChange(e.target.value)} placeholder={list ? "One per line" : ""} />;
}

export default function Editor() {
  const [data, setData] = useState<Json | null>(null);
  const [status, setStatus] = useState("Loading…");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => { setData(d); setStatus("All changes saved"); })
      .catch(() => setStatus("Couldn't load the content. Is `npm run dev` running?"));
  }, []);

  const save = useCallback((next: Json) => {
    setStatus("Saving…");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
        setStatus(r.ok ? "All changes saved" : `Not saved: ${await r.text()}`);
      } catch { setStatus("Not saved: the dev server isn't reachable"); }
    }, 500);
  }, []);

  const update = (path: Path, value: Json) => setData((d) => { const n = setIn(d, path, value); save(n); return n; });

  // Bring the matching part of the site into view in the preview.
  const reveal = (path: Path) => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const [top, , i] = path;
    let el: Element | null = null;
    if (top === "work" && path[1] === "projects") el = doc.querySelectorAll(".card")[i as number] ?? null;
    else if (top === "work" && path[1] === "stats") el = doc.querySelector(".tally");
    else if (top === "story" && path[1] === "beats") el = doc.querySelectorAll(".beat2")[i as number] ?? null;
    else el = doc.querySelector(({ hero: "#top", showreel: "#top", crafts: ".marquee", work: "#work", story: "#story", films: "#films", closing: "#contact", footer: "footer" } as Record<string, string>)[top as string] ?? "#top");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  function field(key: string, v: Json, path: Path): React.ReactNode {
    if (SKIP.has(key)) return null;
    const label = labelFor(key, path.slice(0, -1));
    if (typeof v === "string") {
      return (
        <label key={key} className="ed-field" onFocus={() => reveal(path)}>
          <span>{label}</span>
          <Area value={v} onChange={(x) => update(path, x)} />
        </label>
      );
    }
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      return (
        <label key={key} className="ed-field" onFocus={() => reveal(path)}>
          <span>{label} <em>one per line</em></span>
          <Area list value={(v as string[]).join("\n")} onChange={(x) => update(path, x.split("\n"))} />
        </label>
      );
    }
    if (Array.isArray(v)) {
      const editable = !v.some(hasSkipped);
      return (
        <fieldset key={key} className="ed-group">
          <legend>{label}</legend>
          {v.map((item, i) => (
            <div key={i} className="ed-item">
              <div className="ed-item-head">
                <b>{itemName(item, i)}</b>
                {editable && v.length > 1 && (
                  <button type="button" onClick={() => update(path, v.filter((_, j) => j !== i))}>Remove</button>
                )}
              </div>
              {typeof item === "string"
                ? field(String(i), item, [...path, i])
                : Object.entries(item as Obj).map(([k, x]) => field(k, x, [...path, i, k]))}
            </div>
          ))}
          {editable && v.length > 0 && (
            <button type="button" className="ed-add" onClick={() => update(path, [...v, blank(v[v.length - 1])])}>+ Add one</button>
          )}
        </fieldset>
      );
    }
    if (v && typeof v === "object") {
      const kids = Object.entries(v).map(([k, x]) => field(k, x, [...path, k]));
      if (path.length === 1) return <div key={key}>{kids}</div>;
      return <fieldset key={key} className="ed-group"><legend>{label}</legend>{kids}</fieldset>;
    }
    return null;
  }

  const saved = status === "All changes saved";

  return (
    <div className="ed">
      <style>{CSS}</style>
      <div className="ed-form">
        <header className="ed-top">
          <div>
            <h1>Write-ups</h1>
            <p>Type and it saves. Wrap words in <code>{"{curly brackets}"}</code> for the red accent. Links, images and logos aren&apos;t here; ask Claude for those.</p>
          </div>
          <span className={saved ? "ed-status ok" : "ed-status"} role="status">{status}</span>
        </header>
        <nav className="ed-jump">
          {SECTIONS.map(([k, t]) => <a key={k} href={`#ed-${k}`}>{t}</a>)}
        </nav>
        {data !== null && SECTIONS.map(([k, t]) => (
          <section key={k} id={`ed-${k}`} className="ed-section">
            <h2>{t}</h2>
            {field(k, (data as Obj)[k], [k])}
          </section>
        ))}
      </div>
      <div className="ed-preview">
        <iframe ref={frame} src="/" title="Live preview of the site" />
      </div>
    </div>
  );
}

const CSS = `
body{overflow:hidden}
#grain{display:none}
.ed{position:fixed;inset:0;display:grid;grid-template-columns:minmax(380px,560px) minmax(0,1fr);background:var(--black);color:var(--screen);font-family:var(--f);z-index:100}
.ed-form{overflow-y:auto;padding:0 24px 80px;border-right:1px solid var(--line)}
.ed-top{position:sticky;top:0;z-index:2;display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:22px 0 14px;background:var(--black)}
.ed-top h1{margin:0;font-stretch:62%;font-weight:800;text-transform:uppercase;font-size:34px;line-height:1}
.ed-top p{margin-top:8px;font-size:13px;color:var(--dim);max-width:44ch}
.ed-top code{color:var(--screen)}
.ed-status{flex:none;font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);color:var(--dim);white-space:nowrap}
.ed-status.ok{color:#9be29b;border-color:#2e4a2e}
.ed-jump{position:sticky;top:104px;z-index:2;display:flex;flex-wrap:wrap;gap:6px;padding:0 0 14px;background:var(--black);border-bottom:1px solid var(--line)}
.ed-jump a{font-size:12px;text-decoration:none;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:4px 10px}
.ed-jump a:hover{color:var(--screen);border-color:var(--screen)}
.ed-section{padding-top:28px;scroll-margin-top:150px}
.ed-section h2{margin:0 0 14px;font-stretch:62%;font-weight:800;text-transform:uppercase;font-size:26px;color:var(--safelight)}
.ed-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ed-field>span{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);font-stretch:87%;font-weight:600}
.ed-field em{font-style:normal;text-transform:none;letter-spacing:0;opacity:.7}
.ed textarea{width:100%;resize:none;overflow:hidden;font:inherit;font-size:15px;line-height:1.5;color:var(--screen);background:var(--raise);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.ed textarea:focus{outline:none;border-color:var(--safelight)}
.ed-group{border:0;border-left:2px solid var(--line);margin:0 0 18px;padding:0 0 0 14px;min-width:0}
.ed-group legend{padding:0;margin-bottom:10px;font-size:13px;font-weight:700;color:var(--screen)}
.ed-item{padding:12px 0 2px;border-top:1px dashed var(--line)}
.ed-item-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.ed-item-head b{font-size:15px}
.ed button{font:inherit;font-size:12px;color:var(--dim);background:none;border:1px solid var(--line);border-radius:999px;padding:4px 10px;cursor:pointer}
.ed button:hover{color:var(--screen);border-color:var(--screen)}
.ed-add{margin-top:4px}
.ed-preview{position:relative;background:#000}
.ed-preview iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
@media (max-width:1000px){.ed{grid-template-columns:1fr}.ed-preview{display:none}.ed-form{border-right:0}}
`;
