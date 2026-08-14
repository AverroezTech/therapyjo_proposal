# CLAUDE_INSTRUCTIONS.MD

You are the coding agent for this project. Read this file completely before doing anything.

---

## Phase 0 — Discovery (Run Once, First Interaction)

Before writing any code, you must understand the project. Do this **automatically** on your first interaction:

### Step 1: Scan the repo
Infer everything you can silently from:
- `package.json` (dependencies, scripts, package manager from lockfile)
- Config files (`next.config.*`, `vite.config.*`, `tailwind.config.*`, `tsconfig.json`)
- Existing `src/` structure (routing, components, patterns)
- `public/` assets

### Step 2: Ask the user these questions
Present them as a numbered list. Do not proceed until answered.

1. **Project name & client** — Who is this for? (e.g., "SSLS — logistics company in KSA")
2. **Sector** — What industry? (logistics, hospitality, tech, creative portfolio, ecommerce, other)
3. **Design feel** — Pick one or describe:
   - 🔲 Sharp Edges (industrial, zero border-radius, precision)
   - 🔵 Rounded Modern (soft corners, friendly, consumer)
   - 🟣 Glassmorphic Dark (blur, transparency, premium tech)
   - ✏️ Custom (describe it)
4. **Brand colors** — Primary, secondary, accent. Or say "suggest based on sector."
5. **Languages** — Monolingual (EN) or bilingual? Which languages? RTL needed?
6. **Animation preference** — Framer Motion, GSAP, CSS-only, or "make it feel alive but don't overdo it"?
7. **Anything special?** — Video hero, 3D elements, specific sections, content rules, etc.

### Step 3: Lock the answers
After the user responds, write a `## Project Profile` section at the bottom of this file with the finalized answers. This becomes the source of truth for all future work.

---

## Hard Rules (Always Apply)

### 1. No dependency creep
- Do NOT add npm packages unless they already exist in `package.json` or the user explicitly requests it.
- If something is needed but not allowed, propose an alternative using existing deps.

### 2. Patch-only development
- Prefer editing existing files over creating new ones.
- Output changes as small, reviewable diffs. No massive rewrites.
- If you must create files, only create them in directories that already exist in the project.

### 3. Respect what's already there
- Use existing components, design tokens, and patterns first.
- No random colors or spacing — use what the project already defines.
- No inline styles unless the codebase already uses them.
- Match the naming conventions you see in the repo (PascalCase components, camelCase utils, etc.)

### 4. Build must pass
- Your work is not "done" until the build succeeds.
- Infer the correct commands from `package.json` scripts.
- Infer the package manager from the lockfile (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm).

---

## Design Standards (Apply Based on Project Profile)

### Typography
- Use professional fonts (Google Fonts like Inter, Outfit, Playfair Display) — never browser defaults.
- Proper heading hierarchy: one `<h1>` per page, then `<h2>`, `<h3>`, etc.
- Uppercase + wide tracking for section titles in industrial/premium projects.

### Color Discipline
- Never use raw hex in components. Use design tokens / CSS variables / Tailwind theme colors.
- Hero text over video/images: ensure contrast. Use pure white if the brand color doesn't pass.
- Test button contrast against both the lightest and darkest parts of any background image.

### Spacing
- Clean rhythm — no random margins. Use consistent padding scale.
- Generous whitespace between sections (py-20 to py-28 range for premium feel).
- All content in `max-w-* mx-auto` containers — nothing bleeds to the edge on wide screens.

### No Emojis in Premium Projects
- Replace emojis with proper icons (Lucide, Heroicons, custom SVGs).
- Exception: if the project profile says the vibe is casual/playful.

---

## Responsive Rules (Always Apply)

- **Mobile-first.** Every layout must work at 320px.
- **Hero sections:** Use `min-h-svh` (dynamic viewport height), not fixed pixel values.
- **Fluid containers:** Use responsive padding (`px-4 sm:px-6 lg:px-8`), not fixed widths (`w-[95%]`).
- **Decorative elements:** Hide complex visual layers below 640px to prevent overflow and improve performance.
- **Test range:** 320px → 2560px.

---

## Animation Rules (Always Apply)

### Philosophy: Soul First
1. **Never strip animations for performance.** A "dead" page is worse than a slow one.
2. Focus on **invisible optimizations** first: better asset formats, DOM reduction, async decoding.
3. If an animation is heavy, swap its **engine** (e.g., CSS `@keyframes` instead of JS-driven) — don't delete the effect.

### Safety
- Avoid setting `opacity: 0` as initial state in scroll-triggered animations — if the trigger doesn't fire, elements stay permanently invisible.
- Prefer declarative approaches (`whileInView`, CSS `@keyframes`) over imperative ones (manual GSAP timelines) unless precision sequencing is needed.
- Scope all JS animations to a container ref for automatic cleanup on unmount.

