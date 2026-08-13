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
   CV Template — "Éditorial d'or" Edition (HTML Preview)
   Warm ink & cream editorial layout with gold accents.
   Matches the React-PDF version.
   ══════════════════════════════════════════════════════ */

const C = {
    ink:       '#2A2622',
    body:      '#4B4640',
    muted:     '#8A837A',
    gold:      '#B8912F',
    earth:     '#7B4F2E',
    cream:     '#F7F3EB',
    line:      '#E4DCCB',
    lineSoft:  '#F0EADD',
    white:     '#FFFFFF',
};

function SectionHeading({ title }: { title: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            gap: '7px',
        }}>
            {/* Gold square */}
            <div style={{
                width: '6px', height: '6px',
                borderRadius: '1px',
                backgroundColor: C.gold,
                flexShrink: 0,
            }} />
            <span style={{
                fontSize: '8.5px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '2px',
                color: C.ink,
                whiteSpace: 'nowrap' as const,
                fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
            }}>
                {title}
            </span>
            {/* Hairline */}
            <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: C.line,
            }} />
        </div>
    );
}

const bulletStyle: React.CSSProperties = {
    fontSize: '9.5px',
    color: C.body,
    paddingLeft: '12px',
    marginBottom: '3px',
    lineHeight: 1.5,
    position: 'relative',
};

const bulletDashStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0',
    top: '0',
    color: C.gold,
    fontWeight: 700,
    display: 'inline-block',
};

