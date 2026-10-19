"use client";

import { useEffect, useState } from "react";

/**
 * The title above the name. Shows each item in order, one at a time, then loops.
 * Each stays up for `seconds` (6 by default, inside the 5 to 7 second range), including a short fade out/in.
 * The text itself lives in content/site.json (hero.eyebrows).
 */
export default function RotatingTitle({ items, seconds = 6 }: { items: React.ReactNode[]; seconds?: number }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"show" | "out" | "pre">("show");

  useEffect(() => {
    if (items.length < 2) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    const tick = setInterval(() => {
      setPhase("out"); // fade the current title up and out
      swap = setTimeout(() => {
        setI((n) => (n + 1) % items.length);
        setPhase("pre"); // new title sits just below, invisible...
        raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setPhase("show")); }); // ...then rises into place
      }, 400);
    }, seconds * 1000);
    return () => { clearInterval(tick); if (swap) clearTimeout(swap); cancelAnimationFrame(raf); };
  }, [items.length, seconds]);

  return <span className={`rot${phase === "show" ? "" : ` ${phase}`}`}>{items[i]}</span>;
}
