'use client';

import React from 'react';

/* ─── Extended CV Data Structure ─── */
export interface CVData {
    personalInfo: {
        fullName: string;
        jobTitle: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
        website?: string;
        photoUrl?: string;
    };
    summary: string;
    experience: Array<{
        role: string;
        company: string;
        period: string;
        location?: string;
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        period: string;
        details?: string;
    }>;
    skills: string[];
    languages?: Array<{
        name: string;
        level: string;
    }>;
    certifications?: Array<{
        name: string;
        issuer?: string;
        year?: string;
    }>;
    interests?: string[];
    references?: Array<{
        name: string;
        role: string;
        contact?: string;
    }>;
}

/* ─── Inline SVG icon helpers (to avoid Tailwind class issues in PDF capture) ─── */
const SvgMail = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const SvgPhone = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const SvgPin = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const SvgLink = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const SvgBriefcase = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
);
const SvgGrad = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const SvgStar = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const SvgGlobe = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);
const SvgAward = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
);
const SvgHeart = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const SvgUsers = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

/* ─── Section Title ─── */
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #C9A84C' }}>
            <span style={{ color: '#C9A84C' }}>{icon}</span>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#2D2D2D', margin: 0 }}>{title}</h3>
        </div>
    );
}

/* ─── Main CV Component ─── */
export function CVTemplateProfessional({ data, photoPreview }: { data: CVData; photoPreview?: string | null }) {
    if (!data) return null;
    const { personalInfo, summary, experience, education, skills, languages, certifications, interests, references } = data;
    const photoSrc = photoPreview || personalInfo?.photoUrl;

    return (
        <div
            id="cv-export-wrapper"
            style={{
                width: '794px',      // A4 width at 96dpi
                minHeight: '1123px', // A4 height at 96dpi
                background: '#fff',
                fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#333',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* ── Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#fff',
                padding: '40px 48px',
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                position: 'relative',
            }}>
                {/* Decorative accent */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: 'linear-gradient(135deg, transparent, rgba(201,168,76,0.15))', pointerEvents: 'none' }} />

                {photoSrc && (
                    <div style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid rgba(201,168,76,0.6)',
                        flexShrink: 0,
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoSrc} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 4px 0', lineHeight: 1.2 }}>
                        {personalInfo?.fullName || 'Votre Nom'}
                    </h1>
                    <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#C9A84C', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
                        {personalInfo?.jobTitle || 'Poste visé'}
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                        {personalInfo?.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SvgMail />{personalInfo.email}</span>
                        )}
                        {personalInfo?.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SvgPhone />{personalInfo.phone}</span>
                        )}
                        {personalInfo?.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SvgPin />{personalInfo.location}</span>
                        )}
                        {personalInfo?.linkedin && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SvgLink />{personalInfo.linkedin}</span>
                        )}
                        {personalInfo?.website && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SvgLink />{personalInfo.website}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body: 2-column layout ── */}
            <div style={{ display: 'flex', minHeight: 'calc(1123px - 170px)' }}>
                {/* Main column */}
                <div style={{ flex: '2', padding: '32px 36px 32px 48px', borderRight: '1px solid #eee' }}>
                    {/* Summary */}
                    {summary && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgStar />} title="Profil professionnel" />
                            <p style={{ color: '#555', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>{summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgBriefcase />} title="Expériences professionnelles" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {experience.map((exp, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                            <div>
                                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{exp.role}</h4>
                                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', margin: '2px 0 0 0' }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p>
                                            </div>
                                            <span style={{ fontSize: '11px', background: '#f5f5f5', color: '#666', padding: '3px 10px', borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                                {exp.period}
                                            </span>
                                        </div>
                                        {exp.achievements && exp.achievements.length > 0 && (
                                            <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                                                {exp.achievements.map((a, i) => (
                                                    <li key={i} style={{ fontSize: '13px', color: '#555', paddingLeft: '16px', position: 'relative', marginBottom: '4px', lineHeight: 1.6 }}>
                                                        <span style={{ position: 'absolute', left: 0, top: '8px', width: '5px', height: '5px', borderRadius: '50%', background: '#C9A84C' }} />
                                                        {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgGrad />} title="Formation" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{edu.degree}</h4>
                                                <p style={{ fontSize: '13px', color: '#666', margin: '2px 0 0 0' }}>{edu.institution}</p>
                                                {edu.details && <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0 0', fontStyle: 'italic' }}>{edu.details}</p>}
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', marginLeft: '12px' }}>{edu.period}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ flex: '1', padding: '32px 32px 32px 28px', background: '#fafafa' }}>
                    {/* Skills */}
                    {skills && skills.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgStar />} title="Compétences" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {skills.map((skill, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: idx < 3 ? '#1a1a2e' : '#e8e4dc',
                                        color: idx < 3 ? '#fff' : '#444',
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgGlobe />} title="Langues" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {languages.map((lang, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{lang.name}</span>
                                        <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications && certifications.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgAward />} title="Certifications" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {certifications.map((cert, idx) => (
                                    <div key={idx}>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', margin: 0 }}>{cert.name}</p>
                                        <p style={{ fontSize: '11px', color: '#888', margin: '1px 0 0 0' }}>{[cert.issuer, cert.year].filter(Boolean).join(' — ')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interests */}
                    {interests && interests.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <SectionTitle icon={<SvgHeart />} title="Centres d'intérêt" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {interests.map((item, idx) => (
                                    <span key={idx} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: '#e8e4dc', color: '#555' }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* References */}
                    {references && references.length > 0 && (
                        <div>
                            <SectionTitle icon={<SvgUsers />} title="Références" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {references.map((ref, idx) => (
                                    <div key={idx}>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', margin: 0 }}>{ref.name}</p>
                                        <p style={{ fontSize: '11px', color: '#888', margin: '1px 0 0 0' }}>{ref.role}</p>
                                        {ref.contact && <p style={{ fontSize: '11px', color: '#C9A84C', margin: '1px 0 0 0' }}>{ref.contact}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