function BulletItem({ text }: { text: string }) {
    return (
        <div style={bulletStyle}>
            <span style={bulletDashStyle}>–</span>
            {text}
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

    const contactItems: string[] = [];
    if (personalInfo?.email) contactItems.push(personalInfo.email);
    if (personalInfo?.phone) contactItems.push(personalInfo.phone);
    if (personalInfo?.location) contactItems.push(personalInfo.location);
    if (personalInfo?.linkedin) contactItems.push(personalInfo.linkedin.replace('https://', '').replace('www.linkedin.com/in/', ''));
    if (personalInfo?.website) contactItems.push(personalInfo.website.replace('https://', ''));
    if (personalInfo?.dateOfBirth) contactItems.push(personalInfo.dateOfBirth);
    if (personalInfo?.nationality) contactItems.push(personalInfo.nationality);
    if (personalInfo?.drivingLicense) contactItems.push(`Permis ${personalInfo.drivingLicense}`);

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
                        color: C.ink,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    {/* ═══ HEADER ═══ */}
                    <div style={{
                        backgroundColor: C.cream,
                        padding: '20px 30px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        flexShrink: 0,
                        borderBottom: `2px solid ${C.gold}`,
                    }}>
                        {/* Name & Contact */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: C.ink,
                                letterSpacing: '-0.4px',
                                lineHeight: 1.15,
                            }}>
                                {personalInfo?.fullName || 'Prénom Nom'}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: C.gold,
                                letterSpacing: '2.5px',
                                textTransform: 'uppercase' as const,
                                marginTop: '6px',
                            }}>
                                {personalInfo?.jobTitle || 'Votre Poste'}
                            </div>

                            {/* Contact line with gold dot separators */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap' as const,
                                columnGap: '4px',
                                rowGap: '3px',
                                marginTop: '10px',
                                alignItems: 'center',
                            }}>
                                {contactItems.map((item, idx) => (
                                    <span key={idx} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: '8.5px',
                                        color: C.muted,
                                    }}>
                                        {idx > 0 && (
                                            <span style={{
                                                width: '3px', height: '3px',
                                                borderRadius: '50%',
                                                backgroundColor: C.gold,
                                                marginRight: '9px',
                                                marginLeft: '5px',
                                                flexShrink: 0,
                                            }} />
                                        )}
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Photo — subtle gold ring */}
                        {photoSrc && (
                            <div style={{
                                width: '88px', height: '88px',
                                borderRadius: '50%',
                                border: `2px solid ${C.gold}`,
                                padding: '2.5px',
                                backgroundColor: C.white,
                                boxSizing: 'border-box',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photoSrc}
                                        alt="Photo de profil"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover' as const,
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══ BODY ═══ */}
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        alignItems: 'stretch',
                    }}>
                        {/* ── Sidebar ── */}
                        {hasSidebar && (
                            <div style={{
                                width: '30%',
                                flexShrink: 0,
                                padding: '18px 16px 20px',
                                backgroundColor: C.cream,
                                borderRight: `1px solid ${C.line}`,
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                {/* Skills */}
                                {hasSkills && (
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Compétences" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                                            {skills.map((skill, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '8.5px',
                                                    fontWeight: 500,
                                                    padding: '3px 9px',
                                                    borderRadius: '999px',
                                                    border: `1px solid ${C.line}`,
                                                    backgroundColor: C.white,
                                                    color: C.body,
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
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Langues" />
                                        <div>
                                            {languages!.map((lang, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '4px 0',
                                                    borderBottom: `1px solid ${C.lineSoft}`,
                                                }}>
                                                    <span style={{ fontSize: '9.5px', fontWeight: 600, color: C.ink }}>{lang.name}</span>
                                                    <span style={{ fontSize: '8.5px', color: C.muted, fontStyle: 'italic' }}>{lang.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {hasCertifications && (
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Certifications" />
                                        <div>
                                            {certifications!.map((cert, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    gap: '7px',
                                                    marginBottom: '9px',
                                                }}>
                                                    <div style={{
                                                        width: '5px', height: '5px',
                                                        borderRadius: '1px',
                                                        backgroundColor: C.gold,
                                                        flexShrink: 0,
                                                        marginTop: '3.5px',
                                                    }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '9.5px', fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{cert.name}</div>
                                                        {[cert.issuer, cert.year].filter(Boolean).length > 0 && (
                                                            <div style={{ fontSize: '8.5px', color: C.muted, marginTop: '1px' }}>
                                                                {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Interests */}
                                {hasInterests && (
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Intérêts" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                                            {interests!.map((item, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '8.5px',
                                                    fontWeight: 500,
                                                    padding: '3px 9px',
                                                    borderRadius: '999px',
                                                    border: `1px solid ${C.line}`,
                                                    backgroundColor: C.white,
                                                    color: C.body,
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
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Références" />
                                        <div>
                                            {references!.map((ref, idx) => (
                                                <div key={idx} style={{ marginBottom: '9px' }}>
                                                    <div style={{ fontSize: '9.5px', fontWeight: 600, color: C.ink }}>{ref.name}</div>
                                                    <div style={{ fontSize: '8.5px', color: C.body, marginTop: '1px' }}>{ref.role}</div>
                                                    {ref.contact && <div style={{ fontSize: '8.5px', color: C.gold, marginTop: '1px' }}>{ref.contact}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Awards */}
                                {hasAwards && (
                                    <div className="avoid-break" style={{ marginBottom: '16px' }}>
                                        <SectionHeading title="Distinctions" />
                                        <div>
                                            {awards!.map((aw, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    gap: '7px',
                                                    marginBottom: '9px',
                                                }}>
                                                    <div style={{
                                                        width: '5px', height: '5px',
                                                        borderRadius: '1px',
                                                        backgroundColor: C.gold,
                                                        flexShrink: 0,
                                                        marginTop: '3.5px',
                                                    }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '9.5px', fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{aw.name}</div>
                                                        {[aw.issuer, aw.year].filter(Boolean).length > 0 && (
                                                            <div style={{ fontSize: '8.5px', color: C.muted, marginTop: '1px' }}>
                                                                {[aw.issuer, aw.year].filter(Boolean).join(' — ')}
                                                            </div>
                                                        )}
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
                            padding: '18px 24px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Summary */}
                            {summary && (
                                <div className="avoid-break" style={{ marginBottom: '14px' }}>
                                    <SectionHeading title="Profil Professionnel" />
                                    <p style={{
                                        color: C.body,
                                        fontSize: '9.5px',
                                        lineHeight: 1.55,
                                        margin: 0,
                                        textAlign: 'justify' as const,
                                    }}>
                                        {summary}
                                    </p>
                                </div>
                            )}

                            {/* Experience — refined timeline */}
                            {experience && experience.length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <SectionHeading title="Expériences" />
                                    <div>
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="avoid-break" style={{
                                                paddingLeft: '14px',
                                                borderLeft: `1.5px solid ${C.line}`,
                                                marginBottom: '12px',
                                                position: 'relative',
                                            }}>
                                                {/* Timeline dot */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-5px',
                                                    top: '3.5px',
                                                    width: '8px', height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: C.gold,
                                                    border: `2px solid ${C.white}`,
                                                    boxShadow: `0 0 0 1px ${C.gold}`,
                                                }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                                                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: C.ink }}>{exp.role}</span>
                                                    {exp.period && <span style={{ fontSize: '8.5px', color: C.muted, whiteSpace: 'nowrap' as const }}>{exp.period}</span>}
                                                </div>
                                                <div style={{ fontSize: '9px', fontWeight: 600, color: C.earth, marginTop: '1px' }}>
                                                    {[exp.company, exp.location].filter(Boolean).join(' · ')}
                                                </div>
                                                {exp.achievements && exp.achievements.length > 0 && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        {exp.achievements.map((ach, i) => (
                                                            <BulletItem key={i} text={ach} />
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
                                <div style={{ marginBottom: '14px' }}>
                                    <SectionHeading title="Formations" />
                                    <div>
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="avoid-break" style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                                                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: C.ink }}>{edu.degree}</span>
                                                    {edu.period && <span style={{ fontSize: '8.5px', color: C.gold, fontWeight: 600, whiteSpace: 'nowrap' as const }}>{edu.period}</span>}
                                                </div>
                                                <div style={{ fontSize: '9.5px', color: C.body, fontWeight: 500, marginTop: '1px' }}>{edu.institution}</div>
                                                {edu.details && <div style={{ fontSize: '9px', color: C.muted, fontStyle: 'italic', marginTop: '1px' }}>{edu.details}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {hasProjects && (
                                <div style={{ marginBottom: '14px' }}>
                                    <SectionHeading title="Projets" />
                                    <div>
                                        {projects!.map((proj, idx) => (
                                            <div key={idx} className="avoid-break" style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                                                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: C.ink }}>{proj.name}</span>
                                                    {proj.url && <span style={{ fontSize: '8.5px', color: C.gold, fontWeight: 500 }}>{proj.url}</span>}
                                                </div>
                                                {proj.description && <div style={{ fontSize: '9.5px', color: C.body, marginTop: '2px', lineHeight: 1.5 }}>{proj.description}</div>}
                                                {proj.technologies && <div style={{ fontSize: '9px', color: C.muted, fontStyle: 'italic', marginTop: '2px' }}>{proj.technologies}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Volunteer */}
                            {hasVolunteer && (
                                <div style={{ marginBottom: '14px' }}>
                                    <SectionHeading title="Bénévolat" />
                                    <div>
                                        {volunteer!.map((vol, idx) => (
                                            <div key={idx} className="avoid-break" style={{
                                                paddingLeft: '14px',
                                                borderLeft: `1.5px solid ${C.line}`,
                                                marginBottom: '12px',
                                                position: 'relative',
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-5px',
                                                    top: '3.5px',
                                                    width: '8px', height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: C.gold,
                                                    border: `2px solid ${C.white}`,
                                                    boxShadow: `0 0 0 1px ${C.gold}`,
                                                }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                                                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: C.ink }}>{vol.role}</span>
                                                    {vol.period && <span style={{ fontSize: '8.5px', color: C.muted, whiteSpace: 'nowrap' as const }}>{vol.period}</span>}
                                                </div>
                                                <div style={{ fontSize: '9px', fontWeight: 600, color: C.earth, marginTop: '1px' }}>{vol.organization}</div>
                                                {vol.description && <div style={{ fontSize: '9.5px', color: C.body, marginTop: '5px', lineHeight: 1.5 }}>{vol.description}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Sections */}
                            {hasCustom && customSections!.map((sec, sIdx) => (
                                sec.items.length > 0 && (
                                    <div key={sIdx} style={{ marginBottom: '14px' }}>
                                        <SectionHeading title={sec.title} />
                                        <div>
                                            {sec.items.map((item, i) => (
                                                <BulletItem key={i} text={item} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom gold stripe ── */}
                    <div style={{
                        height: '2px',
                        backgroundColor: C.gold,
                        flexShrink: 0,
                    }} />
                </div>
            </div>
        </>
    );
}