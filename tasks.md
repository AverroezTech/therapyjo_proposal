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
| TJ-001 | Sync the Project Profile with the shipped app | DONE | `docs/sync-project-profile` |
| TJ-002 | Remove unreferenced root assets | IN PROGRESS | `chore/prune-root-assets` |
| TJ-003 | Replace placeholder Google Maps embed | BLOCKED | `content/real-maps-embed` |
| TJ-004 | Source Google Reviews from a real API | BLOCKED | `feat/google-reviews-api` |
| TJ-005 | Move content gating to a role capability | BACKLOG | — |
| TJ-006 | Decide the fate of the root icon source files | BACKLOG | — |

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

- **Status:** IN PROGRESS — dispatched 2026-08-14
- **Branch:** `chore/prune-root-assets`
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

- **Status:** BLOCKED — no planning pass run; blocked on client input
- **Branch:** `content/real-maps-embed`
- **Why:** `src/app/components/Location.tsx:14` uses a synthesized embed URL built from approximate coordinates (`!2d35.87!3d31.95`) with a null place ID (`0x0%3A0x0`). It drops a pin near the clinic rather than on it and shows no business card. The design handoff flags this as needing the real embed.

**Blocked on:** the clinic's real Google Maps place embed URL. Open the clinic's Google Business listing → Share → Embed a map → Copy HTML, and supply the `src` value. It cannot be derived — the place ID is issued by Google.

**Planner note:** once the URL arrives, run the pass. Expect a one-line replacement in `Location.tsx` that keeps `loading="lazy"` and the existing `title` attribute; verification is that the pin lands on Az-Zubayr Ben Al-Awwam St., Amman.

---

### TJ-004 — Source Google Reviews from a real API

- **Status:** BLOCKED — no planning pass run; blocked on two decisions
- **Branch:** `feat/google-reviews-api`
- **Why:** `src/app/components/Reviews.tsx` hardcodes a `4.9` rating and a `300+` review count (lines 30 and 33) alongside four invented reviewer quotes with names (lines 9–12), presented to visitors as real Google reviews of a real medical clinic. The design handoff states explicitly: *"Do not hardcode 4.9 / 300+ in production."* This is the most serious open item in the repo and should be resolved before launch.

**Blocked on:**

1. **Integration path.** The handoff recommends the Google Places API (`place_details` with the `reviews` field), fetched server-side and cached with hourly ISR — at most five reviews, plus a reliable rating and total count, and the designed layout survives. The alternative is a third-party widget (Elfsight, Trustindex): more reviews, but vendor markup replaces the design and adds a script dependency. Path 1 recommended.
2. **Credentials.** Path 1 needs a Google Cloud project with the Places API enabled, a server-side API key, and the clinic's Place ID. Calls are billed per request; ISR keeps volume negligible, but billing must be enabled on the account.

**Interim option if launch comes first:** replace the fabricated rating, count, and four quotes with a single honest CTA linking to the clinic's Google listing, keeping the section's visual shell. Ask and the planner will file it as its own task and run the pass.

**Planner note:** the API key must be server-only — never `NEXT_PUBLIC_`. Fetch in a route handler under `src/app/api/public/`, following `src/app/api/public/doctors/route.ts`. Google returns reviews in the reviewer's original language; decide how that interacts with the EN/AR toggle before the pass.

---

### TJ-005 — Move content gating to a role capability

- **Status:** BACKLOG — no planning pass run
- **Branch:** assigned at planning pass
- **Why:** The design handoff specifies that Blog, Doctors, and Approvals are gated by a permission (`canManageContent`) attached to a role, *"so the client can grant a manager access without a code change"* — and explicitly not by a check against one named user. The schema has a flat `Role` enum (`ADMIN` / `DOCTOR` / `SECRETARY`) with no capability layer. Behaviour today is probably correct; the coupling is the problem.

**Before the pass can run, resolve:**
- How content routes gate today. Read `src/middleware.ts`, `src/lib/auth.config.ts`, `src/app/admin/layout.tsx`, and the route handlers under `src/app/api/blog/`, `src/app/api/doctor-profiles/`, and `src/app/api/pending-changes/`. Record what each actually checks — role equality, user ID, or nothing.
- **User decision:** whether the handoff's roles (Head Doctor / Clinic Manager / Staff) replace or map onto the shipped ones (`ADMIN` / `DOCTOR` / `SECRETARY`). Two vocabularies for overlapping concepts; not the executor's call, and not the planner's either.
- Mechanism: a `canManageContent` boolean on `User`, a capability set derived from `Role` in one shared helper, or a permissions table. The derived helper is the smallest change that satisfies the requirement and needs no migration.
- If a schema change wins, this exceeds one task — split it: migration first, then call sites.

---

### TJ-006 — Decide the fate of the root icon source files

- **Status:** BACKLOG — no planning pass run; needs a user decision
- **Branch:** assigned at planning pass
- **Why:** `therapyjo_icons_no_bg/` (nine PNGs) and `therapyjo_icons_no_bg.zip` are tracked at the repo root and referenced by nothing in `src/`. They appear to be the source icons that the shipped `public/icons/*` were derived from. Split out of TJ-002, which deletes only assets with no plausible ongoing value.

**Needs a decision:** keep them at the root as source material, move them somewhere non-shipped, or delete them. Deleting source art is not a call the planner should make unilaterally, and the zip plus the folder are redundant with each other regardless.

---

## Notes for the planner

Findings reported by the executor, or surfaced during a pass, that fall outside the scope of the task that turned them up. The planner triages these into tasks. **The executor does not write here** — it reports in conversation and the planner records.

- `src/app/login/page.tsx:69` carries the comment `{/* Background video — same as landing hero */}`. Stale: the landing hero has been a static WebP since the redesign. A one-line comment fix, too small to file alone — fold it into the next task that touches `login/page.tsx`. (Found during the TJ-002 pass.)
- The Project Profile still carries the bare note `- Logo: logo.jpg`. TJ-001's instructions said to preserve it, correctly — but once TJ-002 deletes the root `logo.jpg`, that line reads ambiguously, since the surviving file is `public/logo.jpg`. Not worth reopening TJ-001; fold `public/logo.jpg` into the next task that edits the profile. (Found during TJ-001 planner verification.)
- **Branches are unmerged.** `docs/sync-project-profile` holds TJ-001 and is not on `master`. The protocol bars the executor from merging and is silent on the planner, so nothing merges without a user decision. Confirm whether completed task branches should be merged to `master`, opened as PRs, or left for manual review.
- ~~`package-lock.json` has one uncommitted line (`"hasInstallScript": true`)~~ — resolved 2026-08-14. Committed to `master` alongside the protocol, because a dirty tree makes every executor's `git status` verification step meaningless. Lesson for future dispatches: **the planner must confirm a clean tree before handing off**, or the executor inherits the planner's own uncommitted work on its branch.
