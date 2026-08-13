import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { CVData } from './CVTemplateProfessional';

/* ═══════════════════════════════════════════════════════════
   CV Template React-PDF — "Éditorial d'or" Edition
   Warm ink & cream editorial layout with gold accents.
   Matches the HTML preview (CVTemplateProfessional).
   * FIX: Removed wrap={false} to prevent infinite loop / OOM crashes
   * FIX: Added paddingBottom to prevent footer overlap
   ═══════════════════════════════════════════════════════════ */

const C = {
    ink:      '#2A2622',
    body:     '#4B4640',
    muted:    '#8A837A',
    gold:     '#B8912F',
    earth:    '#7B4F2E',
    cream:    '#F7F3EB',
    line:     '#E4DCCB',
    lineSoft: '#F0EADD',
    white:    '#FFFFFF',
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
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 24, // Prevents content from overlapping the fixed footer
    },
    /* Fixed sidebar background that spans all pages beautifully */
    sidebarBg: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '30%',
        backgroundColor: C.cream,
        borderRight: `1px solid ${C.line}`,
        zIndex: -1,
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: C.cream,
        padding: '20px 30px 18px',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        position: 'relative',
        borderBottomWidth: 2,
        borderBottomColor: C.gold,
        borderBottomStyle: 'solid',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },
    fullName: {
        fontSize: 24,
        fontWeight: 800,
        color: C.ink,
        letterSpacing: -0.4,
        lineHeight: 1.15,
    },
    jobTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: C.gold,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        marginTop: 6,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        alignItems: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 8.5,
        color: C.muted,
    },
    contactDot: {
        width: 3,
        height: 3,
        borderRadius: 9999,
        backgroundColor: C.gold,
        marginHorizontal: 9,
    },

    /* Photo — subtle gold ring */
    photoOuter: {
        width: 88,
        height: 88,
        borderRadius: 9999,
        borderWidth: 2,
        borderColor: C.gold,
        padding: 2.5,
        backgroundColor: C.white,
        flexShrink: 0,
    },
    photoInner: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        objectFit: 'cover',
    },

    /* ── BODY ── */
    body: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'stretch',
    },
    sidebar: {
        width: '30%',
        padding: '18px 16px 20px',
        // backgroundColor is handled by sidebarBg
    },
    main: {
        width: '70%',
        padding: '18px 24px 20px',
    },
    sideBlock: {
        marginBottom: 16,
    },
    mainBlock: {
        marginBottom: 14,
    },

    /* ── SECTION HEADING ── */
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 7,
    },
    sectionSquare: {
        width: 6,
        height: 6,
        borderRadius: 1,
        backgroundColor: C.gold,
    },
    sectionTitle: {
        fontSize: 8.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: C.ink,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.line,
    },

    /* ── EXPERIENCE TIMELINE ── */
    expBlock: {
        marginBottom: 12,
        paddingLeft: 14,
        borderLeftWidth: 1.5,
        borderLeftColor: C.line,
        borderLeftStyle: 'solid',
        position: 'relative',
    },
    expDot: {
        position: 'absolute',
        left: -5,
        top: 3.5,
        width: 8,
        height: 8,
        borderRadius: 9999,
        backgroundColor: C.gold,
        borderWidth: 2,
        borderColor: C.white,
    },
    expHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    expRole: {
        fontSize: 10.5,
        fontWeight: 700,
        color: C.ink,
    },
    expPeriod: {
        fontSize: 8.5,
        color: C.muted,
    },
    expCompany: {
        fontSize: 9,
        fontWeight: 600,
        color: C.earth,
        marginTop: 1,
    },
    achieveRow: {
        flexDirection: 'row',
        marginBottom: 3,
        marginTop: 2,
    },
    achieveDash: {
        fontSize: 9.5,
        color: C.gold,
        fontWeight: 700,
        marginRight: 6,
        width: 6,
    },
    achieveText: {
        fontSize: 9.5,
        color: C.body,
        lineHeight: 1.5,
        flex: 1,
    },

    /* ── EDUCATION / PROJECTS ── */
    eduBlock: {
        marginBottom: 10,
    },
    eduHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    eduDegree: {
        fontSize: 10.5,
        fontWeight: 700,
        color: C.ink,
    },
    eduPeriod: {
        fontSize: 8.5,
        color: C.gold,
        fontWeight: 600,
    },
    eduInstitution: {
        fontSize: 9.5,
        color: C.body,
        fontWeight: 500,
        marginTop: 1,
    },
    eduDetails: {
        fontSize: 9,
        color: C.muted,
        fontStyle: 'italic',
        marginTop: 1,
    },
    projUrl: {
        fontSize: 8.5,
        color: C.gold,
        fontWeight: 500,
    },

    /* ── SIDEBAR ITEMS ── */
    pillWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    pill: {
        fontSize: 8.5,
        fontWeight: 500,
        padding: '3px 9px',
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: C.line,
        backgroundColor: C.white,
        color: C.body,
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: C.lineSoft,
        borderBottomStyle: 'solid',
    },
    langName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.ink,
    },
    langLevel: {
        fontSize: 8.5,
        color: C.muted,
        fontStyle: 'italic',
    },
    certRow: {
        flexDirection: 'row',
        marginBottom: 9,
    },
    certSquare: {
        width: 5,
        height: 5,
        borderRadius: 1,
        backgroundColor: C.gold,
        marginTop: 3.5,
        marginRight: 7,
    },
    certName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.ink,
        lineHeight: 1.3,
    },
    certMeta: {
        fontSize: 8.5,
        color: C.muted,
        marginTop: 1,
    },
    refName: {
        fontSize: 9.5,
        fontWeight: 600,
        color: C.ink,
        marginBottom: 1,
    },
    refRole: {
        fontSize: 8.5,
        color: C.body,
        marginBottom: 1,
    },
    refContact: {
        fontSize: 8.5,
        color: C.gold,
    },

    /* ── SUMMARY ── */
    summaryText: {
        fontSize: 9.5,
        lineHeight: 1.55,
        color: C.body,
        textAlign: 'justify',
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

const Heading = ({ title }: { title: string }) => (
    <View style={s.sectionHead}>
        <View style={s.sectionSquare} />
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
    if (personalInfo?.email) contactItems.push(personalInfo.email);
    if (personalInfo?.phone) contactItems.push(personalInfo.phone);
    if (personalInfo?.location) contactItems.push(personalInfo.location);
    if (personalInfo?.linkedin) contactItems.push(personalInfo.linkedin.replace('https://', '').replace('www.linkedin.com/in/', ''));
    if (personalInfo?.website) contactItems.push(personalInfo.website.replace('https://', ''));
    if (personalInfo?.dateOfBirth) contactItems.push(personalInfo.dateOfBirth);
    if (personalInfo?.nationality) contactItems.push(personalInfo.nationality);
    if (personalInfo?.drivingLicense) contactItems.push(`Permis ${personalInfo.drivingLicense}`);

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* Global Backgrounds for Multi-Page Support */}
                <View style={s.sidebarBg} fixed />
                <View style={s.footer} fixed />

                {/* ═══ HEADER (Only on first page) ═══ */}
                <View style={s.header}>
                    {shouldRenderPhoto && (
                        <View style={s.photoOuter}>
                            <View style={s.photoInner}>
                                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                <Image src={photoSrc} style={s.photo} />
                            </View>
                        </View>
                    )}

                    <View style={s.headerInfo}>
                        <Text style={s.fullName}>{personalInfo?.fullName || 'Votre Nom'}</Text>
                        <Text style={s.jobTitle}>{personalInfo?.jobTitle || 'Votre Poste'}</Text>
                        <View style={s.contactRow}>
                            {contactItems.map((item, idx) => (
                                <View key={idx} style={s.contactItem}>
                                    {idx > 0 && <View style={s.contactDot} />}
                                    <Text style={s.contactText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ═══ BODY ═══ */}
                <View style={s.body}>
                    {/* ── SIDEBAR ── */}
                    <View style={s.sidebar}>
                        {hasSkills && (
                            <View style={s.sideBlock}>
                                <Heading title="Compétences" />
                                <View style={s.pillWrap}>
                                    {skills.map((skill, idx) => (
                                        <Text key={idx} style={s.pill}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasLanguages && (
                            <View style={s.sideBlock}>
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
                            <View style={s.sideBlock}>
                                <Heading title="Certifications" />
                                {certifications!.map((cert, idx) => (
                                    <View key={idx} style={s.certRow}>
                                        <View style={s.certSquare} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.certName}>{cert.name}</Text>
                                            {[cert.issuer, cert.year].filter(Boolean).length > 0 && (
                                                <Text style={s.certMeta}>
                                                    {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasInterests && (
                            <View style={s.sideBlock}>
                                <Heading title="Intérêts" />
                                <View style={s.pillWrap}>
                                    {interests!.map((item, idx) => (
                                        <Text key={idx} style={s.pill}>{item}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasReferences && (
                            <View style={s.sideBlock}>
                                <Heading title="Références" />
                                {references!.map((ref, idx) => (
                                    <View key={idx} style={{ marginBottom: 9 }}>
                                        <Text style={s.refName}>{ref.name}</Text>
                                        <Text style={s.refRole}>{ref.role}</Text>
                                        {ref.contact && <Text style={s.refContact}>{ref.contact}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasAwards && (
                            <View style={s.sideBlock}>
                                <Heading title="Distinctions" />
                                {awards!.map((aw, idx) => (
                                    <View key={idx} style={s.certRow}>
                                        <View style={s.certSquare} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.certName}>{aw.name}</Text>
                                            {[aw.issuer, aw.year].filter(Boolean).length > 0 && (
                                                <Text style={s.certMeta}>
                                                    {[aw.issuer, aw.year].filter(Boolean).join(' — ')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ── MAIN CONTENT ── */}
                    <View style={s.main}>
                        {summary && (
                            <View style={s.mainBlock}>
                                <Heading title="Profil Professionnel" />
                                <Text style={s.summaryText}>{summary}</Text>
                            </View>
                        )}

                        {experience && experience.length > 0 && (
                            <View style={s.mainBlock}>
                                <Heading title="Expériences" />
                                {experience.map((exp, idx) => (
                                    <View key={idx} style={s.expBlock}>
                                        <View style={s.expDot} />
                                        <View style={s.expHead}>
                                            <Text style={s.expRole}>{exp.role}</Text>
                                            {exp.period && <Text style={s.expPeriod}>{exp.period}</Text>}
                                        </View>
                                        <Text style={s.expCompany}>
                                            {[exp.company, exp.location].filter(Boolean).join(' · ')}
                                        </Text>
                                        {exp.achievements && exp.achievements.length > 0 && (
                                            <View style={{ marginTop: 3 }}>
                                                {exp.achievements.map((achiev, i) => (
                                                    <View key={i} style={s.achieveRow}>
                                                        <Text style={s.achieveDash}>–</Text>
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
                                    <View key={idx} style={s.eduBlock}>
                                        <View style={s.eduHead}>
                                            <Text style={s.eduDegree}>{edu.degree}</Text>
                                            {edu.period && <Text style={s.eduPeriod}>{edu.period}</Text>}
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
                                    <View key={idx} style={s.eduBlock}>
                                        <View style={s.eduHead}>
                                            <Text style={s.eduDegree}>{proj.name}</Text>
                                            {proj.url && <Text style={s.projUrl}>{proj.url}</Text>}
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
                                    <View key={idx} style={s.expBlock}>
                                        <View style={s.expDot} />
                                        <View style={s.expHead}>
                                            <Text style={s.expRole}>{vol.role}</Text>
                                            {vol.period && <Text style={s.expPeriod}>{vol.period}</Text>}
                                        </View>
                                        <Text style={s.expCompany}>{vol.organization}</Text>
                                        {vol.description && <Text style={[s.achieveText, { marginTop: 3 }]}>{vol.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasCustom && customSections!.map((sec, sIdx) => (
                            sec.items.length > 0 && (
                                <View key={sIdx} style={s.mainBlock}>
                                    <Heading title={sec.title} />
                                    <View>
                                        {sec.items.map((item, i) => (
                                            <View key={i} style={s.achieveRow}>
                                                <Text style={s.achieveDash}>–</Text>
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