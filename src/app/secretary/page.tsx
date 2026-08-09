"use client";

import { useState, useEffect, useCallback } from "react";
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
    doctor: { id: string; name: string; color: string | null };
}

interface PatientResult {
    id: number;
    name: string;
    phone1: string;
}

const today = () => new Date().toISOString().split("T")[0];

export default function SecretaryDashboard() {
    const [selectedDate, setSelectedDate] = useState(today());
    const [doctorFilter, setDoctorFilter] = useState("all");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Reservation modal
    const [showAdd, setShowAdd] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");
    const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
    const [addForm, setAddForm] = useState({
        doctorId: "",
        sessionTime: "09:00",
        note: "",
        showNoteOnCalendar: false,
        paymentType: "",
        isTwoHours: false,
    });
    const [saving, setSaving] = useState(false);
    const [addError, setAddError] = useState("");

    const fetchDoctors = useCallback(async () => {
        const res = await fetch("/api/employees/doctors");
        const data = await res.json();
        setDoctors(data.filter((d: Doctor & { status: string }) => d.status === "ACTIVE"));
    }, []);

    const fetchReservations = useCallback(async () => {
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

    useEffect(() => {
        if (patientSearch.length < 2) { setPatientResults([]); return; }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}&limit=5`);
            const data = await res.json();
            setPatientResults(data.patients || []);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    const handleStatusChange = async (id: number, status: string) => {
        await fetch(`/api/reservations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        fetchReservations();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this reservation?")) return;
        await fetch(`/api/reservations/${id}`, { method: "DELETE" });
        fetchReservations();
    };

    const handleDuplicate = async (id: number) => {
        const date = prompt("Duplicate to which date? (YYYY-MM-DD)");
        if (!date) return;
        await fetch(`/api/reservations/${id}/duplicate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionDate: date }),
        });
        fetchReservations();
    };

    const openAddModal = () => {
        setShowAdd(true);
        setSelectedPatient(null);
        setPatientSearch("");
        setAddError("");
        setAddForm({
            doctorId: doctors.length > 0 ? doctors[0].id : "",
            sessionTime: "09:00",
            note: "",
            showNoteOnCalendar: false,
            paymentType: "",
            isTwoHours: false,
        });
    };

    const submitAdd = async () => {
        if (!selectedPatient) { setAddError("Select a patient"); return; }
        setSaving(true);
        const res = await fetch("/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId: selectedPatient.id,
                doctorId: addForm.doctorId,
                sessionDate: selectedDate,
                sessionTime: addForm.sessionTime,
                note: addForm.note,
                showNoteOnCalendar: addForm.showNoteOnCalendar,
                paymentType: addForm.paymentType || null,
                isTwoHours: addForm.isTwoHours,
            }),
        });
        const data = await res.json();
        setSaving(false);
        if (res.ok) { setShowAdd(false); fetchReservations(); }
        else { setAddError(data.error || "Error"); }
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
                <div className="controls-left">
                    <h1>Dashboard</h1>
                    <div className="date-nav">
                        <button className="btn-nav" onClick={() => goDay(-1)}>← Yesterday</button>
                        <button className="btn-nav btn-today" onClick={() => setSelectedDate(today())}>Today</button>
                        <button className="btn-nav" onClick={() => goDay(1)}>Tomorrow →</button>
                    </div>
                </div>
                <div className="controls-right">
                    <select className="doctor-select" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                        <option value="all">All Doctors</option>
                        {doctors.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                    <button className="btn-add" onClick={() => { window.location.href = `/secretary/reservations/new?date=${selectedDate}`; }}>+ Add Reservation</button>
                </div>
            </div>

            <p className="current-date">{formatDate()}</p>

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
                            onSlotClick={() => { }}
                        />
                    )}
                </div>
                <div className="sidebar-col">
                    <DatePickerCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} doctorId={doctorFilter} />
                </div>
            </div>

            {/* Add Reservation Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Reservation — {formatDate()}</h2>
                        {addError && <div className="error-msg">{addError}</div>}
                        <div className="form-group">
                            <label>Patient</label>
                            <input
                                placeholder="Search by name or phone..."
                                value={selectedPatient ? selectedPatient.name : patientSearch}
                                onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                            />
                            {patientResults.length > 0 && !selectedPatient && (
                                <div className="search-results">
                                    {patientResults.map((p) => (
                                        <button key={p.id} className="search-item" onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatientResults([]); }}>
                                            {p.name} <span className="search-phone">{p.phone1}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Doctor</label>
                                <select value={addForm.doctorId} onChange={(e) => setAddForm({ ...addForm, doctorId: e.target.value })}>
                                    {doctors.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input type="time" value={addForm.sessionTime} onChange={(e) => setAddForm({ ...addForm, sessionTime: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Note</label>
                            <textarea rows={2} value={addForm.note} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="btn-save" onClick={submitAdd} disabled={saving}>{saving ? "Saving…" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem; }
                .controls-left { display: flex; align-items: center; gap: 1.25rem; }
                .controls-left h1 { font-size: 1.5rem; font-weight: 600; }
                .date-nav { display: flex; gap: 0.35rem; }
                .btn-nav { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm, 2px); font-size: 0.78rem; cursor: pointer; font-family: inherit; }
                .btn-nav:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .btn-today { font-weight: 600; color: var(--primary, #4CAF93); border-color: var(--primary, #4CAF93); }
                .controls-right { display: flex; align-items: center; gap: 0.5rem; }
                .doctor-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.4rem 0.75rem; border-radius: var(--radius-sm, 2px); font-size: 0.82rem; font-family: inherit; }
                .doctor-select option { background: #1a2e35; }
                .btn-add { background: var(--primary, #4CAF93); color: #fff; border: none; padding: 0.45rem 1rem; border-radius: var(--radius-sm, 2px); font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit; }
                .current-date { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 1rem; }
                .main-layout { display: flex; gap: 1rem; align-items: flex-start; }
                .calendar-col { flex: 1; min-width: 0; }
                .sidebar-col { width: 260px; flex-shrink: 0; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-card { background: var(--bg-dark-secondary, #243b44); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md, 4px); padding: 2rem; width: 100%; max-width: 480px; }
                .modal-card h2 { font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; }
                .error-msg { background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2); color: #fca5a5; padding: 0.5rem; border-radius: var(--radius-sm, 2px); font-size: 0.82rem; margin-bottom: 0.75rem; }
                .form-group { margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
                .form-row { display: flex; gap: 0.75rem; }
                .form-row .form-group { flex: 1; }
                .form-group label { font-size: 0.76rem; color: rgba(255,255,255,0.5); font-weight: 500; }
                .form-group input, .form-group textarea, .form-group select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm, 2px); padding: 0.5rem 0.7rem; color: #fff; font-size: 0.85rem; outline: none; font-family: inherit; resize: vertical; }
                .form-group select option { background: #1a2e35; }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary, #4CAF93); }
                .search-results { background: var(--bg-dark-secondary, #243b44); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px); max-height: 160px; overflow-y: auto; }
                .search-item { display: flex; justify-content: space-between; width: 100%; background: none; border: none; color: #fff; padding: 0.45rem 0.7rem; font-size: 0.82rem; cursor: pointer; font-family: inherit; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .search-item:hover { background: rgba(255,255,255,0.06); }
                .search-phone { color: rgba(255,255,255,0.35); font-size: 0.76rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; }
                .btn-cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px); padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
                .btn-save { background: var(--primary, #4CAF93); color: #fff; border: none; border-radius: var(--radius-sm, 2px); padding: 0.5rem 1.2rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                @media (max-width: 768px) { .main-layout { flex-direction: column; } .sidebar-col { width: 100%; } .controls { flex-direction: column; align-items: flex-start; } }
            `}</style>
        </div>
    );
}
