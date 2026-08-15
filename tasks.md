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
| TJ-009 | Employees / doctors — reported issues | SPLIT — see TJ-009a … TJ-009g | — |
| TJ-009a | Reveal and confirm passwords on the employee forms | DONE — merged `234d800` | `feat/employee-password-fields` |
| TJ-009b | Re-authenticate the admin before changing an employee's password | DONE — merged `ffd55a7` | `feat/admin-reauth-password-change` |
| TJ-009c | Archive view and re-enrolment for resigned employees | DONE — merged `2724893` | `feat/employee-archive-view` |
| TJ-009d | One calendar colour per doctor | DONE — merged `4e6587e` | `feat/unique-doctor-colours` |
| TJ-009e | Working hours as a selector | DONE — merged `423935d` | `feat/working-hours-selector` |
| TJ-009h | New-doctor form defaults to a colour it will not accept | READY | `bugfix/default-doctor-colour` |
| TJ-009f | Upload identification documents | SCHEMA DONE — merged `ade1a06`; endpoints + UI still to build | `feat/employee-documents` |
| TJ-009g | Hard delete a doctor | DONE — merged `fe05f69`; both paths proven | `feat/hard-delete-doctor` |
| TJ-010 | Employees / secretaries — reported issues | BACKLOG — needs a pass, splits further; its §3 is closed by TJ-009a | — |
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

- **Status:** SPLIT — planning pass run 2026-08-15. Seven tasks, TJ-009a … TJ-009g. Do not execute against this ID.
- **Why:** Seven issues were reported against `/admin/employees/doctors`. All seven are real; one is half-built already. They are captured together because the user grouped them, but they touch the schema, the API and two UI surfaces, so they cannot ship as one task.

**Verified against `src/app/admin/employees/doctors/page.tsx`, `.../doctors/new/page.tsx`, `src/app/api/employees/doctors/route.ts`, `.../doctors/[id]/route.ts`, and the live database:**

1. **Upload identification documents (PDF / DOCX / image).** **Real — needs a schema change.** There is no model for employee documents; `User` has only `pictureUrl`. `POST /api/upload` already handles non-images correctly — it passes them through untouched, keeps the extension, and `patient-files` is already in `ALLOWED_FOLDERS` — so the storage half exists and only a table and a UI are missing. **Blocked on the user's go-ahead:** there is no `prisma/migrations/`, so a schema change is `prisma db push` straight into the production database with no down path.
2. **No duplicate colors between doctors.** **Real.** `User.color` is a plain `String?` with no unique constraint, and both the modal (`page.tsx:203-210`) and the create page (`new/page.tsx:108-115`) offer the full 12-swatch `COLORS` array with no exclusion. Live data has two doctors on distinct colors, so nothing is broken *yet*. **Needs a decision:** the `RESIGNED` doctor holds `#6ee7b7` — does a resigned doctor keep their colour reserved, or does it return to the pool? With 12 swatches and no reuse, the 13th doctor cannot be created at all, so the answer also has to say what happens when the palette runs out.
3. **Working hours as a selector, not free text.** **Real.** `User.workingHours` is `String?` and both forms are bare `<input>`s. The live rows read literally `"9-7"` in all three — unparseable, so no shift logic can ever be built on it. **Needs a decision:** a from/to time pair covers the reported complaint, but per-weekday hours is what a clinic rota actually needs, and the two have different storage shapes. Ask before building.
4. **Show-password toggle.** **Real.** `type="password"` with no reveal at `page.tsx:196` and `new/page.tsx:153`. Trivial, and the same fix serves TJ-010.
5. **Repeat-password field.** **Real.** No confirm input anywhere. Note the API already enforces an 8-character minimum (`[id]/route.ts:66`) but the forms never mention it, so a short password fails silently — `handleSave` at `page.tsx:89` never reads the response.
6. **Change a password from the admin dashboard, with the admin re-entering their own password.** **Half-built.** The edit modal already exposes *New Password (optional)* and `PUT` already hashes it. What is missing is only the re-authentication gate. Small task, worth doing on its own.
7. **Hard delete / archive tab / re-enrol.** **All three real.** `DELETE` sets `status: "RESIGNED"` (`[id]/route.ts:88-98`) — the button says *Delete* and does not delete, which is the worst of both. There is no archived view, so resigned doctors sit mixed into the main list. Re-enrolment needs **no API work at all** — `PUT` already accepts `status` (`[id]/route.ts:63`) — it is a UI-only fix. Hard delete is the hard one: `Reservation_doctorId_fkey` and `Note_doctorId_fkey` are both **RESTRICT**, so a doctor who has ever been booked cannot be deleted until the user decides whether those sessions are reassigned or destroyed.

**Planning pass:** 2026-08-15 — read in full: `src/app/admin/employees/doctors/page.tsx`, `.../doctors/new/page.tsx`, `.../secretaries/page.tsx`, `.../secretaries/new/page.tsx`, `src/app/api/employees/doctors/route.ts`, `.../doctors/[id]/route.ts`, `.../secretaries/[id]/route.ts`, `.../secretaries/route.ts` (POST half), `src/lib/auth.ts`, `package.json`, and `src/app/admin/page.tsx:496-515` for the shipped error-banner styles. Every claim in the seven findings above re-confirmed against the code as it stands today; nothing was corrected. Four things the original capture did not record, all of which change how the splits are written:

- **The four employee forms are two matched pairs, not four independent surfaces.** `doctors/page.tsx` and `secretaries/page.tsx` are the same modal with a colour picker added to one; `doctors/new/page.tsx` and `secretaries/new/page.tsx` are the same page with the same avatar block. The password defects (§4, §5) are identical in all four, and the earlier note under TJ-010 arguing for one change across both surfaces is right — TJ-009a therefore covers all four files and closes TJ-010 §3 as well.
- **The silent failure in §5 is worse than "the forms never mention the minimum."** Both *modals* (`doctors/page.tsx:89`, `secretaries/page.tsx:79`) `await fetch(...)` and never look at the result — they close and refetch regardless, so a rejected save looks exactly like a successful one. Both *create pages* already read the response and render an `.error-banner` (`doctors/new/page.tsx:63-68`). So the fix is not symmetric: the create pages need the fields, the modals need the fields *and* the error path.
- **All four endpoints enforce the same rule with the same wording** — `password.length < 8` → `"Password must be at least 8 characters"` (`doctors/route.ts:50-55`, `doctors/[id]/route.ts:66-71`, `secretaries/route.ts:49-54`, `secretaries/[id]/route.ts:63-68`). The client-side check can mirror the server's string verbatim rather than inventing copy, so the two can never disagree.
- **`lucide-react@0.564.0` is a dependency but is imported nowhere in `src/`.** The admin UI draws every icon as inline SVG (e.g. the avatar placeholder at `doctors/new/page.tsx:89-92`). TJ-009a follows the existing convention and inlines the eye icons; it does not introduce the codebase's first Lucide import for a two-icon toggle.

**The admin area is English-only.** `src/app/i18n/translations.ts` serves the public site; every string under `src/app/admin/` is hardcoded EN. No `ar` copy is required for any TJ-009 split — recorded here so no future pass goes looking for it.

**Dispatch order and why it is serial, recorded 2026-08-15.** Five of the six remaining splits touch `admin/employees/doctors/page.tsx`, and four of them touch `secretaries/page.tsx` as well. **They cannot be dispatched in parallel** — they would rewrite each other's anchors and produce diffs that no longer match their tasks. The order is `TJ-009b → 009c → 009d → 009e → 009g`, each branch cut from the previous one because nothing can merge to `master` until the user calls for the visual review they have deferred. Consequence worth stating plainly: **only the task at the head of the chain can carry hard-pinned anchors.** The rest are `PLANNED` — design settled, decisions taken, scope and verification fixed — and their anchor strings are pinned against the real tree immediately before each is dispatched. A `PLANNED` task is not `READY` and must not be pulled by an executor.

**Four product decisions were taken as stated assumptions rather than stalling the queue**, at the user's instruction to plan all of them. Each is flagged in its own task with the reasoning and is cheap to reverse — they are copy, a filter default, a validation rule and a storage format. The one decision **not** taken is TJ-009f's, because it is a schema push against a production database with no down path; that stays blocked and undispatched.

**Splits and why each one falls where it does:** §4 and §5 are one concern (password entry) and need no decision → **TJ-009a, READY**. §6 needs no decision either but rewrites the same lines of the same two modals → **TJ-009b**, held until TJ-009a merges rather than dispatched into a guaranteed conflict. §7 splits in two: archive-view-plus-re-enrol is UI-only but cannot be specified until the button vocabulary is settled → **TJ-009c, BLOCKED**; hard delete is **TJ-009g, BLOCKED**. §2, §3 and §1 keep the blockers already named on them → **TJ-009d, TJ-009e, TJ-009f**.

---

### TJ-009a — Reveal and confirm passwords on the employee forms

- **Status:** DONE — task commit `3d0682f` on `feat/employee-password-fields`, merged to `master` as `234d800` with `--no-ff`. Verified, visually reviewed on all four surfaces against the live app, merged. Not pushed.
- **Branch:** `feat/employee-password-fields`
- **Why:** Closes TJ-009 §4 and §5, and TJ-010 §3 with them. Every password box in the admin area is a bare `type="password"` with no reveal and no confirm field, so an admin typing a new credential for a doctor or secretary cannot see what they typed and gets no second chance to catch a typo — and then has to read it out to the employee. Worse, the two edit modals never read the API's response: `handleSave` awaits the `fetch`, then closes the modal and refetches whatever the outcome was. A password under eight characters is rejected by all four endpoints with a 400, and the admin sees a modal close cleanly and a row that looks saved. This lands the reveal toggle, the repeat field, the minimum stated up front, and — in the modals — the error the server was already sending.

**Planning pass:** 2026-08-15 — see the TJ-009 pass block above; the four form files and all four endpoints were read in full for it. **All 28 anchor strings quoted below were verified mechanically against the working tree on 2026-08-15** — each matches exactly once per file, with `\r` stripped before comparing (see the CRLF note at the bottom of this file; skip that normalisation and every multi-line anchor here reports zero matches). Confirmed for this task specifically: no show-password toggle exists anywhere in `src/` (`src/app/login/page.tsx:112` is a bare `type="password"` too, and is deliberately **out of scope** — the reported issue is the admin forms). Confirmed `globals.css:65-69` sets `box-sizing: border-box` on `*`, so `width: 100%` on an input with inline padding is safe. Confirmed the styled-jsx blocks are component-scoped, so each of the four files needs its own copy of the new rules — `.error-msg` is copied verbatim from the shipped `src/app/admin/page.tsx:500-504` rather than invented. One trap found and written into the steps: **`openAdd` in both modal files is unreachable dead code** (the header button routes to `/new` instead) but it still type-checks against the form interface, so leaving it alone breaks `tsc`. It must be updated, not deleted — deleting it belongs to the dead-code task already noted under TJ-011.

**Scope — touch only these:**
- `src/app/admin/employees/doctors/page.tsx`
- `src/app/admin/employees/doctors/new/page.tsx`
- `src/app/admin/employees/secretaries/page.tsx`
- `src/app/admin/employees/secretaries/new/page.tsx`

**Do not touch:** any file under `src/app/api/` — the server-side rule is already correct and this task deliberately mirrors it rather than moving it. Not `src/app/login/page.tsx`. Not `src/app/globals.css` — all new CSS goes in each file's own `<style jsx>` block. Do not delete the dead `openAdd` handlers, do not touch the colour picker, and do not change the `disabled={...}` expressions on the Save buttons — validation lands in `handleSave` where it can explain itself.

**Shared literals — use these exact values in all four files.**

Eye icon (shown when the password is hidden — click to reveal):
```jsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
</svg>
```

Eye-off icon (shown when the password is visible — click to hide):
```jsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.15M6.6 6.6A17.7 17.7 0 0 0 2 11s3.6 7 10 7a9 9 0 0 0 4.4-1.1" />
    <path d="m2 2 20 20" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
</svg>
```

Error strings, verbatim:
- `"Password must be at least 8 characters"` — matches the four endpoints word for word. Do not reword it.
- `"Passwords do not match"`
- Modal fallback when the API returns an error with no `error` field: `"Failed to save doctor"` / `"Failed to save secretary"`.

Hint text under the password field: `At least 8 characters.`

**One `showPassword` state per file drives both the password and the repeat input**, so they reveal together. The toggle button renders inside the password field only; the repeat field has no button of its own.

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

1. In `interface DoctorForm`, add `confirmPassword: string;` on its own line directly after `    password: string;`.
2. Replace:
   ```
       const [form, setForm] = useState<DoctorForm>({
           name: "", email: "", phone: "", workingHours: "",
           username: "", password: "", color: COLORS[0],
       });
   ```
   with:
   ```
       const [form, setForm] = useState<DoctorForm>({
           name: "", email: "", phone: "", workingHours: "",
           username: "", password: "", confirmPassword: "", color: COLORS[0],
       });
       const [showPassword, setShowPassword] = useState(false);
       const [formError, setFormError] = useState("");
   ```