### Video Backgrounds
- Must autoplay on initial load AND after any client-side navigation (locale switch, route change).
- Listen for `canplay`, `loadeddata`, and `visibilitychange` to handle browser autoplay policies.

---

## Performance Rules (Always Apply)

### Assets
- All images should be WebP or AVIF. Delete legacy JPG/PNG after migration.
- `loading="lazy"` on all below-the-fold images.
- `decoding="async"` on all non-hero images.
- `fetchPriority="high"` on the hero image/video only.
- Keep initial viewport payload under 2MB.

### Code
- Lazy-load below-the-fold sections (`React.lazy` + `Suspense fallback={null}`).
- No infinite JS animations in the footer or off-screen sections — they burn CPU while invisible.
- Use `will-change: transform, opacity` sparingly for GPU promotion.

### Hygiene
- Delete unused components, zombie assets, and stale build artifacts.
- Clear `.next/` or `dist/` when debugging stale build errors.

---

## i18n Rules (Apply If Bilingual)

- Use institutional/formal translations for business names — NOT phonetic transliterations.
- `generateStaticParams()` must exist on **every** page inside a dynamic `[locale]/` route (not just layout).
- Root `/` redirect must be client-side for static export compatibility.
- Use `key={locale}` on the main wrapper to re-trigger animations on language switch.
- Test both LTR and RTL layouts thoroughly.

---

## Agent Workflow (Every Request)

1. **Plan** — State what files you'll touch and what changes.
2. **Implement** — Smallest diff possible. Reuse existing patterns.
3. **Verify** — Run the build. Fix failures. No "it should work" responses.
4. **Summarize** — What changed, where, how to preview, any tradeoffs.

Queued work follows the stricter **Planner / Executor Protocol** below instead.

---

## Definition of Done

A request is done when:
- [ ] The change exists and matches project conventions
- [ ] Build passes
- [ ] Mobile (320px) is not broken
- [ ] Desktop/wide (2560px) is not broken
- [ ] Animations are visible and working (nothing hidden by bad initial state)
- [ ] If applicable: video plays, navigation works, locale switching works
- [ ] The diff is small and reviewable

---

## Planner / Executor Protocol

Queued work is split between two agents. `tasks.md` in the repo root is the queue they share.

### Roles

**Planner — Opus.** Owns `tasks.md` exclusively. It is the only agent that writes to that file: it adds tasks, runs planning passes, sets every status, and marks work `DONE`. It also verifies the executor's output before doing so.

**Executor — Sonnet.** Reads `tasks.md`, implements one task, reports back. It **never edits `tasks.md`** — not to claim a task, not to record a status, not to append a note. Anything it needs to tell the planner goes in its report.

### The planning pass (mandatory gate)

**No task may be executed until the planner has run a planning pass on it.** A task written from memory, from a status report, or from another document has not had a planning pass. Being obviously correct does not exempt a task.

The pass is per-task, not per-batch, and consists of:

1. **Read the code.** Open every file in the blast radius — the files that will change and the files that consume them. Not a search, a read.
2. **Verify every claim.** Each statement in the task's *Why* must be confirmed against the code as it is now. A claim that turns out to be wrong invalidates the task, not just the sentence.
3. **Pin the targets.** Exact paths. Exact anchor strings to match against, quoted verbatim from the file. Never bare line numbers — they move.
4. **Supply every literal.** Hex values, copy strings for both `en` and `ar`, env var names, routes, commands. If the executor would have to choose a value, the pass is not finished.
5. **Name the regression risk.** What could this break that the task does not touch? That answer becomes the Verification steps. "Build passes" alone is not verification for a UI change.
6. **Check the constraints.** No new dependency required? Fits in roughly four files or fewer? One concern only? If not, split the task and pass each piece separately.
7. **Record the pass.** Write a `**Planning pass:**` block into the task: the date, the files actually read, and what was confirmed or corrected. This block is the evidence the gate was cleared — a task carrying no pass block is not `READY`, whatever its status line says.

If the pass reveals the task needs a decision or an asset that does not exist yet, it ends in `BLOCKED` with the blocker named. That is a successful pass, not a failed one.

### Task lifecycle

| Status | Meaning | Who moves it |
|---|---|---|
| `BACKLOG` | Captured. No planning pass run. Executor must not touch it. | Planner |
| `BLOCKED` | Pass run, or attempted; needs a decision or an external input. Blocker is named in the task. | Planner |
| `READY` | Planning pass complete, evidence recorded. Executor may pull it. | Planner |
| `IN PROGRESS` | Executor has created the branch and started. | Planner, on the executor's report |
| `REVIEW` | Executor has reported completion. Awaiting planner verification. | Planner, on the executor's report |
| `DONE` | Planner has independently verified the work and recorded the commit SHA. | Planner |

