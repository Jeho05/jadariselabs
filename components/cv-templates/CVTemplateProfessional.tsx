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
        dateOfBirth?: string;
        nationality?: string;
        drivingLicense?: string;
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
    projects?: Array<{
        name: string;
        description?: string;
        technologies?: string;
        url?: string;
    }>;
    volunteer?: Array<{
        role: string;
        organization: string;
        period?: string;
        description?: string;
    }>;
    awards?: Array<{
        name: string;
        issuer?: string;
        year?: string;
    }>;
    customSections?: Array<{
        title: string;
        items: string[];
    }>;
}

/* ══════════════════════════════════════════════════════
   CV Template — "Prestige" Edition (HTML Preview)
   Matches the React-PDF version pixel-perfectly
   ══════════════════════════════════════════════════════ */

const C = {
    navyDark:   '#0B1120',
    navy:       '#111827',
    navyMid:    '#1A2540',
    gold:       '#C9A84C',
    goldMuted:  '#D4BE7A',
    goldPale:   '#F5EFDB',
    white:      '#FFFFFF',
    offWhite:   '#FAFBFC',
    sidebar:    '#F4F5F7',
    textDark:   '#111827',
    textBody:   '#374151',
    textLight:  '#6B7280',
    textMuted:  '#9CA3AF',
    border:     '#E5E7EB',
    borderLight:'#F3F4F6',
    badgeDark:  '#1F2937',
};

function SectionHeading({ title }: { title: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            gap: '8px',
        }}>
            {/* Gold dot */}
            <div style={{
                width: '9px', height: '9px',
                borderRadius: '50%',
                backgroundColor: C.gold,
                flexShrink: 0,
            }} />
            <span style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '1.5px',
                color: C.navy,
                whiteSpace: 'nowrap' as const,
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            }}>
                {title}
            </span>
            {/* Extending line */}
            <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: C.border,
            }} />
        </div>
    );
}

