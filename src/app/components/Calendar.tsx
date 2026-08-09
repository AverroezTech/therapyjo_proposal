"use client";

import ReservationSlot from "./ReservationSlot";

interface Reservation {
    id: number;
    sessionTime: string;
    status: string;
    note: string | null;
    showNoteOnCalendar: boolean;
    isTwoHours: boolean;
    patient: { id: number; name: string; phone1: string; phone2: string | null };
    doctor: { id: string; name: string; color: string | null };
}

interface CalendarProps {
    reservations: Reservation[];
    onStatusChange: (id: number, status: string) => void;
    onDuplicate: (id: number) => void;
    onDelete: (id: number) => void;
    onSlotClick: (id: number) => void;
    canDelete?: boolean;
}

// 9 AM to 6 PM = 9 hours
const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9, 10, 11, ..., 18

function formatHour(h: number) {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
}

function getHour(timeStr: string) {
    const d = new Date(timeStr);
    return d.getHours();
}

export default function Calendar({
    reservations,
    onStatusChange,
    onDuplicate,
    onDelete,
    onSlotClick,
    canDelete = false,
}: CalendarProps) {
    // Group reservations by hour
    const byHour: Record<number, Reservation[]> = {};
    for (const r of reservations) {
        const h = getHour(r.sessionTime);
        if (!byHour[h]) byHour[h] = [];
        byHour[h].push(r);
    }

    return (
        <div className="calendar">
            {HOURS.map((hour) => (
                <div key={hour} className="time-row">
                    <div className="time-label">{formatHour(hour)}</div>
                    <div className="time-slots">
                        {(byHour[hour] || []).map((r) => (
                            <ReservationSlot
                                key={r.id}
                                id={r.id}
                                patientName={r.patient.name}
                                patientPhone={r.patient.phone1}
                                doctorName={r.doctor.name}
                                doctorColor={r.doctor.color || "#666"}
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
                        ))}
                        {(!byHour[hour] || byHour[hour].length === 0) && (
                            <div className="empty-slot" />
                        )}
                    </div>
                </div>
            ))}

            <style jsx>{`
                .calendar {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: var(--radius-md, 4px); overflow: hidden;
                }
                .time-row {
                    display: flex; border-bottom: 1px solid rgba(255,255,255,0.04);
                    min-height: 60px;
                }
                .time-row:last-child { border-bottom: none; }
                .time-label {
                    width: 72px; flex-shrink: 0; padding: 0.5rem 0.6rem;
                    font-size: 0.72rem; color: rgba(255,255,255,0.35);
                    font-weight: 500; text-align: right; border-right: 1px solid rgba(255,255,255,0.05);
                    font-variant-numeric: tabular-nums;
                }
                .time-slots {
                    flex: 1; display: flex; flex-direction: column; gap: 3px;
                    padding: 3px 6px;
                }
                .empty-slot { min-height: 54px; }
            `}</style>
        </div>
    );
}
