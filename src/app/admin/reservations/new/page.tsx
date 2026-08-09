"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Doctor { id: string; name: string; color: string | null; }
interface PatientResult { id: number; name: string; phone1: string; }

function NewReservationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
    const [form, setForm] = useState({
        doctorId: "",
        sessionDate: dateParam,
        sessionTime: "09:00",
        note: "",
        showNoteOnCalendar: false,
        nextSessionNote: "",
        paymentType: "",
        isTwoHours: false,
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchDoctors = useCallback(async () => {
        const res = await fetch("/api/employees/doctors");
        const data = await res.json();
        const active = data.filter((d: Doctor & { status: string }) => d.status === "ACTIVE");
        setDoctors(active);
        if (active.length > 0 && !form.doctorId) setForm((f) => ({ ...f, doctorId: active[0].id }));
    }, []);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    // Patient search
    useEffect(() => {
        if (patientSearch.length < 2) { setPatientResults([]); return; }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}&limit=5`);
            const data = await res.json();
            setPatientResults(data.patients || []);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    const handleSubmit = async () => {
        setError("");
        if (!selectedPatient) { setError("Please select a patient"); return; }
        if (!form.doctorId) { setError("Please select a doctor"); return; }
        setSaving(true);
        const res = await fetch("/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId: selectedPatient.id,
                doctorId: form.doctorId,
                sessionDate: form.sessionDate,
                sessionTime: form.sessionTime,
                note: form.note,
                showNoteOnCalendar: form.showNoteOnCalendar,
                nextSessionNote: form.nextSessionNote,
                paymentType: form.paymentType || null,
                isTwoHours: form.isTwoHours,
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to create reservation");
            setSaving(false);
            return;
        }
        router.push("/admin");
    };

    const formatDate = () =>
        new Date(form.sessionDate + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
        });

    return (
        <div className="page">
            <button className="back-btn" onClick={() => router.push("/admin")}>← Back to Dashboard</button>
            <h1>New Reservation</h1>
            <p className="subtitle">{formatDate()}</p>

            {error && <div className="error-banner">{error}</div>}

            <div className="form-layout">
                {/* Left: Patient + Schedule */}
                <div className="main-column">
                    <div className="card">
                        <h2>Patient</h2>
                        <div className="field">
                            <label>Search by name or phone <span className="req">*</span></label>
                            <input
                                placeholder="Type to search…"
                                value={selectedPatient ? selectedPatient.name : patientSearch}
                                onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                            />
                            {patientResults.length > 0 && !selectedPatient && (
                                <div className="search-dropdown">
                                    {patientResults.map((p) => (
                                        <button key={p.id} className="search-item" onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatientResults([]); }}>
                                            <span className="sr-name">{p.name}</span>
                                            <span className="sr-phone">{p.phone1}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedPatient && (
                                <div className="selected-patient">
                                    <span>✓ {selectedPatient.name} — {selectedPatient.phone1}</span>
                                    <button className="clear-btn" onClick={() => setSelectedPatient(null)}>Change</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h2>Schedule</h2>
                        <div className="field-row">
                            <div className="field">
                                <label>Date</label>
                                <input type="date" value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} />
                            </div>
                            <div className="field">
                                <label>Time</label>
                                <input type="time" value={form.sessionTime} onChange={(e) => setForm({ ...form, sessionTime: e.target.value })} />
                            </div>
                        </div>
                        <div className="field-row">
                            <div className="field">
                                <label>Doctor <span className="req">*</span></label>
                                <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Payment</label>
                                <select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
                                    <option value="">— None —</option>
                                    <option value="CASH">Cash</option>
                                    <option value="INSURANCE">Insurance</option>
                                </select>
                            </div>
                        </div>
                        <div className="checkbox-field">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={form.isTwoHours} onChange={(e) => setForm({ ...form, isTwoHours: e.target.checked })} />
                                2-hour session
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Notes */}
                <div className="side-column">
                    <div className="card">
                        <h2>Notes</h2>
                        <div className="field">
                            <label>Session Note</label>
                            <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note for this session…" />
                            <label className="checkbox-label">
                                <input type="checkbox" checked={form.showNoteOnCalendar} onChange={(e) => setForm({ ...form, showNoteOnCalendar: e.target.checked })} />
                                Show on calendar
                            </label>
                        </div>
                        <div className="field">
                            <label>Next Session Note</label>
                            <textarea rows={3} value={form.nextSessionNote} onChange={(e) => setForm({ ...form, nextSessionNote: e.target.value })} placeholder="Note for follow-up…" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-cancel" onClick={() => router.push("/admin")}>Cancel</button>
                        <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                            {saving ? "Creating…" : "Create Reservation"}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page { max-width: 900px; }
                .back-btn { background: none; border: none; color: rgba(255,255,255,0.45); font-size: 0.85rem; cursor: pointer; padding: 0; margin-bottom: 1rem; font-family: inherit; }
                .back-btn:hover { color: #fff; }
                h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.25rem; }
                .subtitle { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-bottom: 1.5rem; }
                .error-banner { background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25); color: #fca5a5; padding: 0.65rem 1rem; border-radius: var(--radius-sm, 2px); font-size: 0.85rem; margin-bottom: 1.25rem; }

                .form-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
                .main-column { flex: 1.2; min-width: 0; display: flex; flex-direction: column; gap: 1rem; }
                .side-column { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1rem; }

                .card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: var(--radius-md, 4px); padding: 1.5rem;
                }
                .card h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1.25rem; color: rgba(255,255,255,0.85); }

                .field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; position: relative; }
                .field:last-child { margin-bottom: 0; }
                .field label { font-size: 0.78rem; color: rgba(255,255,255,0.55); font-weight: 500; }
                .req { color: var(--primary, #4CAF93); }
                .field input, .field textarea, .field select {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: var(--radius-sm, 2px); padding: 0.65rem 0.85rem; color: #fff;
                    font-size: 0.9rem; outline: none; font-family: inherit; transition: border-color 0.15s;
                }
                .field textarea { resize: vertical; }
                .field select option { background: #1a2e35; }
                .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--primary, #4CAF93); }
                .field input::placeholder, .field textarea::placeholder { color: rgba(255,255,255,0.2); }
                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .search-dropdown {
                    position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
                    background: #1e293b; border: 1px solid rgba(255,255,255,0.12);
                    border-radius: var(--radius-sm, 2px); overflow: hidden; margin-top: 2px;
                }
                .search-item {
                    width: 100%; display: flex; justify-content: space-between; align-items: center;
                    padding: 0.6rem 0.85rem; border: none; background: none; color: #fff;
                    cursor: pointer; font-size: 0.85rem; font-family: inherit; text-align: left;
                }
                .search-item:hover { background: rgba(76,175,147,0.12); }
                .sr-phone { color: rgba(255,255,255,0.4); font-size: 0.8rem; }

                .selected-patient {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(76,175,147,0.08); border: 1px solid rgba(76,175,147,0.2);
                    padding: 0.5rem 0.75rem; border-radius: var(--radius-sm, 2px);
                    font-size: 0.85rem; color: var(--primary, #4CAF93); margin-top: 0.25rem;
                }
                .clear-btn { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 0.78rem; cursor: pointer; font-family: inherit; }
                .clear-btn:hover { color: #fff; }

                .checkbox-field { margin-top: 0.5rem; }
                .checkbox-label {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.82rem; color: rgba(255,255,255,0.6); cursor: pointer;
                }
                .checkbox-label input[type="checkbox"] { width: auto; accent-color: var(--primary, #4CAF93); }

                .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .btn-cancel {
                    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px);
                    padding: 0.55rem 1.2rem; font-size: 0.88rem; cursor: pointer; font-family: inherit;
                }
                .btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .btn-save {
                    background: var(--primary, #4CAF93); color: #fff; border: none;
                    border-radius: var(--radius-sm, 2px); padding: 0.55rem 1.5rem; font-size: 0.88rem;
                    font-weight: 600; cursor: pointer; font-family: inherit;
                }
                .btn-save:hover { background: var(--primary-dark, #3a8f77); }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 640px) {
                    .form-layout { flex-direction: column; }
                    .field-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

export default function NewReservationPage() {
    return (
        <Suspense fallback={<div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem" }}>Loading…</div>}>
            <NewReservationForm />
        </Suspense>
    );
}
