"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from "@/app/components/Calendar";
import DatePickerCalendar from "@/app/components/DatePicker";

interface Doctor {
    id: string;
    name: string;
    color: string | null;
}

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

const today = () => new Date().toISOString().split("T")[0];

export default function DoctorDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(today());
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    // Duplicate modal
    const [dupeId, setDupeId] = useState<number | null>(null);
    const [dupeDate, setDupeDate] = useState(today());
    const [dupeTime, setDupeTime] = useState("09:00");
    const [duping, setDuping] = useState(false);

    const doctorId = (session?.user as { id?: string })?.id;

    // Defaults to "my schedule only" — the toggle below lets a doctor opt
    // into seeing the whole clinic's schedule, same as admin/secretary. (TJ-024)
    const [doctorFilter, setDoctorFilter] = useState("");
    useEffect(() => { if (doctorId) setDoctorFilter(doctorId); }, [doctorId]);

    const fetchDoctors = useCallback(async () => {
        const res = await fetch("/api/employees/doctors");
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data.filter((d: Doctor & { status: string }) => d.status === "ACTIVE") : []);
    }, []);

    const fetchReservations = useCallback(async () => {
        if (!doctorFilter) return;
        setLoading(true);
        const params = new URLSearchParams({ date: selectedDate });
        if (doctorFilter !== "all") params.set("doctorId", doctorFilter);
        const res = await fetch(`/api/reservations?${params}`);
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [selectedDate, doctorFilter]);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
    useEffect(() => { fetchReservations(); }, [fetchReservations]);

    const handleStatusChange = async (id: number, status: string) => {
        await fetch(`/api/reservations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        fetchReservations();
    };

    const handleSlotClick = (id: number) => {
        router.push(`/doctor/session/${id}`);
    };

    const handleDuplicate = (id: number) => {
        setDupeId(id);
        setDupeDate(today());
        setDupeTime("09:00");
    };

    const confirmDuplicate = async () => {
        if (!dupeId) return;
        setDuping(true);
        await fetch(`/api/reservations/${dupeId}/duplicate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dupeDate, time: dupeTime }),
        });
        setDuping(false);
        setDupeId(null);
        fetchReservations();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this session?")) return;
        await fetch(`/api/reservations/${id}`, { method: "DELETE" });
        fetchReservations();
    };

    const goDay = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split("T")[0]);
    };

    const formatDate = () =>
        new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
        });

    return (
        <div>
            <div className="controls">
                <h1>My Schedule</h1>
                <div className="date-nav">
                    <button className="btn-nav" onClick={() => goDay(-1)}>← Yesterday</button>
                    <button className="btn-nav btn-today" onClick={() => setSelectedDate(today())}>Today</button>
                    <button className="btn-nav" onClick={() => goDay(1)}>Tomorrow →</button>
                </div>
                <select className="doctor-select" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                    {doctorId && <option value={doctorId}>My Schedule</option>}
                    <option value="all">All Doctors</option>
                    {doctors.filter((d) => d.id !== doctorId).map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>
            <p className="current-date">{formatDate()} — {reservations.length} session{reservations.length !== 1 ? "s" : ""}</p>

            <div className="main-layout">
                <div className="calendar-col">
                    {loading ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem", textAlign: "center" }}>Loading…</div>
                    ) : (
                        <Calendar
                            reservations={reservations}
                            onStatusChange={handleStatusChange}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onSlotClick={handleSlotClick}
                        />
                    )}
                </div>
                <div className="sidebar-col">
                    <DatePickerCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} doctorId={doctorFilter} />
                </div>
            </div>

            {/* Duplicate Modal */}
            {dupeId !== null && (
                <div className="modal-overlay" onClick={() => setDupeId(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Duplicate Session</h2>
                        <div className="form-row">
                            <div className="form-group"><label>New Date</label><input type="date" value={dupeDate} onChange={(e) => setDupeDate(e.target.value)} /></div>
                            <div className="form-group"><label>New Time</label><input type="time" value={dupeTime} onChange={(e) => setDupeTime(e.target.value)} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setDupeId(null)}>Cancel</button>
                            <button className="btn-save" onClick={confirmDuplicate} disabled={duping}>{duping ? "Duplicating…" : "Duplicate"}</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .controls { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 0.5rem; }
                .controls h1 { font-size: 1.5rem; font-weight: 600; }
                .date-nav { display: flex; gap: 0.35rem; }
                .btn-nav { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm, 2px); font-size: 0.78rem; cursor: pointer; font-family: inherit; }
                .btn-nav:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .btn-today { font-weight: 600; color: var(--primary, #4CAF93); border-color: var(--primary, #4CAF93); }
                .doctor-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.4rem 0.75rem; border-radius: var(--radius-sm, 2px); font-size: 0.82rem; font-family: inherit; margin-left: auto; }
                .doctor-select option { background: #1a2e35; }
                .current-date { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 1rem; }
                .main-layout { display: flex; gap: 1rem; align-items: flex-start; }
                .calendar-col { flex: 1; min-width: 0; }
                .sidebar-col { width: 260px; flex-shrink: 0; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-card { background: var(--bg-dark-secondary, #243b44); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md, 4px); padding: 2rem; width: 100%; max-width: 400px; }
                .modal-card h2 { font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; }
                .form-row { display: flex; gap: 0.75rem; }
                .form-row .form-group { flex: 1; }
                .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
                .form-group label { font-size: 0.76rem; color: rgba(255,255,255,0.5); font-weight: 500; }
                .form-group input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm, 2px); padding: 0.5rem 0.7rem; color: #fff; font-size: 0.85rem; outline: none; font-family: inherit; }
                .form-group input:focus { border-color: var(--primary, #4CAF93); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1.25rem; }
                .btn-cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px); padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
                .btn-save { background: var(--primary, #4CAF93); color: #fff; border: none; border-radius: var(--radius-sm, 2px); padding: 0.5rem 1.2rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                @media (max-width: 768px) { .main-layout { flex-direction: column; } .sidebar-col { width: 100%; } }
            `}</style>
        </div>
    );
}
