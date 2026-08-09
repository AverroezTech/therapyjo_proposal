"use client";

import { useState, useEffect, useCallback } from "react";

interface DatePickerProps {
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    doctorId?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePickerCalendar({ selectedDate, onDateSelect, doctorId }: DatePickerProps) {
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date(selectedDate);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const [counts, setCounts] = useState<Record<string, number>>({});

    const fetchCounts = useCallback(async () => {
        const monthStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}`;
        const params = new URLSearchParams({ month: monthStr });
        if (doctorId && doctorId !== "all") params.set("doctorId", doctorId);
        const res = await fetch(`/api/reservations?${params}`);
        const data = await res.json();
        setCounts(data.counts || {});
    }, [viewDate, doctorId]);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay();
    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    const prevMonth = () => {
        setViewDate((v) => {
            const m = v.month - 1;
            return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m };
        });
    };
    const nextMonth = () => {
        setViewDate((v) => {
            const m = v.month + 1;
            return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m };
        });
    };

    const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="datepicker">
            <div className="dp-header">
                <button className="dp-nav" onClick={prevMonth}>‹</button>
                <span className="dp-month">{monthLabel}</span>
                <button className="dp-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="dp-grid">
                {DAYS.map((d) => (
                    <div key={d} className="dp-dayname">{d}</div>
                ))}
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="dp-cell empty" />;
                    const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === today;
                    const count = counts[dateStr] || 0;

                    return (
                        <button
                            key={dateStr}
                            className={`dp-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                            onClick={() => onDateSelect(dateStr)}
                        >
                            <span className="dp-day">{day}</span>
                            {count > 0 && <span className="dp-count">{count}</span>}
                        </button>
                    );
                })}
            </div>

            <style jsx>{`
                .datepicker {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: var(--radius-md, 4px); padding: 0.75rem;
                    min-width: 240px;
                }
                .dp-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 0.6rem;
                }
                .dp-nav {
                    background: none; border: none; color: rgba(255,255,255,0.5);
                    font-size: 1.2rem; cursor: pointer; padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }
                .dp-nav:hover { background: rgba(255,255,255,0.06); color: #fff; }
                .dp-month { font-size: 0.85rem; font-weight: 600; color: #fff; }
                .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
                .dp-dayname {
                    font-size: 0.65rem; text-align: center; padding: 0.3rem 0;
                    color: rgba(255,255,255,0.3); font-weight: 600; text-transform: uppercase;
                }
                .dp-cell {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 0.3rem 0; min-height: 36px; border: none; border-radius: 4px;
                    cursor: pointer; background: none; transition: all 0.1s;
                }
                .dp-cell.empty { cursor: default; }
                .dp-cell:not(.empty):hover { background: rgba(255,255,255,0.06); }
                .dp-cell.selected { background: var(--primary, #4CAF93); }
                .dp-cell.selected .dp-day { color: #fff; font-weight: 700; }
                .dp-cell.today .dp-day { color: var(--primary, #4CAF93); font-weight: 700; }
                .dp-cell.selected.today .dp-day { color: #fff; }
                .dp-day { font-size: 0.78rem; color: rgba(255,255,255,0.7); }
                .dp-count {
                    font-size: 0.55rem; color: var(--primary, #4CAF93);
                    font-weight: 700; margin-top: -1px;
                }
                .dp-cell.selected .dp-count { color: rgba(255,255,255,0.85); }
            `}</style>
        </div>
    );
}
