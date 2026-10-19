import { Fragment } from "react";
import raw from "@/content/site.json";
import type { Video } from "@/app/components/Thumb";
import type { Post } from "@/app/components/Post";

/* All the site's writing lives in content/site.json (edit it at /edit while `npm run dev` runs).
   Text conventions: {words} = the accent (red, or outlined in the closing title); a line break = <br>. */

export type Piece = { title: string; body: string };
export type Project = {
  name: string;
  meta: string;
  hook: string;
  big: string;
  bigCaption: string;
  brief: string;
  did: Piece[];
  result: string;
  links?: { label: string; items: { when: string; title: string; href: string }[] };
  credits: string[];
  logo: string;
  brand: [string, string];
};
export type Beat = {
  when: string;
  org: string;
  role: string;
  logo?: string;
  mark?: string;
  body: string;
  crafts?: string[];
  videos?: Video[];
  posts?: Post[];
  /** Pill buttons for the main external calls to action. */
  ctas?: { label: string; href: string }[];
  /** Small in-page links. */
  links?: { label: string; href: string }[];
  /** A picture beside the text. `halo` gives it the gold treatment (Palampur). */
  shot?: { src: string; alt: string; caption?: string; halo?: boolean; w?: number; h?: number };
};
export type Site = {
  intro: { title: string; hint: string };
  /** One per part of the page, in order: top, work, backstory, films, closing. "SC 01 · Title card" */
  nav: { scenes: string[] };
  hero: { eyebrows: string[]; lead: string; intro: string };
  showreel: { title: string; meta: string; slate: string };
  crafts: string[];
  work: {
    heading: string; label: string; readMore: string;
    situation: string; did: string; result: string;
    projects: Project[];
    numbersLabel: string;
    stats: { n: string; p: string }[];
  };
  story: { heading: string; label: string; beats: Beat[] };
  films: { heading: string; label: string; feature: Video; shorts: Video[] };
  closing: { label: string; title: string; resume: string };
  footer: { left: string; right: string };
};

// Lists edited one-per-line can carry blank lines mid-edit; drop them.
const clean = (v: unknown): unknown =>
  Array.isArray(v) ? v.filter((x) => x !== "").map(clean)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
  : v;

export const site = clean(raw) as Site;

/** Render text with {accent} marks and line breaks. `Accent` is the element the marked words get. */
export function rich(text: string, Accent: "i" | "em" | "span" = "i") {
  return text.split("\n").map((line, l) => (
    <Fragment key={l}>
      {l > 0 && <br />}
      {line.split(/(\{[^}]*\})/).map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <Fragment key={i}><Accent>{part.slice(1, -1)}</Accent><wbr /></Fragment>
        ) : (
          part
        ),
      )}
    </Fragment>
  ));
}