export function CVTemplateProfessional({ data, photoPreview }: { data: CVData; photoPreview?: string | null }) {
    if (!data) return null;
    const { personalInfo, summary, experience, education, skills, languages, certifications, interests, references, projects, volunteer, awards, customSections } = data;
    const photoSrc = photoPreview || personalInfo?.photoUrl;

    const hasLanguages = languages && languages.length > 0;
    const hasCertifications = certifications && certifications.length > 0;
    const hasInterests = interests && interests.length > 0;
    const hasReferences = references && references.length > 0;
    const hasSkills = skills && skills.length > 0;
    const hasProjects = projects && projects.length > 0;
    const hasVolunteer = volunteer && volunteer.length > 0;
    const hasAwards = awards && awards.length > 0;
    const hasCustom = customSections && customSections.length > 0;
    const hasSidebar = hasSkills || hasLanguages || hasCertifications || hasInterests || hasReferences || hasAwards;

    const contactItems: Array<{ icon: string; text: string }> = [];
    if (personalInfo?.email) contactItems.push({ icon: '✉', text: personalInfo.email });
    if (personalInfo?.phone) contactItems.push({ icon: '☎', text: personalInfo.phone });
    if (personalInfo?.location) contactItems.push({ icon: '📍', text: personalInfo.location });
    if (personalInfo?.linkedin) contactItems.push({ icon: 'in', text: personalInfo.linkedin.replace('https://', '').replace('www.linkedin.com/in/', '') });
    if (personalInfo?.website) contactItems.push({ icon: '🌐', text: personalInfo.website.replace('https://', '') });
    if (personalInfo?.dateOfBirth) contactItems.push({ icon: '🎂', text: personalInfo.dateOfBirth });
    if (personalInfo?.nationality) contactItems.push({ icon: '🏳', text: personalInfo.nationality });
    if (personalInfo?.drivingLicense) contactItems.push({ icon: '🚗', text: `Permis ${personalInfo.drivingLicense}` });

    return (
        <>
            {/* Inline CSS targeting print & page breaking */}
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
                        backgroundColor: C.white,
                        fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
                        color: C.textDark,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    {/* ═══ HEADER ═══ */}
                    <div style={{
                        backgroundColor: C.navy,
                        padding: '24px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative corner accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '60px',
                            height: '60px',
                            borderBottomLeftRadius: '60px',
                            backgroundColor: C.navyMid,
                            opacity: 0.5,
                        }} />

                        {/* Photo — BIG and prominent */}
                        {photoSrc && (
                            <div style={{
                                width: '80px', height: '80px',
                                borderRadius: '50%',
                                background: C.gold,
                                padding: '1.5px',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    backgroundColor: C.white,
                                    padding: '1.5px',
                                    overflow: 'hidden',
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photoSrc}
                                        alt="Photo"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover' as const,
                                            display: 'block',
                                            borderRadius: '50%',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Name & Contact */}
                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 800,
                                color: C.white,
                                textTransform: 'uppercase' as const,
                                letterSpacing: '1.5px',
                                lineHeight: '1.2',
                                marginBottom: '4px',
                            }}>
                                {personalInfo?.fullName || 'Prénom Nom'}
                            </div>
                            <div style={{
                                fontSize: '9.5px',
                                fontWeight: 600,
                                color: C.gold,
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase' as const,
                                marginBottom: '10px',
                            }}>
                                {personalInfo?.jobTitle || 'Votre Poste'}
                            </div>

                            {/* Contact pills with gold dot separators */}
                            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', alignItems: 'center' }}>
                                {contactItems.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        {idx > 0 && (
                                            <div style={{
                                                width: '2.5px',
                                                height: '2.5px',
                                                borderRadius: '50%',
                                                backgroundColor: C.gold,
                                                opacity: 0.6,
                                            }} />
                                        )}
                                        <span style={{
                                            fontSize: '9.5px',
                                            color: '#D1D5DB',
                                            backgroundColor: 'rgba(255,255,255,0.07)',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                        }}>
                                            <span style={{ fontSize: '7.5px' }}>{item.icon}</span> {item.text}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Bottom gold stripe */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            backgroundColor: C.gold,
                        }} />
                    </div>

                    {/* ═══ BODY ═══ */}
                    <div style={{
                        display: 'flex',
                        flex: 1,
                    }}>
                        {/* ── Sidebar ── */}
                        {hasSidebar && (
                            <div style={{
                                width: '32%',
                                flexShrink: 0,
                                padding: '20px 16px',
                                backgroundColor: C.sidebar,
                                borderRight: `1px solid ${C.border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '7px',
                            }}>
                                {/* Skills */}
                                {hasSkills && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Compétences" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '3px' }}>
                                            {skills.map((skill, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '9.5px',
                                                    fontWeight: 600,
                                                    padding: '3px 6px',
                                                    borderRadius: '4px',
                                                    backgroundColor: idx < 5 ? C.badgeDark : C.white,
                                                    color: idx < 5 ? C.white : C.textBody,
                                                    border: idx >= 5 ? `1px solid ${C.border}` : 'none',
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                            {languages!.map((lang, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '3px 0',
                                                    borderBottom: `1px solid ${C.borderLight}`,
                                                }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 600, color: C.textDark }}>{lang.name}</span>
                                                    <span style={{ fontSize: '9.5px', color: C.textMuted, fontStyle: 'italic' }}>{lang.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {hasCertifications && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Certifications" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {certifications!.map((cert, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: '10px', fontWeight: 600, color: C.textDark, lineHeight: '1.3' }}>{cert.name}</div>
                                                    <div style={{ fontSize: '9.5px', color: C.textMuted, marginTop: '2px' }}>
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
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '3px' }}>
                                            {interests!.map((item, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '9.5px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    backgroundColor: C.white,
                                                    border: `1px solid ${C.border}`,
                                                    color: C.textLight,
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {references!.map((ref, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: '10px', fontWeight: 600, color: C.textDark }}>{ref.name}</div>
                                                    <div style={{ fontSize: '9.5px', color: C.textBody, marginTop: '1px' }}>{ref.role}</div>
                                                    {ref.contact && <div style={{ fontSize: '9.5px', color: C.gold, marginTop: '2px' }}>{ref.contact}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Awards */}
                                {hasAwards && (
                                    <div className="avoid-break">
                                        <SectionHeading title="Distinctions" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {awards!.map((aw, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: '10px', fontWeight: 600, color: C.textDark, lineHeight: '1.3' }}>{aw.name}</div>
                                                    <div style={{ fontSize: '9.5px', color: C.textMuted, marginTop: '2px' }}>
                                                        {[aw.issuer, aw.year].filter(Boolean).join(' — ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Main Column ── */}
                        <div style={{
                            flex: 1,
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px',
                        }}>
                            {/* Summary */}
                            {summary && (
                                <div className="avoid-break">
                                    <SectionHeading title="Profil Professionnel" />
                                    <p style={{
                                        color: C.textBody,
                                        fontSize: '10px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        textAlign: 'justify' as const,
                                    }}>
                                        {summary}
                                    </p>
                                </div>
                            )}

                            {/* Experience — left border timeline */}
                            {experience && experience.length > 0 && (
                                <div>
                                    <SectionHeading title="Expériences" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="avoid-break" style={{
                                                paddingLeft: '12px',
                                                borderLeft: `2px solid ${C.borderLight}`,
                                                marginBottom: '16px',
                                                position: 'relative',
                                            }}>
                                                {/* Timeline dot */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-5.5px',
                                                    top: '4px',
                                                    width: '9px', height: '9px',
                                                    borderRadius: '50%',
                                                    backgroundColor: C.gold,
                                                    border: `2px solid ${C.white}`,
                                                    boxShadow: `0 0 0 1px ${C.border}`,
                                                }} />
                                                <div style={{ fontSize: '9.5px', fontWeight: 700, color: C.navy }}>
                                                    {exp.role}
                                                </div>
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: C.gold, marginTop: '2px' }}>
                                                    {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                                                </div>
                                                <div style={{
                                                    fontSize: '9.5px',
                                                    color: C.textMuted,
                                                    fontWeight: 500,
                                                    marginTop: '2px',
                                                    marginBottom: '6px',
                                                }}>
                                                    {exp.period}
                                                </div>
                                                {exp.achievements && exp.achievements.length > 0 && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        {exp.achievements.map((ach, i) => (
                                                            <div key={i} style={{
                                                                fontSize: '9.5px',
                                                                color: C.textBody,
                                                                paddingLeft: '12px',
                                                                marginBottom: '4px',
                                                                lineHeight: '1.6',
                                                                position: 'relative' as const,
                                                            }}>
                                                                <span style={{
                                                                    position: 'absolute' as const,
                                                                    left: '0',
                                                                    top: '4px',
                                                                    width: '4px',
                                                                    height: '3px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: C.gold,
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="avoid-break">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: C.navy }}>{edu.degree}</span>
                                                    <span style={{ fontSize: '9.5px', color: C.gold, fontWeight: 600 }}>{edu.period}</span>
                                                </div>
                                                <div style={{ fontSize: '9.5px', color: C.textBody, marginTop: '2px', fontWeight: 500 }}>{edu.institution}</div>
                                                {edu.details && <div style={{ fontSize: '9.5px', color: C.textMuted, fontStyle: 'italic', marginTop: '2px' }}>{edu.details}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {hasProjects && (
                                <div>
                                    <SectionHeading title="Projets" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                        {projects!.map((proj, idx) => (
                                            <div key={idx} className="avoid-break">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: C.navy }}>{proj.name}</span>
                                                    {proj.url && <span style={{ fontSize: '9.5px', color: C.gold, fontWeight: 500 }}>{proj.url}</span>}
                                                </div>
                                                {proj.description && <div style={{ fontSize: '9.5px', color: C.textBody, marginTop: '2px', lineHeight: '1.5' }}>{proj.description}</div>}
                                                {proj.technologies && <div style={{ fontSize: '9.5px', color: C.textMuted, fontStyle: 'italic', marginTop: '3px' }}>{proj.technologies}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Volunteer */}
                            {hasVolunteer && (
                                <div>
                                    <SectionHeading title="Bénévolat" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                        {volunteer!.map((vol, idx) => (
                                            <div key={idx} className="avoid-break">
                                                <div style={{ fontSize: '9.5px', fontWeight: 700, color: C.navy }}>{vol.role}</div>
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: C.gold, marginTop: '1px' }}>{vol.organization}</div>
                                                {vol.period && <div style={{ fontSize: '9.5px', color: C.textMuted, fontWeight: 500, marginTop: '2px' }}>{vol.period}</div>}
                                                {vol.description && <div style={{ fontSize: '9.5px', color: C.textBody, marginTop: '3px', lineHeight: '1.5' }}>{vol.description}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Sections */}
                            {hasCustom && customSections!.map((sec, sIdx) => (
                                sec.items.length > 0 && (
                                    <div key={sIdx}>
                                        <SectionHeading title={sec.title} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {sec.items.map((item, i) => (
                                                <div key={i} style={{
                                                    fontSize: '9.5px',
                                                    color: C.textBody,
                                                    paddingLeft: '12px',
                                                    lineHeight: '1.6',
                                                    position: 'relative' as const,
                                                }}>
                                                    <span style={{
                                                        position: 'absolute' as const,
                                                        left: '0',
                                                        top: '4px',
                                                        width: '4px',
                                                        height: '3px',
                                                        borderRadius: '50%',
                                                        backgroundColor: C.gold,
                                                        display: 'inline-block',
                                                    }} />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom gold stripe ── */}
                    <div style={{
                        height: '3px',
                        backgroundColor: C.gold,
                        flexShrink: 0,
                    }} />
                </div>
            </div>
        </>
    );
}
