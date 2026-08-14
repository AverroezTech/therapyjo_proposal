# tasks.md — Work Queue

The queue the planner (Opus) and executor (Sonnet) share.

**The protocol lives in `Claude_Instructions.md` → "Planner / Executor Protocol."** Roles, the mandatory planning pass, the status lifecycle, branching rules, executor rules, and the task template are all defined there. Read it before touching this file or pulling from it.

Two things that bear repeating here, because this is the file both agents open:

- **Only the planner writes to this file.** The executor reads a task, implements it, and reports back in conversation. It never edits `tasks.md` — not to claim a task, not to record status.
- **`READY` requires a recorded planning pass.** A task with no `**Planning pass:**` block has not cleared the gate and must not be executed, whatever its status line says.

---

## Queue

| ID | Title | Status | Branch |
|---|---|---|---|
| TJ-001 | Sync the Project Profile with the shipped app | DONE — merged `84aaa1c` | `docs/sync-project-profile` |
| TJ-002 | Remove unreferenced root assets | DONE — merged `26cd5b5` | `chore/prune-root-assets` |
| TJ-003 | Replace placeholder Google Maps embed | READY | `content/real-maps-embed` |
| TJ-004 | Source Google Reviews from a real API | READY | `feat/google-reviews-api` |
| TJ-005 | Move content gating to a role capability | BACKLOG — decision resolved, pass pending | — |
| TJ-006 | Remove duplicate root icon files | READY | `chore/remove-icon-duplicates` |

---

### TJ-001 — Sync the Project Profile with the shipped app

- **Status:** DONE — commit `3156a9a` on `docs/sync-project-profile`, unmerged
- **Branch:** `docs/sync-project-profile`

**Planner verification:** 2026-08-14 — read the full `git diff master..docs/sync-project-profile` rather than relying on the executor's report. Confirmed only `Claude_Instructions.md` changed (11 insertions, 4 deletions), and that the diff hunk opens at line 273 while the `## Project Profile` heading sits at line 267 — so every changed line falls inside Scope and nothing above the heading, including the new protocol section, was touched. Re-ran `npm run build` independently: exit 0. Working tree clean. All five instruction steps applied verbatim; the fields step 6 said to preserve are intact. One false alarm checked and cleared: the executor's report rendered the services line as `Dry Needling &amp; Acupuncture`, but `cat -A` confirms the file holds a literal `&` — the entity was an artifact of the report, not the commit.
- **Why:** The `## Project Profile` block at the bottom of `Claude_Instructions.md` is the declared source of truth for all future work, but it describes an earlier version of the site. It says the app is English-only with no RTL (it is bilingual EN/AR with RTL), lists five services (there are nine), and names a 4K video as the hero background (the hero is a static WebP served through `next/image`). Any agent that trusts it will make wrong decisions about language handling and asset strategy.

**Planning pass:** 2026-08-14 — read `src/app/page.tsx`, `src/app/components/SiteChrome.tsx`, `src/app/components/Hero.tsx`, the head and tail of `src/app/i18n/translations.ts`, and the `## Project Profile` block in `Claude_Instructions.md`. Confirmed: `translations.ts` carries both an `en` (line 2) and `ar` (line 181) tree, so the profile's "English (EN)" and "RTL: No" are both wrong. Confirmed `Hero.tsx:12` renders `/joint-manipulation.webp` via `next/image` and contains no `<video>`; the only video in the app is `/hero.mp4` in `src/app/login/page.tsx:72`. Corrected a claim carried over from the design handoff: the landing section order is split across two files — `page.tsx` renders the content sections, while `SiteChrome.tsx` supplies `GSAPAnimations`, `AccentHairline`, `Navbar`, `Footer`, `WhatsAppFloat`, and `BookingBar` around them. The profile text below reflects that split rather than presenting one flat list. Also confirmed `translations.ts` ends in an exported interface, so any future copy task must extend the type as well — captured in the Definition of Done, not here. No dependency implications. One file.

**Scope — touch only these:**
- `Claude_Instructions.md`, `## Project Profile` section only

**Do not touch:** every section of `Claude_Instructions.md` above `## Project Profile`, including the Planner / Executor Protocol. No application code changes in this task. Match against the quoted anchor strings below rather than line numbers — this file was edited on 2026-08-14 and line numbers have shifted.

**Instructions:**

1. Replace the line `- **LANGUAGES:** English (EN)` with:
   ```
   - **LANGUAGES:** English (EN) + Arabic (AR), runtime toggle via src/app/i18n/translations.ts
   ```
2. Replace the line `- **RTL:** No` with:
   ```
   - **RTL:** Yes — dir flips ltr↔rtl on language switch; use logical CSS properties (margin-inline-start, text-align: start)
   ```
3. Replace the line `  - Video hero background (6111040-uhd_3840_2160_25fps.mp4)` with these two lines, keeping the two-space indent:
   ```
     - Hero background: static image public/joint-manipulation.webp via next/image
     - Video background is used on the login page only (public/hero.mp4)
   ```
4. Replace the line `  - Services: Manipulation, Cupping Therapy, Hawkgrips, Theragun, Consultations` with:
   ```
     - Services (9, in shipped order): Cold Laser Therapy, Radio Frequency Therapy, Pelvic Floor Rehabilitation, Electromagnetic Pelvic Floor, Traction Therapy, Sport Rehabilitation, Post-Op Rehabilitation, Pediatric Physical Therapy, Dry Needling & Acupuncture
   ```
5. Append these lines at the end of the `**SPECIAL_NOTES:**` list, after the existing final entry, keeping the two-space indent:
   ```
     - Landing content sections (src/app/page.tsx, in order): Hero, Marquee, About, Services, Finder, Doctors, BlogPreview, Reviews, Location, ContactCTA
     - Site chrome wraps them in src/app/components/SiteChrome.tsx: GSAPAnimations, AccentHairline, Navbar, Footer, WhatsAppFloat, BookingBar
     - Blog is real routing: /blog and /blog/[slug] (not a state swap)
     - Admin CMS at src/app/admin: blog, doctors, approvals queue
     - Stack: Next.js 16 App Router, React 19, TypeScript, plain CSS in src/app/globals.css, Prisma 7 + Postgres (Supabase), NextAuth v5
     - Design reference: design_handoff_landing_and_blog_cms/README.md and the two .dc.html prototypes
   ```
6. Leave `PROJECT_NAME`, `CLIENT`, `SECTOR`, `DESIGN_LANGUAGE`, `PRIMARY_COLOR`, `SECONDARY_COLOR`, `ACCENT_COLOR`, `ANIMATION_LIB`, and the logo / Instagram / phone / location notes unchanged. All were verified accurate.

