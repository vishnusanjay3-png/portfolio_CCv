"""Builds public/resume.pdf: an ATS-friendly resume from the facts on the site.

ATS rules followed: one column, real selectable text, standard section headings, a standard font
(Helvetica), no tables, text boxes, icons or images, dates written out on the role line.
Run:  python3 scripts/resume.py
"""
import json
import re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether

OUT = Path(__file__).resolve().parent.parent / "public" / "resume.pdf"

NAME = "Vishnu Sanjay"
HEADLINE = "Content Creator | Content Strategist | Host | Creative Director"
# (shown text, link). Email and phone stay readable as text; web links are named, not pasted URLs.
CONTACT = [
    ("vishnu.sanjay3@gmail.com", "mailto:vishnu.sanjay3@gmail.com"),
    ("+91 87540 69029", "tel:+918754069029"),
    ("LinkedIn", "https://www.linkedin.com/in/aham-v/"),
    ("Portfolio Website", "https://vishnusanjay-port.vercel.app"),
    ("YouTube", "https://www.youtube.com/@vizsan3"),
]

SUMMARY = (
    "Content creator, content strategist and creative director who started out on film sets and now builds founders, brands and "
    "products through strategic content and storytelling. Owns the full creative loop: research, strategy, "
    "scripting, direction, editing, publishing and reading the numbers. Recent work includes growing a founder's "
    "LinkedIn audience from 4.2K to 11.4K followers, taking an AI product from 20 to 350+ users, and building "
    "a new AI agency's brand from launch day."
)

HIGHLIGHTS = [
    "~3x follower growth and ~30K impressions across founder and brand accounts",
    "350+ product sign-ups for GotCOS, an open-source AI chief of staff",
    "50+ pieces of content shared and 15 campaigns live across brands",
    "Assistant Creative Director on The Silent Prayer, a feature film scored by Maestro Ilaiyaraaja",
]

# (role, organisation, dates, one-line context, bullets)
EXPERIENCE = [
    ("Brand Designer", "Forward Company", "Jun 2026 – Present",
     "AI-first agency helping businesses become AI native.",
     ["Built the agency's brand from launch day: identity, positioning and campaigns.",
      "Ran competitive research across multiple agencies on positioning, campaign strategy and creative approach, "
      "and turned the insights into campaigns that sharpened the agency's market positioning.",
      "Owned the launch videos end to end, from concept and script to edit, communicating the brand's identity, "
      "values and vision.",
      "Designed promotional posters to the brand identity, planned the post-launch content calendar and wrote "
      "LinkedIn copy for the team."]),
    ("Brand Designer – Growth", "Hermitcrabs", "Oct 2025 – Present",
     "HubSpot CMS development and design agency with 300+ websites delivered.",
     ["Led content across event films, product announcements and product walkthroughs.",
      "Created the event films for HubSpot's yearly conference (INBOUND 2025, UNBOUND 2026): concept, script, "
      "voice-over, edit and motion.",
      "Produced product walkthrough videos showing clients exactly what they are getting, including the Prialto "
      "client portal and the HubCat project portal.",
      "Developed content strategy and campaigns that put the agency's people and culture on screen to build "
      "credibility and generate qualified leads."]),
    ("Creative Head", "Grekam Academy, Coimbatore", "Jun 2025 – Oct 2025",
     "Learning academy.",
     ["Led the creative side of the academy: marketing and branding concepts, videos, posters and social posts.",
      "Ran regular workshops to train junior designers and interns."]),
    ("Visual Designer (Contract)", "Mellow", "Jan 2025 – Jun 2025",
     "Retrospective tool that helps remote teams reflect, celebrate wins and grow together.",
     ["Created expressive, brand-aligned sticker sets that support async communication inside the product and "
      "became part of how people interact in the app.",
      "Designed for fun, delight and clarity, in line with Mellow's playful yet clean tone.",
      "Understood and expanded the design language to create new visual extensions."]),
    ("Product Designer (Contract)", "Freelance", "Jul 2024 – Present",
     "Feedback management platform: a lightweight tool for upvoting, tagging and resolution tracking.",
     ["Designed user flows and interfaces focused on usability.",
      "Worked closely with the product manager and senior designer to refine ideas, adapt to user needs and "
      "create a scalable, intuitive feedback experience.",
      "Supported fast-paced iterations in a startup environment, shaping a simple, effective system for "
      "capturing and managing user feedback."]),
    ("Freelance Creative", "NotSoFlashy", "Aug 2023 – Present",
     "Independent creative practice.",
     ["Branded photography, cinematography (DOP), scriptwriting, voice-overs, editing and graphic design for "
      "brands, often end to end from first idea to final file."]),
    ("Assistant Creative Director", "Palampur Talkies", "Dec 2022 – Jul 2023",
     "The Silent Prayer, a feature film scored by Maestro Ilaiyaraaja; premiered at the Red Lorry Film Festival.",
     ["Led the storyboards and shaped the set, prop and visual direction; designed sets and props in Photoshop "
      "with the art direction team and contributed to the graphic design and costume colour palette.",
      "Ran costume, art department and locations.",
      "Contributed at script readings, played a key role in talent acquisition and auditions, and coached artists "
      "on Tamil dialect nuances for the shoot.",
      "Supported the director as assistant director through pre-production and production, and worked with the "
      "director and art team on the film's marketing."]),
    ("Cast Member", "Nakkalites", "2022",
     "Tamil comedy channel.",
     ["Part of the recurring cast."]),
]

