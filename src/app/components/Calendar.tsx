"use client";

import type { CSSProperties } from "react";
import ReservationSlot from "./ReservationSlot";

interface Reservation {
    id: number;
    sessionTime: string;
    status: string;
    note: string | null;
    showNoteOnCalendar: boolean;
    isTwoHours: boolean;
    patient: { id: number; name: string; phone1: string; phone2: string | null };
    doctor: { id: string; name: string; color: string | null } | null;
    doctorNameSnapshot: string | null;
    doctorColorSnapshot: string | null;
}

interface CalendarProps {
    reservations: Reservation[];
    onStatusChange: (id: number, status: string) => void;
    onDuplicate: (id: number) => void;
    onDelete: (id: number) => void;
    onSlotClick: (id: number) => void;
    canDelete?: boolean;
}

// Layout constants for the hour-row packing engine.
const DEFAULT_MIN_HOUR = 9;
const DEFAULT_MAX_HOUR = 18; // 9 AM – 6 PM reads by default, but nothing outside it is ever dropped
const ROW_HEIGHT = 84; // px, fixed height of one hour row
const ROW_SLACK = 20; // px of vertical room a card's minute offset can use within its row
const CARD_HEIGHT = ROW_HEIGHT - ROW_SLACK; // one-hour card
const TWO_HOUR_CARD_HEIGHT = ROW_HEIGHT * 2 - ROW_SLACK; // overflows into the next row
const MIN_COL_WIDTH = 150; // never pack columns narrower than this — scroll instead of clipping
const MAX_COL_WIDTH = 320; // never let a lone card stretch absurdly wide
const COL_GAP = 6;
const LABEL_WIDTH = 72;

function formatHour(h: number) {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
}

// NOTE: this reads sessionTime in the browser's local timezone while the
// server runs TZ=Asia/Amman. Pre-existing mismatch — out of scope here.
function getHour(timeStr: string) {
    return new Date(timeStr).getHours();
}

function getMinute(timeStr: string) {
    return new Date(timeStr).getMinutes();
}

// min(9, earliest reservation hour) .. max(18, latest occupied hour) — a
// two-hour reservation occupies its start hour AND the next one, so the
// range must cover that overflow too or the tall card has nowhere to bleed
// into and gets clipped by the calendar's own bounds.
function computeHourRange(reservations: Reservation[]) {
    let minHour = DEFAULT_MIN_HOUR;
    let maxHour = DEFAULT_MAX_HOUR;
    for (const r of reservations) {
        const h = getHour(r.sessionTime);
        const endH = r.isTwoHours ? h + 1 : h;
        if (h < minHour) minHour = h;
        if (endH > maxHour) maxHour = endH;
    }
    return { minHour, maxHour };
}

// Assigns each reservation a stable column index so any two reservations
// whose hour ranges overlap never land in the same column — the classic
// "first free column" packing used by day-view calendars, at hour
// granularity (a two-hour reservation occupies its hour and the next one).
function assignColumns(reservations: Reservation[]): Map<number, number> {
    const sorted = [...reservations].sort((a, b) => {
        const ha = getHour(a.sessionTime);
        const hb = getHour(b.sessionTime);
        if (ha !== hb) return ha - hb;
        const ma = getMinute(a.sessionTime);
        const mb = getMinute(b.sessionTime);
        if (ma !== mb) return ma - mb;
        return a.id - b.id;
    });
    const colEnd: number[] = []; // colEnd[i] = last hour column i is occupied through
    const colOf = new Map<number, number>();
    for (const r of sorted) {
        const h = getHour(r.sessionTime);
        const endH = r.isTwoHours ? h + 1 : h;
        let placed = -1;
        for (let i = 0; i < colEnd.length; i++) {
            if (colEnd[i] < h) {
                colEnd[i] = endH;
                placed = i;
                break;
            }
        }
        if (placed === -1) {
            placed = colEnd.length;
            colEnd.push(endH);
        }
        colOf.set(r.id, placed);
    }
    return colOf;
}