**Verification:**
- `npm run build` passes — documentation-only, so a failure here means something outside Scope was touched
- `git diff --stat` shows `Claude_Instructions.md` as the only changed file
- Read the edited `## Project Profile` end to end; no remaining line contradicts the code

**Done when:**
- [ ] Profile states bilingual EN/AR with RTL
- [ ] Profile lists nine services in shipped order
- [ ] Profile names the WebP hero and scopes the video to the login page
- [ ] Section order records the `page.tsx` / `SiteChrome.tsx` split
- [ ] Only `Claude_Instructions.md` changed; no section above `## Project Profile` touched

---

### TJ-002 — Remove unreferenced root assets

- **Status:** DONE — commit `07f31eb` on `chore/prune-root-assets`, unmerged
- **Branch:** `chore/prune-root-assets`

**Planner verification:** 2026-08-14 — read `git diff --name-status master..chore/prune-root-assets` directly: exactly three `D` entries, zero additions, zero modifications. Confirmed the surviving lookalikes are on disk on the branch — `public/hero.mp4`, `public/logo.jpg`, and 18 files in `public/icons/`. Confirmed `master` is an ancestor of the branch and the branch carries a single commit, so no history was rewritten. Re-ran `npm run build` on the branch myself: exit 0.

**Visual review:** 2026-08-14 — done on the branch against a running dev server, before merge. `/` renders the nav logo, hero background, headline with its gradient "Recovery", subtitle, both CTAs, footer logo, all nine footer services, and the sticky booking bar. `/login` renders its card logo with the background video **playing** (`readyState: 4`, not paused, no media error, 3840×2160, source `/hero.mp4`). Scripted the decisive check rather than relying on the eye: enumerated every `<img>` on the landing page and found **0 broken** out of 16, with both logo instances at 128×128 natural size. Merged after this passed.
- **Why:** Three tracked files sit at the repo root, referenced by nothing in `src/`. `Claude_Instructions.md` requires deleting zombie assets, and the 18MB 4K video is the bulk of the repository.

**Planning pass:** 2026-08-14 — read `src/app/login/page.tsx` (lines 60–85), `src/app/components/Navbar.tsx` (lines 67–73), `src/app/components/Footer.tsx` (lines 21–27), and `src/app/components/Hero.tsx`; searched `src/`, `public/`, `next.config.mjs`, and `package.json` for every filename below. Confirmed the three deletion targets have zero references. The real risk this pass surfaced is that each target has an in-use lookalike: `public/hero.mp4` (login background video), `public/logo.jpg`, and `public/icons/*`. Corrected an earlier undercount — `/logo.jpg` has **three** consumers, not two: `Navbar.tsx:69`, `Footer.tsx:23`, and `login/page.tsx:80`. All three reference it as the root-absolute string `"/logo.jpg"`, which Next.js resolves from `public/`, and none imports the root-level file relatively, so deleting root `logo.jpg` cannot break them. Verification below exercises all three consumers. Three files, deletion only, no dependency implications.

**Scope — delete only these three:**
- `6111040-uhd_3840_2160_25fps.mp4` — 18MB, unreferenced
- `icons-grid.png` — 353KB, unreferenced; a contact sheet, not a shipped asset
- `logo.jpg` **at the repo root** — 60KB; distinct from `public/logo.jpg`, which stays

**Do not touch — in use, or source material:**
- `public/hero.mp4` — **in use**, `src/app/login/page.tsx:72`
- `public/logo.jpg` — **in use**, `Navbar.tsx:69`, `Footer.tsx:23`, `login/page.tsx:80`
- `public/icons/*` — **in use** by Services and Finder
- `therapyjo_icons_no_bg/` and `therapyjo_icons_no_bg.zip` — unreferenced but original source icons; see TJ-006

**Do not** rewrite git history — no `git filter-branch`, `git filter-repo`, or BFG. A normal deletion commit is the whole task. Repository size on disk will not drop without a history rewrite, and that is deliberately excluded.

**Instructions:**

1. Re-confirm the targets are unreferenced before deleting anything:
   ```
   grep -rn "6111040\|icons-grid" src/ public/ next.config.mjs package.json
   ```
   Expect zero results. If anything matches, stop and report — do not delete that file.
2. Confirm no relative import reaches the root `logo.jpg`:
   ```
   grep -rn "logo.jpg" src/
   ```
   Expect exactly three hits, all the string `"/logo.jpg"`. If any hit is a relative path such as `../../logo.jpg`, stop and report.
3. Delete the three files:
   ```
   git rm "6111040-uhd_3840_2160_25fps.mp4" icons-grid.png logo.jpg
   ```

**Verification:**
- `npm run build` passes
- Assert every surviving lookalike is still on disk. All three commands must succeed, and the third must print `18` (nine PNGs plus nine SVGs):
  ```
  ls public/hero.mp4
  ls public/logo.jpg
  ls public/icons/ | wc -l
  ```
- `git status --short` shows exactly three `D` entries and nothing else. The tree was clean at handoff, so any fourth entry means something outside Scope was touched — stop and report.
- Re-run `grep -rn "logo.jpg\|hero.mp4" src/` and confirm it still returns the same four hits as before the change (three `/logo.jpg`, one `/hero.mp4`). No reference should have been rewritten to compensate for a deletion.

**Do not start a dev server.** The runtime render check on `/` and `/login` is the planner's at REVIEW, not the executor's.

**Done when:**
- [ ] The three root files are deleted and staged
- [ ] `public/hero.mp4`, `public/logo.jpg`, `public/icons/*`, `therapyjo_icons_no_bg/`, and the zip are untouched
- [ ] Build passes; `/` renders both logos; `/login` plays the video and renders its logo
- [ ] Git history was not rewritten

---

### TJ-003 — Replace placeholder Google Maps embed

- **Status:** READY
- **Branch:** `content/real-maps-embed`
- **Why:** `src/app/components/Location.tsx:14` uses a synthesized embed URL built from approximate coordinates (`!2d35.87!3d31.95`) with a null place ID (`0x0%3A0x0`). It shows no business card, and the pin does not land near the clinic — it lands in **Swiefieh, ~4 km away** (see the visual comparison in the planning pass). The design handoff flags this as needing the real embed.

**Approach — final, 2026-08-14: the keyless share embed.** An earlier revision of this task proposed the Maps Embed API with a `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`. **That is withdrawn.** The clinic's listing is published, so Google's own Share → Embed a map yields a working URL needing no API key, no Cloud project, and no billing. Strictly less machinery for the same result, and it keeps a browser-visible key out of the project altogether. The Cloud project is still needed for TJ-004, but **only** for the Places key — the Maps Embed API does not need enabling.

