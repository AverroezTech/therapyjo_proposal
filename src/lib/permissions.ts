import type { Session } from "next-auth";

/**
 * May this user manage public content — Blog posts, public Doctor profiles,
 * and the Approvals queue?
 *
 * The rule lives here rather than inline at each handler so it can be granted
 * without a code change at every call site. ADMIN always holds it; anyone else
 * holds it only if their User.canManageContent column is set (TJ-005b1).
 */
export function canManageContent(
    user: Session["user"] | undefined | null
): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.canManageContent === true;
}

/**
 * May this user see and edit clinical records — the ClinicalIntake (diagnosis,
 * assessment, medical history, treatment plan) and per-session SOAP notes?
 *
 * ADMIN and DOCTOR may; SECRETARY may not. Front-desk staff book, register and
 * file for patients, and that does not require reading their diagnosis.
 *
 * This covers reading as well as writing, and the reading half is the point:
 * the two PUT handlers have refused secretaries since they were written, but
 * the GET handlers served the same records to anyone signed in, so the data
 * reached the browser and only the UI declined to draw it. (TJ-023)
 */
export function canAccessClinical(
    user: Session["user"] | undefined | null
): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.role === "DOCTOR";
}

/**
 * May this user permanently delete a reservation?
 *
 * ADMIN and SECRETARY may; DOCTOR may not. Front-desk staff own the booking
 * calendar and must be able to remove a session booked in error without
 * finding an admin. Doctors record what happened in a session and do not
 * decide whether it exists — they cancel via PATCH status=CANCELLED.
 *
 * Deletion is permanent and is recorded against the patient's audit log with
 * the acting user's id, so "who removed this" stays answerable. (TJ-040)
 */
export function canDeleteReservation(
    user: Session["user"] | undefined | null
): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.role === "SECRETARY";
}
