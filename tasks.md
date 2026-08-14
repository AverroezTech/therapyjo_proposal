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
| TJ-003 | Replace placeholder Google Maps embed | DONE — merged `cd6ee17` | `content/real-maps-embed` |
| TJ-004 | Source Google Reviews from a real API | DONE — merged `643c558` | `feat/google-reviews-api` |
| TJ-005a | Name the content-management capability | DONE — merged `bc5dd2b` | `refactor/content-capability-helper` |
| TJ-005b | Grant content management per user | BLOCKED — needs a decision on the admin-area access boundary | — |
| TJ-006 | Remove duplicate root icon files | DONE — merged `15b6942` | `chore/remove-icon-duplicates` |
| TJ-007 | End a resigned employee's session immediately | READY | `bugfix/revoke-session-on-resign` |

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

- **Status:** DONE — commit `25d08a8` on `content/real-maps-embed`, merged to `master` as `cd6ee17`
- **Branch:** `content/real-maps-embed`

**Planner verification:** 2026-08-14 — read the full diff rather than trusting the executor's report. One commit, one file, `M` only, exactly **1 insertion / 1 deletion**; `master` an ancestor, no history rewrite. Rather than eyeballing a 300-character URL, **byte-compared** the shipped `src` against the task's specified string programmatically — identical. Placeholder-fragment grep: zero hits. The other three attributes each present exactly once. Grepped for `allowfullscreen|width=|height=|style=`: zero hits, so none of Google's copied attributes were pasted in. Re-ran `npm run build` myself: exit **0**.

**Visual review:** 2026-08-14 — performed on the branch against a **production** build, on both EN and AR.

**The near-miss worth recording: port 3000 was already occupied by a server I did not start, and it was serving the *old* placeholder embed.** `npm start` failed with `EADDRINUSE` while `curl localhost:3000` still returned 200 — the exact shape of a trap, because the obvious move is to shrug and review against whatever answers on :3000. Doing so would have rendered the Swiefieh pin and **failed a task that was correct**. Confirmed the divergence directly: :3000 served `1d3384.5!2d35.87!3d31.95` with `0x0%3A0x0`, while the branch build on :3100 served `0x151ca1cd2ffd43a7`. Reviewed on :3100 and left the stranger process alone — it is the user's machine, not mine to kill. **Rule for future visual reviews: never assume the server answering on the default port is the one you just built. Assert the change is present in the served bytes before reviewing anything.**

Result: the pin sits on the clinic, and the business card reads **Therapy Jo Physiotherapy Center**, *Az Zubayr Ben Al Awwam, Amman*, **4.9 (367)** — the count independently agreeing with the live Places data TJ-004 ships. Neighbours render as the Islamic hospital and Amman Rotana, not Swiefieh Village. Scripted the assertions rather than trusting the eye: real place ID present, null place ID absent, `getAttributeNames()` returns exactly `src, loading, referrerpolicy, title`, and the box measures 544×408 — ratio **1.333**, so the wrapper's `aspect-ratio: 4/3` still governs sizing and the decision to discard Google's `width`/`height` is confirmed correct in the rendered result, not just in theory.

Applied the GSAP lesson from TJ-004 before concluding anything: the tab first reported `visibilityState: "hidden"`, so I re-checked with it genuinely visible — **61 rAF frames in 1s** and the entire ancestor chain up from the iframe at `opacity: 1`, including `.gsap-reveal-left`. Only then was the screenshot trustworthy. AR: `dir` flips to `rtl`, the grid mirrors, the map still resolves to the clinic, ratio holds at 1.333, and `scrollWidth > clientWidth` is **false** — no horizontal overflow. The card stays English-labelled, which is the documented `!1sen!2sjo` limitation in the planner notes, not a regression.
- **Why:** `src/app/components/Location.tsx:14` uses a synthesized embed URL built from approximate coordinates (`!2d35.87!3d31.95`) with a null place ID (`0x0%3A0x0`). It shows no business card, and the pin does not land near the clinic — it lands in **Swiefieh, ~4 km away** (see the visual comparison in the planning pass). The design handoff flags this as needing the real embed.

**Approach — final, 2026-08-14: the keyless share embed.** An earlier revision of this task proposed the Maps Embed API with a `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`. **That is withdrawn.** The clinic's listing is published, so Google's own Share → Embed a map yields a working URL needing no API key, no Cloud project, and no billing. Strictly less machinery for the same result, and it keeps a browser-visible key out of the project altogether. The Cloud project is still needed for TJ-004, but **only** for the Places key — the Maps Embed API does not need enabling.

**Planning pass:** 2026-08-14 — read `src/app/components/Location.tsx` in full (54 lines). Confirmed the `<iframe>` at line 13–18 carries exactly four attributes (`src`, `loading`, `referrerPolicy`, `title`) and no width/height/style — sizing comes from the `.location-map` wrapper in `globals.css`, so the `width`/`height`/`style`/`allowfullscreen` attributes in Google's copied HTML must be **discarded**, not pasted in. Obtained the Place ID `ChIJp0P9L82hHBURgY5pmicC-s0` from the public Place ID Finder and verified it by resolving `https://www.google.com/maps/place/?q=place_id:<ID>`, which returned *Therapy Jo Physiotherapy Center, Az-Zubayr Ben Al-Awwam St., Amman*; the listed phone `07 9981 9669` matches the profile's `+962799819669`. The user then supplied the share-embed HTML from that listing. **Cross-validated it rather than trusting it:** the feature ID inside the supplied URL (`0x151ca1cd2ffd43a7:0xcdfa02279a698e81`) is byte-identical to the one in the Maps place URL reached independently via the Place ID, so the pasted string points at the same entity the Place ID does.

**Corrected the *Why*.** The task claimed the placeholder "drops a pin near the clinic." It does not. Rendered both URLs side by side in iframes on a local page and compared: the placeholder lands in **Swiefieh** — beside Swiefieh Village and Salon Lara — while the real one lands on the clinic among Al-Ahli, Islamic, and Al Kindi hospitals. Roughly 4 km apart, in different districts. The real embed also renders a business card (name in EN and AR, address, 4.9 ★ 367) that the placeholder lacks entirely, because its place ID is the null `0x0:0x0`. Both URLs render, so this is a substitution of a working embed for a working-but-wrong one — not a fix for a broken frame.

One file, one line, no dependency implications.

**Re-verified before dispatch, 2026-08-14.** Re-read `Location.tsx` in full against the tree as it stands. The placeholder is still live at line 14 and still carries the null `0x0%3A0x0` place ID; the `<iframe>` still has exactly the four attributes the pass recorded, so the anchor string matches verbatim. Read `globals.css:1367–1378` and confirmed sizing does come from the wrapper (`aspect-ratio: 4/3` plus the `iframe` rule) — which is what produced the correction above. **Also probed the replacement URL rather than trusting the earlier cross-validation:** `GET` returned **HTTP 200**, 3,536 bytes, and the body names *Therapy Jo*. A dead or malformed embed would have failed here instead of at visual review. Baseline on `master`: `npm run build` exit **0**, tree clean.

**Scope — touch only this:**
- `src/app/components/Location.tsx`, the `src` attribute on the `<iframe>` only

**Do not touch:** the `loading`, `referrerPolicy`, and `title` attributes; the `.location-map` wrapper; every other section of the file. No `globals.css` changes. Do **not** add `width`, `height`, `style`, or `allowfullscreen` from Google's copied HTML.

  **Corrected 2026-08-14 at re-verification.** This line previously claimed those attributes "will break the responsive layout." That is wrong, and a wrong reason in a task is worth more than a wrong instruction. `globals.css:1374` sets `.location-map iframe { width: 100%; height: 100%; border: none; }`, and a CSS rule beats a presentational HTML attribute, so `width="600" height="450"` would be silently overridden rather than break anything. The instruction to discard them stands unchanged — they are dead weight that misrepresents how this element is sized — but it is a cleanliness rule, not a safety one. Do not let the corrected reason tempt you into pasting them in.

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
- [x] The `src` is replaced and the other three attributes are untouched
- [x] Build passes; diff is exactly one line
- [x] No placeholder fragment (`0x0:0x0`, `35.87`, `31.95`) remains in the file
- [x] Visual review: pin on the clinic, business card showing the clinic name

