import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

/* ═══════════════════════════════════════════════════════════
   Cover Letter — International Professional Format
   ──────────────────────────────────────────────────
   Follows the international (French/European) business
   letter standard with:
   • Sender block (top-left)
   • Recipient block (right-aligned below)
   • Place & Date (right-aligned)
   • Subject line (bolded)
   • Formal salutation
   • Body paragraphs (justified)
   • Complimentary close
   • Physical signature space + printed name
   
   Premium design: gold accent stripe, elegant typography,
   subtle decorative details. Ready for physical signing.
   ═══════════════════════════════════════════════════════════ */

const C = {
    navy:      '#111827',
    navyLight: '#1F2937',
    gold:      '#C9A84C',
    goldPale:  '#F5EFDB',
    textDark:  '#111827',
    textBody:  '#1F2937',
    textLight: '#4B5563',
    textMuted: '#9CA3AF',
    border:    '#E5E7EB',
    white:     '#FFFFFF',
    bg:        '#FAFBFC',
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

/* Serif font for the body — elegant for formal letters */
Font.register({
    family: 'Lora',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf', fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-600-normal.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf', fontWeight: 700 },
    ]
});

const s = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: C.white,
        fontFamily: 'Inter',
        padding: 0,
        position: 'relative',
    },

    /* ── TOP ACCENT BAR ── */
    accentBar: {
        height: 6,
        backgroundColor: C.navy,
        position: 'relative',
    },
    accentGoldStripe: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: C.gold,
    },

    /* ── PAGE CONTENT ── */
    content: {
        padding: '40px 55px 50px 55px',
        flex: 1,
    },

    /* ── SENDER BLOCK (top-left) ── */
    senderBlock: {
        marginBottom: 8,
    },
    senderName: {
        fontSize: 18,
        fontWeight: 800,
        color: C.navy,
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    senderJobTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: C.gold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    senderInfoLine: {
        fontSize: 9.5,
        color: C.textLight,
        marginBottom: 2,
        lineHeight: 1.4,
    },

    /* ── SEPARATOR ── */
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },
    sepLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.border,
    },
    sepDiamond: {
        width: 6,
        height: 6,
        backgroundColor: C.gold,
        marginHorizontal: 12,
        transform: 'rotate(45deg)',
    },

    /* ── RECIPIENT BLOCK (right side) ── */
    recipientBlock: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: 6,
        maxWidth: '55%',
    },
    recipientLabel: {
        fontSize: 8,
        fontWeight: 600,
        color: C.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    recipientName: {
        fontSize: 12,
        fontWeight: 700,
        color: C.navy,
        marginBottom: 2,
        textAlign: 'right',
    },
    recipientInfo: {
        fontSize: 9.5,
        color: C.textLight,
        marginBottom: 1,
        textAlign: 'right',
    },

    /* ── DATE LINE ── */
    dateLine: {
        alignSelf: 'flex-end',
        marginTop: 16,
        marginBottom: 24,
        fontSize: 10,
        color: C.textLight,
        fontStyle: 'italic',
    },

    /* ── OBJECT LINE ── */
    objectBlock: {
        backgroundColor: C.bg,
        borderLeft: `3px solid ${C.gold}`,
        padding: '8px 14px',
        marginBottom: 24,
        borderRadius: 2,
    },
    objectLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: C.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    objectText: {
        fontSize: 11,
        fontWeight: 700,
        color: C.navy,
    },

    /* ── BODY ── */
    salutation: {
        fontSize: 11,
        fontWeight: 600,
        color: C.textDark,
        marginBottom: 14,
        fontFamily: 'Lora',
    },
    paragraph: {
        fontSize: 10.5,
        color: C.textBody,
        lineHeight: 1.7,
        marginBottom: 10,
        textAlign: 'justify',
        fontFamily: 'Lora',
        textIndent: 25,
    },

    /* ── CLOSING & SIGNATURE ── */
    closingBlock: {
        marginTop: 20,
    },
    closingText: {
        fontSize: 10.5,
        color: C.textBody,
        lineHeight: 1.7,
        fontFamily: 'Lora',
        textIndent: 25,
        marginBottom: 4,
    },

    signatureArea: {
        marginTop: 30,
        alignSelf: 'flex-end',
        alignItems: 'center',
        width: 200,
    },
    signatureLabel: {
        fontSize: 8,
        fontWeight: 600,
        color: C.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    signatureBox: {
        width: '100%',
        height: 55,
        borderBottom: `1px solid ${C.textMuted}`,
        marginBottom: 8,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 700,
        color: C.navy,
        textAlign: 'center',
    },

    /* ── FOOTER ── */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    footerDot: {
        width: 3,
        height: 3,
        borderRadius: 9999,
        backgroundColor: C.gold,
    },
    footerText: {
        fontSize: 7.5,
        color: C.textMuted,
        letterSpacing: 0.5,
    },

    /* ── BOTTOM GOLD STRIPE ── */
    bottomStripe: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: C.gold,
    },
});

