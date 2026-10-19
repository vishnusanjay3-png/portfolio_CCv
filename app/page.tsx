import Effects from "./components/Effects";
import NavBrand from "./components/NavBrand";
import Intro from "./components/Intro";
import Cursor from "./components/Cursor";
import HeroReel from "./components/HeroReel";
import RotatingTitle from "./components/RotatingTitle";
import Contact from "./components/Contact";
import Work from "./components/Work";
import Backstory from "./components/Backstory";
import Films from "./components/Films";
import { site, rich } from "./lib/content";

const { hero, crafts, closing, footer } = site;

export default function Home() {
  return (
    <>
      <Intro />
      <Effects />
      <Cursor />

      <nav>
        <NavBrand />
        <div className="navlinks label">
          <a href="#work">Work</a>
          <a href="#story">Story</a>
          <a href="#films">Films</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <HeroReel>
        <div className="bill eyebrow"><RotatingTitle items={hero.eyebrows.map((t) => rich(t, "em"))} /></div>
        <h1 className="bill"><span className="ln">Vishnu</span><span className="ln out">Sanjay</span></h1>
        <p className="lead">{hero.lead}</p>
        <p>{hero.intro}</p>
      </HeroReel>

      <div className="marquee" aria-label="Crafts">
        <div className="track">
          {crafts.map((c) => <span key={c}>{c}</span>)}
          {crafts.map((c) => <span key={`dup-${c}`} aria-hidden="true">{c}</span>)}
        </div>
      </div>

      <Work />
      <Backstory />
      <Films />

      <section className="end wrap" id="contact">
        <span className="label">{closing.label}</span>
        <h2 className="bill" style={{ marginTop: 22 }}>{rich(closing.title, "span")}</h2>
        <Contact />
        <a className="resume-cta label" href="/resume.pdf" download="Vishnu-Sanjay-Resume.pdf">
          {closing.resume}
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </section>

      <footer className="wrap label">
        <span>{footer.left}</span>
        <span>{footer.right}</span>
      </footer>
    </>
  );
}