3. In `openAdd`, replace the line
   `        setForm({ name: "", email: "", phone: "", workingHours: "", username: "", password: "", color: COLORS[0] });`
   with:
   ```
           setForm({ name: "", email: "", phone: "", workingHours: "", username: "", password: "", confirmPassword: "", color: COLORS[0] });
           setShowPassword(false);
           setFormError("");
   ```
   (`openAdd` is never called today. It is updated anyway because the object literal is typed as `DoctorForm` and the build fails otherwise. Do not delete it.)
4. In `openEdit`, replace:
   ```
           setForm({
               name: doc.name, email: doc.email || "", phone: doc.phone || "",
               workingHours: doc.workingHours || "", username: doc.username,
               password: "", color: doc.color || COLORS[0],
           });
   ```
   with:
   ```
           setForm({
               name: doc.name, email: doc.email || "", phone: doc.phone || "",
               workingHours: doc.workingHours || "", username: doc.username,
               password: "", confirmPassword: "", color: doc.color || COLORS[0],
           });
           setShowPassword(false);
           setFormError("");
   ```
5. Replace the whole `handleSave` function — from `    const handleSave = async () => {` through its closing `    };` — with:
   ```
       const handleSave = async () => {
           setFormError("");

           if (!editingDoctor || form.password) {
               if (form.password.length < 8) {
                   setFormError("Password must be at least 8 characters");
                   return;
               }
               if (form.password !== form.confirmPassword) {
                   setFormError("Passwords do not match");
                   return;
               }
           }

           setSaving(true);
           const url = editingDoctor
               ? `/api/employees/doctors/${editingDoctor.id}`
               : "/api/employees/doctors";
           const method = editingDoctor ? "PUT" : "POST";

           const body: Record<string, string> = {
               name: form.name, email: form.email, phone: form.phone,
               workingHours: form.workingHours, color: form.color,
           };
           if (!editingDoctor) {
               body.username = form.username;
               body.password = form.password;
           } else if (form.password) {
               body.password = form.password;
           }

           const res = await fetch(url, {
               method,
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(body),
           });

           setSaving(false);

           if (!res.ok) {
               const data = await res.json().catch(() => ({}));
               setFormError(data.error || "Failed to save doctor");
               return;
           }

           setShowModal(false);
           fetchDoctors();
       };
   ```
   The behaviour change to be deliberate about: **on failure the modal now stays open** with the typed values intact. That is the point of the task.
6. Directly after the line `                        <h2>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</h2>`, add:
   ```
                           {formError && <div className="error-msg" role="alert">{formError}</div>}
   ```
7. Replace this block:
   ```
                               <div className="form-group">
                                   <label>{editingDoctor ? "New Password (optional)" : "Password *"}</label>
                                   <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                               </div>
   ```
   with:
   ```
                               <div className="form-group">
                                   <label>{editingDoctor ? "New Password (optional)" : "Password *"}</label>
                                   <div className="password-wrap">
                                       <input
                                           type={showPassword ? "text" : "password"}
                                           value={form.password}
                                           onChange={(e) => setForm({ ...form, password: e.target.value })}
                                       />
                                       <button
                                           type="button"
                                           className="toggle-password"
                                           aria-label={showPassword ? "Hide password" : "Show password"}
                                           onClick={() => setShowPassword(!showPassword)}
                                       >
                                           {showPassword ? EYE_OFF_SVG : EYE_SVG}
                                       </button>
                                   </div>
                                   <span className="field-hint">At least 8 characters.</span>
                               </div>
                               <div className="form-group">
                                   <label>{editingDoctor ? "Repeat New Password" : "Repeat Password *"}</label>
                                   <input
                                       type={showPassword ? "text" : "password"}
                                       value={form.confirmPassword}
                                       onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                   />
                               </div>
   ```
   substituting the two SVG literals from **Shared literals** above for `EYE_OFF_SVG` and `EYE_SVG`. Those two placeholder names must not survive into the committed file.
8. In the `<style jsx>` block, directly after the line
   `        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }`
   add:
   ```
           .error-msg {
             background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2);
             color: #fca5a5; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm, 2px);
             font-size: 0.82rem; margin-bottom: 0.75rem;
           }
           .password-wrap { position: relative; }
           .password-wrap input { width: 100%; padding-inline-end: 2.4rem; }
           .toggle-password {
             position: absolute; inset-inline-end: 0.5rem; top: 50%; transform: translateY(-50%);
             background: none; border: none; padding: 0.15rem; line-height: 0;
             color: rgba(255,255,255,0.45); cursor: pointer;
           }
           .toggle-password:hover { color: #fff; }
           .field-hint { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
   ```

**Instructions — `src/app/admin/employees/secretaries/page.tsx`:**

9. Apply steps 1–8 again, with these substitutions and no others:
   - `DoctorForm` → `SecretaryForm`; `editingDoctor` → `editing`; `fetchDoctors` → `fetchSecretaries`.
   - The form object has **no `color` key** here. In step 2 the literal becomes `username: "", password: "", confirmPassword: "",` and the `color: COLORS[0]` fragment does not appear; likewise in `openAdd` (step 3) and `openEdit` (step 4, where the source object ends `username: sec.username, password: "",` and gains `confirmPassword: "",`). `doc` is `sec` throughout.
   - Step 5's `body` object omits `color: form.color` — keep the existing body exactly as it is in this file and change only the `fetch`/error handling around it. The fallback string is `"Failed to save secretary"`.
   - Step 6's anchor is `                        <h2>{editing ? "Edit Secretary" : "Add Secretary"}</h2>`.
   - Step 7's labels use `editing` in place of `editingDoctor`.
   - Step 8's anchor is byte-identical in this file — `        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }`, the last rule before the closing `` `}</style> ``. Verified 2026-08-15; add the same block after it, unchanged.

**Instructions — `src/app/admin/employees/doctors/new/page.tsx`:**

10. In the `useState` initialiser, replace
    `        username: "", password: "",`
    with
    `        username: "", password: "", confirmPassword: "",`
    and add, directly after the `const [error, setError] = useState("");` line:
    ```
        const [showPassword, setShowPassword] = useState(false);
    ```
11. In `handleSubmit`, replace the line
    `        if (!form.password.trim()) { setError("Password is required"); return; }`
    with:
    ```
            if (!form.password.trim()) { setError("Password is required"); return; }
            if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
            if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    ```
12. `handleSubmit` posts `{ ...form, pictureUrl }`, which would now send `confirmPassword` to the API. The endpoint destructures named fields and ignores the rest, so nothing breaks — but do not send it. Replace
    `            body: JSON.stringify({ ...form, pictureUrl }),`
    with:
    ```
                body: JSON.stringify({
                    name: form.name, email: form.email, phone: form.phone,
                    workingHours: form.workingHours, username: form.username,
                    password: form.password, color: form.color, pictureUrl,
                }),
    ```
13. Replace this block:
    ```
                            <div className="field">
                                <label htmlFor="password">Password <span className="req">*</span></label>
                                <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                            </div>
    ```
    with:
    ```
                            <div className="field">
                                <label htmlFor="password">Password <span className="req">*</span></label>
                                <div className="password-wrap">
                                    <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? EYE_OFF_SVG : EYE_SVG}
                                    </button>
                                </div>
                                <span className="field-hint">At least 8 characters.</span>
                            </div>
    ```
    then add, as a new `.field` immediately after the closing `</div>` of the `.field-row` that contains it:
    ```
                            <div className="field">
                                <label htmlFor="confirmPassword">Repeat Password <span className="req">*</span></label>
                                <input id="confirmPassword" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" />
                            </div>
    ```
    The repeat field goes **outside** the two-column `.field-row` (which holds Username and Password), full width beneath it. Substitute the SVG literals as in step 7.
14. In the `<style jsx>` block, directly after the line
    `                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }`
    add:
    ```
                    .password-wrap { position: relative; }
                    .password-wrap input { width: 100%; padding-inline-end: 2.4rem; }
                    .toggle-password {
                      position: absolute; inset-inline-end: 0.5rem; top: 50%; transform: translateY(-50%);
                      background: none; border: none; padding: 0.15rem; line-height: 0;
                      color: rgba(255,255,255,0.45); cursor: pointer;
                    }
                    .toggle-password:hover { color: #fff; }
                    .field-hint { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
    ```

**Instructions — `src/app/admin/employees/secretaries/new/page.tsx`:**

15. Apply steps 10–14 again. This file has **no `color` field**, so step 12's replacement body is:
    ```
                body: JSON.stringify({
                    name: form.name, email: form.email, phone: form.phone,
                    workingHours: form.workingHours, username: form.username,
                    password: form.password, pictureUrl,
                }),
    ```
    Everything else is identical — the `.field`, `.field-row` and `<style jsx>` structures in this file match the doctors one exactly.

**Verification:**
- `npm run build` passes.
- `npx eslint src/app/admin/employees/doctors/page.tsx src/app/admin/employees/doctors/new/page.tsx src/app/admin/employees/secretaries/page.tsx src/app/admin/employees/secretaries/new/page.tsx` — no **new** errors against these four files. (`npm run lint` across the repo cannot pass; see the note at the bottom of this file. Do not run it and do not treat its output as a signal.)
- `grep -rn "EYE_SVG\|EYE_OFF_SVG" src/` returns nothing — the placeholder names must not be in the committed code.
- `grep -rn 'type="password"' src/app/admin/` returns nothing. Every admin password input is now conditional. `src/app/login/page.tsx` still has one and should — it is out of scope.
- **The regression to prove, not assume — the two modals must still save successfully.** The error path is new code on the *only* path that saves a doctor or secretary edit. With the app running and logged in as admin, on `/admin/employees/doctors`: open **Edit** on a doctor, change the name only, leave both password boxes empty, Save. The modal must close and the row must show the new name. Repeat on `/admin/employees/secretaries`. If an empty-password edit is now blocked, step 5's `if (!editingDoctor || form.password)` guard was mistranscribed.
- Then the negative cases, same two modals: a 4-character password in both boxes must show *"Password must be at least 8 characters"* and **not** close the modal; two different 8+ character values must show *"Passwords do not match"*; a matching 8+ character pair must save and close.
- On both `/new` pages: submitting a 4-character password must show the existing red `.error-banner` above the form and must not navigate away; a mismatch must show *"Passwords do not match"*; a valid matching pair must create the account and redirect to the list.
- Click the eye toggle on each of the four forms and confirm the typed text becomes readable in **both** the password and the repeat box, and that the icon swaps.

**Done when:**
- [x] All four forms have a working reveal toggle and a repeat-password field
- [x] Both modals surface the API's error instead of closing silently, and stay open with the values intact
- [x] An edit that does not change the password still saves from both modals
- [x] The 8-character minimum is stated in the UI and enforced client-side with the server's own wording
- [x] `npm run build` passes; scoped eslint clean
- [x] Visual review, geometry half: the toggle does not overlap the input's text and the repeat field does not overflow at 1440px
- [x] Visual review, authenticated half — all four forms driven against the live app
- [x] Diff confined to the four Scope files

**Planner verification:** 2026-08-15 — read the full `git diff master..feat/employee-password-fields` rather than relying on the executor's report. **4 files, 252 insertions, 15 deletions, one commit `3d0682f`, working tree clean, nothing outside Scope touched.** Every instruction applied verbatim: both SVG literals inlined as ternaries with the placeholder names absent from the tree, both error strings matching the API's wording, and the `if (!editingDoctor || form.password)` guard transcribed correctly in both modals — that guard is the one that keeps a password-less edit working, so it was read character by character in both files.

Re-ran verification independently: `npm run build` **exit 0**, 49 static pages, all four employee routes in the table. The three greps all returned as specified — no placeholders anywhere in `src/`, no bare `type="password"` left under `src/app/admin/`, and `login/page.tsx:112` still carrying its own, untouched.

**The lint claim was checked rather than accepted.** Scoped eslint on the four files reports 2 errors + 2 warnings. I restored the four `master` versions in place, re-ran the identical command, and got **the same 4 problems, same rules, same files** — `react-hooks/set-state-in-effect` on the untouched `useEffect(() => { fetchDoctors(); })` lines and `no-img-element` on the untouched avatar previews, differing only in line number where the diff shifted them. **Zero new lint problems.** Branch files restored afterwards; tree clean.

**Visual review — geometry half performed, authenticated half not.** The live admin surface is behind a login, and reading `.env` for a database connection was refused by the sandbox's permission classifier — the same wall the executor hit and honestly reported. Rather than merge on a green build, I measured the two layout risks named in the Verification block against the **exact** shipped CSS and markup, lifted verbatim into a static harness and served over HTTP (`file://` is blocked by the browser extension), with a `master` reproduction as the control:

- **The toggle is clear of the input's text.** `padding-inline-end: 2.4rem` computes to 38.4px, so the text area ends at x=192.2 while the button starts at x=201.8 — 9.6px of clearance. The button sits inside the input box, is vertically centred to **0.00px**, and its hit area is 20.8×20.8. The SVG computes `opacity: 1`, `visibility: visible`, 16×16. Confirmed by eye as well as by measurement.
- **At 1440px nothing overflows** — card 560 wide, content 543.
- **At 320px the modal card overflows its width by 123px — and that is pre-existing, not this diff.** The control proves it: `master` overflows by **exactly the same 123px**. `.form-grid` is a hard `grid-template-columns: 1fr 1fr` with no media query, so the modal has never fitted a phone; the new Repeat field lands in the existing second column and adds nothing to the overflow. This is the same standing 320px violation already filed in the notes below for the admin navbar, and it should be fixed there rather than inside this task.