/* ─── Helpers ─── */
const cleanMarkdown = (text: string) =>
    text.replace(/#{1,6}\s*/g, '')     // headings
        .replace(/\*\*/g, '')          // bold
        .replace(/\*/g, '')            // italic
        .replace(/^[-•]\s*/gm, '')     // list bullets
        .replace(/^\d+\.\s*/gm, '')    // numbered lists
        .trim();

/**
 * Intelligently splits AI-generated letter content into structured parts:
 * salutation, body paragraphs, and closing formula.
 */
function parseLetterContent(raw: string) {
    const cleaned = cleanMarkdown(raw);
    const lines = cleaned.split('\n').filter(l => l.trim() !== '');

    let salutation = 'Madame, Monsieur,';
    let closingFormula = '';
    const bodyParagraphs: string[] = [];

    // Detect salutation (first line if matches pattern)
    const salutationPatterns = [
        /^(madame|monsieur|cher|chère|mesdames|messieurs|à l'attention)/i,
    ];

    let startIdx = 0;
    if (lines.length > 0 && salutationPatterns.some(p => p.test(lines[0].trim()))) {
        salutation = lines[0].trim();
        startIdx = 1;
    }

    // Detect closing formula (last 1-2 lines if matches closing patterns)
    const closingPatterns = [
        /^(veuillez|je vous prie|dans l'attente|cordialement|respectueusement|sincères salutations|avec mes|en espérant|restant à)/i,
    ];

    let endIdx = lines.length;
    for (let i = lines.length - 1; i >= Math.max(startIdx, lines.length - 3); i--) {
        if (closingPatterns.some(p => p.test(lines[i].trim()))) {
            closingFormula = lines.slice(i, endIdx).join(' ').trim();
            endIdx = i;
            break;
        }
    }

    // Everything in between is body
    for (let i = startIdx; i < endIdx; i++) {
        bodyParagraphs.push(lines[i].trim());
    }

    // Default closing if none detected
    if (!closingFormula) {
        closingFormula = 'Veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.';
    }

    return { salutation, bodyParagraphs, closingFormula };
}

/* ═══ MAIN COMPONENT ═══ */
export const CoverLetterReactPDF = ({
    content,
    personalInfo,
    companyName,
    companyAddress,
    jobTitle,
}: {
    content: string;
    personalInfo: any;
    companyName: string;
    companyAddress?: string;
    jobTitle?: string;
}) => {
    const todayDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const location = personalInfo?.location || '';
    const datePlaceLine = location ? `${location}, le ${todayDate}` : `Le ${todayDate}`;

    const { salutation, bodyParagraphs, closingFormula } = parseLetterContent(content);

    // Build subject line
    const subject = jobTitle
        ? `Candidature au poste de ${jobTitle}`
        : personalInfo?.jobTitle
            ? `Candidature au poste de ${personalInfo.jobTitle}`
            : `Candidature spontanée`;

    // Sender contact details
    const senderLines: string[] = [];
    if (personalInfo?.location) senderLines.push(personalInfo.location);
    if (personalInfo?.phone) senderLines.push(`Tél. : ${personalInfo.phone}`);
    if (personalInfo?.email) senderLines.push(personalInfo.email);
    if (personalInfo?.linkedin) senderLines.push(`LinkedIn : ${personalInfo.linkedin}`);

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* ── Top Accent Bar ── */}
                <View style={s.accentBar}>
                    <View style={s.accentGoldStripe} />
                </View>

                <View style={s.content}>
                    {/* ═══ SENDER BLOCK ═══ */}
                    <View style={s.senderBlock}>
                        <Text style={s.senderName}>
                            {personalInfo?.fullName || 'Votre Nom'}
                        </Text>
                        {(personalInfo?.jobTitle) && (
                            <Text style={s.senderJobTitle}>
                                {personalInfo.jobTitle}
                            </Text>
                        )}
                        {senderLines.map((line, idx) => (
                            <Text key={idx} style={s.senderInfoLine}>{line}</Text>
                        ))}
                    </View>

                    {/* ── Elegant Separator ── */}
                    <View style={s.separator}>
                        <View style={s.sepLine} />
                        <View style={s.sepDiamond} />
                        <View style={s.sepLine} />
                    </View>

                    {/* ═══ RECIPIENT BLOCK ═══ */}
                    <View style={s.recipientBlock}>
                        <Text style={s.recipientLabel}>Destinataire</Text>
                        <Text style={s.recipientName}>
                            {companyName || "Nom de l'entreprise"}
                        </Text>
                        <Text style={s.recipientInfo}>
                            À l&apos;attention du Responsable du Recrutement
                        </Text>
                        {companyAddress && (
                            <Text style={s.recipientInfo}>{companyAddress}</Text>
                        )}
                    </View>

                    {/* ═══ DATE ═══ */}
                    <Text style={s.dateLine}>{datePlaceLine}</Text>

                    {/* ═══ OBJECT LINE ═══ */}
                    <View style={s.objectBlock}>
                        <Text style={s.objectLabel}>Objet</Text>
                        <Text style={s.objectText}>{subject}</Text>
                    </View>

                    {/* ═══ SALUTATION ═══ */}
                    <Text style={s.salutation}>{salutation}</Text>

                    {/* ═══ BODY PARAGRAPHS ═══ */}
                    {bodyParagraphs.map((p, idx) => (
                        <Text key={idx} style={s.paragraph}>
                            {p}
                        </Text>
                    ))}

                    {/* ═══ CLOSING FORMULA ═══ */}
                    <View style={s.closingBlock}>
                        <Text style={s.closingText}>{closingFormula}</Text>
                    </View>

                    {/* ═══ SIGNATURE AREA ═══ */}
                    <View style={s.signatureArea}>
                        <Text style={s.signatureLabel}>Signature</Text>
                        <View style={s.signatureBox} />
                        <Text style={s.signatureName}>
                            {personalInfo?.fullName || 'Votre Nom'}
                        </Text>
                    </View>
                </View>

                {/* ── Footer ── */}
                <View style={s.footer}>
                    <View style={s.footerDot} />
                    <Text style={s.footerText}>
                        {personalInfo?.fullName || 'Candidat'} — Lettre de Motivation
                    </Text>
                    <View style={s.footerDot} />
                </View>

                {/* Bottom gold stripe */}
                <View style={s.bottomStripe} />
            </Page>
        </Document>
    );
};
