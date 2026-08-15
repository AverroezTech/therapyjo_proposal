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
| TJ-007 | End a resigned employee's session immediately | DONE — merged `a1af675` | `bugfix/revoke-session-on-resign` |
| TJ-008 | Dashboard / reservations — reported issues | SPLIT — see TJ-008a, TJ-008b | — |
| TJ-008a | Create a patient without leaving the reservation form | DONE — merged `f80b589` | `feat/inline-patient-create` |
| TJ-008b | Allow a session's state to be reverted | DONE — merged `e5765b9` | `feat/revert-session-status` |
| TJ-009 | Employees / doctors — reported issues | BACKLOG — needs a pass, splits further | — |
| TJ-010 | Employees / secretaries — reported issues | BACKLOG — needs a pass, splits further | — |
| TJ-011 | Patients — reported issues | BACKLOG — needs a pass, splits further | — |
| TJ-012 | Blog — hard delete a post | BACKLOG — needs a pass | — |
| TJ-013 | Doctor profiles (public site) — hard delete | BACKLOG — needs a pass | — |

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

- **Status:** DONE — commit `70ed8ec` on `bugfix/revoke-session-on-resign`, merged to `master` as `a1af675`
- **Branch:** `bugfix/revoke-session-on-resign`

**Planner verification:** 2026-08-15 — read the diff rather than trusting the report. One commit, `master` an ancestor, one file, **31 insertions and 0 deletions**, matching the supplied block verbatim. `git diff --stat master` over `auth.config.ts`, `middleware.ts`, `src/types/`, and `prisma/` is **empty** — the Do-not-touch set is byte-identical. `grep -c prisma src/lib/auth.config.ts`: **0**. `grep 'status !== "ACTIVE"' src/lib/auth.ts`: **two** hits, the new one at line 36 and the original sign-in gate at line 58, so the check that stops a resigned user logging back *in* survives alongside the one that ends their existing session. `npx eslint src/lib/auth.ts`: exit **0**. Build: compiled in 3.7s, `ƒ Proxy (Middleware)` still listed.

**Went past the task's own Edge check, because "the build passed" is weak evidence for it.** The catastrophic failure mode here is Prisma leaking into the Edge bundle, and a build can succeed while that is true. So I read the actual bundle: `middleware-manifest.json` names three Edge chunks, and grepping them (278KB) for `PrismaClient`, `@prisma/client`, `adapter-pg`, and `findUnique` returns **zero** across all four terms — while `/unauthorized`, `SECRETARY`, `/admin`, and `callbackUrl` are all still present. So the authorization logic is at the Edge and the database check is not. That is the actual claim, proven directly rather than inferred.

**Visual review: 2026-08-15 — PASSED, with a real watched revocation.** Production build on port 3100, build ID `DeUS15vpa_TTF3RCJqWWh` confirmed in the served HTML first.

**Method worth reusing: two origins, two cookie jars.** Cookies are scoped by host but ignore port, so `localhost:3100` and `127.0.0.1:3100` are independent jars against the same server. That let one tab hold the ADMIN session while another held the test employee's, so the revocation could be *observed* rather than reported second-hand. The server was started with `AUTH_URL=http://127.0.0.1:3100` so the test login's redirect stayed on its own origin. The user created the throwaway account and signed in; account creation and password entry stayed with them.

| Stage | Test employee (`zz-revoke-test`, SECRETARY) | Admin (`Noor Hamami`) |
|---|---|---|
| Before flip | session live, `/api/patients` **200** with data | live, `/api/blog` **200** |
| After flip to `RESIGNED` | `/api/auth/session` → **null**; `/api/patients`, `/api/reservations`, `/api/blog` → **3xx to `/login`**, no JSON; browser lands on the sign-in screen | **unaffected**, still 200 |

**The pre-existing session survived, which is the regression this could have caused.** The admin's token was issued *before* this code existed and still validates — a wrong callback would have logged out every user on deploy.

**I raised a false alarm mid-review and it is worth recording, because the artifact is convincing.** The first post-flip probe reported `/api/patients -> 200` and I called it a failure: a resigned employee apparently still reading patient data. It was a measurement bug. `fetch` follows redirects transparently, so the middleware's 3xx to `/login` was surfaced as a **200 with the login page's HTML**. Reading the body settled it (`<!DOCTYPE html>` where JSON was expected), and re-probing with `redirect: "manual"` showed the truth: `type: "opaqueredirect"`, no JSON served. **A bare status code cannot tell "authorized" from "redirected to login" — assert on the body or on `redirect: "manual"`, never on `res.status` alone.** This is the same family as the rAF and stale-server traps already in these notes: the check looked healthier than the thing it was checking, this time in the direction of false failure rather than false pass.

**Left in the database:** the throwaway `zz-revoke-test` account, status `RESIGNED`. That is this app's soft-delete state, it cannot log in, and it is the only secretary row — safe to leave, and safe for the user to purge whenever.
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
- [x] `src/lib/auth.ts` re-validates the account on every non-sign-in `jwt` invocation and returns `null` when it is missing or not `ACTIVE`
- [x] `auth.config.ts` is untouched and still Prisma-free; middleware still builds as Edge — proven against the bundle, not just the build
- [x] The sign-in gate in `authorize()` is unchanged
- [x] Build and scoped lint pass; the diff is exactly one file
- [x] Visual review: an ACTIVE user's session survives normal use, and an account flipped to `RESIGNED` is signed out on its next request

---

## User-reported issues — triage, 2026-08-15

The user reported 17 issues across five admin surfaces. Every one was checked against the code and against the live database before being filed. **Fifteen are real, one was already half-built, and one is misdiagnosed but still worth fixing.** The verification that matters is recorded per task; the findings that shape more than one task are here.

**Foreign-key delete rules, read from the live database.** Every hard-delete request in this batch runs into one of these, and none of them are visible in `schema.prisma` at a glance:

| Constraint | On delete | What it means |
|---|---|---|
| `Reservation_patientId_fkey` | **RESTRICT** | Deleting a patient with any reservation **fails at the database**. Reservations must go first. |
| `Reservation_doctorId_fkey` | **RESTRICT** | Same for a doctor. A doctor who has ever been booked cannot be deleted without deciding what happens to the sessions. |
| `Note_doctorId_fkey` | **RESTRICT** | Same again, for general notes. |
| `ClinicalIntake_patientId_fkey` | CASCADE | Goes automatically with the patient. |
| `PatientFile_patientId_fkey` | CASCADE | Goes automatically with the patient. |
| `SOAPNote_reservationId_fkey` | CASCADE | Goes automatically with the reservation. |
| `PendingChange_doctorId_fkey` | CASCADE | Goes automatically with the doctor profile. |
| `DoctorProfile_userId_fkey` | SET NULL | Deleting a login account orphans the public profile rather than removing it. |
| `BlogPost_linkedId_fkey` | SET NULL | Deleting one language of a post **unlinks** its translation instead of deleting it. |

So "add a hard delete" is never a one-line `prisma.x.delete()`. Each of TJ-011, TJ-012, TJ-013 and the doctor half of TJ-009 has to state what happens to the RESTRICT-ed children, and that is a product decision, not an implementation detail.

**Storage is never reclaimed.** No code path deletes from Supabase Storage, and `src/lib/supabase.ts` holds only the anon key, so the app could not do it even if asked. Every hard delete added in this batch therefore leaves its uploaded files behind. Already recorded as a standing leak in the notes below; it now has a second cause.

**The live database is entirely test data** — user decision, 2026-08-15, in answer to a direct question. 3 users (`DeleteTest`, `testdelete`, `testsec`), 1 patient (`TestDelete`, id 2), 2 reservations, 7 blog posts, 8 doctor profiles. Nothing in it needs preserving, which means the hard-delete tasks can be tested against real rows rather than mocked. It also means **a second cleanup is wanted before launch** — the first one was 2026-08-15 and the database refilled the same day.

---

### TJ-008 — Dashboard / reservations — reported issues

