"use client";

import { useState, useRef, useEffect } from "react";

interface SlotAction {
    label: string;
    icon: string;
    onClick: () => void;
    danger?: boolean;
}

interface ReservationSlotProps {
    id: number;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    doctorColor: string;
    status: string;
    time: string;
    note?: string | null;
    showNoteOnCalendar?: boolean;
    isTwoHours?: boolean;
    onStatusChange: (id: number, status: string) => void;
    onDuplicate: (id: number) => void;
    onDelete: (id: number) => void;
    onClick: (id: number) => void;
    canDelete?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
    SCHEDULED: "Scheduled",
    WAITING: "Waiting",
    CHECKED_IN: "Checked In",
    WITH_DOCTOR: "With Doctor",
    CHECKED_OUT: "Checked Out",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
};

const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: "#60a5fa",
    WAITING: "#fbbf24",
    CHECKED_IN: "#34d399",
    WITH_DOCTOR: "#a78bfa",
    CHECKED_OUT: "rgba(255,255,255,0.3)",
    CANCELLED: "#f87171",
    NO_SHOW: "#f87171",
};

export default function ReservationSlot({
    id,
    patientName,
    patientPhone,
    doctorName,
    doctorColor,
    status,
    time,
    note,
    showNoteOnCalendar,
    isTwoHours,
    onStatusChange,
    onDuplicate,
    onDelete,
    onClick,
    canDelete = false,
}: ReservationSlotProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const actions: SlotAction[] = [];
    if (status === "SCHEDULED" || status === "WAITING") {
        actions.push({ label: "Check In", icon: "✅", onClick: () => onStatusChange(id, "CHECKED_IN") });
    }
    if (status === "SCHEDULED") {
        actions.push({ label: "Waiting", icon: "⏳", onClick: () => onStatusChange(id, "WAITING") });
    }
    if (status === "CHECKED_IN") {
        actions.push({ label: "Entry to Doctor", icon: "🩺", onClick: () => onStatusChange(id, "WITH_DOCTOR") });
        actions.push({ label: "Waiting", icon: "⏳", onClick: () => onStatusChange(id, "WAITING") });
    }
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
    const cancellable = ["SCHEDULED", "WAITING", "CHECKED_IN"].includes(status);
    if (cancellable) {
        actions.push({ label: "Cancel", icon: "🚫", onClick: () => onStatusChange(id, "CANCELLED"), danger: true });
    }
    if (canDelete) {
        actions.push({ label: "Delete", icon: "🗑️", onClick: () => onDelete(id), danger: true });
    }

    const slotHeight = isTwoHours ? 120 : 60;

    return (
        <div
            className="slot"
            style={{
                borderLeftColor: doctorColor,
                height: slotHeight,
                opacity: status === "CHECKED_OUT" ? 0.5 : 1,
            }}
            onClick={() => onClick(id)}
        >
            <div className="slot-main">
                <span className="slot-name">{patientName}</span>
                <span className="slot-phone">{patientPhone}</span>
                {showNoteOnCalendar && note && (
                    <span className="slot-note">📝 {note}</span>
                )}
            </div>
            <div className="slot-right">
                <span className="slot-status" style={{ background: STATUS_COLORS[status] + "22", color: STATUS_COLORS[status] }}>
                    {STATUS_LABELS[status]}
                </span>
                <div className="menu-wrap" ref={menuRef}>
                    <button
                        className="menu-trigger"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                    >
                        ⋮
                    </button>
                    {menuOpen && (
                        <div className="menu-panel">
                            {actions.map((a) => (
                                <button
                                    key={a.label}
                                    className={`menu-item ${a.danger ? "danger" : ""}`}
                                    onClick={(e) => { e.stopPropagation(); a.onClick(); setMenuOpen(false); }}
                                >
                                    <span>{a.icon}</span> {a.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .slot {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0.45rem 0.75rem; border-left: 3px solid;
                    background: rgba(255,255,255,0.04); border-radius: var(--radius-sm, 2px);
                    cursor: pointer; transition: background 0.15s;
                    min-height: 48px;
                }
                .slot:hover { background: rgba(255,255,255,0.07); }
                .slot-main { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; flex: 1; }
                .slot-name { font-weight: 600; font-size: 0.82rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .slot-phone { font-size: 0.73rem; color: rgba(255,255,255,0.4); }
                .slot-note { font-size: 0.7rem; color: rgba(255,255,255,0.5); font-style: italic; }
                .slot-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
                .slot-status {
                    font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.45rem;
                    border-radius: 10px; white-space: nowrap;
                }
                .menu-wrap { position: relative; }
                .menu-trigger {
                    background: none; border: none; color: rgba(255,255,255,0.5);
                    font-size: 1.2rem; cursor: pointer; padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
                .menu-trigger:hover { background: rgba(255,255,255,0.08); color: #fff; }
                .menu-panel {
                    position: absolute; right: 0; top: 100%; z-index: 200;
                    min-width: 160px; background: var(--bg-dark-secondary, #243b44);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px);
                    padding: 0.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
                .menu-item {
                    display: flex; align-items: center; gap: 0.5rem; width: 100%;
                    background: none; border: none; color: rgba(255,255,255,0.8);
                    padding: 0.45rem 0.65rem; font-size: 0.8rem; cursor: pointer;
                    border-radius: 2px; font-family: inherit; text-align: left;
                }
                .menu-item:hover { background: rgba(255,255,255,0.06); }
                .menu-item.danger { color: #fca5a5; }
                .menu-item.danger:hover { background: rgba(220,38,38,0.1); }
            `}</style>
        </div>
    );
}
