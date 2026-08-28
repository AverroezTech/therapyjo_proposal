# Data_Reset.md — wiping the test and QA data, 2026-08-28

What was deleted from this application's Supabase Postgres and Storage before the clinic began
real use, why it was deleted in that order, and what to repeat if it is ever needed again.

**Scope.** This touched **only this application's database**. The legacy clinical system runs on a
completely separate database at SmarterASP.NET and was never involved — no connection was opened
to it, no record read from it. See `Production_Cutover.md`, *The one thing that governs everything
else*.

**Authorisation.** The owner confirmed everything in the database was test/QA data entered during
development, and asked for it wiped.

## Counts, before and after

| Table | Before | After |
|---|---|---|
| `Reservation` | 13 | **0** |
| `DoctorProfile` | 10 | **0** |
| `PatientAuditLog` | 7 | **0** |
| `Patient` | 5 | **0** |
| `BlogPost` | 0 | 0 |
| `ClinicalIntake` | 0 | 0 |
| `EmployeeFile` | 0 | 0 |
| `Note` | 0 | 0 |
| `PatientFile` | 0 | 0 |
| `PendingChange` | 0 | 0 |
| `SOAPNote` | 0 | 0 |
| `User` | 6 | **6 — untouched in this pass** |

35 rows, one transaction. `User` was deliberately excluded and handled separately; see *The
account that was already there*.

## Deletion order, and why it is not arbitrary

```sql
BEGIN;
DELETE FROM "SOAPNote";
DELETE FROM "PatientAuditLog";
DELETE FROM "PatientFile";
DELETE FROM "ClinicalIntake";
DELETE FROM "Reservation";
DELETE FROM "Note";
DELETE FROM "Patient";
DELETE FROM "PendingChange";
DELETE FROM "DoctorProfile";
DELETE FROM "BlogPost";
DELETE FROM "EmployeeFile";
COMMIT;
```

**`Reservation.patient` is a required relation with no `onDelete`**, so Prisma's default is
`Restrict` — deleting a patient who still has reservations fails outright. Reservations must go
first. Several other relations do cascade (`SOAPNote` from `Reservation`, `PatientFile` /
`ClinicalIntake` / `PatientAuditLog` from `Patient`, `EmployeeFile` from `User`), but every table
is deleted **explicitly** rather than relying on those cascades: for a one-shot irreversible
operation, an auditable list beats implied behaviour.

Wrapped in one transaction so a foreign-key failure rolls everything back rather than leaving the
database half-wiped.

## Sequence resets

Eight tables use `@default(autoincrement())`. Identity sequences do not rewind on `DELETE`, so
without this the first real patient would have been ID 6 and the first real reservation ID 14:

```sql
SELECT setval(pg_get_serial_sequence('"Patient"', 'id'), 1, false);
```

…and the same for `EmployeeFile`, `PatientFile`, `ClinicalIntake`, `PatientAuditLog`,
`Reservation`, `SOAPNote` and `Note`. `User`, `BlogPost`, `DoctorProfile` and `PendingChange` use
`cuid()` and have no sequence.

## Storage is a separate service — the database wipe does not touch it

`prisma/schema.prisma` states it in the `EmployeeFile` comment:

> *"nothing in this application ever removes the underlying object from Supabase Storage."*

Uploaded bytes live in Storage buckets; the database holds only the **path string**. Deleting rows
therefore deletes the pointers and orphans the files. Both buckets were emptied by hand in the
Supabase dashboard:

| Bucket | Holds |
|---|---|
| `clinical-files` (private) | Patient files, X-rays, employee identification documents |
| `uploads` (public) | Profile pictures, doctor photos, blog cover images |

`PatientFile` and `EmployeeFile` were both already `0` before the wipe, so `clinical-files` held
little or nothing. The real content was in `uploads`: the 10 deleted doctor-profile photos plus
profile pictures belonging to deleted accounts.

**This is the step most likely to be forgotten in any future reset**, and it is the one holding
content that looks like patient records.

## The account that was already there

The plan was to delete all 6 `User` rows and seed a fresh admin. **A unique-constraint violation
stopped it**, and that was fortunate: `noorhamami` was already one of the six — created
2026-08-13, before every test account, already `ADMIN`, already `ACTIVE`. Deleting all six would
have destroyed the owner's own login.