**Planning pass:** 2026-08-14 — read `src/app/components/Location.tsx` in full (54 lines). Confirmed the `<iframe>` at line 13–18 carries exactly four attributes (`src`, `loading`, `referrerPolicy`, `title`) and no width/height/style — sizing comes from the `.location-map` wrapper in `globals.css`, so the `width`/`height`/`style`/`allowfullscreen` attributes in Google's copied HTML must be **discarded**, not pasted in. Obtained the Place ID `ChIJp0P9L82hHBURgY5pmicC-s0` from the public Place ID Finder and verified it by resolving `https://www.google.com/maps/place/?q=place_id:<ID>`, which returned *Therapy Jo Physiotherapy Center, Az-Zubayr Ben Al-Awwam St., Amman*; the listed phone `07 9981 9669` matches the profile's `+962799819669`. The user then supplied the share-embed HTML from that listing. **Cross-validated it rather than trusting it:** the feature ID inside the supplied URL (`0x151ca1cd2ffd43a7:0xcdfa02279a698e81`) is byte-identical to the one in the Maps place URL reached independently via the Place ID, so the pasted string points at the same entity the Place ID does.

**Corrected the *Why*.** The task claimed the placeholder "drops a pin near the clinic." It does not. Rendered both URLs side by side in iframes on a local page and compared: the placeholder lands in **Swiefieh** — beside Swiefieh Village and Salon Lara — while the real one lands on the clinic among Al-Ahli, Islamic, and Al Kindi hospitals. Roughly 4 km apart, in different districts. The real embed also renders a business card (name in EN and AR, address, 4.9 ★ 367) that the placeholder lacks entirely, because its place ID is the null `0x0:0x0`. Both URLs render, so this is a substitution of a working embed for a working-but-wrong one — not a fix for a broken frame.

One file, one line, no dependency implications.

**Scope — touch only this:**
- `src/app/components/Location.tsx`, the `src` attribute on the `<iframe>` only

**Do not touch:** the `loading`, `referrerPolicy`, and `title` attributes; the `.location-map` wrapper; every other section of the file. No `globals.css` changes. Do **not** add `width`, `height`, `style`, or `allowfullscreen` from Google's copied HTML — the wrapper handles sizing and adding them will break the responsive layout.

**Instructions:**

1. In `src/app/components/Location.tsx`, replace the entire `src="…"` attribute value on the `<iframe>` — the string beginning `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.5!2d35.87!3d31.95` and ending `!4v1700000000000` — with exactly:
   ```
   https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.7262024301945!2d35.9076188!3d31.968323799999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ca1cd2ffd43a7%3A0xcdfa02279a698e81!2sTherapy%20Jo%20Physiotherapy%20Center!5e0!3m2!1sen!2sjo!4v1786726473771!5m2!1sen!2sjo
   ```
   Copy it verbatim, including the `%3A` and `%20` escapes. Change nothing else on the element.

**Verification:**
- `npm run build` passes
- `git diff --stat` shows `src/app/components/Location.tsx` as the only changed file, **1 insertion and 1 deletion**. More than one line changed means an attribute was touched that should not have been.
- `grep -n "0x0%3A0x0\|!2d35.87\|1d3384.5" src/app/components/Location.tsx` returns **zero** hits — no fragment of the placeholder survives
- `grep -c "loading=\"lazy\"" src/app/components/Location.tsx` returns `1`, and `referrerPolicy="no-referrer-when-downgrade"` and `title="Therapy Jo Location"` are both still present

**Do not start a dev server.** The rendered-map check is the planner's at VISUAL REVIEW.

**Visual review is mandatory and is the whole point of this task.** A wrong embed URL renders a grey box or a map of the wrong place; neither fails a build, and `npm run build` will pass either way. At VISUAL REVIEW the planner must load `/`, scroll to `#location`, and confirm the pin sits on the clinic *and* the business card reads "Therapy Jo Physiotherapy Center" — not merely that a map appeared.

**Done when:**
- [ ] The `src` is replaced and the other three attributes are untouched
- [ ] Build passes; diff is exactly one line
- [ ] No placeholder fragment (`0x0:0x0`, `35.87`, `31.95`) remains in the file
- [ ] Visual review: pin on the clinic, business card showing the clinic name

---

### TJ-004 — Source Google Reviews from a real API

- **Status:** READY
- **Branch:** `feat/google-reviews-api`
- **Why:** `src/app/components/Reviews.tsx` hardcodes a `4.9` rating and a `300+` review count (lines 30 and 33) alongside four invented reviewer quotes with names (lines 9–12), presented to visitors as real Google reviews of a real medical clinic. The design handoff states explicitly: *"Do not hardcode 4.9 / 300+ in production."* This is the most serious open item in the repo and should be resolved before launch.

**Decisions — user, 2026-08-14. Both blockers below are now resolved in principle; only the credential values are outstanding.**

1. **Integration path: Google Places API (New).** `place_details` with the `reviews` field, fetched server-side and cached with hourly ISR — at most five reviews plus a reliable rating and total count, and the designed layout survives untouched. The third-party widget alternative (Elfsight, Trustindex) was **rejected**: vendor markup would replace the design and add a script dependency.
2. **Mixed-language reviews: show the original, always.** Every review renders as the reviewer wrote it, in both site languages. Each card carries `dir="auto"` so an Arabic review lays out RTL even on the English site. Google's machine translations were **rejected** — attributing a translated sentence to a named real patient misrepresents them. Language filtering was **rejected** because it would decouple the visible cards from the headline rating.

**Place ID obtained 2026-08-14 — see TJ-003 for provenance and the verification:** `ChIJp0P9L82hHBURgY5pmicC-s0`

**Ground truth captured 2026-08-14 from the live listing:** the clinic's real rating is **4.9 from 367 reviews**. The hardcoded `4.9` and `300+` are therefore *currently accurate* — the numbers mislead nobody today. This lowers the urgency of the rating and count, and it should be said plainly rather than left implied by the alarming *Why* above. It changes nothing about the four invented reviewers, which remain fabricated attributions to named people and are the real reason this task exists. It also does not make hardcoding safe: 367 was 300-something at some point and will be 400-something later, and nobody will remember to edit it.

