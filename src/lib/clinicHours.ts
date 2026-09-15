// The clinic's opening window. A session may start at 07:00 at the earliest
// and must end by 19:00 — so the latest one-hour start is 18:00 and the latest
// two-hour start is 17:00.
//
// Checked as plain numbers before any Date is constructed: sessionTime arrives
// as "HH:MM" and the server runs TZ=Asia/Amman while the browser does not, so
// parsing first would make this check disagree with itself for any staff
// member outside Amman. (TJ-042a; extracted here by TJ-047a so that every
// booking write path refuses in the same words.)
//
// Not to be confused with src/lib/workingHours.ts, which parses a *doctor's*
// personal hours from User.workingHours. This is the building's window and
// applies to every reservation, whoever it belongs to.
export const CLINIC_OPEN_HOUR = 7;
export const CLINIC_CLOSE_HOUR = 19;

export type ClinicWindowResult = { ok: true } | { ok: false; error: string };

/**
 * Checks an "HH:MM" start against the clinic window for a session of the given
 * length. Both failure messages are the ones POST /api/reservations already
 * returned before this helper existed, so no caller's wording changes.
 */
export function checkClinicWindow(
    sessionTime: unknown,
    isTwoHours: boolean
): ClinicWindowResult {
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(sessionTime));
    if (!timeMatch) {
        return { ok: false, error: "sessionTime must be in HH:MM format" };
    }
    const startMinutes = Number(timeMatch[1]) * 60 + Number(timeMatch[2]);
    const endMinutes = startMinutes + (isTwoHours ? 120 : 60);
    if (startMinutes < CLINIC_OPEN_HOUR * 60 || endMinutes > CLINIC_CLOSE_HOUR * 60) {
        return {
            ok: false,
            error: `The clinic is open ${CLINIC_OPEN_HOUR}:00–${CLINIC_CLOSE_HOUR}:00. A ${isTwoHours ? "two-hour" : "one-hour"} session must start between ${CLINIC_OPEN_HOUR}:00 and ${String(CLINIC_CLOSE_HOUR - (isTwoHours ? 2 : 1)).padStart(2, "0")}:00.`,
        };
    }
    return { ok: true };
}