---

### TJ-004 — Source Google Reviews from a real API

- **Status:** DONE — commit `8df1861` on `feat/google-reviews-api`, merged to `master` as `643c558`
- **Branch:** `feat/google-reviews-api`

**Planner verification:** 2026-08-14 — read the full diff rather than relying on the executor's report. Exactly four files (`A` the route, `M` the other three), one commit, `master` an ancestor, no history rewrite. Read both new files end to end and confirmed them byte-faithful to the Instructions. Re-ran the build myself: exit 0, and the route table prints `○ /api/public/reviews  1h`, which is the evidence the hourly revalidate is actually in effect rather than merely written down. Re-ran every grep: zero fabrication hits, key confined to the server route, no `NEXT_PUBLIC_GOOGLE`, `readFull` present three times. Live route check returned `available: true` with rating 4.9, count 367, and five real reviewers.

**Two defects in this task's own Verification section, both mine, both confirmed by the executor:**

1. **`npm run lint` was never passable.** I added it without checking the baseline. `master` at `a6f3e49` fails with **76 problems (43 errors)** across `src/app/admin/*`, generated Prisma files, and the design-handoff bundle. The branch produces the identical 76 — TJ-004 added none — and `npx eslint` against the three touched TS/TSX files returns zero. The step has been struck below. Do not re-add it to any task until the baseline is fixed; it can only ever produce a false failure. See the note in the planner section.
2. **The `GOOGLE_PLACES_API_KEY` grep check said "exactly one hit."** The verbatim route file I supplied necessarily produces **three** — a comment, the `process.env` read, and the warning string — all inside the one file. The check's intent was that the key never appears outside the server route. Corrected below to test that instead of a line count. The executor flagged both rather than quietly working around them, which is the right behaviour.

**Visual review:** 2026-08-14 — performed on the branch against a **production** build (`npm run build && npm start`), not dev, before merge.

Live data end to end. The section renders **4.9** with five gold stars and **"Based on 367 Google reviews"** — no `300+`, and none of `R. Sami`, `L. Haddad`, `M. Odeh`, `D. Nassar`. Five dots, five real reviewers (`Ahmad Almudallal`, `Jaber Jaber`, `hedab albaz`, `Alpha Construction`, `Dana Asnan`). The `.toUpperCase()` on the avatar initial earns its place: `hedab albaz` renders as `H`. Truncated quotes end in an ellipsis and carry the "Read the full review on Google" link pointing at *that review's* own Maps URL; the two short reviews (91 and 141 characters) correctly have no link. **Measured the regression the truncation exists to prevent**: section height across all five reviews spans 231px, against the ~900px lurch the untruncated 1,452-character review would have produced.

Arabic passes, and exercised `dir="auto"` in the mirror image of the case it was designed for: with `<html dir="rtl">`, the English review's computed direction is `ltr` *inside* the RTL section, while the Arabic chrome, the Arabic `readFull` string, and `استناداً إلى 367 تقييم على Google` all lay out RTL. Also simulated the `available: false` branch in the DOM: `.is-unavailable` zeroes the `margin-inline-start` and the lone CTA centres to within 0px.

**One scare, investigated rather than assumed.** Mid-review `.hero-title` read `opacity: 0` for eight consecutive seconds on a production build — precisely the dead-element failure mode `Claude_Instructions.md` warns about. It was an artifact of the automation environment, not a defect: the tab was backgrounded, `requestAnimationFrame` was throttled to zero frames, and every GSAP `.from()` element sat frozen at its start state. With the tab genuinely visible, rAF ran at ~60fps (119 frames in 2s) and the hero settled at `opacity: 1`. This also closes the open TJ-002 observation about the hero taking half a minute to arrive — same cause. Recorded because a single screenshot cannot tell this apart from a real dead element, and the protocol's instruction to query computed opacity *and* distinguish mid-flight from never-appears is what caught it.
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
- ~~`npm run lint` passes~~ — **struck 2026-08-14.** Unpassable for reasons predating this task; `master` fails it with 76 problems. Verify instead that the touched files are individually clean: `npx eslint src/app/api/public/reviews/route.ts src/app/components/Reviews.tsx src/app/i18n/translations.ts` returns no output.
- `git diff --stat` shows exactly **four** files: the three edited plus the new route. Anything else means Scope was exceeded.
- No fabricated content survives — all three must return **zero** hits:
  ```
  grep -n "R\. Sami\|L\. Haddad\|M\. Odeh\|D\. Nassar" src/app/components/Reviews.tsx
  grep -n "300+" src/app/components/Reviews.tsx
  grep -n "4\.9" src/app/components/Reviews.tsx
  ```
