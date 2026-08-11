# Handoff: Therapy Jo — Landing Page Redesign + Admin Content CMS

## Overview

Two deliverables for the Therapy Jo physiotherapy clinic (Amman, Jordan):

1. **Public landing page** — a visual redesign of the existing marketing site, plus three new sections: a Treatment Finder, a Doctors/Team grid, a Blog index with an in-page article view, and a Google Reviews block.
2. **Admin content management** — new areas inside the existing admin dashboard for managing blog posts and doctor profiles, an approvals queue for doctor-submitted profile changes, and role-based access control.

Both are bilingual (English / Arabic, LTR / RTL).

The source app is the Next.js project at \`CerciMuh/therapyjo_proposal\` (branch \`master\`). See \`github.md\` in the project root for the screen-to-source-file map.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes that demonstrate intended look, layout, and behavior. They are **not production code to copy directly**.

The task is to **recreate these designs in the existing codebase**: a Next.js App Router project using React, TypeScript, and plain CSS (\`src/app/globals.css\`), with translations in \`src/app/i18n/translations.ts\`. Follow the established patterns there — component-per-section files under \`src/app/components/\`, admin routes under \`src/app/admin/\`.

Each prototype is a single self-contained HTML file that opens directly in a browser. Interactions are real and clickable — open them and click through before implementing.

## Fidelity

**High fidelity.** Colors, typography, spacing, radii, shadows, and interaction states are all final and specified exactly below. Recreate the UI faithfully using the codebase's existing conventions.

Two deliberate exceptions:
- **Doctor photos and blog cover images are placeholders.** Only the head doctor's photo is real (\`public/noor_hamami_head_doctor.jpg\`). Every other image is an empty drop-zone awaiting real assets from the client.
- **Google Reviews numbers are placeholders** (4.9, "300+"). The four review quotes are written samples, not real reviews. See "Google Reviews" below for the integration decision that is still open.

---

# Part 1 — Public Landing Page

File: \`Landing Page.dc.html\`

## Page structure, in order

1. Accent hairline (2px, gradient primary → secondary, fixed at top)
2. Fixed navigation bar
3. Hero (full viewport height)
4. Scrolling stat marquee
5. About (image + copy + animated stat counters)
6. Services (numbered editorial list)
7. Treatment Finder ("Where does it hurt?") — **new**
8. Doctors / Team — **new**
9. Blog index, or single-article view — **new**
10. Google Reviews — **new**
11. Location (map embed + address + hours)
12. Contact CTA
13. Footer
14. Sticky booking bar (appears on scroll)
15. Floating WhatsApp button

## Design Tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| Ink / dark surface | \`#1a2e35\` | Nav background, Doctors section, footer, dark cards, primary body text |
| Ink light | \`#243b44\` | Marquee strip background, gradient end on Contact CTA |
| Primary (teal) | \`#4CAF93\` | Buttons, accents, section eyebrow labels, active states |
| Primary dark | \`#3a8f77\` | Button hover |
| Primary light | \`color-mix(in srgb, #4CAF93 55%, white)\` | Accents on dark backgrounds, nav link hover |
| Secondary (blue) | \`#2A7AB5\` | Category labels, service numerals, review avatars |
| Secondary light | \`color-mix(in srgb, #2A7AB5 55%, white)\` | Hero headline gradient end |
| Page background | \`#f8f5ef\` | Warm off-white — About, Finder, Blog, Reviews sections |
| White surface | \`#ffffff\` | Services and Location section backgrounds, cards |
| Body text | \`#4a6670\` | Paragraph copy |
| Muted text | \`#7a9aa5\` | Captions, dates, stat labels |
| Article body text | \`#3d5158\` | Single blog post paragraphs |
| Star gold | \`#d9b45c\` | Filled review stars |
| Star empty | \`#d9dfe1\` | Empty review stars |
| WhatsApp green | \`#25d366\` | Floating button only |

Alpha values used on dark backgrounds: text \`rgba(255,255,255,0.85)\` / \`0.78\` / \`0.6\` / \`0.55\`; borders \`rgba(255,255,255,0.06)\` / \`0.1\` / \`0.2\` / \`0.28\` / \`0.3\` / \`0.35\`.
On light backgrounds: borders \`rgba(26,46,53,0.06)\` / \`0.08\` / \`0.1\` / \`0.12\`.

### Typography

Fonts loaded from Google Fonts:
- **Bodoni Moda** (serif, opsz 6–96, weights 500–800) — display headings, English
- **Outfit** (sans, 600/700/800) — alternate display heading option
- **Inter** (sans, 400/500/600) — all body copy, English
- **Noto Kufi Arabic** (500/600/700) — all Arabic text, both headings and body

Heading font resolution:
- Arabic → \`'Noto Kufi Arabic', sans-serif\`
- English, Editorial mode (default) → \`'Bodoni Moda', serif\`
- English, Modern mode → \`'Outfit', sans-serif\`

Body font: \`'Inter', sans-serif\` (English) / \`'Noto Kufi Arabic', sans-serif\` (Arabic).

| Role | Size | Weight | Other |
|---|---|---|---|
| Hero H1 | \`clamp(2.8rem, 7.5vw, 5.6rem)\` | 700 | line-height 1.05, letter-spacing -0.01em |
| Section H2 | \`clamp(2rem, 4vw, 2.9rem)\` | 700 | line-height ~1.18 |
| Section eyebrow label | 0.95rem | 600 | **italic**, primary color |
| Article H1 | \`clamp(1.9rem, 4.5vw, 2.7rem)\` | 700 | line-height 1.2 |
| Card H3 | 1.1–1.18rem | 700 | line-height 1.35 |
| Body paragraph | 1.05rem | 400 | line-height 1.7–1.8 |
| Article paragraph | 1.08rem | 400 | line-height 1.9 |
| Small copy / captions | 0.8–0.9rem | 400 | line-height 1.5–1.6 |
| Nav link | 0.72rem | 600 | UPPERCASE, letter-spacing 0.05em |
| Button label | 0.7–0.82rem | 700 | UPPERCASE, letter-spacing 0.06–0.08em |
| Category tag | 0.68–0.7rem | 700 | UPPERCASE, letter-spacing 0.06em |
| Stat number | 2.1rem | 700 | heading font |
| Service numeral | 1.7rem | 700 | secondary color at 30% opacity |
| Rating number | 2.6rem | 800 | heading font |
| Pull-quote (reviews) | \`clamp(1.25rem, 2.5vw, 1.6rem)\` | 400 | **italic**, heading font, line-height 1.55 |

### Spacing, radii, shadows

- Section padding: \`clamp(4rem, 8vw, 7rem) 2rem\` (Comfortable) / \`clamp(5.5rem, 10vw, 9rem) 2rem\` (Spacious)
- Content max-widths: 1200px (most sections), 1100px (Finder), 980px (Services), 840px (hero copy), 760px (article body), 680px (review quote), 620px (rating card)
- Radii: **4px** buttons, inputs, image frames, social icons · **6px** logo, small chips · **8px** cards, article cover, rating card · **999px** pills and badges · **50%** avatars and the floating button
- Shadows:
  - Card rest: \`0 4px 16px rgba(26,46,53,0.06)\`
  - Card hover: \`0 16px 40px rgba(26,46,53,0.1)\`
  - Finder panel: \`0 8px 32px rgba(26,46,53,0.07)\`
  - About image: \`0 24px 60px rgba(26,46,53,0.18)\`
  - Location map: \`0 20px 60px rgba(26,46,53,0.12)\`
  - Doctor card: \`0 20px 50px rgba(0,0,0,0.35)\`
  - Floating button: \`0 4px 20px rgba(37,211,102,0.4)\`

## Section specifications

### Navigation (fixed)

Height ~72px. Background \`rgba(26,46,53,0.78)\` with \`backdrop-filter: blur(16px)\`, bottom border \`1px solid rgba(255,255,255,0.06)\`. Sits below the 2px gradient hairline (so \`top: 2px\`), z-index 200.

Inner container: max-width 1280px, padding \`0.85rem 1.25rem\`, \`display: flex\`, \`justify-content: space-between\`, \`gap: 1rem\`, **\`flex-wrap: nowrap\`**.

Three children:
1. Logo link (\`public/logo.jpg\`, height 40px, radius 6px) — \`flex-shrink: 0\`
2. Link group — 7 links, \`gap: 0.95rem\`, \`flex-wrap: nowrap\`, \`overflow: hidden\`, \`min-width: 0\`. Links are 0.72rem / 600 / uppercase / letter-spacing 0.05em / white at 0.75 opacity, \`white-space: nowrap\`. Hover: full opacity, color primary-light.
3. Actions group — \`gap: 0.6rem\`, **\`flex-shrink: 0\`**: hamburger (mobile only), language toggle, Book Now button.

**This nowrap + flex-shrink arrangement is load-bearing.** Without it the CTA wraps below the logo at laptop widths.

**Responsive:** below **1000px** the link group is hidden and a 44×44px hamburger appears. Tapping it opens a panel **inside the \`<nav>\` element** (so it inherits the fixed position and blurred dark background and overlays the hero rather than pushing the page down). Panel: top border \`rgba(255,255,255,0.08)\`, padding \`0.5rem 1.25rem 1rem\`, \`max-height: 70vh\`, \`overflow-y: auto\`, one column of 8 links at \`min-height: 48px\` each with a hairline divider. Links close the panel on click.

Language toggle: 0.72rem / 700, 1px border \`rgba(255,255,255,0.3)\`, radius 4px. Label is the *other* language — shows "عربي" in English mode, "EN" in Arabic mode.

### Hero

Full viewport height, background \`#1a2e35\`. Background image \`public/joint-manipulation.webp\`, \`object-fit: cover\`, opacity 0.42. Gradient scrim over it: \`linear-gradient(to bottom, rgba(15,26,31,0.72) 0%, rgba(15,26,31,0.5) 40%, rgba(15,26,31,0.92) 100%)\`.

Centered content, max-width 840px, entrance animation \`heroFadeUp 0.9s ease\` (opacity 0→1, translateY 24px→0):
- 34×2px primary-color rule, centered, 1.4rem below
- Pill badge: 1px border \`rgba(255,255,255,0.28)\`, radius 999px, padding \`0.45rem 1.1rem\`, 0.74rem uppercase, letter-spacing 0.08em
- H1 in two lines separated by \`<br>\`. The highlight word ("Recovery") is **italic** with a gradient text fill: \`linear-gradient(135deg, primaryLight, secondaryLight)\` + \`background-clip: text\` + transparent fill
- Subtitle, max-width 540px
- Two buttons, \`gap: 1rem\`: filled primary (WhatsApp) and outlined (tel:). Both hover \`translateY(-2px)\`

### Stat marquee

Strip on \`#243b44\`, padding \`0.85rem 0\`, \`overflow: hidden\`, bottom hairline. Inside: a \`width: max-content\` flex row, \`gap: 3rem\`, animated \`marquee 30s linear infinite\` (\`translateX(0)\` → \`translateX(-50%)\`). The text span is **duplicated twice** so the loop is seamless.

Text is assembled at runtime by joining, with \`"   •   "\` separators: the hero badge, each of the three stats ("500+ Happy Patients", etc.), and a tagline ("Not your typical physiotherapist" / "لسنا مجرد أخصائيي علاج طبيعي"), then a trailing separator. Rendered in the heading font, italic, 0.85rem, \`rgba(255,255,255,0.55)\`, \`white-space: nowrap\`.

### About

Two columns \`1fr 1fr\`, \`gap: 5rem\`, vertically centered, on \`#f8f5ef\`.

Left: image \`public/cupping.webp\` in a 4:3 frame, radius 4px, with a **2px primary-color outline frame offset behind it** — absolutely positioned at \`inset: 18px -18px -18px 18px\`, \`z-index: 0\`, image wrapper at \`z-index: 1\`.

Right: italic eyebrow, H2, two paragraphs, then a three-column stat row with a top hairline \`rgba(26,46,53,0.12)\`, each cell \`padding: 1.4rem\` on top with asymmetric side padding (first cell pads right only, middle both, last left only).

**Stat counters animate.** An IntersectionObserver at \`threshold: 0.3\` on the stat row triggers a count-up to 500 / 10 / 9 over **1400ms** with cubic ease-out (\`1 - (1-p)³\`) via requestAnimationFrame. Runs once. The first two display their suffixed label ("500+", "10+") only once the target is reached; before that they show the raw number.

Whole right column also fades in — see "Scroll reveal".

### Services

White background, max-width 980px. Centered header block (italic eyebrow, H2, subtitle), 4rem below.

**Not cards — a numbered editorial list.** A single column with a top hairline; each row: \`display: flex\`, \`align-items: center\`, \`gap: 1.75rem\`, \`padding: 1.7rem 0.5rem\`, bottom hairline \`rgba(26,46,53,0.1)\`. Hover: background \`#f8f5ef\` (0.25s).

Row contents, in order:
1. Zero-padded numeral ("01"…"09"), 1.7rem / 700, secondary color at 0.3 opacity, fixed 52px width
2. 52×52px icon tile, radius 12px, \`linear-gradient(160deg, #e8f5f0, #dff0ea)\`, holding a 30×30px PNG icon
3. Title (1.12rem / 700) over description (0.88rem, line-height 1.55), \`flex: 1\`

Nine services in this order, mapped to these icons:

| # | Service | Icon |
|---|---|---|
| 01 | Cold Laser Therapy | \`public/icons/cold-laser.png\` |
| 02 | Radio Frequency Therapy | \`public/icons/radio-frequency.png\` |
| 03 | Pelvic Floor Rehabilitation | \`public/icons/pelvic-floor.png\` |
| 04 | Electromagnetic Pelvic Floor | \`public/icons/electromagnetic.png\` |
| 05 | Traction Therapy | \`public/icons/traction.png\` |
| 06 | Sport Rehabilitation | \`public/icons/sport-rehab.png\` |
| 07 | Post-Op Rehabilitation | \`public/icons/post-op.png\` |
| 08 | Pediatric Physical Therapy | \`public/icons/pediatric.png\` |
| 09 | Dry Needling & Acupuncture | \`public/icons/dry-needling.png\` |

Each service also carries a category (\`technology\` / \`manual\` / \`rehabilitation\`) used by the Finder and available for filtering; the category label is present in the row markup but \`display: none\` in this design.

### Treatment Finder — new

Section id \`finder\`, on \`#f8f5ef\`, top hairline, max-width 1100px. Centered header (eyebrow "Treatment Finder", H2 "Where does it hurt?", subtitle).

Two columns \`300px 1fr\`, \`gap: 2.5rem\`, \`align-items: start\`.

**Left — body-area list.** Six buttons in a column, \`gap: 0.5rem\`. Each: \`min-height: 52px\`, padding \`0.85rem 1.1rem\`, radius 6px, 0.95rem / 600, \`text-align: start\`, \`justify-content: space-between\`, 0.2s transition.
- Inactive: white background, \`#1a2e35\` text, 1px border \`rgba(26,46,53,0.12)\`
- Active: \`#1a2e35\` background, white text, matching border, and a trailing arrow glyph (→ in LTR, ← in RTL) at 1.1rem / 0.5 opacity

**Right — recommendation panel.** White, radius 8px, padding 2.25rem, 1px border \`rgba(26,46,53,0.08)\`, shadow \`0 8px 32px rgba(26,46,53,0.07)\`. Contains: "Recommended for" label (0.7rem uppercase, secondary), area name as H3 (1.65rem / 700), the area's note paragraph, then three treatment rows, then a filled primary CTA "Book This Treatment" linking to WhatsApp.

Treatment row: \`display: flex\`, \`gap: 1rem\`, padding \`0.9rem 1rem\`, background \`#f8f5ef\`, radius 6px; 40×40px icon tile (radius 8px, same gradient, 24px icon) + title (0.95rem / 700) over category label (0.82rem, muted).

**Area → service index mapping** (indices into the nine services above, zero-based):

| Area | Services shown |
|---|---|
| Neck & Shoulders | 4, 8, 0 → Traction, Dry Needling, Cold Laser |
| Lower Back | 4, 0, 1 → Traction, Cold Laser, Radio Frequency |
| Knee & Leg | 5, 6, 1 → Sport Rehab, Post-Op, Radio Frequency |
| Hip & Pelvis | 2, 3, 0 → Pelvic Floor, Electromagnetic, Cold Laser |
| After Surgery | 6, 5, 0 → Post-Op, Sport Rehab, Cold Laser |
| Sports Injury | 5, 8, 1 → Sport Rehab, Dry Needling, Radio Frequency |

Area copy (English) — Arabic equivalents are in the prototype's translation object:
- **Neck & Shoulders** — "Desk posture, tension headaches, and restricted rotation usually respond to a mix of manual release and needling."
- **Lower Back** — "For disc pressure and chronic stiffness we combine decompression with targeted soft-tissue work."
- **Knee & Leg** — "Whether it's overuse or a recovering ligament, the focus is controlled loading and gradual return to full range."
- **Hip & Pelvis** — "Pelvic floor and deep hip work, including non-invasive electromagnetic strengthening where appropriate."
- **After Surgery** — "A staged plan that protects the repair first, then rebuilds strength and mobility week by week."
- **Sports Injury** — "Sport-specific rehab with clear return-to-play benchmarks, not just a date on the calendar."

Default selection: the first area. Selecting is instant, no transition on panel content.

### Doctors / Team — new

Section id \`doctors\`, background \`#1a2e35\` (the one dark content section). Centered header in white with primary-light eyebrow.

Grid: \`repeat(auto-fit, minmax(220px, 1fr))\`, \`gap: 1.5rem\`. Five cards seeded.

**Poster-style card.** \`position: relative\`, \`aspect-ratio: 4/5\`, radius 8px, \`overflow: hidden\`, shadow \`0 20px 50px rgba(0,0,0,0.35)\`. Hover: \`translateY(-6px)\` over 0.35s.

Layers: photo absolutely filling the card (\`object-fit: cover\`) → gradient scrim \`linear-gradient(to top, rgba(10,18,22,0.95) 0%, rgba(10,18,22,0.25) 55%, transparent 78%)\` with \`pointer-events: none\` → text block pinned to the bottom, padding \`1.3rem 1.1rem\`: name (1.15rem / 700, white), role (0.85rem / 600, primary-light), specialty (0.76rem, \`rgba(255,255,255,0.55)\`).

Card 1 is the head doctor with the real photo, role "Head Physiotherapist", specialty "Manual Therapy & Sports Rehab". Cards 2–5 are placeholders: name "Doctor Name", role "Physiotherapist", specialty "Profile coming soon", and an empty photo drop-zone. **These are populated from the admin Doctors CMS** — see Part 2.

### Blog — new

Section id \`blog\`, on \`#f8f5ef\`. Two mutually exclusive views in the same section, switched by state, no route change.

**Index view.** Centered header (eyebrow "Health & Recovery Blog", H2 "From the Clinic"). Grid \`repeat(auto-fit, minmax(300px, 1fr))\`, \`gap: 1.75rem\`.

Card: white, radius 8px, 1px border \`rgba(26,46,53,0.06)\`, shadow \`0 4px 16px rgba(26,46,53,0.06)\`, \`overflow: hidden\`. Hover: \`translateY(-4px)\` + \`0 16px 40px rgba(26,46,53,0.1)\`. Structure: 16:9 cover image → body at padding 1.6rem containing a meta row (category 0.68rem uppercase secondary + "— date" muted), title H3, excerpt, then a text "Read Article" button — 0.82rem / 600 / uppercase with a **1px primary bottom border** and \`padding-bottom: 0.15rem\`, no background.

**Article view.** max-width 760px. Back button ("← Back to Blog", 0.82rem uppercase primary, 2.5rem below), meta row, H1, 16:9 cover with radius 8px, then paragraphs at 1.08rem / line-height 1.9 with \`margin-bottom: 1.3rem\`.

Six seeded posts (full body copy is in the prototype — three paragraphs each):

| Category | Date | Title |
|---|---|---|
| Recovery Tips | Jul 2, 2026 | 5 Stretches to Ease Lower Back Pain at Home |
| Rehabilitation | Jun 18, 2026 | Understanding Post-Surgery Rehabilitation: What to Expect |
| Treatments | Jun 4, 2026 | Dry Needling vs. Acupuncture: What's the Difference? |
| Sports | May 21, 2026 | How Sports Physiotherapy Speeds Up Recovery |
| Women's Health | May 7, 2026 | Pelvic Floor Health: Why It Matters at Every Age |
| Guidance | Apr 23, 2026 | When Should You See a Physiotherapist? |

**Implementation note:** the prototype swaps views in local state because it is a single file. In the real app these should be **real routes** — \`/blog\` and \`/blog/[slug]\` — so posts are linkable, shareable, and indexable. Add \`slug\` to the post model and generate metadata per post.

### Google Reviews — new

Section id \`reviews\`, on \`#f8f5ef\`. Centered header.

**Rating summary card.** max-width 620px, centered, background \`#1a2e35\`, radius 8px, padding \`1.5rem 2rem\`, flex row \`gap: 1.25rem\`, wraps. Contents: rating number ("4.9") at 2.6rem / 800 white → a block with five gold stars (1.2rem, letter-spacing 2px) above "Based on 300+ Google reviews" (0.85rem, \`rgba(255,255,255,0.6)\`) → a filled primary button "See All Reviews on Google" pushed to the end with \`margin-inline-start: auto\`, linking to the clinic's Google search results.

**Quote spotlight** (not a grid). max-width 680px, centered: a large decorative italic quote mark (4.5rem, primary at 0.3 opacity, \`line-height: 0.5\`) → the review text as an italic pull-quote in the heading font → an attribution row (38px circular secondary-colored initial avatar + name + that reviewer's star rating) → a row of dot buttons, \`gap: 0.55rem\`, each 8×8px and circular; active dot is primary, inactive \`#d9dfe1\`.

Four sample reviews (R. Sami ★5, L. Haddad ★5, M. Odeh ★4, D. Nassar ★5) with quotes in the prototype. Rating rendering: \`"★".repeat(rating)\` in gold followed by \`"★".repeat(5 - rating)\` in grey.

**Open decision — how reviews are sourced.** The client chose "live Google widget embed, real reviews later", so this block is currently static placeholder content shaped like the real thing. Two paths:
1. **Google Places API** (\`place_details\` with the \`reviews\` field) fetched server-side and cached. Returns at most 5 reviews and no pagination; rating and total count are reliable. This keeps the design exactly as specified.
2. **Third-party widget** (Elfsight, Trustindex, etc.) — more reviews, but the vendor's markup replaces this design and adds a script dependency.

Recommend path 1 with an ISR cache (revalidate hourly) so the design survives. Do not hardcode 4.9 / 300+ in production.

### Location

Two columns \`1fr 1fr\`, \`gap: 3rem\`, \`align-items: start\`, white background. Left: Google Maps iframe in a 4:3 frame, radius 4px, \`loading="lazy"\`. Right: eyebrow, H2, subtitle, then two info blocks separated by top hairlines — address (40×40px \`#f8f5ef\` tile with 📍, radius 4px, primary color) and working hours as three label/value rows with hairline dividers.

Hours: Saturday–Wednesday 10:00 AM – 7:00 PM · Thursday 10:00 AM – 3:00 PM · Friday 10:00 AM – 7:00 PM.

Address: Az-Zubayr Ben Al-Awwam St., Amman, Jordan.

**Note:** the iframe currently uses an approximate embed URL. Replace with the clinic's real Google Maps place embed.

### Contact CTA

Background \`linear-gradient(135deg, #1a2e35 0%, #243b44 100%)\`, centered, max-width 700px. Eyebrow in primary-light, white H2, subtitle at \`rgba(255,255,255,0.7)\`, then three outlined buttons (\`min-width: 190px\`, radius 4px, 1px border \`rgba(255,255,255,0.2)\`, 0.78rem uppercase): WhatsApp, Call Now, @therapyjocenter. Hover brightens border to 0.5 and text to white.

### Footer

Background \`#1a2e35\`, padding \`3rem 2rem 1.5rem\`. Upper grid \`1.5fr 1fr 1fr\`, \`gap: 3rem\`: logo + description (max-width 300px) · Quick Links (About Us, Our Team, Blog, Location) · Services (all nine titles, linking to \`#services\`). Link rows are 0.9rem at \`rgba(255,255,255,0.6)\`, \`padding: 0.3rem 0\`, hover primary-light.

Lower bar: top hairline, \`padding-top: 1.5rem\`, space-between, 0.8rem: copyright left, three 38×38px social tiles right (radius 4px, 1px border \`rgba(255,255,255,0.15)\`) labelled IG / WA / FB linking to Instagram, WhatsApp, and Facebook.

### Sticky booking bar

Fixed to the bottom, z-index 160, background \`rgba(26,46,53,0.95)\` + \`blur(16px)\`, top border \`rgba(255,255,255,0.1)\`.

Hidden state \`translateY(110%)\` + \`opacity: 0\`; shown \`translateY(0)\` + \`opacity: 1\`. Transition: \`transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)\` and \`opacity 0.4s ease\`. Reveals when \`window.scrollY > window.innerHeight * 0.85\` (passive scroll listener).

Content: max-width 1280px, space-between, wraps. Left: italic heading-font line "Ready when you are." plus a primary-light slot line. Right: outlined Call button + filled primary Book Now.

**"Next available: today, 4:00 PM" is placeholder copy.** Either wire it to real availability from the booking system or replace it with something static and honest.

Desktop padding is \`0.85rem 6rem 0.85rem 2rem\` — the extra right padding clears the floating WhatsApp button. On mobile it becomes \`0.85rem 1.25rem\` and the floating button hides while the bar is up (the bar already offers WhatsApp).

### Floating WhatsApp button

Fixed \`bottom: 1.5rem; right: 1.5rem\`, z-index 150, 56×56px, circular, \`#25d366\`, 💬 at 1.4rem, shadow \`0 4px 20px rgba(37,211,102,0.4)\`. Hover \`scale(1.08)\`. Carried over from the existing site.

## Interactions & Behavior

### Scroll reveal
Section header blocks and the About copy column start at \`opacity: 0\` / \`translateY(24px)\` with \`transition: opacity 0.8s ease, transform 0.8s ease\`, and animate in when an IntersectionObserver at \`threshold: 0.15\` first sees them. Each element is unobserved after firing, so it reveals once. Elements are marked with a data attribute and re-scanned after updates (needed because language switching re-renders).

### Language toggle
Switches the entire page between English and Arabic: \`dir\` flips \`ltr\` ↔ \`rtl\` on the root, both fonts swap to Noto Kufi Arabic, all copy comes from the translation object, and the Finder's arrow glyph flips direction. Logical properties (\`margin-inline-start\`, \`text-align: start\`) are used wherever direction matters.

In the real app this is \`src/app/i18n/translations.ts\` — extend it with the new \`finder\`, \`blog\`, \`reviews\`, \`doctors\`, \`bookBar\`, and \`tagline\` keys.

### Responsive breakpoints
Driven by a resize listener rather than media queries (a constraint of the prototype format — **use real CSS media queries in production**).

| Width | Behavior |
|---|---|
| < 1000px | Nav links → hamburger panel; About / Location / Finder collapse to one column; About column gap 5rem → 2.5rem |
| < 760px | Footer grid → single column, gap 2rem; sticky bar padding tightens; floating WhatsApp hides while the bar is visible |

Between 760px and 1000px the footer is two columns. Doctors, Blog, Services, and Reviews grids are already fluid via \`auto-fit\` / \`minmax\`.

### Hover states
Buttons darken (primary → primary-dark) and some lift \`translateY(-2px)\`. Cards lift 4–6px and deepen their shadow. Nav and footer links go to full opacity / primary-light. Service rows tint \`#f8f5ef\`.

## State (landing page)

| State | Type | Purpose |
|---|---|---|
| \`lang\` | \`"en" \\| "ar"\` | Active language; drives dir, fonts, all copy |
| \`view\` | \`"home" \\| "post"\` | Blog index vs. article — **replace with routing** |
| \`activePostId\` | number \\| null | Which article is open |
| \`activeReviewIndex\` | number | Which review the spotlight shows |
| \`activeAreaIndex\` | number | Which Finder body area is selected |
| \`counters\` | number[3] | Animated stat values |
| \`showBookBar\` | boolean | Sticky bar visibility (scroll) |
| \`isNarrow\` / \`isMobile\` | boolean | Viewport flags — **replace with CSS media queries** |
| \`menuOpen\` | boolean | Mobile nav panel |

## Themeable options

The prototype exposes four switchable presets. Treat them as **design exploration**, not required product features — pick the chosen values and hardcode them unless the client wants runtime theming.

- **Accent palette** — Teal Classic \`#4CAF93 / #3a8f77 / #2A7AB5\` (default) · Emerald & Ink \`#1F7A5C / #155843 / #1A2E35\` · Bronze & Navy \`#B08D57 / #8C6D3F / #1A2E35\`
- **Typography** — Editorial (Bodoni Moda, default) · Modern (Outfit)
- **Density** — Comfortable · Spacious (section padding only)
- **Card style** — Soft (white + hairline border) · Glass (\`rgba(255,255,255,0.55)\` + \`blur(12px)\`)

---

# Part 2 — Admin Content Management

File: \`Admin Dashboard.dc.html\`

Extends the existing admin at \`src/app/admin/\`. The dashboard/appointments view is reproduced only as context — **the new work is Blog, Doctors, Approvals, and the role gating**.

## Visual language

Dark UI on \`#1a2e35\`, Inter throughout, Outfit for the wordmark. Distinct from the public site by design.

- Surfaces: \`rgba(255,255,255,0.03)\` panels, \`rgba(255,255,255,0.06)\` borders, radius 10–12px
- Inputs: \`rgba(255,255,255,0.05)\` background, \`rgba(255,255,255,0.1)\` border, radius 8px, padding \`0.65rem 0.85rem\`, white text, \`outline: none\`, placeholder \`rgba(255,255,255,0.3)\`
- Primary action: \`linear-gradient(135deg, #059669, #10b981)\`, radius 8px. Save actions use flat \`#4CAF93\`
- Modal: \`#243b44\`, radius 14px, padding 1.75rem, \`max-width: 520px\`, \`max-height: 90vh\`, scrim \`rgba(0,0,0,0.6)\` + \`blur(4px)\`
- Wordmark: "Therapy Jo", Outfit 700, 1.1rem, \`#4CAF93\`

**Status colors** (used consistently in badges, filter chips, and editor buttons):

| Status | Background | Text |
|---|---|---|
| Published | \`rgba(16,185,129,0.15)\` | \`#6ee7b7\` |
| Scheduled | \`rgba(96,165,250,0.15)\` | \`#93c5fd\` |
| Archived | \`rgba(245,158,11,0.13)\` | \`#fcd34d\` |
| Draft | \`rgba(255,255,255,0.08)\` | \`rgba(255,255,255,0.5)\` |

Action button tints: edit \`rgba(96,165,250,0.15)\` / \`#93c5fd\` · archive \`rgba(245,158,11,0.15)\` / \`#fcd34d\` · restore & approve \`rgba(16,185,129,0.15)\` / \`#6ee7b7\` · reject & sign-out \`rgba(239,68,68,0.12)\` / \`#fca5a5\`.

## Access control

**Roles:** \`Head Doctor\`, \`Clinic Manager\`, \`Staff\`.

Content management (Blog, Doctors, Approvals) is available to **Head Doctor and Clinic Manager**. Staff accounts **do not see these nav items at all** — hidden, not disabled — and are redirected to the Dashboard if they somehow land on a restricted section.

This is a **role capability**, not a check against one named user. Model it as a permission (e.g. \`canManageContent\`) attached to the role so the client can grant a manager access without a code change. Enforce it server-side on every mutation, not only in the UI.

The prototype's "Viewing as" dropdown is a **demo affordance** for showing the client each permission state. Do not ship it — the real app reads the role from the session.

## Navigation bar

Sticky, \`min-height: 56px\` (**not a fixed height** — it must be able to grow), padding \`0.5rem 1.5rem\`, \`box-sizing: border-box\`, \`flex-wrap: wrap\`, \`row-gap: 0.35rem\`, background \`rgba(26,46,53,0.85)\` + \`blur(20px)\`, bottom hairline, z-index 100.

Three groups: wordmark · section tabs · account controls (⌘K search pill, role indicator, avatar, Sign Out).

Tabs: Dashboard · Employees · Patients · Notes · divider · Blog · Doctors · Approvals. The last three are the new, permission-gated ones. Active tab has background \`rgba(255,255,255,0.1)\`; hover \`rgba(255,255,255,0.06)\`. The tab group is \`flex-wrap: nowrap\` with \`overflow-x: auto\`.

Approvals carries a **count badge** when items are pending: \`#f59e0b\` background, \`#3a2606\` text, radius 999px, \`min-width: 17px\`, 0.68rem / 700.

**Below 1250px** the tab group moves to its own full-width row (flex order and \`flex-basis: 100%\`) and the "Viewing as" label hides. Account controls stay on the top row via \`margin-inline-start: auto\`. In production express this with media queries; the important constraint is that **the bar grows instead of clipping** when content wraps.

## Screen: Dashboard

Existing appointment list and day summary, plus a **new summary strip** visible only to content-capable roles: \`repeat(auto-fit, minmax(180px, 1fr))\`, \`gap: 0.85rem\`. Four clickable cards, each navigating to the relevant screen:

| Card | Value | Color | Goes to |
|---|---|---|---|
| Pending approvals | count | \`#fcd34d\` when > 0, else white | Approvals |
| Published posts | count | \`#6ee7b7\` | Blog |
| Scheduled | count | \`#93c5fd\` | Blog |
| Team on site | visible doctor count | white | Doctors |

Card: label 0.72rem uppercase \`rgba(255,255,255,0.4)\` → value 1.5rem / 700 → note 0.76rem \`rgba(255,255,255,0.35)\`. Hover brightens the border to \`rgba(255,255,255,0.18)\`.

## Screen: Blog Posts (list)

Header with "+ New Post" (gradient button) and an access note.

**Filter chips:** All · Published · Scheduled · Drafts · Archived, each with a live count. Pill buttons, radius 999px, 0.8rem / 600; active gets \`rgba(255,255,255,0.12)\` background and \`rgba(255,255,255,0.3)\` border. "All" **excludes** archived posts.

**Table** in a panel with radius 10px. Columns: Title · Lang · Category · Status · Date · Actions. Header cells 0.72rem uppercase \`rgba(255,255,255,0.4)\` with a bottom border; body rows 0.88rem with \`rgba(255,255,255,0.04)\` dividers.

- **Title** cell shows the title with a 0.74rem sub-line beneath: "Arabic version linked" / "English version linked" / "No translation"
- **Lang** cell is a small outlined \`EN\` / \`AR\` chip
- **Status** is a pill using the status colors above
- **Actions:** Edit always; Archive on non-archived rows; Restore on archived rows (restores to Draft)

Empty state: "Nothing here yet." centered at 0.88rem \`rgba(255,255,255,0.35)\`.

## Screen: Post editor

Two columns \`1fr 340px\` (single column below 900px).

**Left column:**
- Title input
- Category select (Recovery Tips · Rehabilitation · Treatments · Sports · Women's Health · Guidance) and a **Language** two-button toggle (English / العربية)
- **Publishing** — three buttons: Draft / Scheduled / Published, each tinted with its status color when active
  - Choosing **Scheduled** reveals an inline \`datetime-local\` field in a blue-tinted panel (\`rgba(96,165,250,0.08)\`, border \`rgba(96,165,250,0.2)\`): "Goes live on"
  - Choosing **Published** reveals a green-tinted panel: "Live on the public site." plus an **Unpublish → Draft** button
- **Body** — a mock formatting toolbar (B / I / link / list) attached to the top of a 10-row textarea; the textarea's \`dir\` flips to \`rtl\` when the post language is Arabic
- Footer row: a "Last saved HH:MM" hint on the left, Cancel and Save Post on the right

The toolbar is presentational. Use whatever rich-text editor the codebase already has; if none, prefer a Markdown field over building one.

**Right column:**
- **Cover Image** — 16:9 drop zone, radius 10px
- **Translation** panel — states whether a counterpart exists and offers either "Open translation" or "Create Arabic/English version". Creating one spawns a linked Draft in the other language, copies the category and cover, and switches the editor to it.

## Screen: Doctors

Header with "+ Add Doctor" and the hint "Drag cards to set the order they appear on the public site."

Grid \`repeat(auto-fill, minmax(220px, 1fr))\`, \`gap: 1.25rem\`.

**Card:** \`draggable="true"\`, radius 12px, \`cursor: grab\`. Square photo area (real image or drop zone) with two overlays: an order badge \`#N\` top-left (\`rgba(10,18,22,0.75)\`, radius 5px, 0.7rem / 700) and, when hidden, a "Hidden" badge top-right (\`rgba(245,158,11,0.9)\` on \`#3a2606\`). Below: name (0.98rem / 700), title (0.8rem \`#6ec4ab\`), then Edit · Hide/Show · Archive buttons.

**Drag feedback:** the dragged card drops to \`opacity: 0.4\`; the current drop target's border turns \`#4CAF93\`. On drop the array is reordered and every record's \`order\` is rewritten to its new 1-based index, then a toast confirms. Hidden doctors render at \`opacity: 0.6\`.

Persist \`order\` server-side on drop.

**Doctor modal** (Add / Edit): 100×100px photo drop zone beside Name and Title inputs, then Specialty, Bio (textarea), and a row with Contact and a numeric Order field. Cancel / Save.

## Screen: Approvals — new

Doctors may edit their own profile, but **changes require approval before going live**. This screen is that queue.

Header note: "Profile edits and photo uploads submitted by doctors. Nothing reaches the public site until approved here."

**Change card:** panel radius 10px, padding \`1.1rem 1.25rem\`. Header row: doctor name (0.95rem / 700) + a field-type chip (amber pill: Bio / Profile photo / Specialty) on the left, relative submission time on the right (0.76rem \`rgba(255,255,255,0.3)\`).

**Diff:** two panels side by side (single column below 900px), \`gap: 0.85rem\`, radius 8px, padding 0.8rem:
- **Current** — neutral surface, label 0.68rem uppercase \`rgba(255,255,255,0.3)\`, value \`rgba(255,255,255,0.55)\`
- **Proposed** — \`rgba(16,185,129,0.06)\` with border \`rgba(16,185,129,0.18)\`, label \`#6ee7b7\`, value \`rgba(255,255,255,0.85)\`

Then **Approve** (gradient) and **Reject** (red-tinted). Both remove the card and toast. Approving should apply the change to the live record; rejecting should notify the submitting doctor.

Empty state: "Nothing waiting for review." in a panel, 3rem padding.

For photo changes, the proposed panel currently describes the upload in words. **Show the actual proposed image next to the current one** when implementing.

## Command palette (⌘K)

Opened by the nav search pill or ⌘K / Ctrl+K; closed by Escape, backdrop click, or running a command.

Overlay: scrim \`rgba(0,0,0,0.55)\` + \`blur(4px)\`, panel \`#243b44\` at \`max-width: 520px\`, radius 12px, positioned \`12vh\` from the top, shadow \`0 24px 70px rgba(0,0,0,0.5)\`, z-index 1200. A borderless search input sits above a scrollable result list (\`max-height: 320px\`).

Result row: icon (24px, 0.6 opacity) · label · right-aligned hint (0.72rem \`rgba(255,255,255,0.35)\`). Hover \`rgba(255,255,255,0.07)\`.

Commands: Go to Dashboard · New blog post · Go to Blog Posts · Review pending approvals · Add doctor · Go to Doctors · plus **every post by title**, hinted with its language and status. Empty query shows the first six. **The list is filtered by role** — Staff sees only Dashboard.

Worth adding in production: arrow-key navigation and Enter to run (the prototype is click-only).

## Toasts

Bottom-right, z-index 1300, \`#10b981\` on \`#06281f\`, radius 8px, padding \`0.8rem 1.2rem\`, 0.88rem / 600, shadow \`0 12px 32px rgba(16,185,129,0.35)\`, a ✓ then the message. Auto-dismiss after **2200ms**.

Messages: "Post saved" · "Moved to archive" · "Restored as draft" · "Translation draft created" · "Doctor saved" · "Doctor archived" · "Order updated" · "Change approved and published" · "Change rejected".

## Data models

\`\`\`ts
type PostStatus = "Draft" | "Scheduled" | "Published" | "Archived";

interface BlogPost {
  id: string;
  slug: string;              // add for real routing
  lang: "EN" | "AR";
  linkedId: string | null;   // the counterpart-language post
  title: string;
  category: string;
  body: string;
  coverImage: string | null;
  status: PostStatus;
  publishAt: string | null;  // ISO; required when status === "Scheduled"
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  contact: string;
  photo: string | null;
  order: number;             // 1-based, manual drag order
  hidden: boolean;           // hidden from the public site, not deleted
  archived: boolean;
}

interface PendingChange {
  id: string;
  doctorId: string;
  doctorName: string;
  field: "name" | "title" | "specialty" | "bio" | "contact" | "photo";
  oldValue: string;
  newValue: string;
  submittedAt: string;
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
}
\`\`\`

## Business rules

1. **Access.** Blog, Doctors, and Approvals require \`canManageContent\` (Head Doctor, Clinic Manager). Staff sees no trace of them. Enforce server-side.
2. **Authoring.** Only content-capable roles create or edit posts. Posts have **no author byline** on the public site — they are the clinic's voice.
3. **Publishing.** Draft → Scheduled (with a future timestamp) → Published. Published content can be unpublished back to Draft. Scheduled posts need a job or an on-read check that promotes them at \`publishAt\`.
4. **Never hard-delete.** Posts and doctors archive and are restorable; restoring a post returns it to Draft.
5. **Translations.** Each language is its own post record, paired via \`linkedId\`. They publish independently — an Arabic version may still be a draft while the English one is live. The public site shows only posts matching the active language.
6. **Doctor self-edits.** A doctor may edit their own profile, but every change enters the approvals queue and only reaches the public site once approved. Photo uploads follow the same path.
7. **Ordering.** Doctor display order is manual (drag), stored as \`order\`. Not alphabetical, not seniority.
8. **Visibility.** \`hidden\` removes a doctor from the public site while keeping the record intact — for leave, transitions, or incomplete profiles.

## Suggested additions (not designed)

Raised as sensible next steps for a clinic CRM, deliberately excluding anything resembling marketing automation or invoicing:
- **Activity log** — who changed what, when. Matters as soon as more than one person has access, and it pairs naturally with the approvals queue.
- **Patient-side essentials**, which the existing admin already gestures at: appointment history per patient, treatment notes tied to a session, and no-show tracking.

---

# Assets

All copied from the source repo at \`master\` and included under \`public/\` in this bundle.

| File | Used for |
|---|---|
| \`logo.jpg\` | Nav and footer wordmark |
| \`noor_hamami_head_doctor.jpg\` | Head doctor's card (the only real portrait) |
| \`joint-manipulation.webp\` | Hero background |
| \`cupping.webp\` | About section image |
| \`theragun.webp\`, \`hawkgrips.webp\` | Available, unused in this design |
| \`icons/cold-laser.png\` … \`icons/traction.png\` | Nine service icons (see the Services table) |

**Still needed from the client:** portraits for the other four doctors, six blog cover images, the real Google Maps place embed, and either real review data or a decision on the reviews integration.

# Files in this bundle

| File | What it is |
|---|---|
| \`Landing Page.dc.html\` | Public landing page prototype — open in a browser, click through it |
| \`Admin Dashboard.dc.html\` | Admin prototype — use the "Viewing as" dropdown to see each permission state |
| \`image-slot.js\` | Supports the image drop zones in the prototypes. **Prototype scaffolding — do not port.** Replace with the codebase's real upload component |
| \`support.js\` | Prototype runtime. **Do not port** |
| \`public/\` | The image and icon assets listed above |
| \`github.md\` | Source repo, branch, and the screen-to-source-file map |

The two HTML files are the authoritative reference for anything this README leaves ambiguous — measure and inspect them directly.