**Cloud setup completed 2026-08-14** (driven in the browser with the user):
- Project **`therapyjo-web`** (ID `therapyjo-web`, no organization), on the personal account, billing attached via the $300 / 90-day free trial.
- **Places API (New)** (`places.googleapis.com`) enabled. The Maps Embed API was deliberately **not** enabled — TJ-003 uses the keyless share embed and needs no key.
- Key **`therapyjo-places-server`**, restricted to Places API (New) and nothing else. Google's onboarding auto-created it scoped to **35** APIs; that was cut to one. Application restrictions are deliberately **None** — "Websites" matches an HTTP referrer that server-to-server calls never send, and "IP addresses" needs stable egress IPs that the host does not guarantee. The controls that do the work here are (a) the key never reaching a browser and (b) the single-API restriction capping the blast radius. **If this key is ever needed client-side, that reasoning collapses — issue a second, referrer-restricted key instead of loosening this one.**
- `.env` carries `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACES_PLACE_ID`; never in git — `.env*` is gitignored, re-confirmed 2026-08-14.

  **Corrected at the pass:** this entry previously read "value pasted by the user." It was not. The variable existed with an **empty value** (0 characters) and the task was carrying a blocker it recorded as cleared. The user pasted the real key on 2026-08-14 when the pass surfaced this; it is now 39 characters and verified working against the live endpoint. Recorded because the failure mode is worth remembering: a `KEY=` line with nothing after the `=` reads as "present" to every eye and every grep that only checks the name.

**Interim option if launch comes first:** replace the fabricated rating, count, and four quotes with a single honest CTA linking to the clinic's Google listing, keeping the section's visual shell. Not selected — this task supersedes it, and the `available: false` branch specified below *is* that shell, now serving as the failure state rather than the shipped state.

**Planning pass:** 2026-08-14 — read `src/app/components/Reviews.tsx` in full (72 lines), `src/app/components/Doctors.tsx` in full, `src/app/api/public/doctors/route.ts` in full, `src/app/globals.css` lines 1183–1336 (the whole `.reviews-*` block), `src/app/i18n/translations.ts` (the `en.reviews` block at 134–141, `ar.reviews` at 311–318, and the `reviews` interface member at 442–449), `src/app/page.tsx`, `package.json`, and the design handoff's "Google Reviews" section (README lines 271–283). **Probed the live Places API (New) endpoint** with the real key and Place ID — `GET https://places.googleapis.com/v1/places/ChIJp0P9L82hHBURgY5pmicC-s0`, HTTP 200 — and pinned every field name below against that response rather than against documentation.

Confirmed:

- **Field names, from the live body.** Top level: `rating` (`4.9`), `userRatingCount` (`367`), `googleMapsUri`, `reviews[]`. Per review: `name` (an opaque stable ID, suitable as a React key), `rating` (integer), `text: { text, languageCode }`, `originalText: { text, languageCode }`, `authorAttribution: { displayName, uri, photoUri }`, `relativePublishTimeDescription` (`"3 weeks ago"`), `publishTime`, `flagContentUri`, `googleMapsUri`. These are **not** the legacy `place_details` names the design handoff assumed — `user_ratings_total` is now `userRatingCount`, and `author_name` is now `authorAttribution.displayName`.
- **The five-review cap is real.** Exactly five came back against 367 total. The design's dot carousel already handles a variable count, so this constrains nothing — but the count is Google's, not ours, and the code must not assume five.
- **Ground truth matches.** Live `rating` 4.9 and `userRatingCount` 367 confirm the recorded figures. The hardcoded values mislead nobody *today*; they are wrong as a mechanism, not as facts. That is the honest framing, and the *Why* above overstates it.
- **`Reviews.tsx` is `"use client"` with `useState`**, so no server fetch can be added to it directly. `Doctors.tsx` already solves this exact shape — `useEffect` → `fetch("/api/public/...")` → `useState`, falling back to empty on both a non-ok response and a throw. This task follows that pattern rather than inventing one.
- **No caching primitives exist anywhere in `src/`** — zero hits for `revalidate`, `force-dynamic`, or `next: {`. The hourly ISR is new ground here, so both literals are supplied below rather than left to judgement.
- **No new dependency.** `server-only` is already in `package.json`; nothing else is needed.

Corrected and discovered:

- **The real reviews collide with the design, and this is the finding that shaped the task.** The prototype's four samples run 85–120 characters. The five live reviews run **90, 140, 440, 578, and 1,452** characters. `.reviews-quote-text` is a centered italic pull-quote at `clamp(1.25rem, 2.5vw, 1.6rem)` in a 680px column — the 1,452-character review renders as roughly 27 lines, about 1,050px tall. Worse than the height itself is the **layout jump**: clicking between the 90-character review and the 1,452-character one would shift the page by ~900px and throw the footer around under the user's cursor. Truncation at 320 characters on a word boundary, with a per-review "read the full review" link built from the review's own `googleMapsUri`, is specified below. It holds the design contract, stabilises the spotlight height, and never presents a cut review as complete. This decision was made at the pass, not by the executor, and it is the one place where the shipped markup extends beyond the handoff.
- **All five live reviews are `languageCode: "en"`, and `text` is byte-identical to `originalText` in every one.** Decision 2 above — show the original, always — is therefore inert *today*. It is still implemented exactly as decided, because the returned set rotates and an Arabic review will eventually land: read `originalText.text` with a fallback to `text.text`, and carry `dir="auto"`. Google omits `originalText` when nothing was translated, so the fallback is load-bearing, not defensive padding.
- **`authorAttribution.photoUri` is available and is deliberately unused.** The design specifies a 38px initial avatar, and consuming Google's photo URLs would need `lh3.googleusercontent.com` added to `next.config.mjs` `remotePatterns` — a config change outside this task's concern for a result the design does not ask for. Listed under *Do not touch*.
- **One live author name is lowercase** (`hedab albaz`) and one is a business account (`Alpha Construction`). The avatar initial must be `.toUpperCase()`d or that card shows a lowercase `h`. The display name is rendered as Google returns it.
- **Hourly caching is a cost control, not a perf nicety.** Place Details requests that include the `reviews` field bill in Google's most expensive Places tier. At `revalidate = 3600` this is ~720 upstream calls a month, comfortably inside the trial credit. Uncached — one upstream call per visitor — a few thousand pageviews would run into real money. Whoever touches the revalidate literal should know why it is what it is.
- **The route must never throw.** `export const revalidate` makes Next attempt to prerender it at build time, so a throw on a missing key would fail `npm run build` on any host whose environment lacks the key. Every failure path returns `{ available: false }` with a 200 and a server-side warning. The section then renders its header and the Google CTA and nothing else — no rating, no quotes, and above all no fabricated content. Silent degradation is the correct failure mode here precisely because the alternative is inventing patient testimony.

Four files, one concern, no dependency change.

**Scope — touch only these four:**
- `src/app/api/public/reviews/route.ts` — **new file**, in the existing `src/app/api/public/` directory
- `src/app/components/Reviews.tsx`
- `src/app/i18n/translations.ts` — three additions only: `en.reviews.readFull`, `ar.reviews.readFull`, and the `readFull: string;` interface member
- `src/app/globals.css` — append only, inside the existing `/* ===== REVIEWS ===== */` block

