"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";

interface PatientData {
    id: number;
    name: string;
    phone1: string;
    phone2: string | null;
    pictureUrl: string | null;
    archived: boolean;
    lastVisitDate: string | null;
    createdAt: string;
    intake: Intake | null;
    files: PatientFile[];
    reservations: Reservation[];
}

interface Intake {
    id: number;
    injuryPlace: string | null;
    enrollDate: string | null;
    medicalHistory: string | null;
    assessment: string | null;
    aggravators: string | null;
    relievers: string | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
    recommendedSessions: number | null;
    clinicExercises: string | null;
    homeExercises: string | null;
    nextSessionTreatment: string | null;
}

interface PatientFile {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    uploadedAt: string;
}

interface Reservation {
    id: number;
    sessionDate: string;
    sessionTime: string;
    status: string;
    paymentType: string | null;
    injuryPlace: string | null;
    doctor: { id: string; name: string; color: string | null };
}

const INTAKE_FIELDS = [
    { key: "injuryPlace", label: "Injury Place", type: "text" },
    { key: "enrollDate", label: "Enrollment Date", type: "date" },
    { key: "medicalHistory", label: "Medical History", type: "textarea" },
    { key: "assessment", label: "Assessment", type: "textarea" },
    { key: "aggravators", label: "Pain Aggravators", type: "textarea" },
    { key: "relievers", label: "Pain Relievers", type: "textarea" },
    { key: "diagnosis", label: "Diagnosis", type: "textarea" },
    { key: "treatmentPlan", label: "Treatment Plan", type: "textarea" },
    { key: "recommendedSessions", label: "Recommended Sessions", type: "number" },
    { key: "clinicExercises", label: "Clinic Exercises", type: "textarea" },
    { key: "homeExercises", label: "Home Exercises", type: "textarea" },
    { key: "nextSessionTreatment", label: "Next Session Treatment", type: "textarea" },
];

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingInfo, setEditingInfo] = useState(false);
    const [infoForm, setInfoForm] = useState({ name: "", phone1: "", phone2: "" });
    const [savingInfo, setSavingInfo] = useState(false);
    const [intakeForm, setIntakeForm] = useState<Record<string, string>>({});
    const [savingIntake, setSavingIntake] = useState(false);
    const [intakeMsg, setIntakeMsg] = useState("");
    const [activeTab, setActiveTab] = useState<"intake" | "sessions" | "files">("intake");

    const fetchPatient = useCallback(async () => {
        const res = await fetch(`/api/patients/${id}`);
        if (!res.ok) { router.push("/admin/patients"); return; }
        const data = await res.json();
        setPatient(data);
        setInfoForm({ name: data.name, phone1: data.phone1, phone2: data.phone2 || "" });

        // Populate intake form
        const intake: Record<string, string> = {};
        for (const f of INTAKE_FIELDS) {
            const val = data.intake?.[f.key];
            if (f.type === "date" && val) {
                intake[f.key] = new Date(val).toISOString().split("T")[0];
            } else {
                intake[f.key] = val != null ? String(val) : "";
            }
        }
        setIntakeForm(intake);
        setLoading(false);
    }, [id, router]);

    useEffect(() => { fetchPatient(); }, [fetchPatient]);

    const saveInfo = async () => {
        setSavingInfo(true);
        await fetch(`/api/patients/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(infoForm),
        });
        setSavingInfo(false);
        setEditingInfo(false);
        fetchPatient();
    };

    const saveIntake = async () => {
        setSavingIntake(true);
        setIntakeMsg("");
        await fetch(`/api/patients/${id}/intake`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(intakeForm),
        });
        setSavingIntake(false);
        setIntakeMsg("Assessment saved!");
        setTimeout(() => setIntakeMsg(""), 2500);
        fetchPatient();
    };

    const handleArchiveToggle = async () => {
        const action = patient?.archived ? "restore" : "archive";
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this patient?`)) return;
        await fetch(`/api/patients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: !patient?.archived }),
        });
        fetchPatient();
    };

    const formatDate = (d: string | null) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const statusColors: Record<string, string> = {
        SCHEDULED: "#60a5fa",
        WAITING: "#fbbf24",
        CHECKED_IN: "#34d399",
        WITH_DOCTOR: "#a78bfa",
        CHECKED_OUT: "rgba(255,255,255,0.35)",
    };

    if (loading) {
        return <div style={{ color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading…</div>;
    }
    if (!patient) return null;

    return (
        <div>
            {/* Header */}
            <div className="profile-header">
                <button className="btn-back" onClick={() => router.push("/admin/patients")}>← Back</button>
                <div className="header-main">
                    <div className="header-info">
                        <h1>{patient.name}</h1>
                        <div className="header-meta">
                            <span>📞 <a href={`tel:${patient.phone1}`}>{patient.phone1}</a></span>
                            {patient.phone2 && <span>📞 <a href={`tel:${patient.phone2}`}>{patient.phone2}</a></span>}
                            <span>Last visit: {formatDate(patient.lastVisitDate)}</span>
                            <span>Patient #{patient.id}</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        {patient.archived && <span className="badge-archived">ARCHIVED</span>}
                        <button className="btn-sm btn-edit" onClick={() => setEditingInfo(true)}>Edit Info</button>
                        <button className="btn-sm btn-archive" onClick={handleArchiveToggle}>
                            {patient.archived ? "Restore" : "Archive"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Info Modal */}
            {editingInfo && (
                <div className="modal-overlay" onClick={() => setEditingInfo(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Update Patient Info</h2>
                        <div className="form-stack">
                            <div className="form-group">
                                <label>Name</label>
                                <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone 1</label>
                                <input value={infoForm.phone1} onChange={(e) => setInfoForm({ ...infoForm, phone1: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone 2</label>
                                <input value={infoForm.phone2} onChange={(e) => setInfoForm({ ...infoForm, phone2: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setEditingInfo(false)}>Cancel</button>
                            <button className="btn-save" onClick={saveInfo} disabled={savingInfo}>
                                {savingInfo ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === "intake" ? "active" : ""}`} onClick={() => setActiveTab("intake")}>Clinical Assessment</button>
                <button className={`tab ${activeTab === "sessions" ? "active" : ""}`} onClick={() => setActiveTab("sessions")}>Sessions ({patient.reservations.length})</button>
                <button className={`tab ${activeTab === "files" ? "active" : ""}`} onClick={() => setActiveTab("files")}>Files ({patient.files.length})</button>
            </div>

            {/* Clinical Intake Tab */}
            {activeTab === "intake" && (
                <div className="section-card">
                    {intakeMsg && <div className="success-msg">{intakeMsg}</div>}
                    <div className="intake-grid">
                        {INTAKE_FIELDS.map((f) => (
                            <div key={f.key} className={`form-group ${f.type === "textarea" ? "full-width" : ""}`}>
                                <label>{f.label}</label>
                                {f.type === "textarea" ? (
                                    <textarea
                                        rows={3}
                                        value={intakeForm[f.key] || ""}
                                        onChange={(e) => setIntakeForm({ ...intakeForm, [f.key]: e.target.value })}
                                    />
                                ) : (
                                    <input
                                        type={f.type}
                                        value={intakeForm[f.key] || ""}
                                        onChange={(e) => setIntakeForm({ ...intakeForm, [f.key]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="section-actions">
                        <button className="btn-save" onClick={saveIntake} disabled={savingIntake}>
                            {savingIntake ? "Saving…" : "Update Assessment"}
                        </button>
                    </div>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
                <div className="section-card">
                    {patient.reservations.length === 0 ? (
                        <p className="empty-text">No sessions yet</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Injury</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.reservations.map((r) => (
                                    <tr key={r.id}>
                                        <td>{formatDate(r.sessionDate)}</td>
                                        <td>
                                            <span className="doctor-tag" style={{ borderColor: r.doctor.color || "#666" }}>
                                                {r.doctor.name}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-dot" style={{ background: statusColors[r.status] || "#666" }} />
                                            {r.status.replace("_", " ")}
                                        </td>
                                        <td>{r.paymentType || "—"}</td>
                                        <td>{r.injuryPlace || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Files Tab */}
            {activeTab === "files" && (
                <div className="section-card">
                    {patient.files.length === 0 ? (
                        <p className="empty-text">No files uploaded yet</p>
                    ) : (
                        <div className="files-grid">
                            {patient.files.map((f) => (
                                <a key={f.id} href={f.filePath} target="_blank" rel="noreferrer" className="file-card">
                                    <span className="file-icon">{f.fileType.includes("image") ? "🖼" : "📄"}</span>
                                    <span className="file-name">{f.fileName}</span>
                                    <span className="file-date">{formatDate(f.uploadedAt)}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .profile-header { margin-bottom: 1.5rem; }
                .btn-back {
                    background: none; border: none; color: rgba(255,255,255,0.45);
                    font-size: 0.85rem; cursor: pointer; margin-bottom: 0.75rem;
                    display: inline-block; font-family: inherit;
                }
                .btn-back:hover { color: #fff; }
                .header-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
                .header-info h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.35rem; }
                .header-meta { display: flex; gap: 1.25rem; flex-wrap: wrap; color: rgba(255,255,255,0.45); font-size: 0.85rem; }
                .header-meta a { color: var(--primary, #4CAF93); text-decoration: none; }
                .header-meta a:hover { text-decoration: underline; }
                .header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
                .badge-archived {
                    background: rgba(239,68,68,0.12); color: #fca5a5;
                    padding: 0.2rem 0.6rem; border-radius: var(--radius-sm, 2px);
                    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
                }
                .btn-sm {
                    padding: 0.3rem 0.7rem; border-radius: var(--radius-sm, 2px); font-size: 0.8rem;
                    border: none; cursor: pointer; font-weight: 500; font-family: inherit;
                }
                .btn-edit { background: rgba(96,165,250,0.12); color: #93c5fd; }
                .btn-edit:hover { background: rgba(96,165,250,0.22); }
                .btn-archive { background: rgba(251,191,36,0.12); color: #fbbf24; }
                .btn-archive:hover { background: rgba(251,191,36,0.22); }
                .tabs {
                    display: flex; gap: 0; margin-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .tab {
                    background: none; border: none; color: rgba(255,255,255,0.4);
                    padding: 0.7rem 1.2rem; font-size: 0.85rem; font-weight: 500;
                    cursor: pointer; border-bottom: 2px solid transparent;
                    transition: all 0.15s; font-family: inherit;
                }
                .tab:hover { color: rgba(255,255,255,0.7); }
                .tab.active { color: var(--primary, #4CAF93); border-bottom-color: var(--primary, #4CAF93); }
                .section-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: var(--radius-md, 4px); padding: 1.5rem;
                }
                .success-msg {
                    background: rgba(76,175,147,0.1); border: 1px solid rgba(76,175,147,0.2);
                    color: #6ee7b7; padding: 0.5rem 0.85rem; border-radius: var(--radius-sm, 2px);
                    font-size: 0.82rem; margin-bottom: 1rem;
                }
                .intake-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
                .full-width { grid-column: 1 / -1; }
                .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
                .form-group label { font-size: 0.76rem; color: rgba(255,255,255,0.5); font-weight: 500; }
                .form-group input, .form-group textarea {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: var(--radius-sm, 2px); padding: 0.55rem 0.75rem; color: #fff;
                    font-size: 0.85rem; outline: none; font-family: inherit; resize: vertical;
                }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary, #4CAF93); }
                .section-actions { margin-top: 1.25rem; display: flex; justify-content: flex-end; }
                .btn-save {
                    background: var(--primary, #4CAF93); color: #fff;
                    border: none; border-radius: var(--radius-sm, 2px);
                    padding: 0.5rem 1.25rem; font-size: 0.85rem; font-weight: 600;
                    cursor: pointer; font-family: inherit;
                }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th {
                    text-align: left; padding: 0.7rem 0.85rem; font-size: 0.74rem;
                    text-transform: uppercase; letter-spacing: 0.05em;
                    color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-weight: 600;
                }
                .data-table td {
                    padding: 0.65rem 0.85rem; font-size: 0.85rem;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.8);
                }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .doctor-tag {
                    border-left: 3px solid; padding-left: 0.5rem;
                }
                .status-dot {
                    display: inline-block; width: 7px; height: 7px; border-radius: 50%;
                    margin-right: 0.4rem; vertical-align: middle;
                }
                .empty-text { color: rgba(255,255,255,0.35); text-align: center; padding: 2rem 0; }
                .files-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }
                .file-card {
                    display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
                    padding: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: var(--radius-sm, 2px); text-decoration: none; color: #fff;
                    transition: background 0.15s;
                }
                .file-card:hover { background: rgba(255,255,255,0.08); }
                .file-icon { font-size: 1.5rem; }
                .file-name { font-size: 0.78rem; text-align: center; word-break: break-all; }
                .file-date { font-size: 0.7rem; color: rgba(255,255,255,0.3); }
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(4px);
                }
                .modal-card {
                    background: var(--bg-dark-secondary, #243b44); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: var(--radius-md, 4px); padding: 2rem; width: 100%; max-width: 440px;
                }
                .modal-card h2 { font-size: 1.2rem; margin-bottom: 1.25rem; font-weight: 600; }
                .form-stack { display: flex; flex-direction: column; gap: 0.9rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1.5rem; }
                .btn-cancel {
                    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 2px);
                    padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; font-family: inherit;
                }
            `}</style>
        </div>
    );
}