- The key stays server-side. The first must name **only** `src/app/api/public/reviews/route.ts` — count the *files*, not the lines; the route legitimately mentions the variable three times. The second must return **zero**:
  ```
  grep -rln "GOOGLE_PLACES_API_KEY" src/
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
- [x] `R. Sami`, `L. Haddad`, `M. Odeh`, `D. Nassar`, `4.9`, and `300+` are all gone from `Reviews.tsx`
- [x] Rating, count, and all five quotes come from the live API
- [x] The key appears only in the server route; nothing is `NEXT_PUBLIC_`
- [x] A failed or unconfigured upstream renders header + CTA only, never fabricated content, and never fails the build
- [x] Long reviews are truncated on a word boundary and linked to the full text on Google
- [x] `dir="auto"` is present on both the quote and the author name
- [x] Build passes; touched files are lint-clean; diff is four files
- [x] Visual review passed on both EN and AR

---

### TJ-005 — Move content gating to a role capability

- **Status:** SPLIT — superseded by **TJ-005a** (READY) and **TJ-005b** (BLOCKED), both below. Kept for the survey, the user decision, and the pass that produced the split. Nothing executes against this ID.
- **Branch:** none — see the two successors
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

**Planning pass: 2026-08-14 — completed, and it split the task.** Read in full: `src/lib/auth.config.ts`, `src/lib/auth.ts`, `src/types/next-auth.d.ts`, `src/middleware.ts`, `src/app/admin/layout.tsx`, `prisma/schema.prisma`, `package.json`, `.gitignore`, and all eight ADMIN-gated handlers. Four things the partial survey got wrong or never reached:

1. **The survey's claim that "`middleware.ts` does no role gating at all" is wrong, and it is the single most important fact about this task.** `middleware.ts` is indeed a bare `NextAuth(authConfig).auth` — but the gating lives in the `authorized()` callback inside `auth.config.ts`, which that middleware invokes. `auth.config.ts:57` reads `if (pathname.startsWith("/admin") && role !== "ADMIN") → redirect("/unauthorized")`. So there *is* a chokepoint, it fires before any page or handler, and it is keyed on `ADMIN` alone. A per-user override that only teaches the eight API handlers to say yes would still be bounced at the middleware: the grantee could never load `/admin/blog` to use it. **Any capability layer must be readable inside `authorized()`.**
2. **`authorized()` runs on the Edge and cannot read the database.** `auth.config.ts` carries the comment "does NOT import Prisma — safe for Edge runtime / middleware", and that is load-bearing, not decorative. So a `canManageContent` column cannot be consulted at the middleware; the flag has to travel *in the JWT*. Which means `authorize()` in `auth.ts:36-41` must return it and the `jwt` callback must copy it.
3. **A new session field does not propagate without re-login.** `auth.config.ts:7-13` enriches the token only under `if (user)` — true at sign-in and never again. `updateAge: 60 * 60` refreshes the token's expiry, not its claims. With `maxAge: 8 * 60 * 60`, granting a capability leaves the grantee's live session stale for up to eight hours. Not a blocker, but it is behaviour the admin UI has to state ("takes effect at next sign-in") rather than something to discover in support.
4. **`src/app/admin/layout.tsx` does no role-based nav visibility whatsoever.** Every item — Dashboard, Employees, Patients, Notes, Blog, Doctors, Approvals — renders unconditionally for anyone who gets past the middleware. Today that is invisible because the middleware admits only `ADMIN`, so "hide from Staff" has no work to do. The moment a non-`ADMIN` can enter `/admin`, this file becomes the thing standing between a content manager and the patient records nav.

Also confirmed: there is **no `prisma/migrations/` directory** — the project uses `prisma db push` (`package.json:11`), so a schema change means pushing against the live Supabase database, not a reviewable migration file. `src/generated/prisma` is gitignored, so regeneration produces no diff. And `src/types/next-auth.d.ts` already types `session.user.role` properly, which makes the `(session.user as { role?: string })?.role` cast at all ten sites redundant noise the helper removes for free.

**Split, per the four-file and one-concern rules:** the naming of the capability is a pure refactor with no behaviour change and no decision attached — that is **TJ-005a**, below, and it is `READY`. Everything that changes who can do what — the column, the JWT claim, the middleware path split, the nav, the admin toggle — is **TJ-005b**, and it is `BLOCKED` on a decision only the user can make.

---

### TJ-005a — Name the content-management capability

- **Status:** DONE — commit `2205320` on `refactor/content-capability-helper`, merged to `master` as `bc5dd2b`
- **Branch:** `refactor/content-capability-helper`

**Planner verification:** 2026-08-14 — read the diff rather than trusting the report. One commit, `master` an ancestor, no rewrite. `git diff --name-status`: exactly **9** entries — eight `M` plus one `A` (`src/lib/permissions.ts`), no tenth. Every hunk is one of two shapes: the import line, or the guard substitution. No response body, status code, or control-flow change anywhere, as required.

Proved scope was respected by asking the inverse question — `git diff --name-only master <branch>` restricted to the Do-not-touch paths (`auth.config.ts`, `auth.ts`, `middleware.ts`, `src/types/`, `prisma/`, `src/app/admin/`, `doctor-profiles/me`, `employees/`, `reservations/`) returns **empty**. The `DOCTOR` guard in `pending-changes/route.ts` is byte-identical to `master`'s: both lines `md5` to `468ea73ebf1587c9bec3b1c4746cb521`.

Re-ran every verification myself. `npm run build`: compiled in 3.8s, 49/49 static pages, exit **0**. `npx eslint` over all nine files: exit **0**. `grep 'role !== "ADMIN"'` across the three content directories: **zero**. `grep requireAdmin src/`: **zero**. `grep -c canManageContent` per handler: **2** each (import + call), 8 files. And the trap check — `grep 'canManageContent(session)'`: **zero**, so the deny-everyone form was never written.

**Behavioural equivalence, which is the whole claim of this task:** old guard was `!session || role !== "ADMIN"`; new is `!session || !(user?.role === "ADMIN")`. Identical for every input, including `session.user` undefined, since both sides optional-chain. Nothing can pass now that could not pass before.

**Correction to this task's own Verification, found by the executor.** Step "grep `role !== \"DOCTOR\"` returns exactly two hits" is **wrong as written** — it greps all of `src/`, and `src/lib/auth.config.ts:63` contains the compound `role !== "DOCTOR" && role !== "ADMIN"`, which matches too. The true count is **three**, and always was. The executor hit this, investigated instead of stopping, and proved the third hit predates the branch (`git diff --stat master -- src/lib/auth.config.ts` empty; the line present in `git show master:...`). That was the right call and the right evidence. The step should have been scoped to `src/app/api/`, where it does return exactly two. My error: I wrote the narrative about two API handlers and then wrote a grep with a wider blast radius than the sentence describing it.

**Visual review: 2026-08-14 — PASSED, in two sittings.** Against a **production** build on port 3100, with the served-bytes rule applied first each time: `.next/BUILD_ID` (`Nn7TZWEKgMFDCJCLJfTkf`, then `8I73N65DaMgriihX81_EC` after the rebuild) found verbatim in the served HTML, so the bytes reviewed were this build and not the process already sitting on :3000.

**First sitting — logged out, and it proved nothing about the actual risk.** The public site was unaffected as expected (`/` renders all **9** sections, **16** images, **0** broken by `complete && naturalWidth === 0`), unauthenticated `/admin/blog` redirected to `/login?callbackUrl=%2Fadmin%2Fblog`, and the three gated endpoints redirected rather than erroring — no 500 anywhere. All green, and **all of it would have been just as green if this change had turned the entire CMS into a 401**, because none of those checks reach the code under test. Recorded because that is the trap, not the result.

Getting past it took the user: the seeded default (`admin` / `admin123`, `prisma/seed.ts:28`) is **rejected** by the live database (`error=CredentialsSignin`) — the password was changed after seeding, so nothing in the repo can log itself in. Minting a session locally from `AUTH_SECRET` was refused as indistinguishable from forging a token, correctly, and was not worked around. The user signed in themselves; the credential never left them.

**Second sitting — authenticated as `Noor Hamami`, role `ADMIN`.** This is the evidence that matters:

| Endpoint | Status | Payload |
|---|---|---|
| `GET /api/blog` | **200** | 1 post |
| `GET /api/doctor-profiles` | **200** | 3 profiles |
| `GET /api/doctor-profiles?archived=true` | **200** | 0 rows |
| `GET /api/pending-changes` | **200** | 0 rows |