// width/left for column i of n. Widths are percentages of the row (so a
// quiet hour's cards fill the row proportionally) capped at MAX_COL_WIDTH
// (so a single card never stretches absurdly wide just because some other
// hour is busy and widened the shared scroll pane).
function colWidthCss(n: number): string {
    if (n <= 1) return `min(100%, ${MAX_COL_WIDTH}px)`;
    const gapsPx = (n - 1) * COL_GAP;
    return `min(calc((100% - ${gapsPx}px) / ${n}), ${MAX_COL_WIDTH}px)`;
}

function colLeftCss(n: number, i: number): string {
    if (i === 0) return "0px";
    return `calc(${i} * (${colWidthCss(n)} + ${COL_GAP}px))`;
}

export default function Calendar({
    reservations,
    onStatusChange,
    onDuplicate,
    onDelete,
    onSlotClick,
    canDelete = false,
}: CalendarProps) {
    const { minHour, maxHour } = computeHourRange(reservations);
    const HOURS: number[] = [];
    for (let h = minHour; h <= maxHour; h++) HOURS.push(h);

    // Reservations starting in each hour, sorted by minute then id for
    // stable packing.
    const ownAt: Record<number, Reservation[]> = {};
    for (const r of reservations) {
        const h = getHour(r.sessionTime);
        (ownAt[h] ??= []).push(r);
    }
    for (const key of Object.keys(ownAt)) {
        ownAt[Number(key)].sort((a, b) => {
            const ma = getMinute(a.sessionTime);
            const mb = getMinute(b.sessionTime);
            if (ma !== mb) return ma - mb;
            return a.id - b.id;
        });
    }

    const twoHourAt: Record<number, Reservation[]> = {};
    for (const key of Object.keys(ownAt)) {
        const h = Number(key);
        twoHourAt[h] = ownAt[h].filter((r) => r.isTwoHours);
    }

    const colOf = assignColumns(reservations);

    function activeAt(h: number): Reservation[] {
        return [...(ownAt[h] || []), ...(twoHourAt[h - 1] || [])];
    }

    // Column count each row needs before cross-row equalization.
    const nNeeded: Record<number, number> = {};
    for (const h of HOURS) {
        const active = activeAt(h);
        nNeeded[h] = active.length === 0
            ? 0
            : Math.max(...active.map((r) => colOf.get(r.id) ?? 0)) + 1;
    }

    // A two-hour card is drawn once, in its starting row, and visually
    // overflows into the next row. Columns are percentage-based, so for that
    // overflow to never collide with the next row's own cards, both rows
    // must divide their width by the SAME column count (matching
    // denominators is what keeps the reserved gap and the card's real width
    // identical). Hour h is linked to h+1 whenever twoHourAt[h] is
    // non-empty; a run of two or more back-to-back two-hour sessions chains
    // several rows together transitively (h linked to h+1 linked to h+2...),
    // and EVERY row in that chain must agree on one column count — the max
    // needed anywhere in the chain. A single left-to-right pass that only
    // pushes a value forward is not enough: it can raise nFinal[h+1] after
    // nFinal[h] was already finalized, leaving them mismatched. So instead,
    // walk HOURS once to find each maximal linked run, take the max nNeeded
    // over the whole run, then write that max back to every row in it.
    const nFinal: Record<number, number> = { ...nNeeded };
    for (let i = 0; i < HOURS.length; i++) {
        let j = i;
        while (j < HOURS.length - 1 && (twoHourAt[HOURS[j]] || []).length > 0) {
            j++;
        }
        if (j > i) {
            let runMax = 0;
            for (let k = i; k <= j; k++) runMax = Math.max(runMax, nNeeded[HOURS[k]] || 0);
            for (let k = i; k <= j; k++) nFinal[HOURS[k]] = runMax;
        }
        i = j; // skip past the run we just resolved (loop's i++ advances one more)
    }

    const maxCols = HOURS.reduce((m, h) => Math.max(m, nFinal[h] || 0), 0);
    const paneMinWidth = maxCols > 0
        ? maxCols * MIN_COL_WIDTH + Math.max(0, maxCols - 1) * COL_GAP + LABEL_WIDTH
        : 0;

    return (
        <div className="calendar">
            <div className="scroll-outer">
                <div
                    className="scroll-inner"
                    style={{ "--pane-min-width": `${paneMinWidth}px` } as CSSProperties}
                >
                    {HOURS.map((hour) => {
                        const own = ownAt[hour] || [];
                        const n = nFinal[hour] || 0;
                        const isEmpty = activeAt(hour).length === 0;
                        return (
                            <div key={hour} className="time-row">
                                <div className="time-label">{formatHour(hour)}</div>
                                <div className="time-slots">
                                    {isEmpty && <div className="empty-slot" />}
                                    {own.map((r) => {
                                        const idx = colOf.get(r.id) ?? 0;
                                        const minute = getMinute(r.sessionTime);
                                        const top = (minute / 60) * ROW_SLACK;
                                        const height = r.isTwoHours ? TWO_HOUR_CARD_HEIGHT : CARD_HEIGHT;
                                        return (
                                            <div
                                                key={r.id}
                                                className="card-wrap"
                                                style={{
                                                    top,
                                                    left: colLeftCss(n, idx),
                                                    width: colWidthCss(n),
                                                    height,
                                                    zIndex: r.isTwoHours ? 2 : 1,
                                                }}
                                            >
                                                <ReservationSlot
                                                    id={r.id}
                                                    patientName={r.patient.name}
                                                    patientPhone={r.patient.phone1}
                                                    doctorName={r.doctor?.name ?? r.doctorNameSnapshot ?? "Deleted doctor"}
                                                    doctorColor={r.doctor?.color ?? r.doctorColorSnapshot ?? "#666"}
                                                    status={r.status}
                                                    time={new Date(r.sessionTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                                    note={r.note}
                                                    showNoteOnCalendar={r.showNoteOnCalendar}
                                                    isTwoHours={r.isTwoHours}
                                                    onStatusChange={onStatusChange}
                                                    onDuplicate={onDuplicate}
                                                    onDelete={onDelete}
                                                    onClick={onSlotClick}
                                                    canDelete={canDelete}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .calendar {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.12);
                    border-radius: var(--radius-md, 4px); overflow: hidden;
                }
                .scroll-outer {
                    overflow-x: auto;
                }
                .scroll-inner {
                    width: max(100%, var(--pane-min-width, 100%));
                }
                .time-row {
                    display: flex; border-bottom: 1px solid rgba(255,255,255,0.14);
                    height: ${ROW_HEIGHT}px;
                }
                .time-row:nth-child(even) { background: rgba(255,255,255,0.02); }
                .time-row:last-child { border-bottom: none; }
                .time-label {
                    width: ${LABEL_WIDTH}px; flex-shrink: 0; padding: 0.5rem 0.6rem;
                    font-size: 0.72rem; color: rgba(255,255,255,0.4);
                    font-weight: 500; text-align: right; border-right: 1px solid rgba(255,255,255,0.14);
                    font-variant-numeric: tabular-nums;
                    position: sticky; left: 0; z-index: 3;
                    background: var(--bg-dark, #1a2e35);
                }
                .time-slots {
                    flex: 1; min-width: 0; position: relative;
                }
                .card-wrap { position: absolute; }
                .empty-slot {
                    position: absolute; inset: 0;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: var(--radius-sm, 2px);
                }

                @media (max-width: 768px) {
                    .scroll-outer { overflow-x: visible; }
                    .scroll-inner { width: 100% !important; }
                    .time-row { height: auto; }
                    .time-label { position: static; background: none; padding-top: 0.6rem; }
                    .time-slots {
                        position: static; display: flex; flex-direction: column; gap: 3px;
                        padding: 3px 6px 3px 0;
                    }
                    .card-wrap {
                        position: static !important; top: auto !important; left: auto !important;
                        width: 100% !important; height: auto !important; z-index: auto !important;
                    }
                    .empty-slot { position: static; min-height: 54px; }
                }
            `}</style>
        </div>
    );
}
