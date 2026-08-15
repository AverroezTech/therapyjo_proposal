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