**Do not touch:**
- `next.config.mjs` — and therefore **do not render `authorAttribution.photoUri`**. The design calls for an initial avatar; a remote image would need a `remotePatterns` entry and is out of scope.
- Any existing rule in `globals.css`. The `.reviews-*` selectors at lines 1183–1336 are pinned by the design handoff — add new rules, change none.
- `src/app/page.tsx` — `<Reviews />` is already wired at line 29.
- The section's existing markup contract: the `.reviews-rating-card` / `.reviews-spotlight` structure, `"★".repeat(rating)` gold followed by `"★".repeat(5 - rating)` grey, the 38px initial avatar, and one dot per review. The redesign is not part of this task.
- `.env` — both variables are already set and verified. Do not add, rename, or template them, and **never** prefix either with `NEXT_PUBLIC_`.

**Instructions:**

1. Create `src/app/api/public/reviews/route.ts` with exactly this content:

   ```ts
   import { NextResponse } from "next/server";

   // GET /api/public/reviews — real Google reviews for the public site.
   // Server-only: GOOGLE_PLACES_API_KEY must never reach the browser.
   // Revalidated hourly. Place Details calls that include `reviews` bill in
   // Google's most expensive Places tier, so this cache is a cost control.
   export const revalidate = 3600;

   const MAX_QUOTE_CHARS = 320;

   interface LocalizedText {
       text?: string;
       languageCode?: string;
   }

   interface PlacesReview {
       name?: string;
       rating?: number;
       text?: LocalizedText;
       originalText?: LocalizedText;
       relativePublishTimeDescription?: string;
       googleMapsUri?: string;
       authorAttribution?: { displayName?: string };
   }

   interface PlacesResponse {
       rating?: number;
       userRatingCount?: number;
       googleMapsUri?: string;
       reviews?: PlacesReview[];
   }

   function truncate(text: string): { text: string; truncated: boolean } {
       if (text.length <= MAX_QUOTE_CHARS) return { text, truncated: false };
       const cut = text.slice(0, MAX_QUOTE_CHARS);
       const lastSpace = cut.lastIndexOf(" ");
       const body = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd();
       return { text: `${body}…`, truncated: true };
   }

   export async function GET() {
       const key = process.env.GOOGLE_PLACES_API_KEY;
       const placeId = process.env.GOOGLE_PLACES_PLACE_ID;

       if (!key || !placeId) {
           console.warn("[reviews] GOOGLE_PLACES_API_KEY or GOOGLE_PLACES_PLACE_ID is not set");
           return NextResponse.json({ available: false });
       }

       try {
           const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
               headers: {
                   "X-Goog-Api-Key": key,
                   "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
               },
               next: { revalidate: 3600 },
           });

           if (!res.ok) {
               console.warn(`[reviews] Places API returned ${res.status}`);
               return NextResponse.json({ available: false });
           }

           const data: PlacesResponse = await res.json();

           if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
               console.warn("[reviews] Places API response missing rating or userRatingCount");
               return NextResponse.json({ available: false });
           }

           const reviews = (data.reviews ?? []).flatMap((r) => {
               // Show the review as its author wrote it. Google omits originalText
               // when nothing was translated, so the fallback carries real weight.
               const source = r.originalText?.text ?? r.text?.text ?? "";
               const author = r.authorAttribution?.displayName?.trim() ?? "";
               if (!source || !author) return [];
               const { text, truncated } = truncate(source);
               return [{
                   id: r.name ?? `${author}-${r.relativePublishTimeDescription ?? ""}`,
                   author,
                   rating: typeof r.rating === "number" ? r.rating : 5,
                   text,
                   truncated,
                   relativeTime: r.relativePublishTimeDescription ?? "",
                   url: r.googleMapsUri ?? data.googleMapsUri ?? "",
               }];
           });

           return NextResponse.json({
               available: true,
               rating: data.rating,
               userRatingCount: data.userRatingCount,
               googleMapsUri: data.googleMapsUri ?? "",
               reviews,
           });
       } catch {
           console.warn("[reviews] Places API request failed");
           return NextResponse.json({ available: false });
       }
   }
   ```

2. Replace the entire contents of `src/app/components/Reviews.tsx` with exactly this:

   ```tsx
   "use client";

   import { useEffect, useState } from "react";
   import { useLanguage } from "../i18n/LanguageContext";

   interface Review {
       id: string;
       author: string;
       rating: number;
       text: string;
       truncated: boolean;
       relativeTime: string;
       url: string;
   }

   interface ReviewsPayload {
       available: boolean;
       rating?: number;
       userRatingCount?: number;
       googleMapsUri?: string;
       reviews?: Review[];
   }

   const GOOGLE_SEARCH_FALLBACK =
       "https://www.google.com/search?q=Therapy+Jo+Physiotherapy+Center+reviews";

   export default function Reviews() {
       const { t } = useLanguage();
       const [data, setData] = useState<ReviewsPayload | null>(null);
       const [activeIndex, setActiveIndex] = useState(0);

       useEffect(() => {
           fetch("/api/public/reviews")
               .then((res) => (res.ok ? res.json() : { available: false }))
               .then(setData)
               .catch(() => setData({ available: false }));
       }, []);

       const reviews = data?.reviews ?? [];
       const active = reviews[activeIndex];
       const hasRating = data?.available === true && typeof data.rating === "number";
       const filledStars = hasRating ? Math.round(data!.rating!) : 0;
       const ctaUrl = data?.googleMapsUri || GOOGLE_SEARCH_FALLBACK;

       return (
           <section id="reviews" className="reviews section-padding">
               <div className="container reviews-inner">
                   <div className="reviews-header reveal">
                       <div className="section-label" style={{ justifyContent: "center" }}>{t.reviews.label}</div>
                       <h2 className="section-title">{t.reviews.title}</h2>
                       <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.reviews.subtitle}</p>
                   </div>

                   {data && (
                       <div className={`reviews-rating-card${hasRating ? "" : " is-unavailable"}`}>
                           {hasRating && (
                               <>
                                   <div className="reviews-rating-number">{data!.rating!.toFixed(1)}</div>
                                   <div>
                                       <div className="reviews-rating-stars">
                                           {"★".repeat(filledStars)}
                                           <span className="reviews-stars-empty">{"★".repeat(5 - filledStars)}</span>
                                       </div>
                                       <div className="reviews-rating-count">
                                           {t.reviews.basedOn} {data!.userRatingCount} {t.reviews.reviewsWord}
                                       </div>
                                   </div>
                               </>
                           )}
                           <a
                               href={ctaUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="reviews-rating-cta"
                           >
                               {t.reviews.cta}
                           </a>
                       </div>
                   )}

                   {active && (
                       <div className="reviews-spotlight">
                           <div className="reviews-quote-mark">&ldquo;</div>
                           <p className="reviews-quote-text" dir="auto">{active.text}</p>
                           {active.truncated && active.url && (
                               <p className="reviews-quote-more">
                                   <a href={active.url} target="_blank" rel="noopener noreferrer">
                                       {t.reviews.readFull}
                                   </a>
                               </p>
                           )}
                           <div className="reviews-attribution">
                               <div className="reviews-avatar">{active.author.charAt(0).toUpperCase()}</div>
                               <div className="reviews-attribution-text">
                                   <div className="reviews-name" dir="auto">{active.author}</div>
                                   <div className="reviews-stars-small">
                                       <span className="reviews-stars-filled">{"★".repeat(active.rating)}</span>
                                       <span className="reviews-stars-empty">{"★".repeat(5 - active.rating)}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="reviews-dots">
                               {reviews.map((r, i) => (
                                   <button
                                       key={r.id}
                                       className={`reviews-dot ${i === activeIndex ? "active" : ""}`}
                                       onClick={() => setActiveIndex(i)}
                                       aria-label={`Show review from ${r.author}`}
                                   />
                               ))}
                           </div>
                       </div>
                   )}
               </div>
           </section>
       );
   }
   ```

