import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { CVData } from './CVTemplateProfessional';

// Definition of standard colors (matching the HTML ones)
const COLORS = {
    headerBg: '#111827',
    headerText: '#FFFFFF',
    gold: '#C9A84C',
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

// Register remote fonts for a beautiful print typography (Open Sans as an example)
// We will use standard Helvetica if no fonts are provided, but for premium look:
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf', fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-600-normal.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-600-italic.ttf', fontWeight: 600, fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-normal.ttf', fontWeight: 700 }
        ,{ src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-italic.ttf', fontWeight: 700, fontStyle: 'italic' }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: COLORS.white,
        fontFamily: 'Open Sans',
        padding: 0,
    },
    // ---- HEADER ----
    header: {
        backgroundColor: COLORS.headerBg,
        color: COLORS.headerText,
        padding: '30px 40px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
    },
    name: {
        fontSize: 28,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 6,
    },
    jobTitle: {
        fontSize: 16,
        color: COLORS.gold,
        fontWeight: 600,
        marginBottom: 12,
        letterSpacing: 1,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    contactItem: {
        fontSize: 10,
        color: '#D1D5DB', // gray-300
    },
    photoContainer: {
        width: 100,
        height: 100,
        borderRadius: 9999,
        overflow: 'hidden',
        border: `3px solid ${COLORS.gold}`,
        marginLeft: 20,
        backgroundColor: COLORS.white,
        padding: 4,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        objectFit: 'contain',
        objectPosition: 'center',
    },
    // ---- BODY ----
    mainBody: {
        flexDirection: 'row',
        flex: 1,
    },
    // Sidebar
    sidebar: {
        width: '35%',
        backgroundColor: COLORS.sidebarBg,
        padding: '30px 25px',
        borderRight: `1px solid ${COLORS.border}`,
    },
    // Main column
    content: {
        width: '65%',
        padding: '30px 35px',
        backgroundColor: COLORS.white,
    },
    // ---- COMPONENTS ----
    sectionHeading: {
        borderBottom: `2px solid ${COLORS.gold}`,
        paddingBottom: 4,
        marginBottom: 16,
    },
    sectionTitleText: {
        fontSize: 14,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: COLORS.headerBg,
    },
    summaryText: {
        fontSize: 11,
        lineHeight: 1.5,
        color: COLORS.bodyLight,
        marginBottom: 25,
    },
    // Experience Block
    expBlock: {
        marginBottom: 18,
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 3,
    },
    expRole: {
        fontSize: 14,
        fontWeight: 700,
        color: COLORS.bodyText,
    },
    expPeriod: {
        fontSize: 11,
        color: COLORS.gold,
        fontWeight: 600,
    },
    expCompany: {
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.bodyLight,
        marginBottom: 6,
    },
    achievementsList: {
        marginLeft: 10,
    },
    achievementItem: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        fontSize: 14,
        color: COLORS.gold,
        marginRight: 6,
        lineHeight: 1,
    },
    achievementText: {
        fontSize: 11,
        color: COLORS.bodyLight,
        lineHeight: 1.4,
        flex: 1,
    },
    // Education
    eduBlock: {
        marginBottom: 12,
    },
    eduDegree: {
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.bodyText,
        marginBottom: 2,
    },
    eduInstitution: {
        fontSize: 11,
        color: COLORS.bodyLight,
    },
    eduPeriod: {
        fontSize: 10,
        color: COLORS.gold,
        marginTop: 2,
    },
    eduDetails: {
        fontSize: 10,
        color: COLORS.bodyMuted,
        marginTop: 2,
        fontStyle: 'italic',
    },
    // Skills
    skillBadge: {
        fontSize: 10,
        backgroundColor: COLORS.badgeDark,
        color: COLORS.white,
        padding: '5px 10px',
        borderRadius: 4,
        marginBottom: 6,
        marginRight: 6,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    // SIDEBAR items
    sidebarItemText: {
        fontSize: 11,
        color: COLORS.bodyLight,
        marginBottom: 4,
    },
    sidebarItemBold: {
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.bodyText,
    },
    sidebarBlock: {
        marginBottom: 20,
    },
    sidebarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
});

const SectionHeading = ({ title }: { title: string }) => (
    <View style={styles.sectionHeading} wrap={false}>
        <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
);