- **Status:** SPLIT — superseded by **TJ-008a** and **TJ-008b**, both `READY`. Nothing executes against this ID.
- **Why:** Two issues were reported against the reservation flow. They share a surface but not a concern, and the protocol caps a task at one concern, so they were passed separately.

**Reported and verified:**

1. *"When creating a reservation it requires that a patient is already registered."* — **Real.** `src/app/admin/reservations/new/page.tsx:54` blocks submission on `if (!selectedPatient)`, and the only way to get a `selectedPatient` is to pick one out of the search dropdown, which reads existing rows. There is no create path on the page. → **TJ-008a.**
2. *"When selecting patient state, you should have the ability to revert the state."* — **Real.** `src/app/api/reservations/[id]/route.ts:6-14` defines `VALID_TRANSITIONS` with `CHECKED_OUT: []`, `CANCELLED: []` and `NO_SHOW: []` — three terminal states, no way back. → **TJ-008b.**

---

### TJ-008a — Create a patient without leaving the reservation form

- **Status:** DONE — commit `2ecbb69` on `feat/inline-patient-create`, merged to `master` as `f80b589`
- **Branch:** `feat/inline-patient-create`
- **Why:** Booking a first-time patient today means abandoning a half-filled reservation form, navigating to `/admin/patients/new`, creating the patient, navigating back, and re-entering the date, time, doctor and notes. The form keeps nothing. A modal on the reservation page that creates the patient and selects it in place removes the round trip entirely — which is what the user asked for: *"no need to leave the reservation page to make a patient."*

**Planning pass:** 2026-08-15 — read `src/app/admin/reservations/new/page.tsx` (all 283 lines), `src/app/secretary/reservations/new/page.tsx`, `src/app/api/patients/route.ts`, `src/app/admin/patients/page.tsx` (for the modal styling precedent).

Confirmed:
- The blocking check is `if (!selectedPatient) { setError("Please select a patient"); return; }` at `admin/.../new/page.tsx:54`. Identical logic exists in the secretary form. **Both surfaces need the fix** — the user reported it against the dashboard, but the secretary books reservations too and would otherwise keep the broken flow.
- `POST /api/patients` already does everything needed. **No API change is required.** It returns `201 { id, name, message }` on success and `409 { error, duplicate: { id, name } }` when `phone1` already exists.
- The 201 response omits `phone1`, which `PatientResult` needs. The client already holds the typed phone in its own state, so it can build the object without an API change. Same trick covers the 409: the duplicate check is an **exact match on `phone1`**, so the phone the user just typed *is* the duplicate's phone, and the existing patient can be offered for selection with no extra fetch.
- The `{selectedPatient && (…)}` JSX block is **byte-identical** in both files, same indentation. Verified with `cat -A`. The anchors below are therefore safe to apply to both.
- Neither file has any modal CSS — `.modal-overlay` and `.modal-card` appear in neither. They must be added. `src/app/admin/patients/page.tsx:262-270` is the styling precedent to match; it uses the project's CSS variables with literal fallbacks.
- `.clear-btn:hover { color: #fff; }` occurs **exactly once** in each file and is the CSS insertion anchor.
- `const [error, setError] = useState("");` occurs **exactly once** in each file.

Corrected during the pass: the first draft of this task added a picture upload to the modal, mirroring the dead `showAdd` modal in `admin/patients/page.tsx`. Dropped — a photo is not needed to book a session, and the patient profile page already handles it. The inline modal stays at name + two phones.

**Scope — touch only these:**
- `src/app/admin/reservations/new/page.tsx`
- `src/app/secretary/reservations/new/page.tsx`

**Do not touch:** `src/app/api/patients/route.ts` — it already does what is needed, and changing its response shape would ripple into `admin/patients/page.tsx`. Do not touch the dead `showAdd` modal in `admin/patients/page.tsx`; it is unrelated dead code and is being handled under TJ-011. Do not touch the `Suspense` wrapper or the default export in either file.

**Instructions:**

Apply all six steps to **both** files in Scope. The JSX and CSS anchors are identical in the two files; only the router destination after submit differs, and no step below changes it.

1. Add state. Find the line, unique in each file:
   ```
       const [error, setError] = useState("");
   ```
   Insert immediately **after** it:
   ```tsx
       const [showNewPatient, setShowNewPatient] = useState(false);
       const [newPatient, setNewPatient] = useState({ name: "", phone1: "", phone2: "" });
       const [creatingPatient, setCreatingPatient] = useState(false);
       const [newPatientError, setNewPatientError] = useState("");
       const [duplicateMatch, setDuplicateMatch] = useState<PatientResult | null>(null);
   ```

2. Add the handlers. Find the line, unique in each file:
   ```
       const handleSubmit = async () => {
   ```
   Insert immediately **before** it:
   ```tsx
       const selectPatient = (p: PatientResult) => {
           setSelectedPatient(p);
           setPatientSearch("");
           setPatientResults([]);
           setShowNewPatient(false);
       };

       const openNewPatient = () => {
           const typed = patientSearch.trim();
           const looksLikePhone = /^[0-9+][0-9\s+-]*$/.test(typed);
           setNewPatient({
               name: looksLikePhone ? "" : typed,
               phone1: looksLikePhone ? typed : "",
               phone2: "",
           });
           setNewPatientError("");
           setDuplicateMatch(null);
           setShowNewPatient(true);
       };

       const handleCreatePatient = async () => {
           setNewPatientError("");
           setDuplicateMatch(null);
           if (!newPatient.name.trim() || !newPatient.phone1.trim()) {
               setNewPatientError("Name and phone are required");
               return;
           }
           setCreatingPatient(true);
           const res = await fetch("/api/patients", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                   name: newPatient.name.trim(),
                   phone1: newPatient.phone1.trim(),
                   phone2: newPatient.phone2.trim() || null,
               }),
           });
           const data = await res.json();
           setCreatingPatient(false);
           if (!res.ok) {
               setNewPatientError(data.error || "Failed to create patient");
               if (data.duplicate) {
                   setDuplicateMatch({
                       id: data.duplicate.id,
                       name: data.duplicate.name,
                       phone1: newPatient.phone1.trim(),
                   });
               }
               return;
           }
           selectPatient({ id: data.id, name: data.name, phone1: newPatient.phone1.trim() });
       };
   ```

3. Route the search dropdown through the new helper. Find, in each file:
   ```
                                           <button key={p.id} className="search-item" onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatientResults([]); }}>
   ```
   Replace with:
   ```
                                           <button key={p.id} className="search-item" onClick={() => selectPatient(p)}>
   ```

4. Add the trigger button. Find, in each file:
   ```
                               {selectedPatient && (
                                   <div className="selected-patient">
                                       <span>✓ {selectedPatient.name} — {selectedPatient.phone1}</span>
                                       <button className="clear-btn" onClick={() => setSelectedPatient(null)}>Change</button>
                                   </div>
                               )}
   ```
   Insert immediately **after** that closing `)}`:
   ```tsx
                               {!selectedPatient && (
                                   <button className="new-patient-btn" onClick={openNewPatient}>
                                       + Create a new patient
                                   </button>
                               )}
   ```