**Visual review — authenticated half, completed 2026-08-15.** The user chose to finish rather than merge on static verification; an admin session (`noorhamami`) already existed in their Chrome, so no login was needed and none was performed by me. Driven against the running dev server, all four surfaces. **First: proved the code under test was actually live** — `#confirmPassword` present in the DOM — because a dev server that started before the branch was checked out would have looked identical while serving `master`.

- **The regression that mattered passes.** A name-only edit with both password boxes empty saves from **both** modals: doctor row went `Test Delete2` → `Test Delete2 QA` → back, secretary `Test Delete` → `Test Delete QA` → back, modal closing cleanly each time with no error. The `if (!editingDoctor || form.password)` guard does what it was written to do.
- **All four negative cases hold, on all four forms**, and — the part worth recording — **with zero network calls**. `window.fetch` was wrapped to count them: a 4-character password and a mismatch are both refused client-side before any request leaves, with the modal staying open and the typed values intact. Messages exactly as specified: *"Password must be at least 8 characters"* and *"Passwords do not match"*.
- **The riskiest edit in the diff was the one with no visible symptom, so it was tested directly.** Step 12 replaced the create pages' `JSON.stringify({ ...form, pictureUrl })` with an explicit field list; a dropped field there would silently lose data with nothing on screen to show it. `fetch` was intercepted to capture the outgoing payload and return a synthetic 400 **so no account was ever created**. Doctor POST carried exactly `color, email, name, password, phone, pictureUrl, username, workingHours` with every value intact including the hand-picked `#a78bfa`; secretary POST carried the same set minus `color`, correctly. **`confirmPassword` appears in neither**, nor in the modal's PUT (`color, email, name, password, phone, workingHours`).
- **The silent-failure fix was proven with a real 400, not a simulated one.** The intercepted error response surfaced verbatim in the modal's `.error-msg` and in the create pages' `.error-banner`, and the modal **stayed open** — which is the entire point of the task.
- **The toggle flips both fields together** (`password`↔`text` on the password and repeat inputs in one click), swaps the icon (3-path eye-off ↔ 1-path eye) and updates `aria-label`. Verified on all four forms.
- **The database was left exactly as found** — 2 doctors (`Test Delete` RESIGNED `#6ee7b7`, `Test Delete2` ACTIVE `#fbbf24`), 1 secretary (`Test Delete` RESIGNED), every test rename reverted and no review account created. Incidentally corroborates TJ-009 §2's colour claim and §3's unparseable `9-7` working hours.

**One trap worth carrying forward: in dev mode the first call to an API route compiles it, and a 1.2s wait was not enough.** The empty-password save looked like a *failure* — modal still open, row unchanged, no error — and was simply mid-flight. Re-checking a second later showed it had succeeded. A single-shot assertion after a fixed timeout would have condemned working code; wait for the state to settle, or poll.

---

### TJ-009b — Re-authenticate the admin before changing an employee's password

- **Status:** REVIEW — statically verified on commit `8ed59cd`; **unmerged**, awaiting the runtime checks the user has deferred.
- **Branch:** `feat/admin-reauth-password-change`

**Planner verification (static half):** 2026-08-15 — read the full diff rather than the report. **4 files, 102 insertions, 8 deletions, one commit `8ed59cd`, tree clean, nothing outside Scope.** The security-bearing line is right: `const actingAdminId = (session.user as { id?: string }).id;` — the acting admin comes from the session, never the body, so the gate cannot be pointed at another account by tampering with the request. Both routes carry byte-identical logic; both `POST` handlers and both `/new` pages are untouched (`grep` for `adminPassword` in the create pages returns nothing). Re-ran `npm run build` independently: **exit 0**. Re-ran the eslint baseline myself by restoring the `master` versions in place: **2 problems on the branch, 2 on the baseline — zero new.**

**The executor corrected the pass, and it was right.** This block originally predicted a `master` baseline of "2 errors + 2 warnings"; the real figure for *these four* files is 2 errors + 0 warnings. The two `no-img-element` warnings belong to the two `/new` pages, which were in TJ-009a's file set and are **not** in this task's. The number was carried over from the previous task without re-deriving it for a different Scope — a small error, but exactly the kind that trains an executor to ignore a failing check. Recorded rather than quietly fixed.

**Still outstanding:** the six runtime checks (a)–(f) in Verification, above all (f) — a `PUT` carrying `password` but no `adminPassword` must return 400. That is the case that proves the gate exists rather than merely appearing in the UI, and it cannot be established from a diff.
- **Why:** TJ-009 §6. The edit modals already offer *New Password (optional)* and `PUT` already hashes whatever arrives, so anyone holding a live admin session — an unlocked machine at the front desk is the realistic case — can silently reset a doctor's or secretary's credentials and lock them out. The missing piece is the gate: the admin re-enters their **own** password, and the API verifies it with `bcrypt.compare` before `passwordHash` is touched.

**Planning pass:** 2026-08-15 — read the post-merge `src/app/admin/employees/doctors/page.tsx` and `.../secretaries/page.tsx` (both as they stand after `234d800`), `src/app/api/employees/doctors/[id]/route.ts`, `.../secretaries/[id]/route.ts`, `src/lib/auth.ts`, `src/lib/auth.config.ts` and `prisma/schema.prisma`. Confirmed:

- **`session.user.id` is populated and can be trusted.** `auth.config.ts:16` assigns `session.user.id = token.id` in the `session` callback, and `auth.ts:21-39` re-reads the account from the database on every server-side session read. So the route can look up the acting admin by id without trusting anything from the request body. This is the single fact the whole task depends on and it was verified rather than assumed.
- **`User.passwordHash` is non-nullable** (`schema.prisma:73`), so there is no "admin has no password set" edge case to handle.
- **Both `PUT` handlers already gate on `role === "ADMIN"`** and both hash with `bcrypt.hash(password, 12)` inside `if (password) { … }`. The new check goes inside that same block, so an edit that does not touch the password is completely unaffected — that is the regression to prove.
- **Scope stays at four files.** `POST` (create) is deliberately **not** touched: creating a new account is not changing an existing person's credential, and requiring a re-auth there would be friction with no threat behind it.
- Corrected a wording assumption from the original capture: the modal label is *New Password (optional)*, not *Change Password*, so the new field is introduced beneath the existing pair rather than replacing anything.

**Anchors verified mechanically 2026-08-15** against the post-merge tree, `\r` stripped before comparing — every string below matches exactly once in its file.

**Scope — touch only these:**
- `src/app/admin/employees/doctors/page.tsx`
- `src/app/admin/employees/secretaries/page.tsx`
- `src/app/api/employees/doctors/[id]/route.ts`
- `src/app/api/employees/secretaries/[id]/route.ts`

**Do not touch:** the `POST` handlers or either `/new` page — creating an account stays as it is. Not `src/lib/auth.ts` or `auth.config.ts`. Do not add a reveal toggle to the admin's own password field (see step 5). Do not change the existing 8-character rule or either error string from TJ-009a.

**Exact strings — use verbatim:**
- Field label: `Your Password *`
- Field hint: `Confirm it is you before changing someone else's password.`
- Client-side, admin field left empty: `Enter your own password to confirm this change`
- API, `adminPassword` missing: `Enter your own password to confirm this change`
- API, `adminPassword` wrong: `Your password is incorrect`

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

1. In `interface DoctorForm`, add `adminPassword: string;` directly after `    confirmPassword: string;`.
2. Add `adminPassword: ""` to all three form initialisers — the `useState<DoctorForm>` literal, the one in `openAdd`, and the one in `openEdit` — placing it directly after each `confirmPassword: ""`.
3. In `handleSave`, replace this block:
   ```
        if (!editingDoctor || form.password) {
            if (form.password.length < 8) {
                setFormError("Password must be at least 8 characters");
                return;
            }
            if (form.password !== form.confirmPassword) {
                setFormError("Passwords do not match");
                return;
            }
        }
   ```
   with:
   ```
        if (!editingDoctor || form.password) {
            if (form.password.length < 8) {
                setFormError("Password must be at least 8 characters");
                return;
            }
            if (form.password !== form.confirmPassword) {
                setFormError("Passwords do not match");
                return;
            }
        }

        if (editingDoctor && form.password && !form.adminPassword) {
            setFormError("Enter your own password to confirm this change");
            return;
        }
   ```
   Note the guard is `editingDoctor && form.password` — the admin's own password is required **only** when changing an existing person's credential, never on create and never on a password-less edit.
4. In the same function, replace:
   ```
        } else if (form.password) {
            body.password = form.password;
        }
   ```
   with:
   ```
        } else if (form.password) {
            body.password = form.password;
            body.adminPassword = form.adminPassword;
        }
   ```
5. Immediately after the closing `</div>` of the *Repeat New Password* `form-group` (the one whose input is bound to `form.confirmPassword`), add this conditional group. It renders only while an actual password change is in progress, so ordinary edits never see it. It has **no reveal toggle on purpose** — revealing the employee's new password should not also reveal the admin's own:
   ```
                            {editingDoctor && form.password && (
                                <div className="form-group">
                                    <label>Your Password *</label>
                                    <input
                                        type="password"
                                        value={form.adminPassword}
                                        onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                                    />
                                    <span className="field-hint">Confirm it is you before changing someone else&apos;s password.</span>
                                </div>
                            )}
   ```

**Instructions — `src/app/admin/employees/secretaries/page.tsx`:**

6. Apply steps 1–5 again with `SecretaryForm` for `DoctorForm` and `editing` for `editingDoctor` throughout. The `handleSave` block in step 3 is identical except it opens `if (!editing || form.password) {`, and step 5's condition becomes `{editing && form.password && (`. There is no `color` key in this file's form object; do not add one.

**Instructions — `src/app/api/employees/doctors/[id]/route.ts`:**

7. In the `PUT` handler, replace:
   `    const { name, email, phone, workingHours, password, color, pictureUrl, status } = body;`
   with:
   `    const { name, email, phone, workingHours, password, color, pictureUrl, status, adminPassword } = body;`
8. Replace this block:
   ```
    if (password) {
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }
        updateData.passwordHash = await bcrypt.hash(password, 12);
    }
   ```
   with:
   ```
    if (password) {
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Re-authenticate the acting admin before overwriting someone else's
        // credential. The id comes from the session, never from the body, and
        // auth.ts re-reads the account on every session read — so this cannot
        // be pointed at another user by tampering with the request.
        if (!adminPassword) {
            return NextResponse.json(
                { error: "Enter your own password to confirm this change" },
                { status: 400 }
            );
        }
        const actingAdminId = (session.user as { id?: string }).id;
        const actingAdmin = actingAdminId
            ? await prisma.user.findUnique({
                where: { id: actingAdminId },
                select: { passwordHash: true },
            })
            : null;
        if (!actingAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const adminPasswordOk = await bcrypt.compare(adminPassword, actingAdmin.passwordHash);
        if (!adminPasswordOk) {
            return NextResponse.json(
                { error: "Your password is incorrect" },
                { status: 403 }
            );
        }

        updateData.passwordHash = await bcrypt.hash(password, 12);
    }
   ```

**Instructions — `src/app/api/employees/secretaries/[id]/route.ts`:**

9. Apply steps 7–8 again. This file's destructure line has no `color`, so it becomes:
   `    const { name, email, phone, workingHours, password, pictureUrl, status, adminPassword } = body;`
   The `if (password) { … }` block is otherwise byte-identical to the doctors one — verified 2026-08-15 — so paste the same replacement.

**Verification:**
- `npm run build` passes.
- `npx eslint` on the four Scope files — no **new** problems. Establish the baseline the way TJ-009a's review did (restore the `master` versions, run, compare) rather than assuming; `master` currently reports 2 errors + 2 warnings across the two page files, all pre-existing.
- `grep -n "adminPassword" src/app/api/employees/doctors/\[id\]/route.ts src/app/api/employees/secretaries/\[id\]/route.ts` shows the destructure and the guard in both.
- `grep -rn "adminPassword" src/app/admin/employees/doctors/new/page.tsx src/app/admin/employees/secretaries/new/page.tsx` returns **nothing** — the create pages must be untouched.
- **Runtime checks are deferred by the user and must NOT be run by the executor.** Record them here for the planner's later pass: (a) a name-only edit with no password still saves from both modals and never shows the new field; (b) typing a new password reveals the *Your Password* field; (c) submitting with the admin field empty is refused client-side with no network call; (d) a **wrong** admin password returns 403 *"Your password is incorrect"* and the modal stays open; (e) the correct admin password completes the change; (f) the negative case that actually proves the gate — a `PUT` sent with `password` but **no** `adminPassword` at all must return 400, not succeed.

**Done when:**
- [ ] The admin's own password is required for every password change on both employee surfaces
- [ ] An edit that does not change the password is completely unaffected — no new field, no new requirement
- [ ] Account creation is unchanged
- [ ] The acting admin is identified from the session, never from the request body
- [ ] `npm run build` passes; no new eslint problems
- [ ] Diff confined to the four Scope files

---

### TJ-009c — Archive view and re-enrolment for resigned employees

- **Status:** READY
- **Branch:** `feat/employee-archive-view` — **cut from `feat/admin-reauth-password-change`, not from `master`.** That branch is unmerged (the visual review is deferred), so branching from `master` would silently drop TJ-009b's work.