3. In `src/app/i18n/translations.ts`, add one key to the **English** `reviews` block. Match against the anchor `cta: "See All Reviews on Google",` and add the new line immediately after it, keeping the existing indentation:
   ```
               readFull: "Read the full review on Google",
   ```

4. In the same file, add the matching key to the **Arabic** `reviews` block. Match against the anchor `cta: "عرض جميع التقييمات على Google",` and add immediately after it:
   ```
               readFull: "اقرأ التقييم كاملاً على Google",
   ```

5. In the same file, extend the exported interface. Match against the `reviews` member — the block that reads `basedOn: string;` / `reviewsWord: string;` / `cta: string;` — and add after `cta: string;`:
   ```
           readFull: string;
   ```

6. In `src/app/globals.css`, append these three rules immediately after the existing `.reviews-rating-cta:hover { … }` rule and before `.reviews-spotlight {`. Add nothing else and modify no existing rule:
   ```css
   .reviews-rating-card.is-unavailable .reviews-rating-cta {
     margin-inline-start: 0;
   }

   .reviews-quote-more {
     margin: -1rem 0 1.75rem;
     font-size: 0.8rem;
   }

   .reviews-quote-more a {
     color: var(--secondary);
     font-weight: 600;
     text-decoration: underline;
     text-underline-offset: 3px;
   }
   ```

**Verification:**

- `npm run build` passes
- `npm run lint` passes
- `git diff --stat` shows exactly **four** files: the three edited plus the new route. Anything else means Scope was exceeded.
- No fabricated content survives — all three must return **zero** hits:
  ```
  grep -n "R\. Sami\|L\. Haddad\|M\. Odeh\|D\. Nassar" src/app/components/Reviews.tsx
  grep -n "300+" src/app/components/Reviews.tsx
  grep -n "4\.9" src/app/components/Reviews.tsx
  ```
- The key stays server-side. The first must return **exactly one** hit (in the new route file), the second **zero**:
  ```
  grep -rn "GOOGLE_PLACES_API_KEY" src/
  grep -rn "NEXT_PUBLIC_GOOGLE" src/
  ```
- The upstream contract still holds. This is a one-shot API call, **not** a dev server — run it verbatim and confirm it prints `200`:
  ```
  KEY=$(grep -E "^GOOGLE_PLACES_API_KEY=" .env | cut -d= -f2- | tr -d '\r"')
  PID=$(grep -E "^GOOGLE_PLACES_PLACE_ID=" .env | cut -d= -f2- | tr -d '\r"')
  curl -s -o /dev/null -w "%{http_code}\n" "https://places.googleapis.com/v1/places/$PID" \
    -H "X-Goog-Api-Key: $KEY" \
    -H "X-Goog-FieldMask: rating,userRatingCount,googleMapsUri,reviews"
  ```
  Anything other than `200` means the field mask or the Place ID was altered — stop and report. **Never echo `$KEY`.**
- Both language trees stay symmetrical: `grep -c "readFull" src/app/i18n/translations.ts` returns `3` (en, ar, interface)

**Do not start a dev server.** The rendered check is the planner's at VISUAL REVIEW.

**Visual review is mandatory.** A wrong field name, a bad field mask, or a failed upstream call all produce a clean build and a section that silently falls back to the CTA-only state — which is exactly what the failure mode is designed to look like, and therefore exactly what a green build cannot distinguish from success. At VISUAL REVIEW the planner must load `/`, scroll to `#reviews`, and confirm: the rating reads **4.9** with **367** beside it and not `300+`; the spotlight shows a **real** reviewer name from the live set (`Ahmad Almudallal`, `Jaber Jaber`, `hedab albaz`, `Alpha Construction`, `Dana Asnan`) and none of the four invented ones; there are **five** dots; clicking through all five does not make the page height lurch; the truncated cards show the "read the full review" link and the short ones do not. Then repeat on the Arabic site and confirm the section reads RTL with the numerals still correct.

**Done when:**
- [ ] `R. Sami`, `L. Haddad`, `M. Odeh`, `D. Nassar`, `4.9`, and `300+` are all gone from `Reviews.tsx`
- [ ] Rating, count, and all five quotes come from the live API
- [ ] The key appears only in the server route; nothing is `NEXT_PUBLIC_`
- [ ] A failed or unconfigured upstream renders header + CTA only, never fabricated content, and never fails the build
- [ ] Long reviews are truncated on a word boundary and linked to the full text on Google
- [ ] `dir="auto"` is present on both the quote and the author name
- [ ] Build and lint pass; diff is four files
- [ ] Visual review passed on both EN and AR

---

### TJ-005 — Move content gating to a role capability

- **Status:** BACKLOG — no planning pass run
- **Branch:** assigned at planning pass
- **Why:** The design handoff specifies that Blog, Doctors, and Approvals are gated by a permission (`canManageContent`) attached to a role, *"so the client can grant a manager access without a code change"* — and explicitly not by a check against one named user. The schema has a flat `Role` enum (`ADMIN` / `DOCTOR` / `SECRETARY`) with no capability layer. Behaviour today is probably correct; the coupling is the problem.

