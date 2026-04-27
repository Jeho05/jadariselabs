import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { CVData } from './CVTemplateProfessional';

/* ═══════════════════════════════════════════════════════════
   CV Template React-PDF — "Prestige" Edition
   Ultra-premium vector PDF with large photo, refined accents,
   and subtle design details that make the difference.
   ═══════════════════════════════════════════════════════════ */

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
    accent:     '#0B1120',
    badgeDark:  '#1F2937',
};

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.ttf', fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.ttf', fontWeight: 800 },
    ]
});

const s = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: C.white,
        fontFamily: 'Inter',
        padding: 0,
    },

    /* ── HEADER ── compact */
    header: {
        backgroundColor: C.navy,
        padding: '16px 28px',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
    },
    headerDecoStripe: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: C.gold,
    },
    headerDecoCorner: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        borderBottomLeftRadius: 60,
        backgroundColor: C.navyMid,
        opacity: 0.5,
    },

    /* Photo — compact */
    photoOuter: {
        width: 72,
        height: 72,
        borderRadius: 9999,
        backgroundColor: C.gold,
        padding: 2,
        flexShrink: 0,
    },
    photoInner: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        backgroundColor: C.white,
        padding: 1.5,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        objectFit: 'cover',
        objectPosition: 'center',
    },

    /* Name area */
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    fullName: {
        fontSize: 20,
        fontWeight: 800,
        color: C.white,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    jobTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: C.gold,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
    },
    contactPill: {
        fontSize: 7.5,
        color: '#D1D5DB',
        backgroundColor: 'rgba(255,255,255,0.07)',
        padding: '2px 7px',
        borderRadius: 3,
    },
    contactSep: {
        width: 2.5,
        height: 2.5,
        borderRadius: 9999,
        backgroundColor: C.gold,
        opacity: 0.6,
    },

    /* ── BODY LAYOUT ── */
    body: {
        flexDirection: 'row',
        flex: 1,
    },

    /* Sidebar */
    sidebar: {
        width: '32%',
        backgroundColor: C.sidebar,
        padding: '14px 14px',
        borderRight: `1px solid ${C.border}`,
    },
    sideBlock: {
        marginBottom: 12,
    },

    /* Main content */
    main: {
        width: '68%',
        padding: '14px 20px',
        backgroundColor: C.white,
    },
    mainBlock: {
        marginBottom: 12,
    },

    /* ── SECTION HEADING ── */
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
        gap: 5,
    },
    sectionDot: {
        width: 6,
        height: 6,
        borderRadius: 9999,
        backgroundColor: C.gold,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.6,
        color: C.navy,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.border,
        marginLeft: 4,
    },

    /* ── EXPERIENCE ── */
    expBlock: {
        marginBottom: 9,
        paddingLeft: 10,
        borderLeft: `2px solid ${C.borderLight}`,
    },
    expDot: {
        position: 'absolute',
        left: -6,
        top: 3,
        width: 8,
        height: 8,
        borderRadius: 9999,
        backgroundColor: C.gold,
        borderWidth: 1.5,
        borderColor: C.white,
    },
    expRole: {
        fontSize: 10,
        fontWeight: 700,
        color: C.textDark,
        marginBottom: 0,
    },
    expCompany: {
        fontSize: 8.5,
        fontWeight: 600,
        color: C.gold,
        marginBottom: 0,
    },
    expPeriod: {
        fontSize: 7.5,
        color: C.textMuted,
        fontWeight: 500,
        marginBottom: 3,
    },
    achieveRow: {
        flexDirection: 'row',
        marginBottom: 1.5,
        paddingLeft: 2,
    },
    achieveBullet: {
        fontSize: 5,
        color: C.gold,
        marginRight: 4,
        marginTop: 2.5,
    },
    achieveText: {
        fontSize: 8,
        color: C.textBody,
        lineHeight: 1.4,
        flex: 1,
    },

    /* ── EDUCATION ── */
    eduBlock: {
        marginBottom: 7,
    },
    eduDegree: {
        fontSize: 9.5,
        fontWeight: 700,
        color: C.textDark,
        marginBottom: 0,
    },
    eduInstitution: {
        fontSize: 8,
        color: C.textBody,
        fontWeight: 500,
    },
    eduPeriod: {
        fontSize: 7.5,
        color: C.gold,
        fontWeight: 600,
        marginTop: 0,
    },
    eduDetails: {
        fontSize: 7.5,
        color: C.textMuted,
        fontStyle: 'italic',
        marginTop: 0,
    },

    /* ── SIDEBAR ITEMS ── */
    skillBadge: {
        fontSize: 7.5,
        fontWeight: 600,
        backgroundColor: C.badgeDark,
        color: C.white,
        padding: '3px 6px',
        borderRadius: 3,
        marginBottom: 3,
        marginRight: 3,
    },
    skillBadgeLight: {
        fontSize: 7.5,
        fontWeight: 500,
        backgroundColor: C.white,
        color: C.textBody,
        padding: '3px 6px',
        borderRadius: 3,
        marginBottom: 3,
        marginRight: 3,
        borderWidth: 1,
        borderColor: C.border,
    },
    skillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
        paddingBottom: 3,
        borderBottom: `1px solid ${C.borderLight}`,
    },
    langName: {
        fontSize: 8.5,
        fontWeight: 600,
        color: C.textDark,
    },
    langLevel: {
        fontSize: 7.5,
        color: C.textMuted,
        fontStyle: 'italic',
    },
    certName: {
        fontSize: 8.5,
        fontWeight: 600,
        color: C.textDark,
    },
    certMeta: {
        fontSize: 7.5,
        color: C.textMuted,
        marginTop: 0,
    },
    interestBadge: {
        fontSize: 7.5,
        padding: '2px 6px',
        borderRadius: 3,
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.border,
        color: C.textBody,
        marginBottom: 3,
        marginRight: 3,
    },
    refName: {
        fontSize: 8.5,
        fontWeight: 600,
        color: C.textDark,
    },
    refRole: {
        fontSize: 7.5,
        color: C.textBody,
        marginTop: 0,
    },
    refContact: {
        fontSize: 7.5,
        color: C.gold,
        marginTop: 0,
    },

    /* ── SUMMARY ── */
    summaryText: {
        fontSize: 8.5,
        lineHeight: 1.45,
        color: C.textBody,
        marginBottom: 2,
    },

    /* ── FOOTER ── */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: C.gold,
    },
});

