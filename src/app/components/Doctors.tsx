"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

interface DoctorProfile {
    id: string;
    name: string;
    title: string;
    specialty: string;
    photo: string | null;
}

export default function Doctors() {
    const { t } = useLanguage();
    const [doctors, setDoctors] = useState<DoctorProfile[] | null>(null);

    useEffect(() => {
        fetch("/api/public/doctors")
            .then((res) => (res.ok ? res.json() : []))
            .then(setDoctors)
            .catch(() => setDoctors([]));
    }, []);

    return (
        <section id="doctors" className="doctors section-padding">
            <div className="container doctors-inner">
                <div className="doctors-header reveal">
                    <div className="section-label">{t.doctors.label}</div>
                    <h2 className="section-title">{t.doctors.title}</h2>
                    <p className="section-subtitle">{t.doctors.subtitle}</p>
                </div>

                {doctors && doctors.length === 0 && (
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{t.doctors.empty}</p>
                )}

                {doctors && doctors.length > 0 && (
                    <div className="doctors-grid">
                        {doctors.map((doc) => (
                            <div className="doctor-card" key={doc.id}>
                                {doc.photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={doc.photo} alt={doc.name} className="doctor-card-photo" />
                                ) : (
                                    <div className="doctor-card-placeholder">{doc.name}</div>
                                )}
                                <div className="doctor-card-scrim"></div>
                                <div className="doctor-card-text">
                                    <h3 className="doctor-card-name">{doc.name}</h3>
                                    <p className="doctor-card-role">{doc.title}</p>
                                    <p className="doctor-card-specialty">{doc.specialty}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