The five that were test accounts:

```sql
DELETE FROM "User"
WHERE username IN ('DeleteTest','testdelete','TJ10','TJtest','qa_prodcheck');
```

Named explicitly rather than `WHERE username <> 'noorhamami'`, so the statement is auditable and
cannot over-reach.

**Sequencing that matters if this is ever repeated:** verify the surviving login works *before*
deleting the others. The dashboard is publicly reachable, and there is no recovery path from a
`User` table with no rows in it.

Two related changes went with it:

- The password was reset by generating a bcrypt hash locally (cost 12, matching `auth.ts`) and
  applying it with `UPDATE`. `"updatedAt"` had to be set by hand — `@updatedAt` is a Prisma-side
  default and a raw SQL update does not trigger it. The same is true of `id` and `@default(cuid())`
  if a row is ever inserted directly.
- `AUTH_SECRET` was rotated on Vercel. Auth here is JWT with **no session table**, so a deleted
  user's token keeps verifying until it expires; rotation is what actually revokes it. It requires
  a redeploy to take effect.

### One diagnostic worth remembering

After the password change, login failed while `failedLoginAttempts` stayed at `0`. That counter is
the tell. `src/lib/auth.ts` returns the same generic failure for four different causes, but only
one of them increments it:

| Cause | Increments the counter? |
|---|---|
| Wrong password | **Yes** |
| No such username | No — returns before the check |
| Empty username or password field | No |
| Account locked (5 attempts → 15 minutes) | No |
| `status` is not `ACTIVE` | No |

A counter sitting at `0` therefore proves the attempt never reached the password comparison. The
cause was the login form's `autoComplete="username"` field being filled with the old email address.

## `prisma/seed.ts` no longer invents credentials

It hardcoded `username: "admin"` and fell back to the password `admin123` when `ADMIN_PASSWORD`
was unset — reasonable when it was local-dev tooling, not reasonable now that the dashboard is
publicly reachable at `https://therapyjo.com/login`.

`ADMIN_USERNAME` and `ADMIN_PASSWORD` are now required, `admin123` is rejected by name, and
`ADMIN_EMAIL` is optional with **no synthesised default** — a fabricated address on an account
that receives password resets is worse than none. The validation runs before the connection pool
is constructed, so it fails instantly with a clear message instead of after a connection timeout.
That ordering is also what made it testable while `DATABASE_URL` was stale.

## How it was actually run, and why

**In the Supabase dashboard's SQL Editor**, not from this repo.

The local `.env` cannot reach the database: `DATABASE_URL` is rejected with `28P01 password
authentication failed for user "postgres"`, and `SUPABASE_SERVICE_ROLE_KEY` is absent entirely
(present in `.env.example`, never populated). Vercel's own environment is valid — production reads
*and writes* fine, confirmed against `/api/public/blog`, which performs an `updateMany` promoting
scheduled posts before it reads.

The dashboard route needs no local credentials at all and is the recommended path for any repeat.
Refreshing `.env` from **Project Settings → Database** and **→ API** is the alternative, but note
that resetting the database password invalidates the one Vercel is using and takes production down
until Vercel is updated **and redeployed**.

## No backup was taken

Raised, and declined by the owner on the grounds that the contents were entirely test data.
Recorded here rather than argued: this was a deliberate decision, not an oversight. Supabase Free
has no point-in-time recovery, so there is no undo.

If a future reset wants a cheap safety net without leaving the SQL Editor:

```sql
CREATE TABLE "_bak_Patient" AS SELECT * FROM "Patient";
```

Plain tables, droppable later, no credentials or `pg_dump` required.

## Verification after

- Every table except `User` reads `0`; `User` read `6` before and after the first pass, then `1`.
- `/` `/login` `/blog` `/clinic/` all return `200` on the live domain.
- `/api/public/doctors` and `/api/public/blog` return `[]` — reading successfully against empty
  tables rather than erroring. Neither route has a `try`/`catch`, so a broken connection would
  surface as a `500`, not an empty array.
- `/admin` returns `302` to `https://therapyjo.com/login?callbackUrl=%2Fadmin`.