Every content page loads and consumes its data: `/admin/blog` renders the table with live filter counts (`Archived 1` — which is itself the proof the gated GET returned the post, since a 401 would zero every chip); `/admin/doctors` renders all three profiles as ordered cards (#1–#3) with Hidden pills and Edit/Show/Archive controls; `/admin/doctors/archived` renders "Archived Doctors (0)" with its empty state; `/admin/approvals` renders "Nothing waiting for review," matching its 0-row 200. Zero broken images across all of them.

**The positive control I did not plan and would not have thought to write.** `GET /api/doctor-profiles/me` returns **401** for this ADMIN. That is correct — it requires `DOCTOR` — and it is the strongest single piece of evidence in this review: it proves the two `DOCTOR` ownership checks were *not* quietly folded into `canManageContent`. Had the executor merged the concepts, an ADMIN would have received 200 there and no other check in this review would have noticed. **Worth generalising: when a refactor's main risk is two concepts being collapsed into one, the test is not that the kept concept still passes — it is that the other concept still *fails* where it should.**

**Correction to what this file said an hour ago.** The earlier note claimed the database holds **zero** `DoctorProfile` rows, inferred from `/api/public/doctors` returning `[]`. Wrong: there are **three**, all `hidden: true`, and the public endpoint filters on `hidden: false`. An empty public response conflates "no data" with "data filtered out," and I read the first meaning into it without checking. The admin endpoint, which filters only on `archived`, showed all three immediately.

**Also confirms TJ-005b's finding #4 empirically:** the admin nav renders all seven items — Dashboard, Employees, Patients, Notes, Blog, Doctors, Approvals — with no role condition of any kind. Exactly as the planning pass predicted from reading the file.

- **Why:** The rule "who may manage Blog, public Doctor profiles, and the Approvals queue" is spelled out eight times as the string comparison `role !== "ADMIN"`, in eight different files. There is nowhere to change it. This task gives the rule a name and one home — `canManageContent()` — **without changing who passes it**. It is the prerequisite that makes TJ-005b a two-line change to one function instead of an eight-file edit under a security-relevant decision. Split out of TJ-005.

**Planning pass:** 2026-08-14 — see the TJ-005 pass above for the files read; this task is carved from it. Specific to this piece: confirmed all eight sites are byte-identical in shape, and that the predicate they encode is *exactly* `role === "ADMIN"` with no site-local variation — so a helper returning `user?.role === "ADMIN"` is provably behaviour-preserving today. Confirmed `src/lib/permissions.ts` does not exist. Confirmed `requireAdmin` appears exactly **12 times** across four files (one definition plus two call sites each) and **nowhere else** in `src/`. Confirmed the two `role !== "DOCTOR"` sites are a different concept (profile ownership) and stay untouched. Baseline on `master`: tree clean, `npm run build` exit **0**, and `npx eslint` over all eight handlers exit **0** — so any lint failure the executor sees is its own, not inherited.

**Deliberate exception to the four-file rule, recorded rather than ignored:** this touches nine files. Splitting it further is worse, not better — a half-migrated codebase where some content handlers use the helper and others still inline the string is a genuine review hazard, and the concept being moved is singular. The diff is one new 12-line file plus the same two-line substitution repeated eight times.

**Scope — touch only these:**
- `src/lib/permissions.ts` — **new file**
- `src/app/api/blog/route.ts`
- `src/app/api/blog/[id]/route.ts`
- `src/app/api/blog/[id]/translate/route.ts`
- `src/app/api/doctor-profiles/route.ts`
- `src/app/api/doctor-profiles/[id]/route.ts`
- `src/app/api/doctor-profiles/reorder/route.ts`
- `src/app/api/pending-changes/route.ts`
- `src/app/api/pending-changes/[id]/route.ts`

**Do not touch:**
- `prisma/schema.prisma` — no column in this task. The override is TJ-005b.
- `src/lib/auth.config.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `src/types/next-auth.d.ts` — no session or middleware change in this task.
- `src/app/admin/**` — no UI change in this task.
- `src/app/api/doctor-profiles/me/route.ts:8` and `src/app/api/pending-changes/route.ts:35` — both are `role !== "DOCTOR"`. **In-use lookalikes.** They gate a doctor editing their own profile and submitting it for approval. They express profile *ownership*, not content management, and folding either into `canManageContent` breaks the doctor self-service flow. Leave both exactly as they are.
- The `role === "ADMIN"` checks under `src/app/api/employees/**` and `src/app/api/reservations/**` — staff administration and clinical data, not content. Out of scope.

**Instructions:**

1. Create `src/lib/permissions.ts` with exactly this content:
   ```ts
   import type { Session } from "next-auth";

   /**
    * May this user manage public content — Blog posts, public Doctor profiles,
    * and the Approvals queue?
    *
    * The rule lives here rather than inline at each handler so it can be granted
    * without a code change at every call site. Today it derives from the role;
    * a per-user override is TJ-005b.
    */
   export function canManageContent(
       user: Session["user"] | undefined | null
   ): boolean {
       return user?.role === "ADMIN";
   }
   ```
   No Prisma import, no runtime import at all — the type import is erased at compile time. This keeps the file usable from Edge middleware, which TJ-005b needs.

2. In **each** of the eight handler files, add the import immediately below the existing `import { auth } from "@/lib/auth";` line:
   ```ts
   import { canManageContent } from "@/lib/permissions";
   ```

3. In **each** of the eight handler files, replace this exact line:
   ```ts
       if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
   ```
   with:
   ```ts
       if (!session || !canManageContent(session.user)) {
   ```
   It occurs **once per file**. In `src/app/api/pending-changes/route.ts` there is a second, similar line ending `!== "DOCTOR"` at line 35 — match on the `"ADMIN"` literal so you edit the right one, and leave the `"DOCTOR"` line untouched.

4. Rename the now-misleading local helper. In the four files that define it — `api/blog/route.ts`, `api/blog/[id]/route.ts`, `api/doctor-profiles/route.ts`, `api/doctor-profiles/[id]/route.ts` — rename `requireAdmin` to `requireContentManager`, at its definition and at both call sites in each file. That is 3 occurrences per file, 12 in total, and `requireAdmin` appears nowhere else in `src/`. A function still called `requireAdmin` that no longer checks for admin is the exact coupling this task exists to remove.

5. Do **not** change any response body, status code, or control flow. Every one of these sites returns `401` with `{ error: "Unauthorized" }` (or `null` from the local helper, which its callers turn into that same 401). All of that stays byte-identical.

**Verification:**
- `npm run build` passes.
- `npx eslint src/lib/permissions.ts src/app/api/blog/route.ts "src/app/api/blog/[id]/route.ts" "src/app/api/blog/[id]/translate/route.ts" src/app/api/doctor-profiles/route.ts "src/app/api/doctor-profiles/[id]/route.ts" src/app/api/doctor-profiles/reorder/route.ts src/app/api/pending-changes/route.ts "src/app/api/pending-changes/[id]/route.ts"` exits **0**. All nine were clean on `master`, so any finding is task-generated. **Do not run `npm run lint`** — `master` fails it with 76 pre-existing problems and it can only produce a false failure.
- `grep -rn 'role !== "ADMIN"' src/app/api/blog src/app/api/doctor-profiles src/app/api/pending-changes` returns **zero** hits.
- `grep -rn "requireAdmin" src/` returns **zero** hits; `grep -rc "requireContentManager"` over the four defining files returns **3** each.
- **The regression that matters:** `grep -rn 'role !== "DOCTOR"' src/` still returns exactly **two** hits — `src/app/api/doctor-profiles/me/route.ts` and `src/app/api/pending-changes/route.ts`. If either is gone, a doctor can no longer read or submit their own profile, and the build will not tell you.
- `git status --short` shows exactly **9** entries: one `A` (`src/lib/permissions.ts`) and eight `M`. The tree is clean at handoff, so a tenth entry means something outside Scope was touched — stop and report.
- Sanity-read your own diff for `canManageContent(session.user)` and confirm you never wrote `canManageContent(session)`. Both compile under the optional-chaining signature; only one is correct, and the wrong one silently denies **everyone**, turning the whole CMS into a 401. The build cannot catch this.

**Do not start a dev server.** The runtime check on the admin CMS is the planner's at VISUAL REVIEW.

**Done when:**
- [x] `src/lib/permissions.ts` exists and exports `canManageContent`, deriving from the role and importing nothing at runtime
- [x] All eight content handlers gate on the helper; no `"ADMIN"` string literal survives in them
- [x] `requireAdmin` is gone; the two `DOCTOR` ownership checks are untouched — and proved still enforced, not merely still present, by the 401 on `/api/doctor-profiles/me`
- [x] Build and scoped lint pass; the diff is exactly nine files
- [x] Visual review: admin CMS Blog list, Doctors list, and Approvals all load for an ADMIN, with live data

---

### TJ-005b — Grant content management per user

- **Status:** BLOCKED — needs a decision on the admin-area access boundary
- **Branch:** assigned once unblocked
- **Why:** TJ-005a names the capability but leaves it derived from the role, so granting a clinic manager access still means editing the helper and redeploying — the exact code change the handoff set out to avoid. This task makes the grant real: a per-user override, honoured at the middleware, exposed in the admin UI. Split out of TJ-005.

**The blocker — a product decision with a security edge, for the user:**

`/admin` is one path prefix guarding two very different things. Blog, Doctors, and Approvals are public marketing content. `/admin/patients`, `/admin/employees`, and `/admin/notes` are patient records, clinical intake, SOAP notes, and staff accounts. Right now one rule covers both: `role === "ADMIN"`.

The moment a secretary can hold `canManageContent`, that rule has to split, or granting someone the right to write a blog post also hands them every patient file in the clinic. So, before this can be planned:

1. **Should a content grant admit its holder to `/admin` at all?** If yes, `authorized()` must gate `/admin/blog`, `/admin/doctors`, and `/admin/approvals` on `ADMIN || canManageContent` while every other `/admin` path stays `ADMIN`-only — and `admin/layout.tsx` must hide the Dashboard, Employees, Patients, and Notes nav from a content-only holder, per the handoff's "no trace" requirement. The alternative is a separate `/content` route tree, which is cleaner to reason about but a much larger move.
2. **Who may grant it?** Presumably `ADMIN` only, from the employee edit screens. Confirm.
3. **Is the eight-hour lag acceptable?** A grant lands in the JWT at sign-in, so it does not reach a user already logged in until they sign out and back in (session `maxAge` is 8h). The workable alternative — bumping a session version, or forcing re-auth on change — is real work and should be decided, not defaulted into.

Also to settle before this is `READY`, both consequences of facts the pass established rather than open questions: applying the column means running `prisma db push` against the **live Supabase database** (there is no migrations directory), which is a production write and needs the user's go-ahead in its own right; and `src/types/next-auth.d.ts` must be extended for both `Session["user"]` and `JWT`, or the flag will not typecheck anywhere it is read.

---

### TJ-006 — Remove duplicate root icon files

- **Status:** DONE — commit `e29f573` on `chore/remove-icon-duplicates`, merged to `master` as `15b6942`
- **Branch:** `chore/remove-icon-duplicates`

**Planner verification:** 2026-08-14 — read the diff directly rather than trusting the report. One commit, `master` an ancestor, no rewrite. `git diff --name-status`: exactly **10 `D`** entries and **0** non-`D`; `--shortstat` confirms **0 insertions, 0 deletions** of content, i.e. pure delete-mode with no code touched. Re-ran the build myself: exit **0**. `public/icons/` still 18 files; `/icons/` references in `src/` still 18; no `therapyjo_icons_no_bg*` left at root; tree clean.

**Re-proved the safety gate a different way, because the executor's version could no longer be re-run.** The task's `md5sum` step hashes files that the task itself then deletes — on the branch they are gone, so re-running it verbatim proves nothing. Instead I hashed the **deleted blobs out of git history** (`git show master:<path>` piped to `md5sum`) and compared those against the surviving `public/icons/*.png`: **identical, digest for digest.** That is the stronger statement anyway — it proves what was removed is byte-recoverable from what remains, rather than proving something about files that no longer exist.

**Closed a gap the task left open: the zip's contents were assumed redundant, never proven.** Every version of this task justified deleting `therapyjo_icons_no_bg.zip` by pointing at the nine loose PNGs, but nobody had looked inside the archive. Extracted it from git history: it holds exactly those nine PNGs (293,339 bytes total) and their digests match `public/icons/*.png` **identically**. So the archive held nothing unique either. Recorded because "it's obviously just a zip of the folder" is an assumption, and the whole point of the md5 gate was to not delete source art on an assumption.

**Visual review:** 2026-08-14 — on the branch, against a **production** build on port 3100, with the new served-bytes rule applied first: confirmed the server was actually serving this build by checking the post-TJ-003 embed marker (`0x151ca1cd2ffd43a7`) was present in the served HTML before reviewing anything.

All nine icon URLs return **200**. In the rendered page: **0 broken images out of 16** (`complete && naturalWidth === 0`), and all nine distinct icon files present. Per-row measurement of `#services img` shows every one of the nine loaded at **512×512** natural size.

**One thing that would have looked like a defect and is not.** Service rows 5–9 photographed as blank, with min ancestor `opacity: 0.00`. The icons behind them were fully loaded at 512×512 — the GSAP reveal simply had not fired for below-the-fold rows in a throttled tab. Rows 1–4 read 1.00 / 0.99 / 0.98 / 0.96, a decaying stagger that is the signature of an animation **mid-flight**, not a dead element. This is the trap the planner notes already warn about, met for the third time; the per-element `naturalWidth` check is what settles it, and a screenshot alone never could.

**Also worth recording: my own verification script froze the renderer.** Awaiting `requestAnimationFrame` inside a hidden tab never resolves, because rAF is throttled to zero frames — the CDP call timed out after 45s. The page was fine throughout. **Never `await` a rAF-gated promise in an automation tab without racing it against a timeout**; use `setTimeout`-based waits and measure rAF only as a bounded sample.
- **Why:** `therapyjo_icons_no_bg/` (nine PNGs) and `therapyjo_icons_no_bg.zip` are tracked at the repo root and referenced by nothing. They are **not** source art: all nine PNGs are byte-identical to the shipped `public/icons/*.png`, so deleting them loses nothing that is not already in the repo under the shipped names. Split out of TJ-002, which deliberately excluded them pending this check.

**Planning pass:** 2026-08-14 — corrected the premise this task was filed on. The original note assumed these were originals that `public/icons/*` were *derived* from, which would have made deletion a judgement call about source art. Hashed both sets: `md5sum` over the nine root PNGs and the nine `public/icons/*.png` produces **identical sorted digest sets**, so the shipped PNGs are these files renamed, not re-exported from them. The only assets with no root counterpart are the nine `public/icons/*.svg`, which this task does not touch. Confirmed `git ls-files | grep -i therapyjo_icons` returns exactly **10** tracked paths (nine PNGs plus the zip), and that `grep -rn "therapyjo_icons"` across `src/`, `public/`, `next.config.mjs`, `package.json`, `README.md`, and `Claude_Instructions.md` returns **zero** hits — nothing references the folder or the archive by name. Read `src/app/components/Services.tsx` and `src/app/components/Finder.tsx`: both consume the nine icons as root-absolute `/icons/*.png` strings resolved from `public/`, so neither can reach the root folder. **User decision, 2026-08-14: delete both.** Deletion only, no dependency implications.

**Re-verified before dispatch, 2026-08-14.** Re-ran every claim rather than trusting the pass. `grep -rn "therapyjo_icons"` across the six named paths: **zero** hits. `md5sum` over both PNG sets: the nine sorted digests are **identical**, so the delete is provably lossless — re-checked because "byte-identical" is the entire justification for deleting what look like source files, and it is the one claim whose falsity would make this task destructive. `git ls-files | grep -i therapyjo_icons`: exactly **10** tracked paths (nine PNGs plus the zip). `ls public/icons/ | wc -l`: **18**. `grep -rn "/icons/" src/ | wc -l`: **18**. Baseline on `master`: `npm run build` exit **0**, tree clean.

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
- [x] The folder and the zip are deleted and staged — 10 files
- [x] `public/icons/*` is untouched; all 18 files present
- [x] Build passes; Services and Finder still render all nine icons on `/`
- [x] Git history was not rewritten

---

### TJ-007 — End a resigned employee's session immediately

- **Status:** READY
- **Branch:** `bugfix/revoke-session-on-resign`
- **Why:** Marking an employee as gone does not log them out. `authorize()` (`src/lib/auth.ts:27`) checks `status !== "ACTIVE"` **at sign-in only**, and the `jwt` callback enriches the token only under `if (user)` — true once per login and never again. So a user marked `RESIGNED` keeps a fully valid session, and with `maxAge: 8 * 60 * 60` they retain working access to patient records, clinical notes, and the CMS for up to eight hours after being removed. "Resigned" is the app's own delete: `DELETE /api/employees/doctors/[id]` and `.../secretaries/[id]` are soft deletes that set `status: "RESIGNED"`, and the `PUT` handlers accept `status` directly. There is no hard delete. Requested by the user 2026-08-14.

**Planning pass:** 2026-08-14 — read `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/providers.tsx`, `src/app/admin/layout.tsx`, `src/types/next-auth.d.ts`, `tsconfig.json`, both `api/employees/*/[id]/route.ts` handlers, and — because the mechanism depends on library internals rather than on our own code — `@auth/core`'s `src/index.ts`, `src/lib/actions/session.ts`, `jwt.d.ts`, and `next-auth/lib/index.js`. Five things established:

1. **Returning `null` from the `jwt` callback is a real revocation, not just a rejection.** In `@auth/core/src/lib/actions/session.ts`, when `callbacks.jwt(...)` returns non-null the session cookie is re-signed and re-set; when it returns `null` the `else` branch runs `response.cookies?.push(...sessionStore.clean())` — **the cookie is actively cleared**. So a revoked user is not merely denied, they are signed out. The type permits it: `jwt?: (params) => Awaitable<JWT | null>`, and `NextAuthConfig` widens `callbacks` without narrowing `jwt`, so `return null` typechecks.
2. **Both the middleware and `auth()` invoke the `jwt` callback** — `next-auth/lib/index.js` has `auth()` and `handleAuth()` (the middleware path) both call `getSession(headers, config)`, which spreads `...config.callbacks`. This is the fact that decides the design: **the check cannot go in `auth.config.ts`**, because that file is imported by Edge middleware and importing Prisma there breaks it. It must go in `auth.ts`, which is `server-only` and Node.
3. **`/api/auth/session` is served by the Node instance** — `src/app/api/auth/[...nextauth]/route.ts` re-exports `handlers` from `@/lib/auth`. So the client's own session endpoint runs the overridden callback, revokes, and clears the cookie. `src/app/providers.tsx` mounts `SessionProvider`, which refetches on window focus, and `admin/layout.tsx:130-134` already redirects to `/login` on `status === "unauthenticated"` plus re-checks `/api/auth/session` on `visibilitychange`. **The client-side logout path already exists** — this task only has to make the server say no.
4. **The JWT type augmentation in `src/types/next-auth.d.ts` is inert, and the executor will trip on it.** It declares `module "next-auth/jwt"`, but `next-auth/jwt.d.ts` is a bare `export * from "@auth/core/jwt"` — a re-export, so the merge never reaches the interface that actually types the `token` parameter. `JWT extends Record<string, unknown>`, which is why *writing* `token.id = …` compiles anywhere while *reading* `token.id` yields `unknown`. Reading it therefore needs an explicit cast, supplied verbatim below. (This also explains the `(session.user as { role?: string })` casts littered across the codebase.)
5. **`tsconfig.json` has `"strict": false`**, so nullability will not fight you here — but `unknown` is still not assignable to `string` under any setting, which is exactly why step 4 matters.

**What "immediately" honestly means here, because the middleware is Edge and cannot be part of it.** After this lands, a resigned user's *next request* gets: every API route 401 (all of them call `auth()`), `/api/auth/session` returns null and clears their cookie, and the admin shell redirects them to `/login`. Data access stops on the very next request. The one gap is that Edge middleware, running the un-overridden callback, would still wave a stale cookie through to a page *shell* until any Node-side session read clears it — which the mounted `SessionProvider` triggers on focus anyway. Closing that last gap needs Node-runtime middleware, a much larger architectural change; noted for the planner, deliberately out of scope here.

**Scope — touch only this:**
- `src/lib/auth.ts`

**Do not touch:**
- `src/lib/auth.config.ts` — **the critical one.** It is Edge-safe by design and the comment on line 3 says so. Putting the lookup here imports Prisma into the middleware bundle and breaks every route in the app. If it seems like the natural home for this, that instinct is the trap.
- `src/middleware.ts`, `src/types/next-auth.d.ts`, `prisma/schema.prisma` — no middleware, type, or schema change. Do **not** try to fix the inert augmentation from finding 4; cast at the read site as instructed and report the augmentation separately.
- `src/app/admin/layout.tsx` and `src/app/providers.tsx` — the client-side logout path already works. Nothing to add.
- The `api/employees/**` handlers — they already set `RESIGNED` correctly. This task changes what a session does about it, not how it is set.

**Instructions:**

1. In `src/lib/auth.ts`, find this exact line:
   ```ts
       ...authConfig,
   ```
   and insert the following block immediately after it, before the `providers: [` line:
   ```ts
       callbacks: {
           ...authConfig.callbacks,
           // Re-check the account on every server-side session read. authorize()
           // only runs at sign-in, so without this a user marked RESIGNED keeps a
           // valid session until the token expires — up to 8 hours of access after
           // being removed. Returning null revokes the session and clears the
           // cookie (see @auth/core session action), so they are signed out rather
           // than merely denied.
           //
           // This lives here and not in auth.config.ts on purpose: that file is
           // imported by Edge middleware and must stay free of Prisma.
           async jwt({ token, user }) {
               if (user) {
                   // Sign-in. authorize() has already proved the account is ACTIVE.
                   token.role = (user as { role: string }).role;
                   token.id = user.id;
                   return token;
               }

               const userId = (token.id as string | undefined) ?? token.sub;
               if (!userId) return null;

               const current = await prisma.user.findUnique({
                   where: { id: userId },
                   select: { status: true },
               });
               if (!current || current.status !== "ACTIVE") return null;

               return token;
           },
       },
   ```
2. The two lines in the `if (user)` branch are copied verbatim from `auth.config.ts:10-11` and are known to compile — do not "improve" the casts. The `as string | undefined` on `token.id` is **required**, not defensive: reading it yields `unknown` (see the planning pass, finding 4) and Prisma will not accept that.
3. Add nothing else. `prisma` is already imported at `src/lib/auth.ts:5` and `authConfig` at line 6 — no new imports, no new packages.

**Verification:**
- `npm run build` passes, and the output still lists `ƒ Proxy (Middleware)`. If the middleware vanishes or the build errors mentioning Prisma, `bcrypt`, or Node built-ins, the check landed in the Edge path — revert and report.
- `npx eslint src/lib/auth.ts` exits **0**. It was clean on `master`, so any finding is task-generated. **Do not run `npm run lint`** — `master` fails it with 76 pre-existing problems.
- **The regression that matters:** `grep -c "prisma" src/lib/auth.config.ts` returns **0**, and `git diff --name-only master` does **not** list `src/lib/auth.config.ts`. Edge purity is the one thing this task can break catastrophically, and the build may well pass while it is broken.
- `grep -n "status !== \"ACTIVE\"" src/lib/auth.ts` returns **two** hits — the original in `authorize()` at the sign-in gate, and the new one in the `jwt` callback. The first must survive: it is what stops a resigned user from logging back *in*, which this task does not replace.
- `git status --short` shows exactly **one** `M` entry, `src/lib/auth.ts`. The tree is clean at handoff.

**Do not start a dev server, and do not change any employee's status in the database.** The runtime proof requires marking a real account `RESIGNED` against live Supabase; that is the planner's at VISUAL REVIEW, with the user's agreement on which account to use.

**Done when:**
- [ ] `src/lib/auth.ts` re-validates the account on every non-sign-in `jwt` invocation and returns `null` when it is missing or not `ACTIVE`
- [ ] `auth.config.ts` is untouched and still Prisma-free; middleware still builds as Edge
- [ ] The sign-in gate in `authorize()` is unchanged
- [ ] Build and scoped lint pass; the diff is exactly one file
- [ ] Visual review: an ACTIVE user's session survives normal use, and an account flipped to `RESIGNED` is signed out on its next request

---

## Notes for the planner

Findings reported by the executor, or surfaced during a pass, that fall outside the scope of the task that turned them up. The planner triages these into tasks. **The executor does not write here** — it reports in conversation and the planner records.

- `src/app/login/page.tsx:69` carries the comment `{/* Background video — same as landing hero */}`. Stale: the landing hero has been a static WebP since the redesign. A one-line comment fix, too small to file alone — fold it into the next task that touches `login/page.tsx`. (Found during the TJ-002 pass.)
- The Project Profile still carries the bare note `- Logo: logo.jpg`. TJ-001's instructions said to preserve it, correctly — but once TJ-002 deletes the root `logo.jpg`, that line reads ambiguously, since the surviving file is `public/logo.jpg`. Not worth reopening TJ-001; fold `public/logo.jpg` into the next task that edits the profile. (Found during TJ-001 planner verification.)
- ~~**Branches are unmerged.**~~ Resolved 2026-08-14: both merged to `master` with `--no-ff` after visual review. Merge policy is now recorded in the protocol.
- ~~**Hero entrance animation is slow to settle — needs checking against a production build.**~~ **Closed 2026-08-14, not a defect.** Checked against `npm run build && npm start` during the TJ-004 visual review. The cause is neither Turbopack nor the animation: when the browser tab is backgrounded, `requestAnimationFrame` is throttled to **zero frames**, GSAP's ticker never advances, and every element in a `gsap.from()` / `fromTo()` sits frozen at its start state — which for these tweens is `opacity: 0`. It looks exactly like the dead-`opacity:0` bug and is completely benign. Measured: 119 rAF frames in 2s with the tab visible, hero at `opacity: 1`; 0 frames and `opacity: 0` indefinitely with it backgrounded.

  **This is a trap for every future visual review**, so it is worth stating as a rule: a headless or backgrounded tab cannot distinguish a broken entrance animation from a throttled one. Before concluding any GSAP-animated element is dead, confirm `document.visibilityState === "visible"`, `document.hasFocus()`, and that rAF is actually ticking. Only then does `opacity: 0` mean anything.
- **`npm run lint` cannot pass and must not be used as a verification step.** `master` fails it with **76 problems (43 errors, 33 warnings)** — `react-hooks/set-state-in-effect` and `react/no-deprecated` across `src/app/admin/*`, plus unused-disable warnings in generated `src/generated/prisma/*` files and the `design_handoff_landing_and_blog_cms/support.js` bundle. None of it is task-generated; it predates the queue. Until it is fixed, a task that lists `npm run lint` as verification can only produce a false failure, and an executor that trusts the step will either stop for nothing or learn to ignore failing checks — both bad. Scope lint per-file instead: `npx eslint <the files the task touched>`. Filing the cleanup as its own task is worth considering, but note the generated Prisma files probably want an eslint ignore rather than edits. (Found during the TJ-004 verification; the step was mine and it was wrong.)
- ~~**`master` is 23 commits ahead of `origin/master`; the user has chosen to hold.**~~ **Resolved 2026-08-14 — pushed.** The user lifted the hold and `master` went to `origin/master` as `e73914e..2583aa9` (24 commits); local and remote are now level. Pre-push scan, recorded because it is the check worth repeating every time: `.env` is not tracked and appears nowhere in the pushed history, the diff carries no `AIza…` pattern, and the real key value was **content-matched against the entire push and is absent** (matched, never echoed). Repo is **private**, org `AverroezTech`.

  **The outstanding item survives the push and is now live-facing:** `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACES_PLACE_ID` exist only in gitignored `.env`, so the push did **not** carry them. Any host deploying from this remote will render the Reviews section in its `available: false` state — header plus the Google CTA, no rating and no quotes — until both are set in that host's environment. It degrades rather than breaking, and it never fabricates content, which is exactly what TJ-004's failure path was designed for. Also note `tasks.md` is now on the remote and contains the developer's personal Google account address in the ownership note below; fine for a private repo, worth knowing before the repo is ever made public or handed to the clinic.

  The three task branches (`docs/sync-project-profile`, `chore/prune-root-assets`, `feat/google-reviews-api`, plus `content/real-maps-embed` and `chore/remove-icon-duplicates`) were deliberately **not** pushed — their commits are already contained in the `--no-ff` merges, so nothing is lost by leaving them local. **This changed materially when TJ-004 merged** — the original reasoning was that nothing unpushed altered application behaviour. That is no longer true: `643c558` replaces the Reviews section's content with a live API call. Pushing now would deploy real reviews *and* require `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACES_PLACE_ID` to exist in the host's environment. They are in local `.env`, which is gitignored and therefore **not** carried by a push — without them the section degrades to the CTA-only state rather than breaking, but it will not show reviews. Set both in the host's environment variables before or alongside the first push. **Do not push without asking again.** The two task branches (`docs/sync-project-profile`, `chore/prune-root-assets`) stay local; their commits are already contained in the `--no-ff` merges, so nothing is lost by never pushing them.
- **The `next-auth/jwt` module augmentation in `src/types/next-auth.d.ts` does nothing.** It augments `next-auth/jwt`, but that module is a bare `export * from "@auth/core/jwt"`, so the declaration merge never reaches the interface that types the `token` parameter. `JWT extends Record<string, unknown>`, which is why writing `token.id = …` compiles while reading it yields `unknown`. The `Session` half of the same file *does* work. This is the real reason for the `(session.user as { role?: string })` casts everywhere — they were never redundant defensiveness, the types genuinely are not there for the JWT. Fixing it means augmenting `@auth/core/jwt` instead; worth its own task, and it would let a future capability flag be read off the token without casting. (Found during the TJ-007 pass.)
- **Edge middleware cannot enforce anything that needs the database, and that shapes every auth task in this project.** `auth.config.ts` is imported by `middleware.ts` and must stay Prisma-free, yet `next-auth`'s middleware path calls the same `jwt` callback the Node instance does. So any DB-backed rule — session revocation (TJ-007), a per-user capability (TJ-005b) — can only be enforced Node-side, with the middleware running a weaker check on whatever the cookie already carries. The general shape of the fix is always the same: put the authoritative check in `auth.ts`, and rely on the cookie being cleared to bring the middleware back into line on the next request. Node-runtime middleware would collapse the two into one chokepoint and is probably the right long-term move. (Found during the TJ-007 pass.)
- **When a refactor risks collapsing two concepts, assert the *other* concept still fails.** TJ-005a's danger was `canManageContent` quietly absorbing the two `DOCTOR` ownership checks. Every planned check — build, lint, greps, the three content endpoints returning 200 — passes identically whether or not that happened. The check that actually settled it was `GET /api/doctor-profiles/me` returning **401 to an ADMIN**, i.e. proving the doctor-only gate still *rejects* the role that content management admits. Grepping that a line still exists proves it was not deleted; it does not prove it still means something. **Build the negative case into the Verification block, not just the positive one.** (Found during the TJ-005a visual review.)
- **An empty API response conflates "no data" with "data filtered out," and I read it wrong.** `/api/public/doctors` returned `[]`, and I recorded in this file that the database held zero `DoctorProfile` rows. It holds **three** — all `hidden: true`, and the public endpoint filters on `hidden: false`. The admin endpoint, filtering only on `archived`, showed all three at once. The corrected state of the live database, worth knowing independently: **3 doctor profiles, all named "test", all hidden, with placeholder screenshots as photos**, and **1 blog post titled "Test", status ARCHIVED**. None of it reaches the public site, which is why the landing page shows "Team profiles coming soon" — but it is test data sitting in the production database and should be cleaned out before launch. **Never infer the shape of the data from an endpoint that filters it.** (Found during the TJ-005a visual review.)
- **A logged-out visual review cannot review an authenticated surface, and it will look like it passed.** Every check available without a session — public page renders, no broken images, admin routes redirect, no 500s — comes back green whether the CMS works or is a uniform 401, because none of them ever reach the code under test. TJ-005a's whole risk lives behind the login. **When a task's blast radius is authenticated, credentials are part of the review setup, not an optional extra**; establish them before dispatching, not after the executor has finished. Related: the seeded `admin`/`admin123` in `prisma/seed.ts:28` no longer works against the live database, so nothing in the repo can log itself in. (Found during the TJ-005a visual review.)
- **`AUTH_URL` pins auth redirects to :3000 regardless of the port the app is served on.** `.env` sets `AUTH_URL=http://localhost:3000/`, and NextAuth rewrites its redirects against it — so the "start on a free port" rule from TJ-003 sidesteps the stale-server trap for *page* loads but walks straight back into it the moment a login or logout redirect fires. Override `AUTH_URL` for the run when reviewing on any other port. (Found during the TJ-005a visual review.)
- **A survey is not a planning pass, and the TJ-005 partial survey proves why.** It recorded "`middleware.ts` does no role gating at all — all enforcement is per-handler," and concluded from that "there is no chokepoint; all ten sites must change." Both halves were wrong. `middleware.ts` really is a bare `NextAuth(authConfig).auth`, but the gating lives in `authorized()` inside `auth.config.ts`, one import away, and it redirects every non-`ADMIN` off `/admin` before a handler is ever reached. The survey read the file the concern is *named* after and stopped. Had the task shipped on that reading, the override would have been added to eight handlers and the grantee still could not have loaded the page. **Follow the import when a file turns out to be a one-line re-export.** (Found during the TJ-005 pass.)
- **`/admin` guards patient records and marketing content behind the same rule, and TJ-005b has to break that open.** `authorized()` gates the whole prefix on `role === "ADMIN"`, so today Blog/Doctors/Approvals and `/admin/patients` (clinical intake, SOAP notes, patient files) are equally protected by accident of sharing a path. Any per-user content grant must split that gate, or "let the manager write blog posts" silently grants the clinic's patient files. Named as the blocker on TJ-005b; flagging it here too because it outlives that task — the route tree is the real problem and it will resurface with the next role. (Found during the TJ-005 pass.)
- **There is no `prisma/migrations/` directory.** Schema changes go through `prisma db push` (`package.json:11`) straight into the live Supabase database. So "add a column" is a production write with no reviewable migration artifact and no down path, not a file in a diff. Worth the user's explicit go-ahead each time, and worth considering whether the project should adopt real migrations before the schema changes again. (Found during the TJ-005 pass.)
- **Session claims are set at sign-in and never refreshed.** `auth.config.ts:7-13` enriches the JWT only under `if (user)`, which is true exactly once per login; `updateAge` extends the token's life without re-reading anything. With `maxAge: 8h`, any future permission, role, or status change is invisible to an already-logged-in user for up to a workday. This also means **deactivating a user does not end their session** — `authorize()` checks `status !== "ACTIVE"` at login only, so a resigned employee keeps working access until their token expires. Not part of any queued task; probably should be. (Found during the TJ-005 pass.)
- **The clinic's Google listing points its website field at `facebook.com`.** Observed 2026-08-14 while verifying the Place ID. Once this site launches, that field should point at the real domain — otherwise the listing keeps sending traffic to Facebook. Not a code task and not something the planner can action; it needs someone with access to the Google Business listing. Flagged to the user 2026-08-14.
- **The Cloud project will be owned by the developer's personal Google account** (`ahamami02@gmail.com`) — user decision, 2026-08-14, chosen over the clinic's account for speed. Consequence worth writing down now rather than rediscovering at handover: the project, the Places API key, and the billing all sit under a personal account that the clinic does not control, while the Google Business listing sits under an account that *does*. If the clinic ever takes the site over, the key must be reissued under their project or the reviews section stops working. Not a problem today; a known debt.
- **Google Cloud credentials: scope reduced to one key** (2026-08-14). The original plan needed three values. Two are now closed: the Place ID was obtained from the public finder, and TJ-003 switched to the keyless share embed, which **eliminates `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` entirely** — do not create it, and do not enable the Maps Embed API. ~~Only `GOOGLE_PLACES_API_KEY` remains outstanding.~~ **Closed 2026-08-14** — the key is in `.env` and verified live (HTTP 200 against Place Details for the clinic's Place ID). All three original values are now accounted for and no Google credential blocks any task.

  Worth keeping: the key line existed in `.env` with an **empty value** while TJ-004 recorded it as pasted, so the task sat in `BLOCKED` for a reason that had supposedly been cleared. `grep` for a variable *name* proves nothing. Check the value's length.
- **The Places API bills by field mask, and `reviews` is in the top tier.** Requesting `reviews` moves a Place Details call into Google's most expensive Places SKU. TJ-004 ships at `revalidate = 3600` — roughly 720 upstream calls a month, well inside the trial credit — but the same code with caching removed would make one billed call **per visitor**. If anyone ever reaches for the revalidate literal to "make reviews fresher," that is the trade being made. Reviews change a handful of times a year; hourly is already far more current than the data warrants. (Found during the TJ-004 pass.)
- **The reviews section will need re-tuning as the live set rotates.** Google returns five reviews chosen by its own relevance ranking, and today's five run from 90 to 1,452 characters — a spread the prototype's 85–120 character samples never anticipated. TJ-004 handles this with a 320-character truncation and a link to the full text, which is the right call for a fixed-height spotlight, but it means **three of the five currently shipping are cut**. If the returned set later skews long, consider whether the spotlight is still the right form, or whether the section should show fewer, shorter reviews well rather than all five awkwardly. Not a defect; a thing to look at with real eyes every few months. (Found during the TJ-004 pass.)
- **Every live review is currently in English, which makes the mixed-language decision untested in production.** TJ-004 implements it as decided — original text always, `dir="auto"` on the quote and the name — but nothing on the site exercises the RTL-review-on-the-English-page path today, because Google returned `languageCode: "en"` for all five. The first Arabic review to enter the top five will be the first real test. Worth a deliberate look when it happens rather than discovering it from a screenshot. (Found during the TJ-004 pass.)
- **The clinic's Google listing is the source of truth for the reviews section, and nobody on this project controls it.** The rating, the count, and which five reviews appear are all Google's to decide. This is the intended design — it is what makes the numbers honest — but it means the section's content can change without any deploy, and a bad review entering the top five will appear on the landing page automatically. The client should know that before launch. Pairs with the listing's website field still pointing at Facebook, above. (Found during the TJ-004 pass.)
- **The map embed is hardcoded to English (`!1sen!2sjo`) and will not follow the EN/AR toggle.** Google fixes the embed's language in the URL, so the Arabic site gets an English-labelled map. In practice this matters less than it sounds — the rendered map already shows bilingual labels and the business card carries both the English and Arabic clinic names — which is why TJ-003 ships as a one-line change rather than growing a per-locale variant. If a fully Arabic map is wanted later, fetch the AR embed URL and swap on `useLanguage()`; `Location.tsx` is already a client component with `t` in scope, so the mechanism is there. File it as its own task if the client asks. (Found during the TJ-003 pass.)
- **Do not `await` a `requestAnimationFrame`-gated promise in an automation tab.** A verification script written during the TJ-006 visual review waited on rAF to sample the frame rate; the tab was backgrounded, rAF was throttled to **zero frames**, the promise never resolved, and the CDP `Runtime.evaluate` call died after 45s reporting the renderer as possibly frozen. The page was healthy the entire time — the bug was in the check, not the thing being checked. Race any rAF sample against a `setTimeout`, or measure with `setTimeout` alone. Filed next to the throttling note above because it is the same root cause wearing a different mask: the first makes a healthy element *look* dead, the second makes a healthy page *look* hung. (Found during the TJ-006 visual review.)
- **A stale server on port 3000 nearly caused a correct task to be failed.** During the TJ-003 visual review, `npm start` died with `EADDRINUSE` while `curl localhost:3000` cheerfully returned **200** — from a process this session did not start, serving a build old enough to still contain the placeholder embed. Reviewing there would have shown the Swiefieh pin and sent a correct task back to `READY`. **Standing rule: before any visual review, assert the change is present in the bytes the server is actually serving** — a one-line `curl … | grep` against the thing the task changed — rather than trusting that the process on the default port is the one you just built. Starting on a free port (`npx next start -p 3100`) sidesteps it entirely and avoids killing a process that belongs to the user. Related: the process on :3000 was left running deliberately; it is the user's machine and may be their own dev server. (Found during the TJ-003 visual review.)
- ~~`package-lock.json` has one uncommitted line (`"hasInstallScript": true`)~~ — resolved 2026-08-14. Committed to `master` alongside the protocol, because a dirty tree makes every executor's `git status` verification step meaningless. Lesson for future dispatches: **the planner must confirm a clean tree before handing off**, or the executor inherits the planner's own uncommitted work on its branch.