**Planner verification (static half):** 2026-08-15 — read the full `git diff feat/admin-reauth-password-change..feat/employee-archive-view`. **2 files, 121 insertions, 13 deletions, one commit `b75cb9f`, nothing outside Scope.** All 11 instructions applied verbatim. Checked the two places step 11 said this file diverges, because a blind repeat of steps 1–10 would have broken both: the secretaries `{sec.status === "ACTIVE" && (` guard was correctly converted to the `? :` form so archived rows now offer **Re-enrol** instead of nothing, and `colSpan={6}` was preserved rather than copied as `{7}` from the doctors file. Re-ran `npm run build`: **exit 0**. Both greps clean — `>Delete<` and `handleDelete` are gone from `src/app/admin/employees/` entirely, so the button that lied is no longer in the tree.

**Still outstanding:** the runtime checks — a row moving between Active and Archived without a reload, the counts tracking, and above all **a re-enrolled account being able to sign in again**, which is the only check that proves the `status` round-trip reached the database rather than just the UI.
- **Why:** TJ-009 §7, less the hard delete. Resigned staff sit mixed into the active list with a red badge, there is no archived view, and nothing re-enrols them — though re-enrolment needs **no API work at all**, since `PUT` already accepts `status` (`doctors/[id]/route.ts:64`, `secretaries/[id]/route.ts:61`) and `src/lib/auth.ts:36` lets the account sign in again the moment it reads `ACTIVE`. UI-only, across the two list pages.

**Planning pass:** 2026-08-15 — read both employee list pages, both `[id]` routes, `src/lib/auth.ts`, and the two archive patterns the app already ships: `src/app/admin/blog/page.tsx:17-56` (in-page filter chips with counts, `FILTERS` + `statusFor` + a `useMemo` over the fetched rows) and `src/app/secretary/patients/archived/page.tsx` (a separate `/archived` route with a back link). Confirmed re-enrolment needs no endpoint work. Confirmed the two lists already diverge in *behaviour*, not just wording: `secretaries/page.tsx:134` hides its button once the row is `RESIGNED`, while the doctors list leaves *Delete* clickable on an already-resigned doctor where it is a silent no-op.

**Decision taken (assumption — one string each to reverse).** The user has not answered the vocabulary question, so the pass takes the conservative reading rather than stalling the queue:
- The soft-delete button is **"Resign"** on both tabs. It is the honest label — it sets `status: RESIGNED` — the secretaries page already says it, and it frees the word *Delete* for TJ-009g's real delete. Renaming the doctors button is the whole point: *Delete* currently lies.
- The view is an in-page **"Active" / "Archived"** chip filter, following the blog pattern rather than the patients one. Two small lists, no pagination, no new route, and it keeps the change inside the two files already in Scope.
- The reverse action is **"Re-enrol"**, the user's own word from the original report.
- Default filter is **Active**, which is what fixes the reported complaint.

**Scope — touch only these:** `src/app/admin/employees/doctors/page.tsx`, `src/app/admin/employees/secretaries/page.tsx`.

**Do not touch:** any API route — this task adds no endpoint and changes no server behaviour. Do not touch the modal, the password fields, or anything TJ-009b introduced.

**Approach:** mirror `admin/blog/page.tsx` — a `FILTERS = ["Active", "Archived"]` chip row with counts, a `useMemo`-derived visible list filtering on `status`, `Resign` shown only on `ACTIVE` rows, `Re-enrol` shown only on `RESIGNED` rows and calling the existing `PUT` with `{ status: "ACTIVE" }`. Reuse the existing `.chip` / `.chip-count` CSS from the blog page verbatim, and fix the doctors page to stop offering its button on already-resigned rows.

**Anchors verified mechanically 2026-08-15** against the tip of `feat/admin-reauth-password-change`, `\r` stripped — each matches exactly once in its file.

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

1. Replace `import { useState, useEffect, useCallback } from "react";` with:
   `import { useState, useEffect, useCallback, useMemo } from "react";`
2. Directly after the closing `];` of the `COLORS` array, add:
```
const FILTERS = ["Active", "Archived"] as const;

function statusFor(filter: (typeof FILTERS)[number]) {
    return filter === "Archived" ? "RESIGNED" : "ACTIVE";
}
```
3. Directly after the line `    const [formError, setFormError] = useState("");`, add:
```
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Active");
```
4. Directly after the line `    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);`, add:
```

    const counts = useMemo(() => ({
        Active: doctors.filter((d) => d.status === "ACTIVE").length,
        Archived: doctors.filter((d) => d.status === "RESIGNED").length,
    }), [doctors]);

    const visible = useMemo(
        () => doctors.filter((d) => d.status === statusFor(filter)),
        [doctors, filter]
    );
```
5. Replace the whole `handleDelete` function:
```
    const handleDelete = async (id: string) => {
        if (!confirm("Mark this doctor as resigned? This is a soft delete.")) return;
        await fetch(`/api/employees/doctors/${id}`, { method: "DELETE" });
        fetchDoctors();
    };
```
   with:
```
    const handleResign = async (id: string) => {
        if (!confirm("Resign this doctor? They move to Archived and can be re-enrolled later.")) return;
        await fetch(`/api/employees/doctors/${id}`, { method: "DELETE" });
        fetchDoctors();
    };

    const handleReEnrol = async (id: string) => {
        await fetch(`/api/employees/doctors/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIVE" }),
        });
        fetchDoctors();
    };
```
6. Directly after the closing `</div>` of the `page-header` block (the one containing `<h1>Doctors</h1>`), add:
```

            <div className="filter-row">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`chip ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f} <span className="chip-count">{counts[f]}</span>
                    </button>
                ))}
            </div>
```
7. Replace `                        {doctors.map((doc) => (` with `                        {visible.map((doc) => (`.
8. Replace the action-buttons block:
```
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(doc)}>Edit</button>
                                        <button className="btn-sm btn-delete" onClick={() => handleDelete(doc.id)}>Delete</button>
                                    </div>
```
   with:
```
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(doc)}>Edit</button>
                                        {doc.status === "ACTIVE" ? (
                                            <button className="btn-sm btn-delete" onClick={() => handleResign(doc.id)}>Resign</button>
                                        ) : (
                                            <button className="btn-sm btn-edit" onClick={() => handleReEnrol(doc.id)}>Re-enrol</button>
                                        )}
                                    </div>
```
9. Replace:
```
                        {doctors.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No doctors found</td></tr>
                        )}
```
   with:
```
                        {visible.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                                {filter === "Archived" ? "No archived doctors" : "No active doctors"}
                            </td></tr>
                        )}
```
10. In the `<style jsx>` block, directly after the line
    `        .page-header h1 { font-size: 1.5rem; font-weight: 600; }`
    add the chip rules, copied from `admin/blog/page.tsx:159-169` and re-indented to this file's 8-space style:
```
        .filter-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .chip {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65); padding: 0.4rem 0.9rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.15s;
        }
        .chip:hover { background: rgba(255,255,255,0.08); }
        .chip.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); color: #fff; }
        .chip-count { color: rgba(255,255,255,0.4); font-weight: 500; }
        .chip.active .chip-count { color: rgba(255,255,255,0.7); }
```

**Instructions — `src/app/admin/employees/secretaries/page.tsx`:**

11. Apply steps 1–10 again with these differences, and no others:
    - Step 2's block goes directly after the closing `}` of `interface SecretaryForm` (this file has no `COLORS` array).
    - Substitute `secretaries` for `doctors`, `sec` for `doc`, `fetchSecretaries` for `fetchDoctors`, `Secretaries` for `Doctors`.
    - Step 5: this file's function is already named `handleResign` and already reads `secretary`. Replace only its `confirm` string with `"Resign this secretary? They move to Archived and can be re-enrolled later."`, and add `handleReEnrol` beside it calling `/api/employees/secretaries/${id}`.
    - Step 8: this file already guards with `{sec.status === "ACTIVE" && (`. Convert that to the same `? :` form so archived rows get **Re-enrol** instead of nothing.
    - Step 9: the anchor is `colSpan={6}` and the messages are `"No archived secretaries"` / `"No active secretaries"`.
    - Step 10: this file's `.page-header h1` line is `        .page-header h1 { font-size: 1.5rem; font-weight: 600; }` — same string, same insertion point.

