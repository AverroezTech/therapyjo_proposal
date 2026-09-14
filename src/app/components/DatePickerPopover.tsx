"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import DatePickerCalendar from "./DatePicker";

interface DatePickerPopoverProps {
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    doctorId?: string;
    label: string; // formatted date shown on the trigger
}

// Panel is 260px so DatePicker's own min-width: 240px fits with padding.
const PANEL_WIDTH = 260;
const PANEL_HEIGHT = 300; // approximate; used only to decide flip-up vs flip-down
const EDGE_MARGIN = 8;

export default function DatePickerPopover({
    selectedDate,
    onDateSelect,
    doctorId,
    label,
}: DatePickerPopoverProps) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Same shape as ReservationSlot's action menu: close on an outside
    // mousedown, measured against both the trigger and the panel.
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                !triggerRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // The panel is position: fixed and placed from the trigger's real screen
    // coordinates, so it must close rather than drift when the page moves.
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        document.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const toggle = () => {
        if (open) {
            setOpen(false);
            return;
        }
        const btn = triggerRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();

        // Grow rightward from the trigger's left edge, clamped so it always
        // stays on screen.
        let left = rect.left;
        left = Math.min(
            Math.max(left, EDGE_MARGIN),
            window.innerWidth - PANEL_WIDTH - EDGE_MARGIN
        );

        // Open downward; flip above the trigger if that would run off-screen.
        let top = rect.bottom + 4;
        if (top + PANEL_HEIGHT > window.innerHeight - EDGE_MARGIN) {
            top = Math.max(EDGE_MARGIN, rect.top - PANEL_HEIGHT - 4);
        }

        setPos({ top, left });
        setOpen(true);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="dpp-trigger"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={toggle}
            >
                {label}
                <span className="dpp-caret" aria-hidden="true">▾</span>
            </button>

            {open &&
                createPortal(
                    <div
                        ref={panelRef}
                        className="dpp-panel"
                        role="dialog"
                        aria-label="Choose a date"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <DatePickerCalendar
                            selectedDate={selectedDate}
                            onDateSelect={(d) => {
                                onDateSelect(d);
                                setOpen(false);
                            }}
                            doctorId={doctorId}
                        />
                    </div>,
                    document.body
                )}

            <style jsx>{`
                .dpp-trigger {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff; font-family: inherit;
                    font-size: 1rem; font-weight: 500;
                    padding: 0.3rem 0.7rem;
                    border-radius: var(--radius-sm, 2px);
                    cursor: pointer;
                }
                .dpp-trigger:hover { background: rgba(255,255,255,0.1); }
                .dpp-caret { font-size: 0.7rem; color: rgba(255,255,255,0.5); }
            `}</style>
            <style jsx global>{`
                .dpp-panel {
                    position: fixed;
                    width: ${PANEL_WIDTH}px;
                    z-index: 1200;
                }
            `}</style>
        </>
    );
}