5. Add the modal. Find the styled-jsx opening, unique in each file:
   ```
               <style jsx>{`
   ```
   Insert immediately **before** it:
   ```tsx
               {showNewPatient && (
                   <div className="modal-overlay" onClick={() => setShowNewPatient(false)}>
                       <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                           <h2>New Patient</h2>
                           {newPatientError && (
                               <div className="modal-error">
                                   {newPatientError}
                                   {duplicateMatch && (
                                       <button className="use-existing" onClick={() => selectPatient(duplicateMatch)}>
                                           Use {duplicateMatch.name} instead
                                       </button>
                                   )}
                               </div>
                           )}
                           <div className="modal-stack">
                               <div className="field">
                                   <label>Patient Name <span className="req">*</span></label>
                                   <input
                                       value={newPatient.name}
                                       onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                       autoFocus
                                   />
                               </div>
                               <div className="field">
                                   <label>Phone 1 <span className="req">*</span></label>
                                   <input
                                       value={newPatient.phone1}
                                       onChange={(e) => setNewPatient({ ...newPatient, phone1: e.target.value })}
                                       placeholder="e.g. 0791234567"
                                   />
                               </div>
                               <div className="field">
                                   <label>Phone 2</label>
                                   <input
                                       value={newPatient.phone2}
                                       onChange={(e) => setNewPatient({ ...newPatient, phone2: e.target.value })}
                                       placeholder="Optional"
                                   />
                               </div>
                           </div>
                           <div className="modal-actions">
                               <button className="btn-cancel" onClick={() => setShowNewPatient(false)}>Cancel</button>
                               <button className="btn-save" onClick={handleCreatePatient} disabled={creatingPatient}>
                                   {creatingPatient ? "Creating…" : "Create & Select"}
                               </button>
                           </div>
                       </div>
                   </div>
               )}
   ```

6. Add the CSS. Find the line, unique in each file:
   ```
                   .clear-btn:hover { color: #fff; }
   ```
   Insert immediately **after** it:
   ```css
                   .new-patient-btn {
                       margin-top: 0.5rem; align-self: flex-start;
                       background: none; border: 1px dashed rgba(76,175,147,0.35);
                       color: var(--primary, #4CAF93); border-radius: var(--radius-sm, 2px);
                       padding: 0.4rem 0.75rem; font-size: 0.8rem; cursor: pointer;
                       font-family: inherit; transition: all 0.15s;
                   }
                   .new-patient-btn:hover { background: rgba(76,175,147,0.08); border-color: var(--primary, #4CAF93); }
                   .modal-overlay {
                       position: fixed; inset: 0; background: rgba(0,0,0,0.6);
                       display: flex; align-items: center; justify-content: center;
                       z-index: 1000; backdrop-filter: blur(4px);
                   }
                   .modal-card {
                       background: var(--bg-dark-secondary, #243b44); border: 1px solid rgba(255,255,255,0.08);
                       border-radius: var(--radius-md, 4px); padding: 2rem; width: 100%; max-width: 440px;
                   }
                   .modal-card h2 { font-size: 1.2rem; margin-bottom: 1.25rem; font-weight: 600; }
                   .modal-error {
                       background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2);
                       color: #fca5a5; padding: 0.55rem 0.85rem; border-radius: var(--radius-sm, 2px);
                       font-size: 0.82rem; margin-bottom: 1rem;
                       display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem;
                   }
                   .use-existing {
                       background: rgba(76,175,147,0.12); border: none; color: var(--primary, #4CAF93);
                       padding: 0.3rem 0.65rem; border-radius: var(--radius-sm, 2px);
                       font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit;
                   }
                   .use-existing:hover { background: rgba(76,175,147,0.22); }
                   .modal-stack { display: flex; flex-direction: column; gap: 0.9rem; }
                   .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1.5rem; }
   ```

**Verification:**
- `npm run build` passes.
- `npx eslint src/app/admin/reservations/new/page.tsx src/app/secretary/reservations/new/page.tsx` reports no **new** errors. Do **not** run `npm run lint` — `master` already fails it with 76 problems and the result is meaningless (see the notes below).
- `git status --porcelain` lists exactly the two files in Scope and nothing else.
- **Named regression risk — the existing search path.** Step 3 rewrites the dropdown's click handler, which is the *only* way a patient could be selected before this task. If `selectPatient` is wrong, booking an existing patient breaks, and the build will not catch it. Confirm by hand, on both `/admin/reservations/new` and `/secretary/reservations/new`: type at least two characters of an existing patient's name, click the result, and confirm the green `✓ name — phone` row appears and **Create Reservation** succeeds.
- **Second regression risk — the reservation payload.** The POST body must still carry `patientId: selectedPatient.id`. A patient created through the modal must produce a working reservation, not a 500. Create one end-to-end and confirm it lands on the dashboard for the chosen date.
- Duplicate path: open the modal, enter a phone that already exists, submit. The red banner must appear with **Use <name> instead**, and clicking it must close the modal with that patient selected.

**Done when:**
- [x] A patient can be created from both reservation forms without navigating away, and is selected in place on success
- [x] The date, time, doctor and notes already entered survive the patient creation
- [x] The duplicate-phone path offers the existing patient and selecting it works
- [x] Selecting an existing patient through the search dropdown still works on both forms
- [x] Build passes; scoped lint clean; the diff is exactly the two files in Scope
- [x] Visual review: both routes, at 320px and at desktop width — the modal is reachable and readable at both

**Planner verification:** 2026-08-15 — done independently of the executor's report, not on the strength of it.

- **Diff read in full.** All six steps applied as specified. `diff` of the added lines between the two files: **byte-identical apart from the filename header**, which is what the task required.
- **Scope respected.** `git diff --name-only master…branch` returns exactly the two files. `api/patients/route.ts` untouched, the dead `showAdd` modal untouched.
- **Build** exit 0; both routes present in the route table.
- **Lint re-run against a `master` baseline**, which is the only way the number means anything here: 8 problems (6 errors, 2 warnings) on the branch, **8 problems on `master` for the same two files** — identical rules, all in the pre-existing `fetchDoctors`/`useEffect` code above the insertion points. Zero introduced.
- **Visual review performed** on `f80b589`'s content, served by `npx next start -p 3200` — a free port, not the stale build the notes warn about — with a live admin session. Confirmed on `/admin/reservations/new`: created *ZZ Review Patient / 0799000111* through the modal; the modal closed, the green `✓` row appeared, and **the session note, date, time and doctor entered beforehand were all still populated** — which is the entire point of the task. Submitting produced a real reservation visible on the dashboard, so the `patientId` payload path is intact, not merely a 200.
- **Both named regression risks discharged.** Re-entering the same phone under a different name produced the red banner and **Use ZZ Review Patient instead**, which selected it correctly. The rewritten search dropdown still selects an existing patient (`selectPatient(p)` verified through the DOM, not by eye).
- `/secretary/reservations/new` renders the button and modal identically — asserted programmatically, with `document.visibilityState === "visible"` and `document.hasFocus()` checked first, per the throttling trap below.
- **320px was genuinely measured, not assumed.** `resize_window` silently failed to shrink the window — `window.innerWidth` stayed 1920 — which is the same wall the executor hit and honestly reported. Measured instead through a same-origin 320px `<iframe>`: the modal spans 0→301 inside a 316px viewport, every input and both action buttons fit, and the card's bottom is inside the viewport.

**Discovered during review, outside Scope — not a defect in this task:** the page *does* overflow horizontally at 320px (`scrollWidth` 490 vs 316). Every overflowing element is in the **admin navbar** — `.nav-links`, `.nav-dropdown`, `.dropdown-panel` — and none are from this task. Filed in the notes below.

---

### TJ-008b — Allow a session's state to be reverted

- **Status:** DONE — commit `2e5b02d` on `feat/revert-session-status`, merged to `master` as `e5765b9`
- **Branch:** `feat/revert-session-status`
- **Why:** `CANCELLED`, `NO_SHOW` and `CHECKED_OUT` are terminal in the API's state machine, so any misclick is permanent — a session cancelled by accident can never be rescheduled, and the row stays wrong forever. The user asked for this directly, and chose the widest of the three options offered: **all three states become revertible, including checked-out.** Checkout is the likeliest misclick because it is the last step of the normal flow.

**Planning pass:** 2026-08-15 — read `src/app/api/reservations/[id]/route.ts` (all 169 lines), `src/app/components/ReservationSlot.tsx` (all 192 lines), `src/app/admin/page.tsx:109-116`, `src/app/secretary/page.tsx:175-190`.

Confirmed:
- `VALID_TRANSITIONS` at `route.ts:6-14` is the single authority. `CHECKED_OUT: []`, `CANCELLED: []`, `NO_SHOW: []`.
- `ReservationSlot.tsx` is **shared by both dashboards** — admin renders it at `admin/page.tsx:256`, secretary at `secretary/page.tsx:188`. One change covers both surfaces. Its action list is built from `status` and today offers nothing at all for the three terminal states except *Duplicate*.
- **`lastVisitDate` is the complication, and it is real.** `route.ts:131-137` writes `patient.lastVisitDate = new Date()` on every `CHECKED_OUT` transition. Reverting a checkout without touching it leaves the patient's record claiming a visit that was undone. The revert must **recompute** it from the remaining checked-out sessions rather than blindly clearing it — a patient may have earlier legitimate visits.
- **`handleStatusChange` swallows every error.** `admin/page.tsx:109-116` fires the PATCH and calls `fetchReservations()` unconditionally — it never reads `res.ok`. A rejected transition today produces a 400 that the user never sees; the slot simply re-renders unchanged. The secretary dashboard has the same shape. This is why the terminal states feel like nothing happens rather than like a refusal, and it must be fixed in the same task or the new transitions will fail just as silently.

**Open decision — resolved:** revert targets are `CANCELLED → SCHEDULED`, `NO_SHOW → SCHEDULED`, `CHECKED_OUT → WITH_DOCTOR`. Checked-out reverts one step rather than to scheduled, so the session lands back where the mistake was made.

**Scope — touch only these:**
- `src/app/api/reservations/[id]/route.ts`
- `src/app/components/ReservationSlot.tsx`
- `src/app/admin/page.tsx` — `handleStatusChange` only
- `src/app/secretary/page.tsx` — `handleStatusChange` only

**Do not touch:** the `DELETE` handler, the `PUT` handler, the duplicate flow, or the `checkedInAt` / `withDoctorAt` / `checkedOutAt` columns other than where a revert must clear them. **Do not edit `src/app/doctor/session/[id]/page.tsx`** — it is named here because it *is* in the blast radius and was read during the pass, and it turns out to need no change: its own guard at line 215 already restores the doctor's Checkout button once the status returns to `WITH_DOCTOR`. Leave it alone and confirm that behaviour instead. Do not add a role gate — the user explicitly chose the un-gated option over admin-only reverts.

**Pass completed:** 2026-08-15 — second sitting, after TJ-008a merged. Additionally read `src/app/admin/page.tsx:208-232` and `:485-491`, `src/app/secretary/page.tsx:159-183` and `:266`, and `src/app/doctor/session/[id]/page.tsx:185-220`.

Further confirmed:
- `const handleStatusChange = async (id: number, status: string) => {` occurs **exactly once** in each dashboard, and the two handler bodies are byte-identical. `fetchReservations();` on its own occurs **five times** per file and must **not** be used as an anchor.
- **`.error-msg` already exists in both dashboards** — `admin/page.tsx:487-491` (multi-line) and `secretary/page.tsx:266` (single-line). styled-jsx scopes per component, not per element, so the class is reusable anywhere in the same file. No new banner styling is needed beyond the dismiss button.
- The two files' render roots **differ** — admin opens `<div className="dashboard">` followed by a `{/* Controls */}` comment, secretary opens a bare `<div>`. The banner anchors are therefore per-file, and are given separately below.
- **`/doctor/session/[id]` is a consumer and it behaves correctly under the change.** Line 215 hides the action row when `status === "CHECKED_OUT"`; line 219 shows *Checkout* when `WITH_DOCTOR`. So an undone checkout correctly returns the doctor's own Checkout button. No edit needed there — but it is why the doctor session page is named under Do not touch rather than simply omitted.

Corrected during this sitting: the first draft let the existing `if (newStatus === "WITH_DOCTOR") timestamps.withDoctorAt = new Date();` line run on a revert, which would have **overwritten the real session start time with the moment of the undo**. The guard in step 2 exists for that reason — the session genuinely did start when it started, and reverting a checkout must not rewrite that.

**Anchors verified mechanically, not by eye.** Every one of the 11 anchor strings below was matched against its target file by script before this task was dispatched; all 11 occur **exactly once**. The check also caught something worth knowing: all four Scope files are **100% CRLF** on disk (`core.autocrlf=true`, no `.gitattributes`), so a byte-exact comparison against the LF text in this file fails on every multi-line anchor. The editing tooling normalises this — TJ-008a's files were equally CRLF and its multi-line anchors applied cleanly — so the anchors below are correct as written. Recorded because a future pass that verifies anchors by raw `indexOf` will see eleven false failures and conclude the task is broken.

**Instructions:**

**A. `src/app/api/reservations/[id]/route.ts`**

1. Open the three terminal states. Find, verbatim:
   ```ts
   const VALID_TRANSITIONS: Record<string, string[]> = {
       SCHEDULED: ["CHECKED_IN", "WAITING", "CANCELLED", "NO_SHOW"],
       WAITING: ["CHECKED_IN", "CANCELLED"],
       CHECKED_IN: ["WITH_DOCTOR", "WAITING", "CANCELLED"],
       WITH_DOCTOR: ["CHECKED_OUT"],
       CHECKED_OUT: [], // terminal state
       CANCELLED: [], // terminal state
       NO_SHOW: [], // terminal state
   };
   ```
   Replace with:
   ```ts
   const VALID_TRANSITIONS: Record<string, string[]> = {
       SCHEDULED: ["CHECKED_IN", "WAITING", "CANCELLED", "NO_SHOW"],
       WAITING: ["CHECKED_IN", "CANCELLED"],
       CHECKED_IN: ["WITH_DOCTOR", "WAITING", "CANCELLED"],
       WITH_DOCTOR: ["CHECKED_OUT"],
       CHECKED_OUT: ["WITH_DOCTOR"], // revert only — undo a premature checkout
       CANCELLED: ["SCHEDULED"], // revert only — undo a cancellation
       NO_SHOW: ["SCHEDULED"], // revert only — undo a no-show
   };
   ```
   Note what is deliberately **not** here: `CHECKED_OUT` does not lead to `SCHEDULED`, and `SCHEDULED` still does not lead to `CHECKED_OUT`. Each terminal state gets exactly one way back and nothing else.

2. Handle the timestamps and the recomputation. Find, verbatim:
   ```ts
       // Set timestamps for status changes
       const timestamps: Record<string, unknown> = {};
       if (newStatus === "CHECKED_IN") timestamps.checkedInAt = new Date();
       if (newStatus === "WITH_DOCTOR") timestamps.withDoctorAt = new Date();
       if (newStatus === "CHECKED_OUT") {
           timestamps.checkedOutAt = new Date();
           // Auto-update patient's lastVisitDate
           await prisma.patient.update({
               where: { id: reservation.patientId },
               data: { lastVisitDate: new Date() },
           });
       }
   ```
   Replace with:
   ```ts
       // Set timestamps for status changes
       const timestamps: Record<string, unknown> = {};
       if (newStatus === "CHECKED_IN") timestamps.checkedInAt = new Date();
       // Guarded: reverting a checkout also lands on WITH_DOCTOR, and the session
       // really did start when it started — do not rewrite it with the undo time.
       if (newStatus === "WITH_DOCTOR" && reservation.status !== "CHECKED_OUT") {
           timestamps.withDoctorAt = new Date();
       }
       if (newStatus === "CHECKED_OUT") {
           timestamps.checkedOutAt = new Date();
           // Auto-update patient's lastVisitDate
           await prisma.patient.update({
               where: { id: reservation.patientId },
               data: { lastVisitDate: new Date() },
           });
       }

       // Undoing a checkout: drop the checkout stamp, then recompute the patient's
       // lastVisitDate from the sessions still checked out. Clearing it outright
       // would erase an earlier, legitimate visit.
       if (reservation.status === "CHECKED_OUT" && newStatus === "WITH_DOCTOR") {
           timestamps.checkedOutAt = null;
           const priorVisit = await prisma.reservation.findFirst({
               where: {
                   patientId: reservation.patientId,
                   status: "CHECKED_OUT",
                   id: { not: reservation.id },
                   checkedOutAt: { not: null },
               },
               orderBy: { checkedOutAt: "desc" },
               select: { checkedOutAt: true },
           });
           await prisma.patient.update({
               where: { id: reservation.patientId },
               data: { lastVisitDate: priorVisit?.checkedOutAt ?? null },
           });
       }

       // Returning to SCHEDULED means the session has not happened yet, so any
       // stamps left over from a check-in before the cancellation are now stale.
       if (newStatus === "SCHEDULED") {
           timestamps.checkedInAt = null;
           timestamps.withDoctorAt = null;
           timestamps.checkedOutAt = null;
       }
   ```
   The `checkedOutAt: { not: null }` filter is deliberate — it keeps rows with a missing stamp out of the ordering rather than relying on how PostgreSQL sorts NULLs.

**B. `src/app/components/ReservationSlot.tsx`**

3. Add the revert actions. Find, verbatim:
   ```tsx
       if (status === "WITH_DOCTOR") {
           actions.push({ label: "Checkout", icon: "🚪", onClick: () => onStatusChange(id, "CHECKED_OUT") });
       }
       actions.push({ label: "Duplicate", icon: "📋", onClick: () => onDuplicate(id) });
   ```
   Replace with:
   ```tsx
       if (status === "WITH_DOCTOR") {
           actions.push({ label: "Checkout", icon: "🚪", onClick: () => onStatusChange(id, "CHECKED_OUT") });
       }
       if (status === "CANCELLED" || status === "NO_SHOW") {
           actions.push({ label: "Reschedule", icon: "↩️", onClick: () => onStatusChange(id, "SCHEDULED") });
       }
       if (status === "CHECKED_OUT") {
           actions.push({ label: "Undo Checkout", icon: "↩️", onClick: () => onStatusChange(id, "WITH_DOCTOR") });
       }
       actions.push({ label: "Duplicate", icon: "📋", onClick: () => onDuplicate(id) });
   ```
   Emoji icons are correct here — this component already uses ✅ ⏳ 🩺 🚪 📋 🚫 🗑️ and matching the file wins over the no-emoji rule, which governs the public marketing site.

**C. Both dashboards — `src/app/admin/page.tsx` and `src/app/secretary/page.tsx`**

4. Add the error state. Find the line, unique in each file:
   ```ts
       const [addError, setAddError] = useState("");
   ```
   Insert immediately **after** it:
   ```ts
       const [statusError, setStatusError] = useState("");
   ```

5. Make the handler read the response. Find, verbatim and identical in both files:
   ```ts
       const handleStatusChange = async (id: number, status: string) => {
           await fetch(`/api/reservations/${id}`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ status }),
           });
           fetchReservations();
       };
   ```
   Replace with:
   ```ts
       const handleStatusChange = async (id: number, status: string) => {
           setStatusError("");
           const res = await fetch(`/api/reservations/${id}`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ status }),
           });
           if (!res.ok) {
               const data = await res.json().catch(() => ({}));
               setStatusError(data.error || "Could not change the session status.");
               return;
           }
           fetchReservations();
       };
   ```

6. Render the banner. **The anchor differs per file.**

   In `src/app/admin/page.tsx`, find:
   ```tsx
       return (
           <div className="dashboard">
               {/* Controls */}
   ```
   Replace with:
   ```tsx
       return (
           <div className="dashboard">
               {statusError && (
                   <div className="error-msg status-error" role="alert">
                       <span>{statusError}</span>
                       <button className="dismiss-error" onClick={() => setStatusError("")}>Dismiss</button>
                   </div>
               )}
               {/* Controls */}
   ```

   In `src/app/secretary/page.tsx`, find:
   ```tsx
       return (
           <div>
               <div className="controls">
   ```
   Replace with:
   ```tsx
       return (
           <div>
               {statusError && (
                   <div className="error-msg status-error" role="alert">
                       <span>{statusError}</span>
                       <button className="dismiss-error" onClick={() => setStatusError("")}>Dismiss</button>
                   </div>
               )}
               <div className="controls">
   ```

7. Add the two CSS rules. **The anchor differs per file** because `.error-msg` is written multi-line in one and single-line in the other.

   In `src/app/admin/page.tsx`, find:
   ```css
                   .error-msg {
                       background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2);
                       color: #fca5a5; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm, 2px);
                       font-size: 0.82rem; margin-bottom: 0.75rem;
                   }
   ```
   Insert immediately **after** it the block given below.

   In `src/app/secretary/page.tsx`, find:
   ```css
                   .error-msg { background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2); color: #fca5a5; padding: 0.5rem; border-radius: var(--radius-sm, 2px); font-size: 0.82rem; margin-bottom: 0.75rem; }
   ```
   Insert immediately **after** it the same block:
   ```css
                   .status-error {
                       display: flex; align-items: center; justify-content: space-between;
                       gap: 0.75rem; margin-bottom: 1rem;
                   }
                   .dismiss-error {
                       background: none; border: none; color: #fca5a5; text-decoration: underline;
                       font-size: 0.78rem; cursor: pointer; font-family: inherit; flex-shrink: 0;
                   }
                   .dismiss-error:hover { color: #fff; }
   ```

**Verification:**
- `npm run build` passes.
- `npx eslint src/app/api/reservations/[id]/route.ts src/app/components/ReservationSlot.tsx src/app/admin/page.tsx src/app/secretary/page.tsx` introduces no **new** problems. `admin/page.tsx` and `secretary/page.tsx` already fail on `master`, so compare against a baseline — run the same command on `master` via `git stash` and diff the counts. A raw number proves nothing here. Do **not** run `npm run lint`.
- `git status --porcelain` lists exactly the four files in Scope.

- **Named regression risk — the machine must still refuse things.** Widening a state machine can quietly admit transitions that should stay illegal, and every positive test passes either way. Build the **negative** cases in explicitly. Against a logged-in session, `PATCH /api/reservations/<id>` must return **400** for each of:
  - `CHECKED_OUT → SCHEDULED` (a checkout reverts one step, never straight to scheduled)
  - `SCHEDULED → CHECKED_OUT` (still cannot skip check-in)
  - `CANCELLED → CHECKED_IN` (a cancellation reverts to scheduled and nothing else)

  Read the **body**, not just the status code — and remember `fetch` follows redirects, so a 200 can mean "bounced to the login page." Use `redirect: "manual"` or assert on the JSON.

- **Second regression risk — `lastVisitDate`, and it needs the two-visit case.** A patient with a single checked-out session cannot distinguish "recomputed correctly" from "cleared to null", so testing with one visit proves nothing. Set up a patient with **two** checked-out sessions, then:
  - Undo the **later** checkout → `lastVisitDate` must fall back to the **earlier** session's `checkedOutAt`, not to null and not stay where it was.
  - Undo the **earlier** checkout (with both checked out) → `lastVisitDate` must be **unchanged**, since the later visit is still the most recent.
  - Undo the only remaining checkout → `lastVisitDate` must be `null`.

- **Third check — the undo must not rewrite history.** After `CHECKED_OUT → WITH_DOCTOR`, the row's `withDoctorAt` must still hold the **original** session start time, and `checkedOutAt` must be `null`. This is the guard added in step A2; without it the undo silently backdates the session to the moment of the click.

- A rejected transition must now show a visible, dismissible message on **both** dashboards — confirm by driving a rejected transition through the UI, not by reading the code.

- Visual review: the slot menu offers *Reschedule* on a cancelled and on a no-show session, and *Undo Checkout* on a checked-out one, on both `/admin` and `/secretary`.

**Done when:**
- [x] All three reverts work from the slot menu on both dashboards
- [x] `lastVisitDate` is recomputed, not cleared, on a checkout revert
- [x] Illegal transitions are still rejected — proven with the negative cases above
- [x] A rejected transition shows the user an error instead of silently doing nothing

**Execution note — the executor was interrupted.** It cut the branch and applied all four files exactly as specified, then was stopped by the user before it ran verification or committed. Its edits were found uncommitted in the working tree. The diff was read line by line against the Instructions and matched them exactly, with nothing outside Scope, so the work was committed as `2e5b02d` and **the planner ran the entire verification itself** rather than re-dispatching. Recorded because the commit is authored by the executor's work but not by its own verified hand-off — the usual "executor reports, planner checks" split did not happen here. The stray `_tj008b_setup.ts` it had written in the repo root was a test fixture, outside Scope; deleted rather than committed.

**Planner verification:** 2026-08-15.

- **Build** exit 0. **Lint** scoped to the four files: 6 problems on the branch, **6 on `master` for the same files** — zero introduced.
- **Negative cases — all three refused**, and the body was read rather than the status code alone, with `redirect: "manual"` so a login bounce could not masquerade as a result (`type: "basic"` on every response):
  - `CHECKED_OUT → SCHEDULED` → **400** *"Cannot transition from CHECKED_OUT to SCHEDULED. Allowed: WITH_DOCTOR"*
  - `SCHEDULED → CHECKED_OUT` → **400** *"…Allowed: CHECKED_IN, WAITING, CANCELLED, NO_SHOW"*
  - `CANCELLED → CHECKED_IN` → **400** *"…Allowed: SCHEDULED"*
  - Both positive reverts returned **200** with `status: "SCHEDULED"`.
- **`lastVisitDate` — tested against a patient with two checked-out sessions**, which is the only setup where a correct recomputation is distinguishable from a blanket `null`. Sessions A and B checked out 4 seconds apart; `lastVisitDate` started at B's stamp.
  - Undo the **later** (B) → fell back to **A's** `checkedOutAt` exactly. Not null. ✓
  - Re-checkout B, undo the **earlier** (A) → `lastVisitDate` **unchanged**, still B's. ✓
  - Undo the final remaining checkout → **null**. ✓
- **The `withDoctorAt` guard holds.** B's session start read `13:17:31.610Z` before the undo and `13:17:31.610Z` after, with `checkedOutAt` cleared to null. Without the guard this field would have been silently rewritten to the moment of the click — the bug the first draft of this task carried.
- **UI, both dashboards**, asserted through the DOM rather than by eye, after confirming `document.visibilityState === "visible"` and `document.hasFocus()`: every terminal slot offers exactly one revert — *Undo Checkout* on checked-out, *Reschedule* on cancelled and on no-show.
- **The error banner was proven with a real race, not a contrived one.** A row was moved server-side behind the open menu's back, then the stale menu item was used. The server refused, and the banner rendered at the top of the dashboard with the live error text and a working **Dismiss** — 39px tall, visible, exactly where intended.

---

### TJ-009 — Employees / doctors — reported issues

- **Status:** BACKLOG — no planning pass. Splits into at least five tasks; do not execute against this ID.
- **Why:** Seven issues were reported against `/admin/employees/doctors`. All seven are real; one is half-built already. They are captured together because the user grouped them, but they touch the schema, the API and two UI surfaces, so they cannot ship as one task.

**Verified against `src/app/admin/employees/doctors/page.tsx`, `.../doctors/new/page.tsx`, `src/app/api/employees/doctors/route.ts`, `.../doctors/[id]/route.ts`, and the live database:**

1. **Upload identification documents (PDF / DOCX / image).** **Real — needs a schema change.** There is no model for employee documents; `User` has only `pictureUrl`. `POST /api/upload` already handles non-images correctly — it passes them through untouched, keeps the extension, and `patient-files` is already in `ALLOWED_FOLDERS` — so the storage half exists and only a table and a UI are missing. **Blocked on the user's go-ahead:** there is no `prisma/migrations/`, so a schema change is `prisma db push` straight into the production database with no down path.
2. **No duplicate colors between doctors.** **Real.** `User.color` is a plain `String?` with no unique constraint, and both the modal (`page.tsx:203-210`) and the create page (`new/page.tsx:108-115`) offer the full 12-swatch `COLORS` array with no exclusion. Live data has two doctors on distinct colors, so nothing is broken *yet*. **Needs a decision:** the `RESIGNED` doctor holds `#6ee7b7` — does a resigned doctor keep their colour reserved, or does it return to the pool? With 12 swatches and no reuse, the 13th doctor cannot be created at all, so the answer also has to say what happens when the palette runs out.
3. **Working hours as a selector, not free text.** **Real.** `User.workingHours` is `String?` and both forms are bare `<input>`s. The live rows read literally `"9-7"` in all three — unparseable, so no shift logic can ever be built on it. **Needs a decision:** a from/to time pair covers the reported complaint, but per-weekday hours is what a clinic rota actually needs, and the two have different storage shapes. Ask before building.
4. **Show-password toggle.** **Real.** `type="password"` with no reveal at `page.tsx:196` and `new/page.tsx:153`. Trivial, and the same fix serves TJ-010.
5. **Repeat-password field.** **Real.** No confirm input anywhere. Note the API already enforces an 8-character minimum (`[id]/route.ts:66`) but the forms never mention it, so a short password fails silently — `handleSave` at `page.tsx:89` never reads the response.
6. **Change a password from the admin dashboard, with the admin re-entering their own password.** **Half-built.** The edit modal already exposes *New Password (optional)* and `PUT` already hashes it. What is missing is only the re-authentication gate. Small task, worth doing on its own.
7. **Hard delete / archive tab / re-enrol.** **All three real.** `DELETE` sets `status: "RESIGNED"` (`[id]/route.ts:88-98`) — the button says *Delete* and does not delete, which is the worst of both. There is no archived view, so resigned doctors sit mixed into the main list. Re-enrolment needs **no API work at all** — `PUT` already accepts `status` (`[id]/route.ts:63`) — it is a UI-only fix. Hard delete is the hard one: `Reservation_doctorId_fkey` and `Note_doctorId_fkey` are both **RESTRICT**, so a doctor who has ever been booked cannot be deleted until the user decides whether those sessions are reassigned or destroyed.

---

### TJ-010 — Employees / secretaries — reported issues

- **Status:** BACKLOG — no planning pass. Do not execute against this ID.
- **Why:** Six issues, five of them the same as TJ-009's. Filed separately because the user did, but most should ship as one change across both surfaces rather than twice.

**Verified against `src/app/admin/employees/secretaries/page.tsx` and `src/app/api/employees/secretaries/[id]/route.ts`:**

1. **Hard delete.** **Real** — `DELETE` sets `RESIGNED`, same as doctors. **Easier than the doctor case:** a secretary has *no* inbound foreign keys at all — no reservations, no notes, no profile — so the delete is genuinely unblocked. This is the one hard delete in the batch that can ship without a product decision first.
2. **Working-hours selector.** **Real**, identical to TJ-009 §3.
3. **Show password + repeat password.** **Real**, identical to TJ-009 §4–5.
4. **Archive view for soft deletions.** **Real**, identical to TJ-009 §7.
5. **Re-enrol.** **Real**, and again **UI-only** — `PUT` already accepts `status`.
6. **Doctors say "Delete" while secretaries say "Resign".** **Real, and worse than a wording mismatch.** Both buttons call the same soft-delete, but the doctors' one is labelled *Delete* (`doctors/page.tsx:153`) and the secretaries' *Resign* (`secretaries/page.tsx:135`). Whichever verb wins, one of the two labels is currently lying about what it does. The user described the secretary label as "archive"; it actually reads *Resign*. Settle the vocabulary across both tabs in the same task.
7. **Identification documents.** **Real**, identical to TJ-009 §1 — same table, same blocker.

---

### TJ-011 — Patients — reported issues

- **Status:** BACKLOG — no planning pass. Do not execute against this ID.

**Verified against `src/app/admin/patients/page.tsx`, `.../patients/[id]/page.tsx`, `src/app/api/patients/[id]/route.ts` and the live database:**

1. **Upload documents.** **Real, and mostly built already.** The `PatientFile` model exists with every column needed, `GET /api/patients/[id]` already returns `files` ordered by date, the profile page already renders a **Files** tab with a working grid and icons — and `patient-files` is already allow-listed in `POST /api/upload`. The *only* missing piece is an endpoint that writes a `PatientFile` row after the upload, plus a button. There is no `POST /api/patients/[id]/files`. Smallest task in the batch relative to its value.
2. **"I added the first patient after the cleanup and it still said Patient #2, meaning the cleanup didn't clean up properly."** — **Misdiagnosed. The cleanup was fine.** Read from the live database: exactly one `Patient` row, `id = 2`, and `Patient_id_seq` at `last_value = 2, is_called = true`. PostgreSQL never rolls a sequence back on `DELETE` — that is by design, so concurrent inserts can't collide. The rows really were deleted. What the user is seeing is `src/app/admin/patients/[id]/page.tsx:172` printing the raw primary key as `Patient #{patient.id}` (and `secretary/patients/[id]/page.tsx:106` doing the same). **Needs a decision:** reset the sequence once and keep showing the PK — simple, but the gap reappears after the next deletion, and it is *guaranteed* to reappear once TJ-011 §3 ships a hard delete — or stop showing the PK as a patient number. Recommend the latter; the first is a treatment, not a fix.
3. **Hard delete.** **Real.** Only `PATCH { archived }` exists. `ClinicalIntake` and `PatientFile` cascade cleanly, but `Reservation_patientId_fkey` is **RESTRICT**, so any patient who has ever been booked cannot be deleted until the reservations are dealt with. Needs the same product decision as the doctor case.

**Also found, unreported:** `admin/patients/page.tsx:170-201` contains a fully built *Add Patient* modal that can never open — `showAdd` is initialised `false` and the header button navigates to `/admin/patients/new` instead. ~130 lines of dead code including its own upload handling. The identical pattern exists in both employee list pages (`openAdd` defined, never called). Worth deleting, and worth deleting *before* anyone copies from it by mistake.

---

### TJ-012 — Blog — hard delete a post

- **Status:** BACKLOG — no planning pass. Do not execute against this ID.
- **Why:** **Confirmed real, and the starkest case in the batch:** `src/app/api/blog/[id]/route.ts` exports `GET` and `PUT` and **no `DELETE` at all**. The admin list's *Archive* button (`admin/blog/page.tsx:57-64`) is a `PUT` that sets `status: "ARCHIVED"`, and *Restore* sets it back to `DRAFT`. Nothing has ever removed a post. The live database holds 7.

**The one thing a pass must settle:** `BlogPost_linkedId_fkey` is **SET NULL**, and the model carries a self-relation for EN↔AR translation pairs. Deleting one language therefore leaves its translation alive but silently unlinked — it would keep publishing with a dangling half. Decide whether deleting a post deletes its translation too, refuses while one is linked, or unlinks deliberately with a warning.

---

### TJ-013 — Doctor profiles (public site) — hard delete

- **Status:** BACKLOG — no planning pass. Do not execute against this ID.
- **Why:** **Confirmed real.** `DELETE /api/doctor-profiles/[id]` sets `archived: true` (`[id]/route.ts:56-74`); the archived view restores by `PUT`-ing `archived: false`. No path removes a row. The live database holds 8.

**Easier than it looks, with one loose end.** `PendingChange` cascades and `DoctorProfile.userId` is nullable — so nothing blocks the delete at the database level, unlike every other hard delete in this batch. The loose end is the **photo**: profile photos live in Supabase Storage at `uploads/doctor-profiles/`, nothing ever removes them, and the app holds only the anon key. Three photos are *already* orphaned there from the 2026-08-15 cleanup. A hard delete that ignores this turns a one-off leak into a routine one.

---

## Notes for the planner

Findings reported by the executor, or surfaced during a pass, that fall outside the scope of the task that turned them up. The planner triages these into tasks. **The executor does not write here** — it reports in conversation and the planner records.

- **A rejected status change leaves the dashboard showing a stale row, because the handler returns without refetching.** TJ-008b's `handleStatusChange` shows the error and returns early — correct as specified, and vastly better than the silence it replaced. But a 400 here almost always means *the UI's view is out of date* (that is exactly how the banner was proven), so the one case where refetching would help is the one case it now skips. The user reads an error about a state their screen is not showing, and has to reload. One line — `fetchReservations()` before the `return` — in two files. **Deliberately not fixed during the TJ-008b review**: the executor's code matched the spec exactly and had just been verified line by line, and quietly amending verified code is how a diff stops matching its task. File it as its own task. The spec was mine, so this is a planning miss, not an execution one. (Found during the TJ-008b visual review.)
- **The error text the banner shows is written for a developer, not a secretary.** It surfaces the API's raw message — *"Cannot transition from WITH_DOCTOR to WITH_DOCTOR. Allowed: CHECKED_OUT"*. Honest and traceable, which is why it ships, but nobody at a physiotherapy clinic reads `WITH_DOCTOR` as "with the doctor". Worth a friendlier mapping when the status vocabulary is next touched — and note the same enum strings already leak into the patient profile's session table via `r.status.replace("_", " ")`, which only fixes the first underscore. (Found during the TJ-008b visual review.)
- **The whole working tree is CRLF, and it makes anchor verification lie.** `core.autocrlf=true` with no `.gitattributes`, so every source file on disk uses `\r\n` while `tasks.md`'s fenced anchors are written with `\n`. A planner script that checks anchors with a raw `indexOf` therefore reports **zero matches for every multi-line anchor** while single-line ones pass — a signature worth recognising instantly, because it looks exactly like a task whose anchors are all wrong. The editing tooling normalises line endings, so the anchors are fine; the *check* was wrong. Strip `\r` before comparing. Verifying anchors mechanically is still the right move — it is how TJ-008b was cleared for dispatch — just normalise first. (Found during the TJ-008b pass.)
- **The admin/secretary navbar overflows horizontally below ~490px.** Measured during the TJ-008a visual review at a 320px viewport: `document.documentElement.scrollWidth` is **490** against a 316px viewport, and every offending element belongs to the nav chrome — `.nav-links` (330px wide, right edge at 416), `.nav-dropdown`, `.dropdown-panel`, `.dropdown-item`. It predates TJ-008a and is unrelated to it, but it means **every admin page currently side-scrolls on a phone**, and the clinic's secretary is the most likely person to open this on one. The Responsive Rules in `Claude_Instructions.md` require 320px to work, so this is a standing violation rather than a nicety. Worth its own task. (Found during the TJ-008a visual review.)
- **`resize_window` reports success without resizing, and a 320px check done through it is worthless.** Both the executor and I hit this on TJ-008a: the call returns "Successfully resized… to 320x700" and `window.innerWidth` stays at 1920. The executor noticed and honestly reported the check as *not performed* rather than claiming a pass — which is the behaviour to want. The workaround that does work: inject a same-origin `<iframe>` at the target width, let it load, and measure inside `contentDocument`. Real layout, real media queries, no dependency on the window manager. Reusable for every future responsive review. (Found during the TJ-008a visual review.)
- **Test data added during the TJ-008a review, left in place deliberately.** Patient *ZZ Review Patient* (`0799000111`) plus one reservation, and the executor's *TJ008A TestPatient* (`0700000001`) plus one reservation. The user confirmed on 2026-08-15 that the entire live database is test data and disposable, so this harms nothing — but it is worth writing down that **the app still cannot delete any of it** (TJ-011 §3), so it will need the same out-of-band cleanup as last time. Do not run that cleanup without asking: the previous one was explicitly scoped and confirmed with the user first.
- `src/app/login/page.tsx:69` carries the comment `{/* Background video — same as landing hero */}`. Stale: the landing hero has been a static WebP since the redesign. A one-line comment fix, too small to file alone — fold it into the next task that touches `login/page.tsx`. (Found during the TJ-002 pass.)
- The Project Profile still carries the bare note `- Logo: logo.jpg`. TJ-001's instructions said to preserve it, correctly — but once TJ-002 deletes the root `logo.jpg`, that line reads ambiguously, since the surviving file is `public/logo.jpg`. Not worth reopening TJ-001; fold `public/logo.jpg` into the next task that edits the profile. (Found during TJ-001 planner verification.)
- ~~**Branches are unmerged.**~~ Resolved 2026-08-14: both merged to `master` with `--no-ff` after visual review. Merge policy is now recorded in the protocol.
- ~~**Hero entrance animation is slow to settle — needs checking against a production build.**~~ **Closed 2026-08-14, not a defect.** Checked against `npm run build && npm start` during the TJ-004 visual review. The cause is neither Turbopack nor the animation: when the browser tab is backgrounded, `requestAnimationFrame` is throttled to **zero frames**, GSAP's ticker never advances, and every element in a `gsap.from()` / `fromTo()` sits frozen at its start state — which for these tweens is `opacity: 0`. It looks exactly like the dead-`opacity:0` bug and is completely benign. Measured: 119 rAF frames in 2s with the tab visible, hero at `opacity: 1`; 0 frames and `opacity: 0` indefinitely with it backgrounded.

  **This is a trap for every future visual review**, so it is worth stating as a rule: a headless or backgrounded tab cannot distinguish a broken entrance animation from a throttled one. Before concluding any GSAP-animated element is dead, confirm `document.visibilityState === "visible"`, `document.hasFocus()`, and that rAF is actually ticking. Only then does `opacity: 0` mean anything.
- **`npm run lint` cannot pass and must not be used as a verification step.** `master` fails it with **76 problems (43 errors, 33 warnings)** — `react-hooks/set-state-in-effect` and `react/no-deprecated` across `src/app/admin/*`, plus unused-disable warnings in generated `src/generated/prisma/*` files and the `design_handoff_landing_and_blog_cms/support.js` bundle. None of it is task-generated; it predates the queue. Until it is fixed, a task that lists `npm run lint` as verification can only produce a false failure, and an executor that trusts the step will either stop for nothing or learn to ignore failing checks — both bad. Scope lint per-file instead: `npx eslint <the files the task touched>`. Filing the cleanup as its own task is worth considering, but note the generated Prisma files probably want an eslint ignore rather than edits. (Found during the TJ-004 verification; the step was mine and it was wrong.)
- ~~**`master` is 23 commits ahead of `origin/master`; the user has chosen to hold.**~~ **Resolved 2026-08-14 — pushed.** The user lifted the hold and `master` went to `origin/master` as `e73914e..2583aa9` (24 commits); local and remote are now level. Pre-push scan, recorded because it is the check worth repeating every time: `.env` is not tracked and appears nowhere in the pushed history, the diff carries no `AIza…` pattern, and the real key value was **content-matched against the entire push and is absent** (matched, never echoed). Repo is **private**, org `AverroezTech`.

  **The outstanding item survives the push and is now live-facing:** `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACES_PLACE_ID` exist only in gitignored `.env`, so the push did **not** carry them. Any host deploying from this remote will render the Reviews section in its `available: false` state — header plus the Google CTA, no rating and no quotes — until both are set in that host's environment. It degrades rather than breaking, and it never fabricates content, which is exactly what TJ-004's failure path was designed for. Also note `tasks.md` is now on the remote and contains the developer's personal Google account address in the ownership note below; fine for a private repo, worth knowing before the repo is ever made public or handed to the clinic.

  The three task branches (`docs/sync-project-profile`, `chore/prune-root-assets`, `feat/google-reviews-api`, plus `content/real-maps-embed` and `chore/remove-icon-duplicates`) were deliberately **not** pushed — their commits are already contained in the `--no-ff` merges, so nothing is lost by leaving them local. **This changed materially when TJ-004 merged** — the original reasoning was that nothing unpushed altered application behaviour. That is no longer true: `643c558` replaces the Reviews section's content with a live API call. Pushing now would deploy real reviews *and* require `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACES_PLACE_ID` to exist in the host's environment. They are in local `.env`, which is gitignored and therefore **not** carried by a push — without them the section degrades to the CTA-only state rather than breaking, but it will not show reviews. Set both in the host's environment variables before or alongside the first push. **Do not push without asking again.** The two task branches (`docs/sync-project-profile`, `chore/prune-root-assets`) stay local; their commits are already contained in the `--no-ff` merges, so nothing is lost by never pushing them.
- **`fetch` follows redirects, so a 200 can mean "bounced to the login page."** During the TJ-007 visual review a probe reported `/api/patients -> 200` for an account that had just been revoked, and it looked exactly like a security failure. It was the login page's HTML arriving under a 200 because `fetch` had transparently followed the middleware's 3xx. **Never assert on `res.status` alone for an auth check** — read the body, or use `redirect: "manual"` and look for `type: "opaqueredirect"`. Both directions of this error are dangerous: here it faked a failure, but the same artifact would make a genuinely broken gate look like it was serving data fine. (Found during the TJ-007 visual review.)
- **Two origins give you two sessions on one server: `localhost` and `127.0.0.1` are separate cookie jars, and cookies ignore the port.** This is how TJ-007 was reviewed — admin session on `localhost:3100`, the test employee on `127.0.0.1:3100`, both against the same process, so a revocation could be watched rather than reported. Set `AUTH_URL` to whichever origin needs to complete a login. Reusable for anything needing two concurrent roles. (Found during the TJ-007 visual review.)
- **Next 16 deprecates the `middleware` file convention in favour of `proxy`.** Every build prints `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` It predates the queue and nothing is broken — the build still emits `ƒ Proxy (Middleware)` — but it is a rename that will eventually be forced, and it touches the one file whose Edge/Node boundary matters most here. Worth filing before it becomes urgent, and worth pairing with the Node-runtime-middleware question below. (Found during the TJ-007 verification.)
- ~~**A throwaway `zz-revoke-test` secretary account exists in the production database.**~~ **Resolved 2026-08-15 — the database was cleaned to a pre-launch state**, on the user's instruction and with the scope confirmed. Deleted: **2 users** (`zz-revoke-test`, and a `test`/username `123` DOCTOR account that no earlier note had spotted), **3 doctor profiles**, **1 blog post**, **1 patient**. Remaining: exactly **one** user — `noorhamami`, ADMIN, ACTIVE — and zero rows in DoctorProfile, BlogPost, Patient, Reservation, Note, and PendingChange.

  **Two things worth carrying forward.** First, **this app has no hard delete anywhere** — Blog has no `DELETE` route at all, `DELETE` on a doctor profile sets `archived: true`, and `DELETE` on an employee sets `status: RESIGNED`. So every "deleted" thing accumulates as a row, and clearing it genuinely requires going around the app. Worth knowing before the clinic starts generating real data, because the same is true of patients. Second, the inventory found **more cruft than the notes had recorded** (the `123` doctor user and the test patient), which is the argument for inventorying before deleting rather than deleting from a list written earlier.

  The deletion ran behind a pre-flight gate that re-read every target and would have aborted on any mismatch — role not ADMIN, status `RESIGNED`, zero reservations/notes, profile named `test` and hidden, post `ARCHIVED` and unlinked, patient with no files/reservations/intake. Same spirit as TJ-006's md5 gate: prove the thing is what you think it is *at the moment you delete it*, not when you wrote the list.

  **Still outstanding:** three orphaned doctor-profile photos remain in Supabase Storage at `uploads/doctor-profiles/` (`1786660147390-i6plxtpvr5.webp`, `1786660198903-44015a1rher.webp`, `1786660217456-if1l8fdlm5d.webp`). Nothing references them now. They need removing from the Supabase dashboard — note that `src/lib/supabase.ts` only ever holds the **anon** key, so the app itself could not delete them even if it tried, and no code path ever removes an uploaded file. **Uploads are therefore permanently orphaned whenever a profile or patient photo is replaced** — a slow storage leak that is worth its own task before launch.
- **All task branches were deleted locally on 2026-08-15** after confirming each tip is contained in `master`. Their commits survive inside the `--no-ff` merge commits, so nothing was lost. `master` is the only branch now.
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
