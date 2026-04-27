import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { CVData } from './CVTemplateProfessional';

/* ═══════════════════════════════════════════════════════════
   CV Template React-PDF — "Prestige" Edition
   Optimized for both 1-page compact fit AND beautiful multi-page flow.
   ═══════════════════════════════════════════════════════════ */

const C = {
    navyDark:   '#0B1120',
    navy:       '#111827',
    navyMid:    '#1A2540',
    gold:       '#C9A84C',
    white:      '#FFFFFF',
    sidebar:    '#F4F5F7',
    textDark:   '#111827',
    textBody:   '#374151',
    textMuted:  '#6B7280',
    border:     '#E5E7EB',
    borderLight:'#F3F4F6',
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
    /* Fixed sidebar background that spans all pages beautifully */
    sidebarBg: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '32%',
        backgroundColor: C.sidebar,
        zIndex: -1,
        borderRight: `1px solid ${C.border}`,
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: C.navy,
        padding: '24px 32px',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
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

    /* Photo */
    photoOuter: {
        width: 80,
        height: 80,
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
    },

    /* Name & Job */
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    fullName: {
        fontSize: 22,
        fontWeight: 800,
        color: C.white,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: C.gold,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    contactPill: {
        fontSize: 8.5,
        color: '#E5E7EB',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: '3px 8px',
        borderRadius: 4,
    },

    /* ── BODY ── */
    body: {
        flexDirection: 'row',
        flex: 1,
    },
    sidebar: {
        width: '32%',
        padding: '20px 16px',
        // backgroundColor is handled by sidebarBg
    },
    main: {
        width: '68%',
        padding: '20px 24px',
    },
    sideBlock: {
        marginBottom: 14,
    },
    mainBlock: {
        marginBottom: 16,
    },

    /* ── SECTION HEADING ── */
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    sectionDot: {
        width: 6,
        height: 6,
        borderRadius: 9999,
        backgroundColor: C.gold,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: C.navy,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.border,
    },

    /* ── EXPERIENCE TIMELINE ── */
    expBlock: {
        marginBottom: 12,
        paddingLeft: 12,
        borderLeft: `2px solid ${C.borderLight}`,
        position: 'relative',
    },
    expDot: {
        position: 'absolute',
        left: -5.5,
        top: 3,
        width: 9,
        height: 9,
        borderRadius: 9999,
        backgroundColor: C.gold,
        borderWidth: 2,
        borderColor: C.white,
    },
    expRole: {
        fontSize: 11,
        fontWeight: 700,
        color: C.textDark,
        marginBottom: 1,
    },
    expCompany: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.gold,
        marginBottom: 2,
    },
    expPeriod: {
        fontSize: 8.5,
        color: C.textMuted,
        fontWeight: 500,
        marginBottom: 4,
    },
    achieveRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    achieveBullet: {
        fontSize: 6,
        color: C.gold,
        marginRight: 6,
        marginTop: 2.5,
    },
    achieveText: {
        fontSize: 9.5,
        color: C.textBody,
        lineHeight: 1.5,
        flex: 1,
    },

    /* ── EDUCATION / PROJECTS ── */
    eduBlock: {
        marginBottom: 10,
    },
    eduDegree: {
        fontSize: 10.5,
        fontWeight: 700,
        color: C.textDark,
        marginBottom: 1,
    },
    eduInstitution: {
        fontSize: 9.5,
        color: C.textBody,
        fontWeight: 500,
        marginBottom: 1,
    },
    eduPeriod: {
        fontSize: 8.5,
        color: C.gold,
        fontWeight: 600,
        marginBottom: 1,
    },
    eduDetails: {
        fontSize: 9,
        color: C.textMuted,
        fontStyle: 'italic',
        marginTop: 1,
    },

    /* ── SIDEBAR ITEMS ── */
    skillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    skillBadge: {
        fontSize: 8.5,
        fontWeight: 600,
        backgroundColor: C.badgeDark,
        color: C.white,
        padding: '4px 8px',
        borderRadius: 4,
    },
    skillBadgeLight: {
        fontSize: 8.5,
        fontWeight: 500,
        backgroundColor: C.white,
        color: C.textBody,
        padding: '3px 7px',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.border,
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingBottom: 4,
        borderBottom: `1px solid ${C.borderLight}`,
    },
    langName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.textDark,
    },
    langLevel: {
        fontSize: 8.5,
        color: C.textMuted,
        fontStyle: 'italic',
    },
    certName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.textDark,
        lineHeight: 1.3,
        marginBottom: 2,
    },
    certMeta: {
        fontSize: 8.5,
        color: C.textMuted,
    },
    interestBadge: {
        fontSize: 8.5,
        padding: '3px 8px',
        borderRadius: 4,
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.border,
        color: C.textBody,
    },
    refName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.textDark,
        marginBottom: 1,
    },
    refRole: {
        fontSize: 8.5,
        color: C.textBody,
        marginBottom: 1,
    },
    refContact: {
        fontSize: 8.5,
        color: C.gold,
    },

    /* ── SUMMARY ── */
    summaryText: {
        fontSize: 9.5,
        lineHeight: 1.6,
        color: C.textBody,
        textAlign: 'justify',
    },

    /* ── FOOTER ── */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: C.gold,
    },
});