export const CVTemplateReactPDF = ({ data, photoPreview }: { data: CVData; photoPreview?: string | null }) => {
    if (!data) return null;
    const { personalInfo, summary, experience, education, skills, languages, certifications, interests, references } = data;
    const photoSrc = photoPreview || personalInfo?.photoUrl;
    const shouldRenderPhoto = typeof photoSrc === 'string' && /^(data:image\/[a-zA-Z0-9.+-]+;base64,|https?:\/\/)/.test(photoSrc);

    const hasSkills = skills && skills.length > 0;
    const hasLanguages = languages && languages.length > 0;
    const hasCertifications = certifications && certifications.length > 0;
    const hasInterests = interests && interests.length > 0;
    const hasReferences = references && references.length > 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header} fixed>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{personalInfo.fullName || 'Votre Nom'}</Text>
                        <Text style={styles.jobTitle}>{personalInfo.jobTitle || 'Votre Poste'}</Text>
                        <View style={styles.contactRow}>
                            {personalInfo.email && <Text style={styles.contactItem}>{personalInfo.email}</Text>}
                            {personalInfo.phone && <Text style={styles.contactItem}>{personalInfo.phone}</Text>}
                            {personalInfo.location && <Text style={styles.contactItem}>{personalInfo.location}</Text>}
                            {personalInfo.linkedin && <Text style={styles.contactItem}>{personalInfo.linkedin}</Text>}
                            {personalInfo.website && <Text style={styles.contactItem}>{personalInfo.website}</Text>}
                        </View>
                    </View>
                    {shouldRenderPhoto && (
                        <View style={styles.photoContainer}>
                            <Image src={photoSrc} style={styles.photo} />
                        </View>
                    )}
                </View>

                {/* MAIN BODY */}
                <View style={styles.mainBody}>
                    {/* SIDEBAR */}
                    <View style={styles.sidebar}>
                        {hasSkills && (
                            <View style={styles.sidebarBlock}>
                                <SectionHeading title="Compétences" />
                                <View style={styles.skillsContainer}>
                                    {skills.map((skill, idx) => (
                                        <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasLanguages && (
                            <View style={styles.sidebarBlock} wrap={false}>
                                <SectionHeading title="Langues" />
                                {languages.map((lang, idx) => (
                                    <View key={idx} style={styles.sidebarRow}>
                                        <Text style={styles.sidebarItemBold}>{lang.name}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.bodyMuted }}>{lang.level}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasCertifications && (
                            <View style={styles.sidebarBlock} wrap={false}>
                                <SectionHeading title="Certifications" />
                                {certifications.map((cert, idx) => (
                                    <View key={idx} style={{ marginBottom: 8 }}>
                                        <Text style={styles.sidebarItemBold}>{cert.name}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.bodyMuted, marginTop: 2 }}>
                                            {[cert.issuer, cert.year].filter(Boolean).join(' — ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasInterests && (
                            <View style={styles.sidebarBlock} wrap={false}>
                                <SectionHeading title="Intérêts" />
                                <View style={styles.skillsContainer}>
                                    {interests.map((item, idx) => (
                                        <Text key={idx} style={{
                                            fontSize: 10,
                                            backgroundColor: COLORS.white,
                                            border: `1px solid ${COLORS.border}`,
                                            color: COLORS.bodyLight,
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            marginBottom: 6,
                                            marginRight: 6,
                                        }}>{item}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasReferences && (
                            <View style={styles.sidebarBlock} wrap={false}>
                                <SectionHeading title="Références" />
                                {references.map((ref, idx) => (
                                    <View key={idx} style={{ marginBottom: 10 }}>
                                        <Text style={styles.sidebarItemBold}>{ref.name}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.bodyLight, marginTop: 1 }}>{ref.role}</Text>
                                        {ref.contact && <Text style={{ fontSize: 10, color: COLORS.gold, marginTop: 1 }}>{ref.contact}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* CONTENT */}
                    <View style={styles.content}>
                        {summary && (
                            <View style={{ marginBottom: 20 }}>
                                <SectionHeading title="Profil" />
                                <Text style={styles.summaryText}>{summary}</Text>
                            </View>
                        )}

                        {experience && experience.length > 0 && (
                            <View style={{ marginBottom: 20 }}>
                                <SectionHeading title="Expérience" />
                                {experience.map((exp, idx) => (
                                    <View key={idx} style={styles.expBlock} wrap={false}>
                                        <View style={styles.expHeader}>
                                            <Text style={styles.expRole}>{exp.role}</Text>
                                            <Text style={styles.expPeriod}>{exp.period}</Text>
                                        </View>
                                        <Text style={styles.expCompany}>
                                            {[exp.company, exp.location].filter(Boolean).join(' • ')}
                                        </Text>
                                        <View style={styles.achievementsList}>
                                            {exp.achievements.map((achiev, i) => (
                                                <View key={i} style={styles.achievementItem}>
                                                    <Text style={styles.bullet}>•</Text>
                                                    <Text style={styles.achievementText}>{achiev}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {education && education.length > 0 && (
                            <View>
                                <SectionHeading title="Formation" />
                                {education.map((edu, idx) => (
                                    <View key={idx} style={styles.eduBlock} wrap={false}>
                                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                                        <Text style={styles.eduInstitution}>{edu.institution}</Text>
                                        <Text style={styles.eduPeriod}>{edu.period}</Text>
                                        {edu.details && <Text style={styles.eduDetails}>{edu.details}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};