PROJECTS = [
    ("Miles Ukaoma – Founder Brand, LinkedIn and Podcast", "Aug 2025 – Present",
     ["Content strategy and personal branding for a Rio 2016 Olympian and SVP of Marketing at Quilt; grew his "
      "LinkedIn audience from 4.2K to 11.4K followers.",
      "Research, scripts, content calendars, talking points and ghostwritten posts; since December 2025 runs the "
      "weekly loop of research, script, edit, publish and analytics.",
      "Built an AI voice model trained on his speech to draft posts in his voice from each video's context.",
      "Shaped the format of CrispyMile, his podcast with Chris DuBois; prepared questionnaires and hosted."]),
    ("GotCOS – Product Launch", "2026",
     ["Content strategy for an open-source AI chief of staff, built around the line "
      "\"high performers build better systems\"; grew users from 20 to 350+.",
      "Scripted and edited the launch and tutorial videos and prepared assets for the GotCOS hackathon."]),
]

EDUCATION = [("Bachelor's in Visual Communication", "Clusters Institute of Media and Technology, Coimbatore", "2020 – 2023",
              "Specialised in photography, film and video production.")]

_films = json.loads((Path(__file__).resolve().parent.parent / "content" / "site.json").read_text())["films"]
_yt = {v["title"]: f"https://youtu.be/{v['id']}" for v in [_films["feature"], *_films["shorts"]]}
# each line: text with {Film Title} marking a name that links to its video
FILM = [
    "{Vindhya Victim Verdict V3} – feature film debut, cast",
    "{Luv} – short film, written, directed, edited and acted",
    "{Favourite Medicine} – short film, production manager, DOP and art",
    "Also cast in the short films {Ugavar}, {Perspective}, {The Arrival} and {The Visitor}",
]

SKILLS = [
    ("Creative", "Creative Direction, Brand Design, Brand Narrative, Directing, Producing, Storyboarding, "
                 "Art Direction, Photography, Cinematography (DOP), Illustration, Graphic Design, Performance"),
    ("Content", "Content Strategy, Personal Branding, Scriptwriting, Copywriting, Ghostwriting, LinkedIn Content, "
                "Content Calendars, Campaign Planning, Podcast Production, Social Media Analytics"),
    ("Production", "Video Editing, Motion Graphics, Voice-over, Product Walkthrough Videos, Event Films, "
                   "AI-assisted Writing Workflows"),
    ("Tools", "Adobe Premiere Pro, Adobe After Effects, Adobe Photoshop, Adobe Illustrator, Adobe XD, "
              "DaVinci Resolve, Figma, FigJam, Sketch, Remotion, Claude, GitHub, Vercel, Notion, Miro, Slack, Audacity"),
]

# ---- layout ---------------------------------------------------------------------------------------
INK, DIM, RULE = HexColor("#111111"), HexColor("#444444"), HexColor("#999999")
s_name = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=INK)
s_head = ParagraphStyle("head", fontName="Helvetica", fontSize=10.5, leading=14, textColor=DIM)
s_contact = ParagraphStyle("contact", fontName="Helvetica", fontSize=9.5, leading=13, textColor=DIM)
LINK = "#1f4fb8"
s_h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=INK, spaceBefore=8, spaceAfter=1)
s_role = ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=INK, spaceBefore=4.5)
s_ctx = ParagraphStyle("ctx", fontName="Helvetica-Oblique", fontSize=9.3, leading=12.2, textColor=DIM)
s_body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.3, leading=12.4, textColor=INK)
s_bullet = ParagraphStyle("bullet", parent=s_body, leftIndent=11, bulletIndent=2)


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def when(d: str) -> str:
    """A date range that never breaks across lines."""
    return esc(d).replace(" ", "&nbsp;")


def section(title):
    return [Paragraph(title.upper(), s_h2), HRFlowable(width="100%", thickness=0.6, color=RULE, spaceBefore=1, spaceAfter=3)]


def bullets(items):
    return [Paragraph(esc(b), s_bullet, bulletText="•") for b in items]


def linked(text: str) -> str:
    """{Name} → the name as a link to its video."""
    return re.sub(r"\{([^}]+)\}", lambda m: f'<a href="{_yt[m.group(1)]}" color="{LINK}"><u>{esc(m.group(1))}</u></a>', esc(text))


story = [
    Paragraph(esc(NAME), s_name),
    Paragraph(esc(HEADLINE), s_head),
    Paragraph(" | ".join(f'<a href="{esc(url)}" color="{LINK}"><u>{esc(text)}</u></a>' for text, url in CONTACT), s_contact),
]
story += section("Summary") + [Paragraph(esc(SUMMARY), s_body)]
story += section("Key Achievements") + bullets(HIGHLIGHTS)
story += section("Professional Experience")
for role, org, dates, ctx, items in EXPERIENCE:
    story.append(KeepTogether([
        Paragraph(f"{esc(role)}, {esc(org)} | {when(dates)}", s_role),
        *([Paragraph(esc(ctx), s_ctx)] if ctx else []),
        *bullets(items),
    ]))
story += section("Selected Projects")
for title, dates, items in PROJECTS:
    head = f"{esc(title)} | {when(dates)}" if dates else esc(title)
    story.append(KeepTogether([Paragraph(head, s_role), *bullets(items)]))
story += section("Education")
for degree, school, dates, note in EDUCATION:
    story += [Paragraph(f"{esc(degree)}, {esc(school)} | {when(dates)}", s_role), Paragraph(esc(note), s_body)]
story += section("Film and Screen") + [Paragraph(linked(f), s_bullet, bulletText="•") for f in FILM]
story += section("Skills")
for label, items in SKILLS:
    story.append(Paragraph(f"<b>{esc(label)}:</b> {esc(items)}", s_body))

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm, topMargin=12 * mm, bottomMargin=12 * mm,
                        title=f"{NAME} – Resume", author=NAME, subject=HEADLINE, creator=NAME)
doc.build(story)
print(f"wrote {OUT}")