**Partial survey 2026-08-14** (not a full planning pass — see what remains, below). Read `src/middleware.ts`, `src/app/admin/layout.tsx`, `prisma/schema.prisma`, and grepped every handler under `src/app/api/blog/`, `src/app/api/doctor-profiles/`, and `src/app/api/pending-changes/`. Findings:

- **The handoff's actual prohibition is not violated.** It bars gating on *"one named user"*; every site checks `session.user.role`, never a user ID. This is a refactor, not a security hole — downgrade the urgency recorded in *Why* above.
- **Ten inline call sites**, each spelling the capability as a bare string comparison: `role !== "ADMIN"` in `api/blog/route.ts:8`, `api/blog/[id]/route.ts:7`, `api/blog/[id]/translate/route.ts:9`, `api/doctor-profiles/route.ts:7`, `api/doctor-profiles/[id]/route.ts:7`, `api/doctor-profiles/reorder/route.ts:8`, `api/pending-changes/route.ts:19`, `api/pending-changes/[id]/route.ts:17`; and `role !== "DOCTOR"` in `api/doctor-profiles/me/route.ts:8` and `api/pending-changes/route.ts:35`.
- **`middleware.ts` does no role gating at all** — it is a bare `NextAuth(authConfig).auth` with a static-asset matcher. All enforcement is per-handler. That is fine, but it means there is no chokepoint to add the capability to; all ten sites must change.
- **`DOCTOR` is load-bearing.** The two `role !== "DOCTOR"` sites are the flow by which a doctor edits their own profile and submits changes for approval. Any model that collapses `DOCTOR` into a generic staff role breaks it.

**User decision — 2026-08-14: keep the shipped enum, add a capability layer.** `ADMIN` / `DOCTOR` / `SECRETARY` stay as they are. Renaming the enum to the handoff's `Head Doctor` / `Clinic Manager` / `Staff` was **rejected**: it costs an enum migration, a reseed, every call site, and has no slot for `DOCTOR` without inventing a fourth role. UI-only relabelling was **rejected** too — two names for one concept is a maintenance trap.

Mechanism, as decided:
- One shared `canManageContent(user)` helper replaces all eight `ADMIN` checks. The two `DOCTOR` checks stay as they are — they express a different concept (profile ownership, not content management) and must not be folded in.
- Plus a **per-user override column** on `User`. A derived-from-role helper alone does *not* satisfy the handoff, because granting a clinic manager access would still mean editing the helper and redeploying — exactly the code change the spec set out to avoid. The override, exposed in the admin UI, is what makes the requirement true.

**Remaining before this is READY** — the survey above is not a full pass:
- Read `src/lib/auth.config.ts` and the session callback: confirm what the session actually carries, and whether a new field propagates without re-login.
- Confirm how `src/app/admin/layout.tsx` decides nav visibility. The handoff requires Staff see *no trace* of Blog/Doctors/Approvals — hidden, not disabled.
- **Split this into two tasks.** A schema change plus ten call sites plus UI gating exceeds one task under the four-file rule: migration and helper first, then the call sites and nav.

---

### TJ-006 — Remove duplicate root icon files

- **Status:** READY
- **Branch:** `chore/remove-icon-duplicates`
- **Why:** `therapyjo_icons_no_bg/` (nine PNGs) and `therapyjo_icons_no_bg.zip` are tracked at the repo root and referenced by nothing. They are **not** source art: all nine PNGs are byte-identical to the shipped `public/icons/*.png`, so deleting them loses nothing that is not already in the repo under the shipped names. Split out of TJ-002, which deliberately excluded them pending this check.

**Planning pass:** 2026-08-14 — corrected the premise this task was filed on. The original note assumed these were originals that `public/icons/*` were *derived* from, which would have made deletion a judgement call about source art. Hashed both sets: `md5sum` over the nine root PNGs and the nine `public/icons/*.png` produces **identical sorted digest sets**, so the shipped PNGs are these files renamed, not re-exported from them. The only assets with no root counterpart are the nine `public/icons/*.svg`, which this task does not touch. Confirmed `git ls-files | grep -i therapyjo_icons` returns exactly **10** tracked paths (nine PNGs plus the zip), and that `grep -rn "therapyjo_icons"` across `src/`, `public/`, `next.config.mjs`, `package.json`, `README.md`, and `Claude_Instructions.md` returns **zero** hits — nothing references the folder or the archive by name. Read `src/app/components/Services.tsx` and `src/app/components/Finder.tsx`: both consume the nine icons as root-absolute `/icons/*.png` strings resolved from `public/`, so neither can reach the root folder. **User decision, 2026-08-14: delete both.** Deletion only, no dependency implications.

**Scope — delete only these:**
- `therapyjo_icons_no_bg/` — all nine PNGs
- `therapyjo_icons_no_bg.zip`

**Do not touch:**
- `public/icons/*` — **in use**, 18 files (nine PNG, nine SVG), consumed by `Services.tsx` and `Finder.tsx`
- Anything else in the tree. This task deletes two root entries and changes no code.

**Do not** rewrite git history — no `git filter-branch`, `git filter-repo`, or BFG. A normal deletion commit is the whole task, exactly as in TJ-002.

**Instructions:**

1. Re-confirm nothing references them before deleting:
   ```
   grep -rn "therapyjo_icons" src/ public/ next.config.mjs package.json README.md Claude_Instructions.md
   ```
   Expect zero results. If anything matches, stop and report — do not delete.
2. Re-confirm the shipped PNGs are byte-identical, so the delete is provably lossless. Both digest lists must match:
   ```
   md5sum therapyjo_icons_no_bg/*.png | cut -d' ' -f1 | sort
   md5sum public/icons/*.png | cut -d' ' -f1 | sort
   ```
   If any digest differs, **stop and report** — a root file that is not a duplicate is source art and falls outside this decision.
3. Delete both:
   ```
   git rm -r therapyjo_icons_no_bg therapyjo_icons_no_bg.zip
   ```

**Verification:**
- `npm run build` passes
- `ls public/icons/ | wc -l` prints `18` — the shipped icons are untouched
- `git status --short` shows exactly **10** `D` entries and nothing else. The tree is clean at handoff, so an eleventh entry means something outside Scope was touched — stop and report.
- `grep -rn "/icons/" src/` still returns the same 18 hits as before the change (nine in `Services.tsx`, nine in `Finder.tsx`). No reference may be rewritten to compensate for a deletion.

**Do not start a dev server.** The runtime render check on `/` is the planner's at VISUAL REVIEW, not the executor's.

**Done when:**
- [ ] The folder and the zip are deleted and staged — 10 files
- [ ] `public/icons/*` is untouched; all 18 files present
- [ ] Build passes; Services and Finder still render all nine icons on `/`
- [ ] Git history was not rewritten

