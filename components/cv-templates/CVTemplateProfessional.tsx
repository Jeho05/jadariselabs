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

/* ══════════════════════════════════════════════════════
   CV Template — Professional Premium
   Optimized for browser window.print() (Vector PDFs)
   ══════════════════════════════════════════════════════ */

const COLORS = {
    headerBg: '#111827', // darker premium slate
    headerText: '#FFFFFF',
    gold: '#C9A84C', // premium gold accent
    goldLight: '#E8D9A0',
    bodyText: '#1F2937',
    bodyLight: '#4B5563',
    bodyMuted: '#9CA3AF',
    sidebarBg: '#F9FAFB',
    border: '#E5E7EB',
    white: '#FFFFFF',
    badgeDark: '#1F2937',
    badgeLight: '#E5E7EB',
    dot: '#C9A84C',
};

function SectionHeading({ title }: { title: string }) {
    return (
        <div style={{
            borderBottom: `2px solid ${COLORS.gold}`,
            paddingBottom: '4px',
            marginBottom: '16px',
            position: 'relative'
        }}>
            <span style={{
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '1.5px',
                color: COLORS.headerBg,
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
            }}>
                {title}
            </span>
        </div>
    );
}

export function CVTemplateProfessional({ data, photoPreview }: { data: CVData; photoPreview?: string | null }) {
    if (!data) return null;
    const { personalInfo, summary, experience, education, skills, languages, certifications, interests, references } = data;
    const photoSrc = photoPreview || personalInfo?.photoUrl;

    const hasLanguages = languages && languages.length > 0;
    const hasCertifications = certifications && certifications.length > 0;
    const hasInterests = interests && interests.length > 0;
    const hasReferences = references && references.length > 0;
    const hasSkills = skills && skills.length > 0;
    const hasSidebar = hasSkills || hasLanguages || hasCertifications || hasInterests || hasReferences;

    return (
        <>
            {/* Inline CSS targeting print & page breaking to make perfect Vector PDFs */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: #fff;
                    }
                    #cv-export-wrapper {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        break-inside: avoid;
                    }
                    /* Hide EVERYTHING outside the CV wrapper */
                    body > *:not(.cv-print-container) {
                        display: none !important;
                    }
                    .cv-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    
                    /* Prevent page breaks breaking items in half */
                    .avoid-break {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>
            
            <div className="cv-print-container" style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                    id="cv-export-wrapper"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        backgroundColor: COLORS.white,
                        fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
                        color: COLORS.bodyText,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* ═══ HEADER ═══ */}
                    <div style={{
                        backgroundColor: COLORS.headerBg,
                        padding: photoSrc ? '35px 45px' : '45px 45px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '30px',
                        flexShrink: 0,
                    }}>
                        {/* Photo */}
                        {photoSrc && (
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '16px', // modern rounded square
                                overflow: 'hidden',
                                border: `3px solid ${COLORS.gold}`,
                                flexShrink: 0,
                                backgroundColor: '#fff'
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photoSrc}
                                    alt="Photo"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }}
                                />
                            </div>
                        )}

                        {/* Name & Contact */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 800,
                                color: COLORS.headerText,
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2',
                                marginBottom: '6px',
                            }}>
                                {personalInfo?.fullName || 'Prénom Nom'}
                            </div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 500,
                                color: COLORS.gold,
                                letterSpacing: '0.5px',
                                marginBottom: '16px',
                            }}>
                                {personalInfo?.jobTitle || 'Votre Poste'}
                            </div>

                            {/* Contact row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '16px', fontSize: '12px', color: '#D1D5DB' }}>
                                {personalInfo?.email && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        ✉ {personalInfo.email}
                                    </span>
                                )}
                                {personalInfo?.phone && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        ☎ {personalInfo.phone}
                                    </span>
                                )}
                                {personalInfo?.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        📍 {personalInfo.location}
                                    </span>
                                )}
                                {personalInfo?.linkedin && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        in/ {personalInfo.linkedin.replace('https://', '').replace('www.linkedin.com/in/', '')}
                                    </span>
                                )}
                                {personalInfo?.website && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        🌐 {personalInfo.website.replace('https://', '')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══ BODY ═══ */}
                    <div style={{
                        display: 'flex',
                        flex: 1, // fill remaining height
                    }}>
                        {/* ── Main Column ── */}
                        <div style={{
                            flex: hasSidebar ? '2.2' : '1',
                            padding: '35px 35px 35px 45px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '28px'
                        }}>
                            {/* Summary */}
                            {summary && (
                                <div className="avoid-break">
                                    <SectionHeading title="Profil Professionnel" />
                                    <p style={{
                                        color: COLORS.bodyLight,
                                        fontSize: '13.5px',
                                        lineHeight: '1.7',
                                        margin: 0,
                                        textAlign: 'justify' as const
                                    }}>
                                        {summary}
                                    </p>
                                </div>
                            )}

                            {/* Experience */}
                            {experience && experience.length > 0 && (
                                <div>
                                    <SectionHeading title="Expériences" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="avoid-break">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '15px', fontWeight: 700, color: COLORS.headerBg }}>
                                                            {exp.role}
                                                        </div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.gold, marginTop: '2px' }}>
                                                            {exp.company}{exp.location ? ` — ${exp.location}` : ''}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: COLORS.bodyLight,
                                                        backgroundColor: '#F3F4F6',
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap' as const,
                                                    }}>
                                                        {exp.period}
                                                    </div>
                                                </div>
                                                {/* Achievements */}
                                                {exp.achievements && exp.achievements.length > 0 && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        {exp.achievements.map((ach, i) => (
                                                            <div key={i} style={{
                                                                fontSize: '13px',
                                                                color: COLORS.bodyLight,
                                                                paddingLeft: '16px',
                                                                marginBottom: '5px',
                                                                lineHeight: '1.6',
                                                                position: 'relative' as const,
                                                            }}>
                                                                <span style={{
                                                                    position: 'absolute' as const,
                                                                    left: '0',
                                                                    top: '8px',
                                                                    width: '5px',
                                                                    height: '5px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: COLORS.dot,
                                                                    display: 'inline-block',
                                                                }} />
                                                                {ach}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {education && education.length > 0 && (
                                <div>
                                    <SectionHeading title="Formations" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="avoid-break">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.headerBg }}>{edu.degree}</span>
                                                    <span style={{ fontSize: '11px', color: COLORS.bodyMuted, fontWeight: 500 }}>{edu.period}</span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: COLORS.bodyLight, marginTop: '2px', fontWeight: 500 }}>{edu.institution}</div>
                                                {edu.details && <div style={{ fontSize: '12px', color: COLORS.bodyMuted, fontStyle: 'italic', marginTop: '2px' }}>{edu.details}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar ── */}
                        {hasSidebar && (
                            <div style={{
                                width: '240px',
                                flexShrink: 0,
                                padding: '35px 35px 35px 25px',
                                backgroundColor: COLORS.sidebarBg,
                                borderLeft: `1px solid ${COLORS.border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '28px'
                            }}>
                                {/* Skills */}
                                {hasSkills && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Compétences" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                                            {skills.map((skill, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    backgroundColor: idx < 5 ? COLORS.badgeDark : COLORS.badgeLight,
                                                    color: idx < 5 ? COLORS.white : COLORS.bodyText,
                                                    display: 'inline-block',
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Languages */}
                                {hasLanguages && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Langues" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {languages!.map((lang, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.bodyText }}>{lang.name}</span>
                                                    <span style={{ fontSize: '11px', color: COLORS.bodyMuted, fontStyle: 'italic' }}>{lang.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {hasCertifications && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Certifications" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {certifications!.map((cert, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.bodyText, lineHeight: '1.3' }}>{cert.name}</div>
                                                    <div style={{ fontSize: '11.5px', color: COLORS.bodyMuted, marginTop: '2px' }}>
                                                        {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Interests */}
                                {hasInterests && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Intérêts" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                                            {interests!.map((item, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '11px',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    backgroundColor: COLORS.white,
                                                    border: `1px solid ${COLORS.border}`,
                                                    color: COLORS.bodyLight,
                                                    display: 'inline-block',
                                                }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* References */}
                                {hasReferences && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Références" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {references!.map((ref, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.bodyText }}>{ref.name}</div>
                                                    <div style={{ fontSize: '11.5px', color: COLORS.bodyLight, marginTop: '1px' }}>{ref.role}</div>
                                                    {ref.contact && <div style={{ fontSize: '11.5px', color: COLORS.gold, marginTop: '2px' }}>{ref.contact}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