const Heading = ({ title }: { title: string }) => (
    <View style={s.sectionHead} wrap={false}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
        <View style={s.sectionLine} />
    </View>
);

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
    if (personalInfo.linkedin) contactItems.push(personalInfo.linkedin.replace('https://', '').replace('www.linkedin.com/in/', ''));
    if (personalInfo.website) contactItems.push(personalInfo.website.replace('https://', ''));
    if (personalInfo.dateOfBirth) contactItems.push(personalInfo.dateOfBirth);
    if (personalInfo.nationality) contactItems.push(personalInfo.nationality);
    if (personalInfo.drivingLicense) contactItems.push(`Permis ${personalInfo.drivingLicense}`);

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* Global Backgrounds for Multi-Page Support */}
                <View style={s.sidebarBg} fixed />
                <View style={s.footer} fixed />

                {/* ═══ HEADER (Only on first page) ═══ */}
                <View style={s.header}>
                    <View style={s.headerDecoCorner} />

                    {shouldRenderPhoto && (
                        <View style={s.photoOuter}>
                            <View style={s.photoInner}>
                                <Image src={photoSrc} style={s.photo} />
                            </View>
                        </View>
                    )}

                    <View style={s.headerInfo}>
                        <Text style={s.fullName}>{personalInfo.fullName || 'Votre Nom'}</Text>
                        <Text style={s.jobTitle}>{personalInfo.jobTitle || 'Votre Poste'}</Text>
                        <View style={s.contactRow}>
                            {contactItems.map((item, idx) => (
                                <View key={idx} style={s.contactPill}>
                                    <Text>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={s.headerDecoStripe} />
                </View>

                {/* ═══ BODY ═══ */}
                <View style={s.body}>
                    {/* ── SIDEBAR ── */}
                    <View style={s.sidebar}>
                        {hasSkills && (
                            <View style={s.sideBlock} wrap={false}>
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
                                    <View key={idx} style={{ marginBottom: 8 }}>
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
                                    <View key={idx} style={{ marginBottom: 8 }}>
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
                                    <View key={idx} style={{ marginBottom: 8 }}>
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
                        {summary && (
                            <View style={s.mainBlock} wrap={false}>
                                <Heading title="Profil Professionnel" />
                                <Text style={s.summaryText}>{summary}</Text>
                            </View>
                        )}

                        {experience && experience.length > 0 && (
                            <View style={s.mainBlock}>
                                <Heading title="Expériences" />
                                {experience.map((exp, idx) => (
                                    <View key={idx} style={s.expBlock} wrap={false}>
                                        <View style={s.expDot} />
                                        <Text style={s.expRole}>{exp.role}</Text>
                                        <Text style={s.expCompany}>
                                            {[exp.company, exp.location].filter(Boolean).join(' • ')}
                                        </Text>
                                        <Text style={s.expPeriod}>{exp.period}</Text>
                                        {exp.achievements && exp.achievements.length > 0 && (
                                            <View style={{ marginTop: 2 }}>
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

                        {education && education.length > 0 && (
                            <View style={s.mainBlock}>
                                <Heading title="Formations" />
                                {education.map((edu, idx) => (
                                    <View key={idx} style={s.eduBlock} wrap={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text style={s.eduDegree}>{edu.degree}</Text>
                                            <Text style={s.eduPeriod}>{edu.period}</Text>
                                        </View>
                                        <Text style={s.eduInstitution}>{edu.institution}</Text>
                                        {edu.details && <Text style={s.eduDetails}>{edu.details}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasProjects && (
                            <View style={s.mainBlock}>
                                <Heading title="Projets" />
                                {projects!.map((proj, idx) => (
                                    <View key={idx} style={s.eduBlock} wrap={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text style={s.eduDegree}>{proj.name}</Text>
                                            {proj.url && <Text style={{ fontSize: 8.5, color: C.gold }}>{proj.url}</Text>}
                                        </View>
                                        {proj.description && <Text style={[s.achieveText, { marginTop: 2 }]}>{proj.description}</Text>}
                                        {proj.technologies && <Text style={[s.eduDetails, { marginTop: 2 }]}>{proj.technologies}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasVolunteer && (
                            <View style={s.mainBlock}>
                                <Heading title="Bénévolat" />
                                {volunteer!.map((vol, idx) => (
                                    <View key={idx} style={s.expBlock} wrap={false}>
                                        <View style={s.expDot} />
                                        <Text style={s.expRole}>{vol.role}</Text>
                                        <Text style={s.expCompany}>{vol.organization}</Text>
                                        {vol.period && <Text style={s.expPeriod}>{vol.period}</Text>}
                                        {vol.description && <Text style={[s.achieveText, { marginTop: 2 }]}>{vol.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasCustom && customSections!.map((sec, sIdx) => (
                            sec.items.length > 0 && (
                                <View key={sIdx} style={s.mainBlock}>
                                    <Heading title={sec.title} />
                                    <View wrap={false}>
                                        {sec.items.map((item, i) => (
                                            <View key={i} style={s.achieveRow}>
                                                <Text style={s.achieveBullet}>●</Text>
                                                <Text style={s.achieveText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        ))}
                    </View>
                </View>
            </Page>
        </Document>
    );
};