---

## Notes for the planner

Findings reported by the executor, or surfaced during a pass, that fall outside the scope of the task that turned them up. The planner triages these into tasks. **The executor does not write here** — it reports in conversation and the planner records.

- `src/app/login/page.tsx:69` carries the comment `{/* Background video — same as landing hero */}`. Stale: the landing hero has been a static WebP since the redesign. A one-line comment fix, too small to file alone — fold it into the next task that touches `login/page.tsx`. (Found during the TJ-002 pass.)
- The Project Profile still carries the bare note `- Logo: logo.jpg`. TJ-001's instructions said to preserve it, correctly — but once TJ-002 deletes the root `logo.jpg`, that line reads ambiguously, since the surviving file is `public/logo.jpg`. Not worth reopening TJ-001; fold `public/logo.jpg` into the next task that edits the profile. (Found during TJ-001 planner verification.)
- ~~**Branches are unmerged.**~~ Resolved 2026-08-14: both merged to `master` with `--no-ff` after visual review. Merge policy is now recorded in the protocol.
- **Hero entrance animation is slow to settle — needs checking against a production build.** During the TJ-002 visual review, a cold load of `/` showed the hero badge, headline, subtitle, and CTAs arriving over roughly half a minute, well after the nav and background image had painted. Every element was computed-visible (`opacity: 1`) when queried, so this is not the dead-`opacity:0` failure mode. The likely cause is Turbopack compiling the route on demand in dev, which would not occur in production — so this is an observation, not a confirmed defect. Verify against `npm run build && npm start` before filing it as a task. Unrelated to TJ-002, which only deleted unreferenced files.
- **`master` is 8 commits ahead of `origin/master`; the user has chosen to hold.** Decision 2026-08-14: do not push yet. Nothing unpushed changes application behaviour — two merges, two task commits, two status commits, the protocol, and the earlier deploy fix — so there is no urgency, and holding lets a deploy wired to `master` fire once after the Reviews and Maps work lands rather than on a docs-only change. **Do not push without asking again.** The two task branches (`docs/sync-project-profile`, `chore/prune-root-assets`) stay local; their commits are already contained in the `--no-ff` merges, so nothing is lost by never pushing them.
- **The clinic's Google listing points its website field at `facebook.com`.** Observed 2026-08-14 while verifying the Place ID. Once this site launches, that field should point at the real domain — otherwise the listing keeps sending traffic to Facebook. Not a code task and not something the planner can action; it needs someone with access to the Google Business listing. Flagged to the user 2026-08-14.
- **The Cloud project will be owned by the developer's personal Google account** (`ahamami02@gmail.com`) — user decision, 2026-08-14, chosen over the clinic's account for speed. Consequence worth writing down now rather than rediscovering at handover: the project, the Places API key, and the billing all sit under a personal account that the clinic does not control, while the Google Business listing sits under an account that *does*. If the clinic ever takes the site over, the key must be reissued under their project or the reviews section stops working. Not a problem today; a known debt.
- **Google Cloud credentials: scope reduced to one key** (2026-08-14). The original plan needed three values. Two are now closed: the Place ID was obtained from the public finder, and TJ-003 switched to the keyless share embed, which **eliminates `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` entirely** — do not create it, and do not enable the Maps Embed API. ~~Only `GOOGLE_PLACES_API_KEY` remains outstanding.~~ **Closed 2026-08-14** — the key is in `.env` and verified live (HTTP 200 against Place Details for the clinic's Place ID). All three original values are now accounted for and no Google credential blocks any task.

  Worth keeping: the key line existed in `.env` with an **empty value** while TJ-004 recorded it as pasted, so the task sat in `BLOCKED` for a reason that had supposedly been cleared. `grep` for a variable *name* proves nothing. Check the value's length.
- **The Places API bills by field mask, and `reviews` is in the top tier.** Requesting `reviews` moves a Place Details call into Google's most expensive Places SKU. TJ-004 ships at `revalidate = 3600` — roughly 720 upstream calls a month, well inside the trial credit — but the same code with caching removed would make one billed call **per visitor**. If anyone ever reaches for the revalidate literal to "make reviews fresher," that is the trade being made. Reviews change a handful of times a year; hourly is already far more current than the data warrants. (Found during the TJ-004 pass.)
- **The reviews section will need re-tuning as the live set rotates.** Google returns five reviews chosen by its own relevance ranking, and today's five run from 90 to 1,452 characters — a spread the prototype's 85–120 character samples never anticipated. TJ-004 handles this with a 320-character truncation and a link to the full text, which is the right call for a fixed-height spotlight, but it means **three of the five currently shipping are cut**. If the returned set later skews long, consider whether the spotlight is still the right form, or whether the section should show fewer, shorter reviews well rather than all five awkwardly. Not a defect; a thing to look at with real eyes every few months. (Found during the TJ-004 pass.)
- **Every live review is currently in English, which makes the mixed-language decision untested in production.** TJ-004 implements it as decided — original text always, `dir="auto"` on the quote and the name — but nothing on the site exercises the RTL-review-on-the-English-page path today, because Google returned `languageCode: "en"` for all five. The first Arabic review to enter the top five will be the first real test. Worth a deliberate look when it happens rather than discovering it from a screenshot. (Found during the TJ-004 pass.)
- **The clinic's Google listing is the source of truth for the reviews section, and nobody on this project controls it.** The rating, the count, and which five reviews appear are all Google's to decide. This is the intended design — it is what makes the numbers honest — but it means the section's content can change without any deploy, and a bad review entering the top five will appear on the landing page automatically. The client should know that before launch. Pairs with the listing's website field still pointing at Facebook, above. (Found during the TJ-004 pass.)
- **The map embed is hardcoded to English (`!1sen!2sjo`) and will not follow the EN/AR toggle.** Google fixes the embed's language in the URL, so the Arabic site gets an English-labelled map. In practice this matters less than it sounds — the rendered map already shows bilingual labels and the business card carries both the English and Arabic clinic names — which is why TJ-003 ships as a one-line change rather than growing a per-locale variant. If a fully Arabic map is wanted later, fetch the AR embed URL and swap on `useLanguage()`; `Location.tsx` is already a client component with `t` in scope, so the mechanism is there. File it as its own task if the client asks. (Found during the TJ-003 pass.)
- ~~`package-lock.json` has one uncommitted line (`"hasInstallScript": true`)~~ — resolved 2026-08-14. Committed to `master` alongside the protocol, because a dirty tree makes every executor's `git status` verification step meaningless. Lesson for future dispatches: **the planner must confirm a clean tree before handing off**, or the executor inherits the planner's own uncommitted work on its branch.