**Verification:** build; no new eslint problems (baseline the two page files against their `feat/admin-reauth-password-change` versions, **not** against `master` — this branch is stacked on TJ-009b, so `master` is the wrong control and will show TJ-009b's changes as if they were yours); `grep -n ">Delete<" src/app/admin/employees/` returns nothing; `grep -rn "handleDelete" src/app/admin/employees/` returns nothing. **Runtime checks deferred by the user** — record for the planner: resigning moves a row out of Active and into Archived without a reload; Re-enrol moves it back; the counts track; and the re-enrolled account can sign in again, which is the one check that proves the `status` round-trip actually reached the database.

**Done when:**
- [ ] Resigned staff are out of the default list and reachable under Archived
- [ ] Re-enrol restores an account to ACTIVE from the UI alone
- [ ] Both tabs use the same verb for the same action, and no button claims to delete
- [ ] Diff confined to the two Scope files

---

### TJ-009d — One calendar colour per doctor

- **Status:** DONE — task commit `5baacdf`, merged to `master` as `4e6587e` with `--no-ff`. One imprecision found in my own spec, recorded below and filed rather than patched. Not pushed.
- **Branch:** `feat/unique-doctor-colours` — **cut from `feat/employee-archive-view`, not from `master`.**

**Planner verification (static half):** 2026-08-15 — read the full `git diff feat/employee-archive-view..feat/unique-doctor-colours`. **4 files, 106 insertions, 18 deletions, one commit `5baacdf`, nothing outside Scope.** The line the task exists for is present and correct: `where: { role: "DOCTOR", status: "ACTIVE", color, id: { not: id } }` — exactly one hit, so an unrelated save on an existing doctor cannot be refused by their own colour. POST carries the same check without the self-exclusion, correctly, since a new doctor has no id to exclude. Re-ran `npm run build`: **exit 0**. eslint baselined against `feat/employee-archive-view` rather than `master` (the stacked-branch control): **2 problems on both sides — zero new.**

**Spec imprecision found during verification — mine, not the executor's.** Both `takenColors` and `paletteExhausted` test `…filter(…).length >= COLORS.length`, which counts **doctors holding a colour**, not **distinct colours held**. If duplicates already exist in the data — which they can, since nothing prevented them before this task — twelve doctors sharing ten distinct colours would read as "exhausted", re-enable every swatch and show the sharing hint while two colours were in fact still free. **It fails open**, so the worst case is that the admin can pick a taken colour and gets the server's 409 instead of a disabled swatch: confusing for one click, never data corruption, and the uniqueness guarantee is unaffected because it is enforced server-side. Not worth reopening a verified diff on the TJ-008b precedent, and it can only trigger with ≥12 active doctors *and* pre-existing duplicates. **The fix, when something next touches this file: count `new Set(...).size`, not `.length`.**

**Still outstanding:** the runtime checks, above all the self-exclusion one — open an existing doctor, change only the name, save, and confirm it is **not** rejected. That is the case `id: { not: id }` exists for and the only one that proves it works. The chain is unmerged while the visual review is deferred; branching from `master` would drop TJ-009b and TJ-009c.
- **Why:** TJ-009 §2. `User.color` is a plain `String?` with no unique constraint, and both pickers offer all twelve swatches with no exclusion (`doctors/page.tsx` colour picker, `doctors/new/page.tsx:108-115`). Two doctors can share a colour, which makes the calendar unreadable at exactly the moment it matters — a busy day with both of them booked.

**Planning pass:** 2026-08-15 — read both doctor form files, `src/app/api/employees/doctors/route.ts` (POST) and `.../doctors/[id]/route.ts` (PUT), and `prisma/schema.prisma:81`. Confirmed `color` is `String?` with no constraint and that neither endpoint validates it at all. Confirmed against the live database during the TJ-009a review that the two existing doctors hold `#6ee7b7` (RESIGNED) and `#fbbf24` (ACTIVE) — distinct, so nothing is broken today and this is prevention rather than repair.

**Decision taken (assumption).** Two rules, both chosen to fail open rather than block clinic work:
- **A resigned doctor releases their colour.** They no longer appear on the calendar, so reserving a swatch for them buys nothing and costs one of twelve. Uniqueness is therefore enforced against `ACTIVE` doctors only. This pairs with TJ-009c: once resigned staff live in an archive view, the release is the obviously right reading.
- **Palette exhaustion never blocks creation.** With twelve swatches and a thirteenth doctor, taken colours are shown disabled with the holder's name; if *every* colour is taken the picker re-enables all of them and shows a warning that the colour is shared, rather than making the doctor uncreatable. **Never let a cosmetic constraint stop an admin from adding staff** — that is the failure mode worth avoiding here.

**Scope — touch only these:** `src/app/admin/employees/doctors/page.tsx`, `src/app/admin/employees/doctors/new/page.tsx`, `src/app/api/employees/doctors/route.ts`, `src/app/api/employees/doctors/[id]/route.ts`.

**Do not touch:** the schema — this needs no migration and must not acquire one. No secretary file: secretaries have no `color`.

**Approach:** the list page already holds every doctor in state, so the modal can exclude taken colours with no extra request. The `/new` page has no such list and must `GET /api/employees/doctors` to learn them — that endpoint already returns `color` and `status` for any signed-in user. Server-side, both POST and PUT reject a colour already held by a *different* `ACTIVE` doctor with **409** and `{ error: "That colour is already used by <name>" }`, so the rule survives a stale tab. The PUT check must exclude the doctor being edited, or saving a doctor without changing their colour would reject itself — **that is the regression to prove.**

**Anchors verified mechanically 2026-08-15** against the tip of `feat/employee-archive-view`, `\r` stripped — each matches exactly once.

**Shared literal — the 409 message.** Both endpoints return exactly:
`{ error: "That colour is already used by " + holderName }` — build it with the holder's `name` read from the same query that detected the clash, so the admin is told *who* has it rather than just that it is taken.

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

1. Directly after the `visible` memo added by TJ-009c (the block ending `        [doctors, filter]\n    );`), add:
```

    // Colours held by ACTIVE doctors other than the one being edited. Resigned
    // doctors release their colour — they are off the calendar, so reserving a
    // swatch for them costs one of twelve and buys nothing.
    const takenColors = useMemo(() => {
        const t = doctors
            .filter((d) => d.status === "ACTIVE" && d.id !== editingDoctor?.id && d.color)
            .map((d) => d.color as string);
        // Never let a full palette block the work — fall back to allowing reuse.
        return t.length >= COLORS.length ? [] : t;
    }, [doctors, editingDoctor]);

    const paletteExhausted = useMemo(
        () => doctors.filter((d) => d.status === "ACTIVE" && d.id !== editingDoctor?.id && d.color).length >= COLORS.length,
        [doctors, editingDoctor]
    );
```
2. Replace the colour picker block:
```
                        <div className="form-group">
                            <label>Calendar Color</label>
                            <div className="color-picker">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`color-swatch ${form.color === c ? "selected" : ""}`}
                                        style={{ background: c }}
                                        onClick={() => setForm({ ...form, color: c })}
                                    />
                                ))}
                            </div>
                        </div>
```
   with:
```
                        <div className="form-group">
                            <label>Calendar Color</label>
                            <div className="color-picker">
                                {COLORS.map((c) => {
                                    const taken = takenColors.includes(c);
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            disabled={taken}
                                            title={taken ? "Already used by another doctor" : undefined}
                                            className={`color-swatch ${form.color === c ? "selected" : ""}`}
                                            style={{ background: c }}
                                            onClick={() => setForm({ ...form, color: c })}
                                        />
                                    );
                                })}
                            </div>
                            {paletteExhausted && (
                                <span className="field-hint">Every colour is in use — this one will be shared with another doctor.</span>
                            )}
                        </div>
```
3. In the `<style jsx>` block, replace:
```
        .color-swatch {
          width: 32px; height: 32px; border-radius: 8px; border: 2px solid transparent;
          cursor: pointer; transition: transform 0.15s;
        }
```
   with:
```
        .color-swatch {
          width: 32px; height: 32px; border-radius: 8px; border: 2px solid transparent;
          cursor: pointer; transition: transform 0.15s;
        }
        .color-swatch:disabled { opacity: 0.25; cursor: not-allowed; }
        .color-swatch:disabled:hover { transform: none; }
```

**Instructions — `src/app/admin/employees/doctors/new/page.tsx`:**

4. Replace `import { useState, useRef } from "react";` with:
   `import { useState, useRef, useEffect, useMemo } from "react";`
5. Directly after the line `    const [showPassword, setShowPassword] = useState(false);`, add:
```
    const [takenColors, setTakenColors] = useState<string[]>([]);

    // This page has no doctor list of its own, so it asks for one. The endpoint
    // already returns `color` and `status` to any signed-in user.
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/employees/doctors");
            if (!res.ok) return;
            const data: { status: string; color: string | null }[] = await res.json();
            setTakenColors(
                data.filter((d) => d.status === "ACTIVE" && d.color).map((d) => d.color as string)
            );
        })();
    }, []);

    const paletteExhausted = takenColors.length >= COLORS.length;
    const blockedColors = useMemo(
        () => (paletteExhausted ? [] : takenColors),
        [paletteExhausted, takenColors]
    );
```
6. Replace the colour picker block:
```
                        <div className="color-picker">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    className={`color-swatch ${form.color === c ? "selected" : ""}`}
                                    style={{ background: c }}
                                    onClick={() => setForm({ ...form, color: c })}
                                />
                            ))}
                        </div>
```
   with:
```
                        <div className="color-picker">
                            {COLORS.map((c) => {
                                const taken = blockedColors.includes(c);
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        disabled={taken}
                                        title={taken ? "Already used by another doctor" : undefined}
                                        className={`color-swatch ${form.color === c ? "selected" : ""}`}
                                        style={{ background: c }}
                                        onClick={() => setForm({ ...form, color: c })}
                                    />
                                );
                            })}
                        </div>
                        {paletteExhausted && (
                            <p className="upload-hint">Every colour is in use — this one will be shared.</p>
                        )}
```
7. In the `<style jsx>` block, replace:
```
                .color-swatch {
                    width: 100%; aspect-ratio: 1; border-radius: 8px; border: 2px solid transparent;
                    cursor: pointer; transition: transform 0.15s;
                }
```
   with:
```
                .color-swatch {
                    width: 100%; aspect-ratio: 1; border-radius: 8px; border: 2px solid transparent;
                    cursor: pointer; transition: transform 0.15s;
                }
                .color-swatch:disabled { opacity: 0.25; cursor: not-allowed; }
                .color-swatch:disabled:hover { transform: none; }
```
   **Note:** the default colour is `COLORS[0]`, which may itself be taken. The server is the backstop — do not add logic that silently reassigns the default, because a silent reassignment is worse than a clear 409.

**Instructions — `src/app/api/employees/doctors/route.ts` (POST):**

8. Directly after the closing `}` of the `// Check if username is taken` block — that is, after the `if (existing) { … }` block and before `    const passwordHash = await bcrypt.hash(password, 12);` — add:
```

    // One calendar colour per ACTIVE doctor. Resigned doctors release theirs.
    if (color) {
        const clash = await prisma.user.findFirst({
            where: { role: "DOCTOR", status: "ACTIVE", color },
            select: { name: true },
        });
        if (clash) {
            return NextResponse.json(
                { error: `That colour is already used by ${clash.name}` },
                { status: 409 }
            );
        }
    }
```

**Instructions — `src/app/api/employees/doctors/[id]/route.ts` (PUT):**

9. Replace the single line
   `    if (color !== undefined) updateData.color = color;`
   with:
```
    if (color !== undefined) {
        // Exclude the doctor being edited, or saving any other field would
        // reject the colour they already hold.
        if (color) {
            const clash = await prisma.user.findFirst({
                where: { role: "DOCTOR", status: "ACTIVE", color, id: { not: id } },
                select: { name: true },
            });
            if (clash) {
                return NextResponse.json(
                    { error: `That colour is already used by ${clash.name}` },
                    { status: 409 }
                );
            }
        }
        updateData.color = color;
    }
```
   **`id: { not: id }` is the whole task.** Without it, opening a doctor and saving a name change would be refused because their own colour "clashes" with themselves. That is the regression to prove.

**Verification:** build; no new eslint problems (baseline against `feat/employee-archive-view`, **not** `master`); `grep -n "id: { not: id }" src/app/api/employees/doctors/\[id\]/route.ts` returns exactly one hit. **Runtime deferred** — record: taken colours are unpickable in both forms; **saving an unrelated field on an existing doctor does not trip the 409** (the self-exclusion case); a resigned doctor's colour is offered again; and a direct `POST` with a duplicate colour is refused even though the UI would not have allowed it.

**Done when:**
- [ ] No two ACTIVE doctors can hold the same colour, through the UI or the API
- [ ] Editing a doctor without changing their colour still saves
- [ ] A resigned doctor's colour returns to the pool
- [ ] A full palette warns but never blocks creating a doctor
- [ ] Diff confined to the four Scope files

---

### TJ-009e — Working hours as a selector

- **Status:** DONE — task commit `c50c134`, merged to `master` as `423935d` with `--no-ff`. Verified, visually reviewed, merged. Not pushed.
- **Branch:** `feat/working-hours-selector` — **cut from `feat/unique-doctor-colours`, not from `master`.** The chain is unmerged while the visual review is deferred.

**Planner verification (static half):** 2026-08-15 — read the full `git diff feat/unique-doctor-colours..feat/working-hours-selector`. **5 files, 159 insertions, 4 deletions, one commit `c50c134`, nothing outside Scope.** `src/lib/workingHours.ts` matches the specified content character for character, including the `CANONICAL` anchored regex and the `formatWorkingHours` guard that returns `""` rather than a half-range. Re-ran `npm run build`: **exit 0**. `grep` confirms no free-text hour placeholder survives anywhere under `src/app/admin/employees/`, and `type="time"` appears exactly **8** times — two per form, four forms. eslint baselined against `feat/unique-doctor-colours`: **4 problems on both sides, same rules, same files, line numbers shifted only — zero new.**

**Spec error found and confirmed — mine.** Steps 8 and 12 told the executor to add "the same import as step 1" to the two `/new` pages, but a create form has no stored value to parse and no legacy value to preserve: those pages use **only** `formatWorkingHours`. So `parseWorkingHours` and `isLegacyWorkingHours` are imported and never used in both create pages. Verified by grepping each file for uses outside the import line — the two modals use all three, the two create pages use one. It is dead weight rather than a defect: no behaviour, no lint error under this config, and tree-shaken from the bundle. **Filed, not patched** — the executor followed the instruction exactly and amending a verified diff over an unused import is not worth breaking the diff/task correspondence. Fold the trim into the dead-code cleanup already noted under TJ-011, which is the task that will next touch these files.

**Still outstanding:** the runtime checks — a doctor stored as `"9-7"` opening with empty selectors and a `Currently: 9-7` line; `09:00`→`17:00` storing exactly `09:00-17:00` and round-tripping; and **filling only one side storing `""` rather than `"09:00-"`**, which is the failure `formatWorkingHours` exists to prevent.
- **Why:** TJ-009 §3. `User.workingHours` is `String?` and all four forms are bare text inputs; the live rows read literally `"9-7"` — re-confirmed against the API during the TJ-009a review. Nothing can ever be computed from that: not a rota, not an availability check on the booking form, not a warning when a reservation is booked outside a doctor's hours.

**Planning pass:** 2026-08-15 — read all four form files and `prisma/schema.prisma:78`. Confirmed the column is a free-text `String?` and that no code anywhere parses it: `grep` shows `workingHours` only ever being read into a form field or rendered into a table cell. So changing the *format* breaks nothing downstream — there is no consumer to break. That is the fact that makes this safe to do without a schema change.

**Decision taken (assumption), and the reasoning matters here because the user flagged this one as the expensive guess.** Ship the **from/to time pair**, stored in the existing `workingHours String?` column in the canonical format `HH:MM-HH:MM` (24-hour, zero-padded, e.g. `09:00-17:00`), rendered with two native `<input type="time">` controls.

Per-weekday hours is genuinely what a clinic rota needs, and it is *not* what this task builds. The reasons for taking the smaller step first: it needs **no schema change**, so it does not inherit TJ-009f's `prisma db push`-into-production blocker; it fixes the reported complaint completely; and it is strictly forward-compatible — a future per-weekday model can seed every weekday from the single pair and migrate cleanly, whereas free text like `"9-7"` can seed nothing. **If per-weekday is wanted instead, say so before this is dispatched** — that reverses the decision, and it is much cheaper to reverse now than after the data is written.

**Legacy data must survive.** The three existing rows hold `"9-7"`, which is not parseable as `HH:MM-HH:MM`. The forms must not silently discard it: on load, a value that does not match the canonical pattern leaves both time inputs empty and shows the raw stored text beneath them as `Currently: 9-7`, so the admin can see what is there and replace it deliberately. The list column renders the stored string as-is either way.

**Scope — touch only these:** all four employee form files (`doctors/page.tsx`, `doctors/new/page.tsx`, `secretaries/page.tsx`, `secretaries/new/page.tsx`).

**Do not touch:** the schema, or any API route — the column and its type are unchanged and the endpoints already pass `workingHours` straight through.

**Anchors verified mechanically 2026-08-15** against the tip of `feat/unique-doctor-colours`, `\r` stripped — each matches exactly once.

**One new file, deliberately.** The parse/format pair is used by all four forms, and four hand-copied time parsers is exactly how formats drift apart. It goes in `src/lib/`, which already exists and already holds small pure helpers of this kind (`slugify.ts`, `permissions.ts`). This takes the task to five files; that is the right trade and is not a licence to spread further.

**Instructions — create `src/lib/workingHours.ts`** with exactly this content:
```ts
// Working hours are stored in User.workingHours as a canonical "HH:MM-HH:MM"
// 24-hour range, e.g. "09:00-17:00". The column is free text and predates this
// format, so anything that does not parse is treated as legacy and preserved
// rather than discarded.

export type HourRange = { from: string; to: string };

const CANONICAL = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

/** Returns the from/to pair, or null if the stored value is empty or legacy. */
export function parseWorkingHours(stored: string | null | undefined): HourRange | null {
    if (!stored) return null;
    const m = CANONICAL.exec(stored.trim());
    if (!m) return null;
    return { from: `${m[1]}:${m[2]}`, to: `${m[3]}:${m[4]}` };
}

/**
 * Builds the stored value from two <input type="time"> values. Returns "" when
 * either side is missing — never a half-range like "09:00-", which would then
 * fail to parse on the way back in.
 */
export function formatWorkingHours(from: string, to: string): string {
    if (!from || !to) return "";
    return `${from}-${to}`;
}

/** True when a stored value holds something we could not parse and must not lose. */
export function isLegacyWorkingHours(stored: string | null | undefined): boolean {
    return !!stored && parseWorkingHours(stored) === null;
}
```

**The shared field shape.** Every form renders two `type="time"` inputs bound to local `hoursFrom` / `hoursTo` state, writing back through `formatWorkingHours` on every change. On open/load, seed them with `parseWorkingHours(stored)`. When `isLegacyWorkingHours(stored)` is true, render the raw value beneath so it is visible rather than silently dropped:
```
Currently: 9-7
```

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

1. Add to the imports, directly below the `next/navigation` import:
   `import { parseWorkingHours, formatWorkingHours, isLegacyWorkingHours } from "@/lib/workingHours";`
2. Directly after the line `    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Active");`, add:
```
    const [hoursFrom, setHoursFrom] = useState("");
    const [hoursTo, setHoursTo] = useState("");
    const [legacyHours, setLegacyHours] = useState("");
```
3. In `openAdd`, directly after `        setFormError("");`, add:
```
        setHoursFrom("");
        setHoursTo("");
        setLegacyHours("");
```
4. In `openEdit`, directly after its `        setFormError("");` line, add:
```
        const parsed = parseWorkingHours(doc.workingHours);
        setHoursFrom(parsed?.from ?? "");
        setHoursTo(parsed?.to ?? "");
        setLegacyHours(isLegacyWorkingHours(doc.workingHours) ? (doc.workingHours ?? "") : "");
```
   **`openAdd` is still unreachable dead code** (the header button routes to `/new`) but must stay consistent — see TJ-009a's note. Do not delete it.
5. Replace the working-hours field:
```
                            <div className="form-group">
                                <label>Working Hours</label>
                                <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 9:00 AM - 3:00 PM" />
                            </div>
```
   with:
```
                            <div className="form-group">
                                <label>Working Hours</label>
                                <div className="hours-row">
                                    <input
                                        type="time"
                                        aria-label="Start time"
                                        value={hoursFrom}
                                        onChange={(e) => {
                                            setHoursFrom(e.target.value);
                                            setForm({ ...form, workingHours: formatWorkingHours(e.target.value, hoursTo) });
                                        }}
                                    />
                                    <span className="hours-sep">to</span>
                                    <input
                                        type="time"
                                        aria-label="End time"
                                        value={hoursTo}
                                        onChange={(e) => {
                                            setHoursTo(e.target.value);
                                            setForm({ ...form, workingHours: formatWorkingHours(hoursFrom, e.target.value) });
                                        }}
                                    />
                                </div>
                                {legacyHours && <span className="field-hint">Currently: {legacyHours}</span>}
                            </div>
```
6. In the `<style jsx>` block, directly after the line
   `        .form-group input:focus { border-color: #6ee7b7; }`
   add:
```
        .hours-row { display: flex; align-items: center; gap: 0.5rem; }
        .hours-row input { flex: 1; min-width: 0; }
        .hours-sep { font-size: 0.8rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }
```

**Instructions — `src/app/admin/employees/secretaries/page.tsx`:**

7. Apply steps 1–6 again, substituting `sec` for `doc` in step 4. Step 5's anchor is identical except the placeholder reads `"e.g. 9:00 AM - 5:00 PM"`. Step 6's anchor `        .form-group input:focus { border-color: #6ee7b7; }` is byte-identical in this file — verified.

**Instructions — `src/app/admin/employees/doctors/new/page.tsx`:**

8. Add the same import as step 1, directly below the `next/navigation` import.
9. Directly after the line `    const [takenColors, setTakenColors] = useState<string[]>([]);`, add:
```
    const [hoursFrom, setHoursFrom] = useState("");
    const [hoursTo, setHoursTo] = useState("");
```
   (A create form starts empty, so there is no legacy value to preserve here and no `legacyHours` state.)
10. Replace the working-hours field:
```
                        <div className="field">
                            <label htmlFor="hours">Working Hours</label>
                            <input id="hours" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 9:00 AM – 3:00 PM" />
                        </div>
```
    with:
```
                        <div className="field">
                            <label htmlFor="hours">Working Hours</label>
                            <div className="hours-row">
                                <input
                                    id="hours"
                                    type="time"
                                    aria-label="Start time"
                                    value={hoursFrom}
                                    onChange={(e) => {
                                        setHoursFrom(e.target.value);
                                        setForm({ ...form, workingHours: formatWorkingHours(e.target.value, hoursTo) });
                                    }}
                                />
                                <span className="hours-sep">to</span>
                                <input
                                    type="time"
                                    aria-label="End time"
                                    value={hoursTo}
                                    onChange={(e) => {
                                        setHoursTo(e.target.value);
                                        setForm({ ...form, workingHours: formatWorkingHours(hoursFrom, e.target.value) });
                                    }}
                                />
                            </div>
                        </div>
```
11. In the `<style jsx>` block, directly after the line
    `                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }`
    add:
```
                .hours-row { display: flex; align-items: center; gap: 0.5rem; }
                .hours-row input { flex: 1; min-width: 0; }
                .hours-sep { font-size: 0.8rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }
```

**Instructions — `src/app/admin/employees/secretaries/new/page.tsx`:**

12. Apply steps 8–11 again. This file has **no** `takenColors` line, so step 9's block goes directly after `    const [showPassword, setShowPassword] = useState(false);` instead. Step 10's anchor has the placeholder `"e.g. 9:00 AM – 5:00 PM"`; note the en-dash `–` in both `/new` placeholders, which differs from the hyphen used in the two modals — match the file, do not normalise it.

**Verification:** build; no new eslint problems (baseline against `feat/unique-doctor-colours`, **not** `master`); `grep -rn 'placeholder="e.g. 9:00' src/app/admin/employees/` returns nothing — all four free-text hour inputs are gone; `grep -c 'type="time"' ` across the four files totals 8. **Runtime deferred** — record: a doctor stored as `"9-7"` opens with empty selectors and a `Currently: 9-7` line; setting 09:00→17:00 stores exactly `09:00-17:00`; reopening round-trips it into the two controls; **filling only one side stores an empty string, not `"09:00-"`** — that is the obvious way for this to go wrong and `formatWorkingHours` exists to prevent it.

**Done when:**
- [ ] Working hours are picked, not typed, on all four forms
- [ ] The stored format is canonical `HH:MM-HH:MM` and round-trips
- [ ] Legacy unparseable values are shown, not silently destroyed
- [ ] No schema change, no migration
- [ ] Diff confined to the four Scope files

---

### TJ-009h — The new-doctor form defaults to a colour it will not accept

- **Status:** READY — small, self-contained, no decision needed.
- **Branch:** `bugfix/default-doctor-colour`
- **Why:** TJ-009d added server-side colour uniqueness but left `/admin/employees/doctors/new` initialising `color: COLORS[0]`. When `COLORS[0]` (`#6ee7b7`) is already held by an ACTIVE doctor, the form opens with that swatch **selected and simultaneously disabled**, and pressing *Create Doctor* without touching the colour sends a value the server refuses with 409 — naming a colour the admin never chose. **Proven in the browser 2026-08-15**, not inferred: `selectedIndex=0`, `selectedColour=#6ee7b7`, `selectedIsDisabled=true`, `disabledIndexes=[0, 2]`.

**Planning pass:** 2026-08-15 — found during the TJ-009 visual review while checking why a doctor the user created had not appeared. **That turned out to be unrelated** — the user had not pressed Create — and the misattribution is worth recording: the defect was proven independently by reading the form's own state, which is why it survived the correction. The TJ-009d pass explicitly predicted this ("the default colour is `COLORS[0]`, which may itself be taken. The server is the backstop") and chose to leave it, reasoning that a silent reassignment is worse than a clear 409. **Half of that reasoning was wrong:** the 409 is not clear, because it names a colour the admin never picked. The distinction that matters is between *overriding a deliberate choice* — still wrong — and *choosing a sane initial default before the user has chosen anything*, which is just correct behaviour.

**Scope — touch only this:** `src/app/admin/employees/doctors/new/page.tsx`.

**Do not touch:** the modal in `doctors/page.tsx` — it edits an existing doctor whose colour is already theirs and is excluded from `takenColors`, so it has no equivalent bug. No API change: the server-side 409 is correct and stays as the backstop.

**Anchor verified mechanically 2026-08-15** against `master` — matches exactly once.

**Instructions:**

1. Replace this block:
```
            const data: { status: string; color: string | null }[] = await res.json();
            setTakenColors(
                data.filter((d) => d.status === "ACTIVE" && d.color).map((d) => d.color as string)
            );
```
   with:
```
            const data: { status: string; color: string | null }[] = await res.json();
            const taken = data
                .filter((d) => d.status === "ACTIVE" && d.color)
                .map((d) => d.color as string);
            setTakenColors(taken);

            // The form initialises to COLORS[0], which may already be taken —
            // leaving it selected means an untouched submit is refused with a
            // 409 naming a colour the admin never chose. Move to the first free
            // swatch instead. This runs once on mount, before the admin can
            // interact, and the functional update only replaces a colour that
            // is actually unavailable — a deliberate pick is never overridden.
            // When every colour is taken there is no free one to move to, so
            // the selection stays and the server stays the backstop.
            if (taken.length < COLORS.length) {
                setForm((f) =>
                    taken.includes(f.color)
                        ? { ...f, color: COLORS.find((c) => !taken.includes(c)) as string }
                        : f
                );
            }
```

**Why the functional `setForm((f) => …)` and not `setForm({ ...form, … })`:** the effect has `[]` deps and would close over the initial `form`, so the spread form would silently discard anything typed before the fetch resolved. This is the one place in the file where that distinction matters.

**Verification:** build; no new eslint problems. **Runtime:** with `#6ee7b7` held by an ACTIVE doctor, open the form and confirm the selected swatch is not a disabled one; confirm creating a doctor without touching the colour succeeds; confirm that actively picking a colour still sticks.

**Done when:**
- [ ] The form never opens with a disabled swatch selected
- [ ] Creating a doctor without touching the colour succeeds
- [ ] An actively chosen colour is never silently changed

---

### TJ-009f — Upload identification documents

- **Status:** SCHEMA DONE — the user authorised the push on 2026-08-15 conditional on no conflicts or errors; both were checked before applying. `EmployeeFile` is live in the database and merged to `master` as `ade1a06`. **The endpoints and UI are still to build** — this ID stays open until they do.

**Schema push, 2026-08-15 — what was checked and in what order.** The condition attached to the authorisation was *no conflicts or errors*, so it was verified rather than hoped for. **First, drift, before editing anything:** `prisma migrate diff --from-config-datasource --to-schema` returned *"This is an empty migration"*, proving the live database was already an exact match for `schema.prisma` — had it drifted, a `db push` could have silently reconciled the difference in ways nobody chose. **Second, the generated SQL was read before it was applied:** one `CREATE TABLE "EmployeeFile"` and one `ADD CONSTRAINT` on that same new table. **No `DROP`, and no `ALTER` against any existing table.** Run without `--accept-data-loss`, so the command would refuse rather than destroy if it disagreed. **Afterwards:** the drift check is empty again, and every list endpoint still returns its rows — doctors 2, secretaries 1, patients 3, blog 7, doctor profiles 0, reservations 8 on 2026-08-15. Nothing was lost.

**The table is inert until the feature lands**, which is the right order: an additive table that nothing reads costs nothing, whereas code shipped against a missing table is broken on arrival.
- **Why:** TJ-009 §1. There is no model for employee documents; `User` carries only `pictureUrl` (`schema.prisma:79`). The storage half already works — `POST /api/upload` passes non-images through untouched and keeps the extension, and `patient-files` is already in `ALLOWED_FOLDERS` — so what is missing is a table and a UI.

**Planning pass:** 2026-08-15 — read `prisma/schema.prisma` in full, `src/app/api/upload/route.ts`, and the `PatientFile` model that is the obvious template (`schema.prisma:112-122`: `fileName`, `filePath`, `fileType`, `fileSize`, `uploadedAt`, plus an `onDelete: Cascade` back to its owner). The design is therefore settled and small — an `EmployeeFile` model mirroring `PatientFile` with `userId String` and `user User @relation(..., onDelete: Cascade)`, a `POST`/`GET`/`DELETE` under `api/employees/[id]/files`, and a Files section on the employee edit surface.

**Why this one is not being dispatched with the others.** Everything above is buildable today. The blocker is not design, it is the migration path: **there is no `prisma/migrations/` directory**, so the schema change reaches the live database only through `prisma db push`, which applies directly with no down migration and no review step. That is a hard-to-reverse action against a production database, and it is not mine to assume — the user's standing note that the *data* is disposable test data is not the same as authorising a *schema* push. The other five splits were planned under stated assumptions because a wrong assumption there costs a string or a re-edit; a wrong assumption here costs a database.

**What is needed to unblock, in one answer:** go-ahead to run `prisma db push` against the live database for this model. Worth deciding once for both this and **TJ-011 §1** (patient file uploads), which needs no schema change at all and is the better first move — `PatientFile` already exists, so that task is pure endpoint-plus-button and proves the whole upload flow before any schema is touched.

**Also relevant before this ships, and it is not a detail:** nothing in the app ever deletes an uploaded file and the client holds only the Supabase **anon** key, so every upload is permanently orphaned when replaced. Shipping employee documents multiplies an existing storage leak — see the note at the bottom of this file. Worth fixing the leak first, or at least filing it, rather than adding a second source of it.

---

### TJ-009g — Hard delete a doctor

- **Status:** DONE — task commit `4d5ec79`, merged to `master` as `fe05f69` with `--no-ff`. **Both paths now proven**: refusal on 2026-08-15, and the successful deletion the same day once the user supplied a clean doctor. Not pushed.

**Success path proven, 2026-08-15.** The refusal path could be tested against existing data, but the positive path could not — every doctor in the database was referenced, and creating an account requires sending a password, which is out of bounds for me. The user created a throwaway doctor (`claude`) for the purpose. Driven through the real UI, not the API:

| step | result |
|---|---|
| Resign (moves it to Archived, where the delete lives) | `ACTIVE` → `RESIGNED` |
| Typed gate — empty box | disabled |
| Typed gate — wrong text (`claudX`) | disabled |
| Typed gate — exact name (`claude`) | enabled |
| `DELETE …?hard=true` | **200** |
| Doctor count | **3 → 2** |
| Row present afterwards | **gone** |
| Other two doctors | untouched |

**This is the first hard delete this application has ever performed.** The note further down recording that *"this app has no hard delete anywhere"* is now out of date for doctors specifically — Blog, patients, and secretaries still have none.

**Worth carrying into TJ-013 and TJ-011 §3:** the delete removed the `User` row and nothing else. Had the doctor owned an uploaded file, the `EmployeeFile` row would have cascaded but **the object in Supabase Storage would have remained**, because no code path in this application ever removes one. That is now a live concern rather than a theoretical one, since TJ-009f's table exists.
- **Branch:** `feat/hard-delete-doctor` — **cut from `feat/working-hours-selector`, not from `master`.**

**Planner verification (static half):** 2026-08-15 — read the full `git diff feat/working-hours-selector..feat/hard-delete-doctor`. **2 files, 125 insertions, 8 deletions, one commit `4d5ec79`, nothing outside Scope, `prisma/schema.prisma` untouched.** The soft-delete path is byte-identical to what it was, merely nested under `if (!hard)`, so the existing behaviour cannot have changed. The refusal logic reads `_count` for reservations and notes and checks `doctorProfile` before anything is written, and `prisma.user.delete` is reachable only past an empty `blockers` array. `req` is correctly un-underscored. UI confirmed: **Delete permanently** renders only in the archived branch of the ternary, and the confirm button carries `disabled={deleting || deleteConfirm !== deleteTarget.name}`. Re-ran `npm run build`: **exit 0**. eslint baselined against `feat/working-hours-selector`: **1 problem on both sides — zero new.**

**Third spec miscount of mine, caught by the executor.** Verification predicted `grep -n '_count'` would return one hit; it returns **five**, because the code block I wrote in Instruction 1 itself contains five occurrences — one in the `select` and four in the `blockers` reads. The executor flagged it as a write-up error rather than silently "fixing" the code to match, which is exactly right. **The pattern across TJ-009b, TJ-009e and TJ-009g is the same: I asserted a literal in Verification without deriving it from the code I had just written in Instructions.** A grep count is only a check if it is computed, not guessed — and a wrong expected value is worse than no check, because it trains an executor to explain away failing checks. Recorded in the notes below.

**Still outstanding, and the negative cases are the ones that matter:** a doctor with reservations must return 409 **and still exist afterwards**; a doctor with a linked public profile must return 409; a clean doctor must disappear from both filters; and a `DELETE` **without** `?hard=true` must still perform the old soft delete. Test the refusal against the live doctor that genuinely has reservations rather than trusting the count query. **Do not exercise this endpoint casually — it deletes rows.** Last in the chain. TJ-009c is already in it, so the *Delete* label no longer means "resign" — that ordering was a precondition and it is satisfied.
- **Why:** TJ-009 §7's hard half. `DELETE /api/employees/doctors/[id]` sets `status: "RESIGNED"` (`doctors/[id]/route.ts:96-99`) while the button that calls it says *Delete*. Nothing in this application has ever removed a `User` row.

**Planning pass:** 2026-08-15 — read `prisma/schema.prisma` relations in full and both doctor endpoints. Confirmed the referential actions, which decide the whole shape of this task: `Reservation.doctor` (`schema.prisma:171`) and `Note.doctor` (`schema.prisma:202`) are both required relations with no `onDelete`, so Prisma applies **Restrict** — the database itself refuses to delete a doctor who has ever been booked or noted. `DoctorProfile.userId` is **optional** with no `onDelete`, so it defaults to **SetNull**: deleting a doctor silently unlinks their public profile rather than blocking, and leaves the profile alive and publishable. That last one is not in the original capture and is the trap in this task.

**Decision taken (assumption) — the conservative reading, and the only one that cannot destroy clinical records.** A hard delete is offered **only** for a doctor with zero reservations and zero notes. Where either exists, the delete is refused with a count and an explanation, and the admin is pointed at Resign instead. Reservations are **never** reassigned and **never** cascade-deleted: a physiotherapy session is a clinical record, reassigning it would falsify who treated the patient, and deleting it would destroy history the clinic may be required to keep. If the user later wants reassignment, that is a separate decision and a separate task — this one is deliberately the safe subset, and it still solves the real case, which is removing a mistakenly-created account.

**The `DoctorProfile` loose end must be handled explicitly, not left to the default.** A doctor eligible for hard delete may still have a linked public profile; `SetNull` would leave it orphaned on the public site. The delete therefore refuses if a linked `DoctorProfile` exists, naming it, and directs the admin to remove the profile first (TJ-013's territory).

**Scope — touch only these:** `src/app/api/employees/doctors/[id]/route.ts`, `src/app/admin/employees/doctors/page.tsx`.

**Do not touch:** the schema — the RESTRICT behaviour is load-bearing here and must not be relaxed to CASCADE to make the feature easier. No secretary file: TJ-010 §1 is the genuinely unblocked hard delete (a secretary has no inbound foreign keys at all) and is its own task.

**Approach:** extend the existing `DELETE` with a `?hard=true` query parameter rather than adding a route, so the soft path stays exactly as it is. The handler counts `reservations` and `notes` and checks `doctorProfile` before touching anything, and returns **409** with the specific blocker — `{ error: "Cannot delete: this doctor has 12 reservations and 3 notes. Resign them instead." }`. Only a doctor clean on all three is removed with `prisma.user.delete`. In the UI the button lives on **Archived** rows only, is labelled **Delete permanently**, and requires a typed confirmation of the doctor's name — this is the one irreversible action in the admin area and a single `confirm()` is not enough friction for it.

**Anchors verified mechanically 2026-08-15** against the tip of `feat/working-hours-selector`, `\r` stripped — each matches exactly once.

**Instructions — `src/app/api/employees/doctors/[id]/route.ts`:**

1. Replace the entire `DELETE` handler — from the comment line `// DELETE /api/employees/doctors/[id] — soft delete (set status to RESIGNED)` through its closing `}` — with:
```ts
// DELETE /api/employees/doctors/[id]
//   default        → soft delete (set status to RESIGNED)
//   ?hard=true     → permanent removal, refused if the doctor is referenced
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hard = req.nextUrl.searchParams.get("hard") === "true";

    if (!hard) {
        // Soft delete — set status to RESIGNED instead of permanent deletion
        await prisma.user.update({
            where: { id },
            data: { status: "RESIGNED" },
        });

        return NextResponse.json({ message: "Doctor marked as resigned" });
    }

    // Hard delete. Reservations and notes are RESTRICT at the database level and
    // are clinical records besides — they are never reassigned and never cascade
    // away with the doctor. DoctorProfile.userId is SET NULL, which would leave a
    // live public profile silently unlinked, so that is refused too rather than
    // left to the default.
    const doctor = await prisma.user.findFirst({
        where: { id, role: "DOCTOR" },
        select: {
            name: true,
            _count: { select: { reservations: true, notes: true } },
            doctorProfile: { select: { id: true } },
        },
    });

    if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const blockers: string[] = [];
    if (doctor._count.reservations > 0) {
        blockers.push(`${doctor._count.reservations} reservation(s)`);
    }
    if (doctor._count.notes > 0) {
        blockers.push(`${doctor._count.notes} note(s)`);
    }
    if (doctor.doctorProfile) {
        blockers.push("a linked public profile");
    }

    if (blockers.length > 0) {
        return NextResponse.json(
            {
                error: `Cannot delete ${doctor.name}: they have ${blockers.join(" and ")}. Resign them instead.`,
            },
            { status: 409 }
        );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Doctor deleted permanently" });
}
```
   **Note the signature change:** the first parameter goes from `_req: NextRequest` to `req: NextRequest`, because the query string is now read. Leaving it underscored will not compile against its own use.

**Instructions — `src/app/admin/employees/doctors/page.tsx`:**

2. Directly after the line `    const [legacyHours, setLegacyHours] = useState("");`, add:
```
    const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
```
3. Directly after the `handleReEnrol` function's closing `    };`, add:
```

    const openDelete = (doc: Doctor) => {
        setDeleteTarget(doc);
        setDeleteConfirm("");
        setDeleteError("");
    };

    const handleHardDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError("");
        const res = await fetch(`/api/employees/doctors/${deleteTarget.id}?hard=true`, {
            method: "DELETE",
        });
        setDeleting(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setDeleteError(data.error || "Could not delete this doctor.");
            return;
        }
        setDeleteTarget(null);
        fetchDoctors();
    };
```
4. Replace the action-buttons block:
```
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(doc)}>Edit</button>
                                        {doc.status === "ACTIVE" ? (
                                            <button className="btn-sm btn-delete" onClick={() => handleResign(doc.id)}>Resign</button>
                                        ) : (
                                            <button className="btn-sm btn-edit" onClick={() => handleReEnrol(doc.id)}>Re-enrol</button>
                                        )}
                                    </div>
```
   with:
```
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(doc)}>Edit</button>
                                        {doc.status === "ACTIVE" ? (
                                            <button className="btn-sm btn-delete" onClick={() => handleResign(doc.id)}>Resign</button>
                                        ) : (
                                            <>
                                                <button className="btn-sm btn-edit" onClick={() => handleReEnrol(doc.id)}>Re-enrol</button>
                                                <button className="btn-sm btn-delete" onClick={() => openDelete(doc)}>Delete permanently</button>
                                            </>
                                        )}
                                    </div>
```
   **Delete permanently appears on Archived rows only.** A doctor must be resigned first, which makes the irreversible action a deliberate second step rather than a mis-click next to Edit.
5. Directly after the closing `)}` of the existing edit-modal block — that is, immediately before the line `            <style jsx>{\`` — add the confirmation modal. It reuses the file's existing `.modal-overlay` / `.modal-card` / `.modal-actions` / `.error-msg` / `.form-group` classes, so it needs no new CSS beyond step 6:
```
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-card modal-narrow" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete {deleteTarget.name}?</h2>
                        <p className="delete-warning">
                            This permanently removes the account and cannot be undone. It is refused if
                            this doctor has any reservations, notes, or a linked public profile.
                        </p>
                        {deleteError && <div className="error-msg" role="alert">{deleteError}</div>}
                        <div className="form-group">
                            <label>Type <strong>{deleteTarget.name}</strong> to confirm</label>
                            <input
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button
                                className="btn-danger"
                                onClick={handleHardDelete}
                                disabled={deleting || deleteConfirm !== deleteTarget.name}
                            >
                                {deleting ? "Deleting…" : "Delete permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
```
6. In the `<style jsx>` block, directly after the line
   `        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }`
   add:
```
        .modal-narrow { max-width: 420px; }
        .delete-warning { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem; line-height: 1.5; }
        .btn-danger {
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        .btn-danger:hover:not(:disabled) { background: #b91c1c; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
```

**Verification:** build; no new eslint problems (baseline against `feat/working-hours-selector`, **not** `master`); `grep -n 'hard=true' src/app/admin/employees/doctors/page.tsx` returns exactly one hit; `grep -n '_count' src/app/api/employees/doctors/\[id\]/route.ts` returns one hit. **Runtime deferred** — record, and note **the negative cases are the important ones here**: a doctor with reservations returns 409 and is **still present afterwards**; a doctor with a linked profile returns 409; a clean doctor is removed and disappears from both filters; and a `DELETE` **without** `?hard=true` still performs the old soft delete unchanged. Test the refusal against a doctor that genuinely has reservations — the live database has exactly one — rather than trusting the count query. Confirm the confirm-button stays disabled until the typed name matches exactly.

**Done when:**
- [ ] A doctor with any reservation, note, or linked profile cannot be hard-deleted, and is told why
- [ ] A clean doctor can be, from the Archived view, behind a typed confirmation
- [ ] The existing soft delete is byte-for-byte unchanged in behaviour
- [ ] No clinical record is ever reassigned or destroyed
- [ ] Diff confined to the two Scope files

---

### TJ-010 — Employees / secretaries — reported issues

- **Status:** BACKLOG — no planning pass. Do not execute against this ID.
- **Why:** Six issues, five of them the same as TJ-009's. Filed separately because the user did, but most should ship as one change across both surfaces rather than twice.

**Verified against `src/app/admin/employees/secretaries/page.tsx` and `src/app/api/employees/secretaries/[id]/route.ts`:**

1. **Hard delete.** **Real** — `DELETE` sets `RESIGNED`, same as doctors. **Easier than the doctor case:** a secretary has *no* inbound foreign keys at all — no reservations, no notes, no profile — so the delete is genuinely unblocked. This is the one hard delete in the batch that can ship without a product decision first.
2. **Working-hours selector.** **Real**, identical to TJ-009 §3 → now **TJ-009e**, blocked on the storage shape.
3. **Show password + repeat password.** **Real**, identical to TJ-009 §4–5 → **closed by TJ-009a**, which covers both secretary forms as well as both doctor ones. Nothing is left here; do not re-file it when TJ-010 is passed.
4. **Archive view for soft deletions.** **Real**, identical to TJ-009 §7 → now **TJ-009c**, which covers both surfaces and carries the vocabulary decision below.
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

## Visual review of the TJ-009 stack — 2026-08-15

Run at the user's instruction against the **tip of the chain** (`feat/hard-delete-doctor`, `4d5ec79`), which contains all five commits, on `npm run dev` at :3000 in a live admin session. Reviewing the tip rather than each branch is deliberate: the tip is the state that would ship, and a defect only visible in combination would be missed by five isolated reviews.

**Every check below was asserted through the DOM or the HTTP status, not by eye.** Two screenshots were taken as corroboration, not as evidence.

**First, that the code under test was actually live.** `#confirmPassword`, `.chip`, `.hours-row` and the `?hard=true` handler were all confirmed present before anything was concluded — a dev server started on the wrong branch looks identical.

### TJ-009b — the gate holds, and it is enforced server-side

Sent directly at the API, bypassing the UI, because a gate that exists only in the form is not a gate:

| request | result |
|---|---|
| `PUT` with a new password and **no** `adminPassword` | **400** — refused |
| `PUT` with a new password and a **wrong** `adminPassword` | **403** — refused |
| `PUT` with no password at all (ordinary edit) | **200** — unaffected |

That is check (f), the one no diff could establish. In the UI, *Your Password* is absent on open, appears the moment a new password is typed, and disappears when it is cleared — on both the doctor and secretary modals.

### TJ-009c — round trip proven in both directions

Chips read `Active 1 / Archived 1` with the resigned doctor hidden from the default view. **Re-enrol** moved the account to `ACTIVE` (confirmed by re-reading the API, not the UI), and **Resign** moved it back to `RESIGNED`. Counts and the filter-aware empty messages (`No archived doctors`, `No active secretaries`) tracked correctly throughout. `>Delete<` appears nowhere. Secretaries archived rows correctly offer `Edit / Re-enrol` and **no** permanent delete — that is TJ-010 §1's job, not this chain's.

**Not exercised:** an actual login by the re-enrolled account. The status round-trip was proven to reach the database, and `auth.ts:36` gates sign-in on exactly that value, but the sign-in itself was not performed — entering a password is out of bounds for me.

### TJ-009d — the self-exclusion clause works

- Saving a doctor **with their own colour** → **200**. This is the `id: { not: id }` case; without it every edit would have been refused.
- Taking a **resigned** doctor's colour → **200**. Colours are released on resignation, as decided.
- Taking an **active** doctor's colour → **409**, message naming the holder. Proven by temporarily re-enrolling the second doctor so two were active at once, then restoring.
- On `/new`: exactly **1 of 12** swatches disabled — `#fbbf24`, the active doctor's — at `opacity: 0.25` with the title *"Already used by another doctor"*, while the resigned doctor's `#6ee7b7` stayed available.

### TJ-009e — canonical format round-trips, legacy data survives

Opening a doctor stored as `"9-7"` showed **empty** time controls and the hint `Currently: 9-7` — the unparseable legacy value is visible rather than silently destroyed. Setting 09:00→17:00 stored **exactly `"09:00-17:00"`**, and reopening put `09:00` and `17:00` back into the two controls with the legacy hint correctly gone. **Filling only one side serialised to `""`, not `"09:00-"`** — the failure `formatWorkingHours` exists to prevent, confirmed by intercepting the outgoing `PUT` body.

### TJ-009g — the refusal holds, and nothing was deleted

The archived doctor genuinely has 1 reservation, so the destructive path could be exercised safely — it must refuse. It did:

- **HTTP 409**, body *"Cannot delete Test Delete : they have 1 reservation(s). Resign them instead."*
- The modal stayed open with the error rendered in it.
- **The doctor still existed afterwards** — re-read from the API, not assumed.

The typed-name gate behaves: disabled on an empty box, disabled on wrong text, enabled only on an exact match. *Delete permanently* renders on archived rows only.

**Not exercised — needs the user's decision:** the *successful* deletion of a clean doctor. Both doctors in the database are referenced, so proving it would mean creating an account and destroying it. That is irreversible and was not assumed to be authorised.

### Closed by the user, 2026-08-15 — the two checks I could not perform myself

Both required typing a password, which is out of bounds for me, so the user ran them and reported the results. Designed as a controlled experiment: **same username, same password, only `status` changed**, so a difference in outcome can only be caused by re-enrolment.

- **TJ-009b's `200` path — passed.** Setting a new password on `DeleteTest` with the correct admin password in the *Your Password* field saved cleanly. Together with the earlier `400`/`403` results, all three branches of the gate are now proven.
- **TJ-009c end-to-end — passed.** While `RESIGNED`, `DeleteTest` could **not** sign in with the newly-set password. After re-enrolment, the **same credentials signed in successfully**. That closes the one link the API could not prove on its own: `status: "ACTIVE"` reaching the database really does restore the ability to log in.

**Side effect worth keeping:** `DeleteTest` is now an `ACTIVE` doctor account with a password the user knows. The TJ-005a note recorded that *"nothing in the repo can log itself in"* — that is no longer true, and a second role is now available for any future review that needs one. Resign it if it is ever in the way; it is a UI click.

### Database left exactly as found

Both doctors back to `"9-7"`, `Test Delete` RESIGNED on `#6ee7b7`, `Test Delete2` ACTIVE on `#fbbf24`, one secretary RESIGNED. Every test mutation — a re-enrol, a resign, two colour changes and two working-hours writes — was reverted and then re-read to confirm. No account was created and none was deleted.

---

## Notes for the planner

Findings reported by the executor, or surfaced during a pass, that fall outside the scope of the task that turned them up. The planner triages these into tasks. **The executor does not write here** — it reports in conversation and the planner records.

- **The employee tables clip their own Actions column on a phone, and the app already ships the fix elsewhere.** Measured at 320px during the TJ-009 visual review, inside a same-origin iframe: `.data-table` is **804px wide inside a 256px `.table-container`**, and that container is `overflow: hidden` — so the Actions column is not merely off-screen, it is **unreachable**, with no scroll. On the Archived tab that hides *Re-enrol* and *Delete permanently* entirely. **Pre-existing and not caused by the TJ-009 chain** — `git diff master..feat/hard-delete-doctor` does not touch `.table-container`. The fix is one declaration and it is already in this repo: `admin/blog/page.tsx` uses `overflow: hidden; overflow-x: auto;` on the same class while both employee pages use `overflow: hidden` alone. **TJ-009g raises the stakes**, because it puts an irreversible action in the column a phone cannot reach. Fold into the same 320px admin task as the navbar overflow below; the two are the same bug family and the navbar offenders (`.dropdown-panel`, `.dropdown-item`) were re-confirmed in the same run at `scrollWidth 415` vs a 320px viewport. (Found during the TJ-009 visual review.)
- **Redaction in the browser tool fires on message *content*, not just key names, and it will silently blank a result you needed.** During the TJ-009b gate check, returning `{ code, error }` from the API came back as `[BLOCKED: Sensitive key]` — not because of the key names, which I renamed twice, but because the response body contained the phrase *"…your own password…"*. The fix that worked: return **derived values only** — a bare status code, or a boolean from a regex — never the raw message. Worth knowing before concluding that an endpoint returned nothing. Same class of trap as reading `res.status` alone: the tool is shaping what you see. (Found during the TJ-009 visual review.)
- **A grep count in a Verification block must be computed, not guessed — I got three wrong across five tasks and every one was the same mistake.** TJ-009b predicted an eslint baseline of "2 errors + 2 warnings" (carried over from TJ-009a, whose file set included two pages this task did not touch — real answer 2+0); TJ-009e told the executor to add a three-function import to files that use one of them; TJ-009g predicted `grep -n '_count'` would return one hit when the code block in its own Instructions contains five. **The common cause is reusing a literal from the previous task instead of deriving it from the code just written.** Each was caught, twice by the executor rather than by me — which is the system working, but a wrong expected value is worse than no check at all, because an executor that learns to explain away failing checks will eventually explain away a real one. **Rule: any number asserted in Verification gets derived from the Instructions block before dispatch, or it is not written.** (Found across TJ-009b, TJ-009e, TJ-009g.)
- **Five stacked branches now sit verified-but-unmerged, and they must be merged in chain order.** `feat/admin-reauth-password-change` → `feat/employee-archive-view` → `feat/unique-doctor-colours` → `feat/working-hours-selector` → `feat/hard-delete-doctor`, each cut from the one before because the visual review that gates merging was deferred by the user on 2026-08-15. The chain touches **8 source files and no schema**, and carries no `tasks.md` change (verified from the merge base `e1bce67`). **Merging the tip alone brings all five in**, since each contains its predecessor — but merge them one at a time with `--no-ff` so each task stays a legible unit, and do the runtime review of the whole stack in one pass first. Do not rebase them; the chain is the only record of what depended on what. (Recorded 2026-08-15.)
- **`tasks.md` lives on `master`, so editing it while a task branch is checked out silently loses work — and it looks like the edit simply vanished.** Hit while stacking TJ-009d on the TJ-009c chain: `tasks.md` was committed to `master`, then a task branch was checked out (which reverted the file to the branch's older copy, since the chain does not contain the `master` commit), then the next task's instructions were written onto that stale copy. Nothing warned; the file on disk just quietly lacked the previous two verification blocks, and the next `Edit` failed with "string not found" against text that unambiguously existed on `master`. **Recovering was easy only because the two edit sets were in different task sections** — copy the working file aside, `git checkout -- tasks.md` to clean the branch, return to `master`, and re-apply. The rule that avoids it entirely: **plan and pin anchors while on the task branch, but make every `tasks.md` edit on `master`.** Reading a branch's files and writing the planner's file are two different operations and must not be interleaved on one checkout. (Found while pinning TJ-009d.)
- **A component's layout can be reviewed without ever logging in, by lifting its CSS and markup into a static harness — and it is worth doing even when the real page is reachable.** TJ-009a's visual review was locked behind an admin login, but both of its named layout risks were pure geometry. Copying the `<style jsx>` rules and the JSX verbatim into a plain HTML file, serving it over HTTP (the browser extension refuses `file://`), and loading it in iframes at 320px and 1440px answered both questions with real computed styles and real media queries. **The part that made it evidence rather than a guess was the control:** the same harness built from the `master` version of the component, measured in the same run. That is what turned "the modal overflows at 320px" from a blocker into a proven pre-existing condition — both sides overflowed by exactly 123px. A harness without a control only tells you the absolute number, which is the number you cannot interpret. Note the honest limit: this proves CSS geometry, not that the component renders with real data or that its handlers fire. (Found during the TJ-009a visual review.)
- **The admin edit modals have never fitted a 320px screen, and it is the same root cause as the navbar note below.** `.form-grid` in both `employees/doctors/page.tsx` and `employees/secretaries/page.tsx` is a hard `grid-template-columns: 1fr 1fr` with no media query, so the card's content is 443px wide inside a 320px card — 123px clipped, with an inner horizontal scrollbar. Measured on `master`, so it predates the queue and TJ-009a neither caused nor worsened it. The `/new` pages do have a `@media (max-width: 640px)` block that collapses `.field-row`; the modals were simply never given one. **Fold this into the same task as the navbar overflow** — one 320px pass over the admin area, rather than a media query bolted onto whichever task happens to touch a modal next. (Found during the TJ-009a visual review.)
- **`{formError && …}` is indented four spaces too deep in both modals, and it is my spec's fault, not the executor's.** TJ-009a step 6 quoted the line inside a numbered-list code block, so the list's own indent was carried into the literal and the executor applied it faithfully — which is exactly the behaviour to want from an executor. Whitespace only; JSX and output are unaffected. **Deliberately not amended during review**, on the TJ-008b precedent that quietly editing verified code is how a diff stops matching its task. TJ-009b rewrites this exact block, so fix it there. The transferable lesson for writing tasks: **a code literal nested inside a numbered list inherits the list indent — put anchor-sensitive blocks at the left margin, or state the exact column.** (Found during the TJ-009a verification.)
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