`REVIEW → DONE` requires the planner to check the work itself: read the diff, confirm the Scope was respected and nothing outside it changed, re-run the Verification commands, and tick the Definition of Done. The executor's own claim that it passed is not the evidence. If it does not hold up, the status goes back to `READY` with the gap written into the task.

### Branching

Format: `<purpose>/<task-slug>` — e.g. `bugfix/login-creds`

One branch per task, cut from current `master`. The planner assigns the full branch name during the planning pass; the executor uses it verbatim and never invents one.

| Purpose | Use for |
|---|---|
| `feat` | New user-facing capability |
| `bugfix` | Something is broken and should not be |
| `chore` | Housekeeping, deps, config, asset cleanup |
| `refactor` | Structure change, no behavior change |
| `perf` | Speed, payload, render cost |
| `docs` | Documentation and spec files only |
| `content` | Copy, translations, seeded content |

`<task-slug>` is kebab-case, two to four words, naming the change rather than the file.

The executor commits to its branch. It does **not** push, merge, rebase, or open a PR unless the task's Scope says to. Since `tasks.md` is planner-owned and lives on `master`, task branches never carry changes to it.

### Executor rules

1. Pull the topmost `READY` task unless the user names another. Never a `BACKLOG` or `BLOCKED` one.
2. Re-read the task in full, plus this file, before starting.
3. Create the task's branch. Never work on `master`.
4. Implement only what Scope lists. Anything found outside Scope is reported, not fixed.
5. Run every Verification command. All must pass.
6. Commit to the branch.
7. Report: what changed, where, the full verification output, the commit SHA, and anything left undone or discovered.

**Stop and ask** if: a path in the task does not exist, an anchor string does not match, Verification fails for a reason the task does not anticipate, or the work would need a package not already in `package.json`.

### Task template

```markdown
### TJ-000 — Short imperative title

- **Status:** READY
- **Branch:** `purpose/task-slug`
- **Why:** What is wrong or missing, and what changes when this lands.

**Planning pass:** YYYY-MM-DD — files read; what was confirmed; what was corrected.

**Scope — touch only these:**
- `path/to/file.tsx`

**Do not touch:** anything else. Named exceptions and in-use lookalikes go here.

**Instructions:**
1. Mechanical numbered steps. Quoted anchor strings, exact replacement values.

**Verification:**
- `npm run build` passes
- (task-specific checks, covering the named regression risk)

**Done when:**
- [ ] Checklist the planner ticks at REVIEW
```

---

## Project Profile

- **PROJECT_NAME:** Therapy Jo Landing Page
- **CLIENT:** Therapy Jo Physiotherapy Center
- **SECTOR:** Healthcare / Physiotherapy
- **DESIGN_LANGUAGE:** Rounded Modern (soft corners, clean, health/wellness aesthetic)
- **PRIMARY_COLOR:** Light Green (#4CAF93)
- **SECONDARY_COLOR:** Blue (#2A7AB5)
- **ACCENT_COLOR:** White (#FFFFFF)
- **LANGUAGES:** English (EN) + Arabic (AR), runtime toggle via src/app/i18n/translations.ts
- **RTL:** Yes — dir flips ltr↔rtl on language switch; use logical CSS properties (margin-inline-start, text-align: start)
- **ANIMATION_LIB:** GSAP + ScrollTrigger
- **SPECIAL_NOTES:**
  - Hero background: static image public/joint-manipulation.webp via next/image
  - Video background is used on the login page only (public/hero.mp4)
  - Logo: logo.jpg
  - Instagram: @therapyjocenter
  - WhatsApp/Phone: +962799819669
  - Services (9, in shipped order): Cold Laser Therapy, Radio Frequency Therapy, Pelvic Floor Rehabilitation, Electromagnetic Pelvic Floor, Traction Therapy, Sport Rehabilitation, Post-Op Rehabilitation, Pediatric Physical Therapy, Dry Needling & Acupuncture
  - Location: Therapy Jo Physiotherapy Center, Az-Zubayr Ben Al-Awwam St., Amman, Jordan
  - Floating WhatsApp CTA button
  - Google Maps embed for location
  - Landing content sections (src/app/page.tsx, in order): Hero, Marquee, About, Services, Finder, Doctors, BlogPreview, Reviews, Location, ContactCTA
  - Site chrome wraps them in src/app/components/SiteChrome.tsx: GSAPAnimations, AccentHairline, Navbar, Footer, WhatsAppFloat, BookingBar
  - Blog is real routing: /blog and /blog/[slug] (not a state swap)
  - Admin CMS at src/app/admin: blog, doctors, approvals queue
  - Stack: Next.js 16 App Router, React 19, TypeScript, plain CSS in src/app/globals.css, Prisma 7 + Postgres (Supabase), NextAuth v5
  - Design reference: design_handoff_landing_and_blog_cms/README.md and the two .dc.html prototypes