/* ── Section Heading Component ── */
const Heading = ({ title }: { title: string }) => (
    <View style={s.sectionHead}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
        <View style={s.sectionLine} />
    </View>
);

/* ── Main Component ── */
export const CVTemplateReactPDF = ({ data, photoPreview }: { data: CVData; photoPreview?: string | null }) => {
    if (!data) return null;
    const { personalInfo, summary, experience, education, skills, languages, certifications, interests, references, projects, volunteer, awards, customSections } = data;
    const photoSrc = photoPreview || personalInfo?.photoUrl;
    const shouldRenderPhoto = typeof photoSrc === 'string' && /^(data:image\/[a-zA-Z0-9.+-]+;base64,|https?:\/\/)/.test(photoSrc);

    const hasSkills = skills && skills.length > 0;
    const hasLanguages = languages && languages.length > 0;
    const hasCertifications = certifications && certifications.length > 0;
    const hasInterests = interests && interests.length > 0;
    const hasReferences = references && references.length > 0;
    const hasProjects = projects && projects.length > 0;
    const hasVolunteer = volunteer && volunteer.length > 0;
    const hasAwards = awards && awards.length > 0;
    const hasCustom = customSections && customSections.length > 0;

    const contactItems: string[] = [];
    if (personalInfo.email) contactItems.push(personalInfo.email);
    if (personalInfo.phone) contactItems.push(personalInfo.phone);
    if (personalInfo.location) contactItems.push(personalInfo.location);
    if (personalInfo.linkedin) contactItems.push(personalInfo.linkedin);
    if (personalInfo.website) contactItems.push(personalInfo.website);
    if (personalInfo.dateOfBirth) contactItems.push(personalInfo.dateOfBirth);
    if (personalInfo.nationality) contactItems.push(personalInfo.nationality);
    if (personalInfo.drivingLicense) contactItems.push(`Permis ${personalInfo.drivingLicense}`);

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* ═══ HEADER ═══ */}
                <View style={s.header}>
                    {/* Decorative corner accent */}
                    <View style={s.headerDecoCorner} />

                    {/* Photo — Large and Prominent */}
                    {shouldRenderPhoto && (
                        <View style={s.photoOuter}>
                            <View style={s.photoInner}>
                                <Image src={photoSrc} style={s.photo} />
                            </View>
                        </View>
                    )}

                    {/* Name & Contact */}
                    <View style={s.headerInfo}>
                        <Text style={s.fullName}>{personalInfo.fullName || 'Votre Nom'}</Text>
                        <Text style={s.jobTitle}>{personalInfo.jobTitle || 'Votre Poste'}</Text>
                        <View style={s.contactRow}>
                            {contactItems.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <View style={s.contactSep} />}
                                    <Text style={s.contactPill}>{item}</Text>
                                </React.Fragment>
                            ))}
                        </View>
                    </View>

                    {/* Bottom gold stripe */}
                    <View style={s.headerDecoStripe} />
                </View>

                {/* ═══ BODY ═══ */}
                <View style={s.body}>
                    {/* ── SIDEBAR ── */}
                    <View style={s.sidebar}>
                        {hasSkills && (
                            <View style={s.sideBlock}>
                                <Heading title="Compétences" />
                                <View style={s.skillsWrap}>
                                    {skills.map((skill, idx) => (
                                        <Text key={idx} style={idx < 5 ? s.skillBadge : s.skillBadgeLight}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasLanguages && (
                            <View style={s.sideBlock} wrap={false}>
                                <Heading title="Langues" />
                                {languages!.map((lang, idx) => (
                                    <View key={idx} style={s.langRow}>
                                        <Text style={s.langName}>{lang.name}</Text>
                                        <Text style={s.langLevel}>{lang.level}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasCertifications && (
                            <View style={s.sideBlock} wrap={false}>
                                <Heading title="Certifications" />
                                {certifications!.map((cert, idx) => (
                                    <View key={idx} style={{ marginBottom: 5 }}>
                                        <Text style={s.certName}>{cert.name}</Text>
                                        <Text style={s.certMeta}>
                                            {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasInterests && (
                            <View style={s.sideBlock} wrap={false}>
                                <Heading title="Intérêts" />
                                <View style={s.skillsWrap}>
                                    {interests!.map((item, idx) => (
                                        <Text key={idx} style={s.interestBadge}>{item}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasReferences && (
                            <View style={s.sideBlock} wrap={false}>
                                <Heading title="Références" />
                                {references!.map((ref, idx) => (
                                    <View key={idx} style={{ marginBottom: 6 }}>
                                        <Text style={s.refName}>{ref.name}</Text>
                                        <Text style={s.refRole}>{ref.role}</Text>
                                        {ref.contact && <Text style={s.refContact}>{ref.contact}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasAwards && (
                            <View style={s.sideBlock} wrap={false}>
                                <Heading title="Distinctions" />
                                {awards!.map((aw, idx) => (
                                    <View key={idx} style={{ marginBottom: 5 }}>
                                        <Text style={s.certName}>{aw.name}</Text>
                                        <Text style={s.certMeta}>
                                            {[aw.issuer, aw.year].filter(Boolean).join(' — ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ── MAIN CONTENT ── */}
                    <View style={s.main}>
                        {/* Summary */}
                        {summary && (
                            <View style={s.mainBlock}>
                                <Heading title="Profil" />
                                <Text style={s.summaryText}>{summary}</Text>
                            </View>
                        )}

                        {/* Experience */}
                        {experience && experience.length > 0 && (
                            <View style={s.mainBlock}>
                                <Heading title="Expérience" />
                                {experience.map((exp, idx) => (
                                    <View key={idx} style={s.expBlock} wrap={false}>
                                        <View style={s.expDot} />
                                        <Text style={s.expRole}>{exp.role}</Text>
                                        <Text style={s.expCompany}>
                                            {[exp.company, exp.location].filter(Boolean).join(' • ')}
                                        </Text>
                                        <Text style={s.expPeriod}>{exp.period}</Text>
                                        {exp.achievements && exp.achievements.length > 0 && (
                                            <View style={{ marginTop: 4 }}>
                                                {exp.achievements.map((achiev, i) => (
                                                    <View key={i} style={s.achieveRow}>
                                                        <Text style={s.achieveBullet}>●</Text>
                                                        <Text style={s.achieveText}>{achiev}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Education */}
                        {education && education.length > 0 && (
                            <View style={s.mainBlock}>
                                <Heading title="Formation" />
                                {education.map((edu, idx) => (
                                    <View key={idx} style={s.eduBlock} wrap={false}>
                                        <Text style={s.eduDegree}>{edu.degree}</Text>
                                        <Text style={s.eduInstitution}>{edu.institution}</Text>
                                        <Text style={s.eduPeriod}>{edu.period}</Text>
                                        {edu.details && <Text style={s.eduDetails}>{edu.details}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Projects */}
                        {hasProjects && (
                            <View style={s.mainBlock}>
                                <Heading title="Projets" />
                                {projects!.map((proj, idx) => (
                                    <View key={idx} style={s.eduBlock} wrap={false}>
                                        <Text style={s.eduDegree}>{proj.name}</Text>
                                        {proj.description && <Text style={s.achieveText}>{proj.description}</Text>}
                                        {proj.technologies && <Text style={s.eduDetails}>{proj.technologies}</Text>}
                                        {proj.url && <Text style={{ fontSize: 9, color: C.gold, marginTop: 1 }}>{proj.url}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Volunteer */}
                        {hasVolunteer && (
                            <View style={s.mainBlock}>
                                <Heading title="Bénévolat" />
                                {volunteer!.map((vol, idx) => (
                                    <View key={idx} style={s.expBlock} wrap={false}>
                                        <View style={s.expDot} />
                                        <Text style={s.expRole}>{vol.role}</Text>
                                        <Text style={s.expCompany}>{vol.organization}</Text>
                                        {vol.period && <Text style={s.expPeriod}>{vol.period}</Text>}
                                        {vol.description && <Text style={s.achieveText}>{vol.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Custom Sections */}
                        {hasCustom && customSections!.map((sec, sIdx) => (
                            sec.items.length > 0 && (
                                <View key={sIdx} style={s.mainBlock}>
                                    <Heading title={sec.title} />
                                    {sec.items.map((item, i) => (
                                        <View key={i} style={s.achieveRow}>
                                            <Text style={s.achieveBullet}>●</Text>
                                            <Text style={s.achieveText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            )
                        ))}
                    </View>
                </View>

                {/* Footer gold stripe */}
                <View style={s.footer} fixed />
            </Page>
        </Document>
    );
};
