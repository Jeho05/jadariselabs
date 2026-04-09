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
   CV Template — Professional A4
   ALL inline styles, NO CSS variables, NO Tailwind
   Optimized for html2canvas PDF capture
   ══════════════════════════════════════════════════════ */

const COLORS = {
    headerBg: '#1B2A4A',
    headerText: '#FFFFFF',
    gold: '#C9A84C',
    goldLight: '#E8D9A0',
    bodyText: '#333333',
    bodyLight: '#666666',
    bodyMuted: '#999999',
    sidebarBg: '#F7F5F0',
    border: '#E5E2DA',
    white: '#FFFFFF',
    badgeDark: '#1B2A4A',
    badgeLight: '#EDEBE6',
    dot: '#C9A84C',
};

function SectionHeading({ title }: { title: string }) {
    return (
        <div style={{
            borderBottom: `2px solid ${COLORS.gold}`,
            paddingBottom: '6px',
            marginBottom: '14px',
        }}>
            <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '2px',
                color: COLORS.headerBg,
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

    // Check which sidebar sections exist
    const hasLanguages = languages && languages.length > 0;
    const hasCertifications = certifications && certifications.length > 0;
    const hasInterests = interests && interests.length > 0;
    const hasReferences = references && references.length > 0;
    const hasSkills = skills && skills.length > 0;
    const hasSidebar = hasSkills || hasLanguages || hasCertifications || hasInterests || hasReferences;

    return (
        <div
            id="cv-export-wrapper"
            style={{
                width: '794px',
                minHeight: '1123px',
                backgroundColor: COLORS.white,
                fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                fontSize: '13px',
                lineHeight: '1.55',
                color: COLORS.bodyText,
                boxSizing: 'border-box' as const,
            }}
        >
            {/* ═══ HEADER ═══ */}
            <div style={{
                backgroundColor: COLORS.headerBg,
                padding: photoSrc ? '36px 44px' : '40px 44px',
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
            }}>
                {/* Photo */}
                {photoSrc && (
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: `3px solid ${COLORS.gold}`,
                        flexShrink: 0,
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photoSrc}
                            alt="Photo"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' as const, display: 'block' }}
                        />
                    </div>
                )}

                {/* Name & Contact */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '30px',
                        fontWeight: 800,
                        color: COLORS.headerText,
                        letterSpacing: '-0.3px',
                        lineHeight: '1.2',
                        marginBottom: '4px',
                    }}>
                        {personalInfo?.fullName || 'Votre Nom'}
                    </div>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: COLORS.gold,
                        letterSpacing: '0.5px',
                        marginBottom: '14px',
                    }}>
                        {personalInfo?.jobTitle || 'Poste visé'}
                    </div>

                    {/* Contact row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '18px', fontSize: '11.5px', color: COLORS.goldLight }}>
                        {personalInfo?.email && (
                            <span>✉ {personalInfo.email}</span>
                        )}
                        {personalInfo?.phone && (
                            <span>☎ {personalInfo.phone}</span>
                        )}
                        {personalInfo?.location && (
                            <span>📍 {personalInfo.location}</span>
                        )}
                        {personalInfo?.linkedin && (
                            <span>🔗 {personalInfo.linkedin}</span>
                        )}
                        {personalInfo?.website && (
                            <span>🌐 {personalInfo.website}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ BODY ═══ */}
            <div style={{
                display: 'flex',
                minHeight: 'calc(1123px - 180px)',
            }}>
                {/* ── Main Column ── */}
                <div style={{
                    flex: hasSidebar ? '2' : '1',
                    padding: '28px 32px 28px 44px',
                }}>
                    {/* Summary */}
                    {summary && (
                        <div style={{ marginBottom: '24px' }}>
                            <SectionHeading title="Profil Professionnel" />
                            <p style={{
                                color: COLORS.bodyLight,
                                fontSize: '13px',
                                lineHeight: '1.7',
                                margin: 0,
                            }}>
                                {summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <SectionHeading title="Expériences Professionnelles" />
                            {experience.map((exp, idx) => (
                                <div key={idx} style={{ marginBottom: idx < experience.length - 1 ? '18px' : '0' }}>
                                    {/* Role + Period */}
                                    <div style={{ marginBottom: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.headerBg }}>
                                                {exp.role}
                                            </span>
                                            <span style={{
                                                fontSize: '10.5px',
                                                color: COLORS.bodyMuted,
                                                backgroundColor: '#F3F3F3',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap' as const,
                                                marginLeft: '8px',
                                            }}>
                                                {exp.period}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: COLORS.gold, marginTop: '1px' }}>
                                            {exp.company}{exp.location ? ` — ${exp.location}` : ''}
                                        </div>
                                    </div>
                                    {/* Achievements */}
                                    {exp.achievements && exp.achievements.length > 0 && (
                                        <div style={{ marginTop: '6px' }}>
                                            {exp.achievements.map((ach, i) => (
                                                <div key={i} style={{
                                                    fontSize: '12.5px',
                                                    color: COLORS.bodyLight,
                                                    paddingLeft: '14px',
                                                    marginBottom: '3px',
                                                    lineHeight: '1.6',
                                                    position: 'relative' as const,
                                                }}>
                                                    <span style={{
                                                        position: 'absolute' as const,
                                                        left: '0',
                                                        top: '7px',
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
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <SectionHeading title="Formation" />
                            {education.map((edu, idx) => (
                                <div key={idx} style={{ marginBottom: idx < education.length - 1 ? '12px' : '0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: COLORS.headerBg }}>{edu.degree}</span>
                                        <span style={{ fontSize: '10.5px', color: COLORS.bodyMuted, whiteSpace: 'nowrap' as const, marginLeft: '8px' }}>{edu.period}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: COLORS.bodyLight, marginTop: '1px' }}>{edu.institution}</div>
                                    {edu.details && <div style={{ fontSize: '11.5px', color: COLORS.bodyMuted, fontStyle: 'italic', marginTop: '1px' }}>{edu.details}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Sidebar ── */}
                {hasSidebar && (
                    <div style={{
                        width: '260px',
                        flexShrink: 0,
                        padding: '28px 28px 28px 24px',
                        backgroundColor: COLORS.sidebarBg,
                        borderLeft: `1px solid ${COLORS.border}`,
                    }}>
                        {/* Skills */}
                        {hasSkills && (
                            <div style={{ marginBottom: '24px' }}>
                                <SectionHeading title="Compétences" />
                                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                                    {skills.map((skill, idx) => (
                                        <span key={idx} style={{
                                            fontSize: '10.5px',
                                            fontWeight: 600,
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: idx < 4 ? COLORS.badgeDark : COLORS.badgeLight,
                                            color: idx < 4 ? COLORS.white : COLORS.bodyText,
                                            display: 'inline-block',
                                            marginBottom: '1px',
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {hasLanguages && (
                            <div style={{ marginBottom: '24px' }}>
                                <SectionHeading title="Langues" />
                                {languages!.map((lang, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '6px',
                                    }}>
                                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: COLORS.bodyText }}>{lang.name}</span>
                                        <span style={{ fontSize: '11px', color: COLORS.bodyMuted, fontStyle: 'italic' }}>{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {hasCertifications && (
                            <div style={{ marginBottom: '24px' }}>
                                <SectionHeading title="Certifications" />
                                {certifications!.map((cert, idx) => (
                                    <div key={idx} style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: COLORS.bodyText }}>{cert.name}</div>
                                        <div style={{ fontSize: '11px', color: COLORS.bodyMuted }}>
                                            {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interests */}
                        {hasInterests && (
                            <div style={{ marginBottom: '24px' }}>
                                <SectionHeading title="Centres d&apos;intérêt" />
                                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                                    {interests!.map((item, idx) => (
                                        <span key={idx} style={{
                                            fontSize: '10.5px',
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: COLORS.badgeLight,
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
                            <div>
                                <SectionHeading title="Références" />
                                {references!.map((ref, idx) => (
                                    <div key={idx} style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: COLORS.bodyText }}>{ref.name}</div>
                                        <div style={{ fontSize: '11px', color: COLORS.bodyMuted }}>{ref.role}</div>
                                        {ref.contact && <div style={{ fontSize: '11px', color: COLORS.gold }}>{ref.contact}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
