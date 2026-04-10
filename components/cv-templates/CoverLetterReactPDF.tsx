import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
        backgroundColor: '#FFFFFF',
        fontFamily: 'Open Sans',
        padding: '50px 60px',
    },
    header: {
        marginBottom: 40,
    },
    senderName: {
        fontSize: 16,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 4,
    },
    senderInfo: {
        fontSize: 10,
        color: '#4B5563',
        marginBottom: 2,
    },
    recipientBlock: {
        marginTop: 20,
        alignItems: 'flex-start',
    },
    recipientTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#111827',
    },
    dateLine: {
        marginTop: 20,
        fontSize: 11,
        color: '#4B5563',
        textAlign: 'right',
    },
    bodyContainer: {
        marginTop: 30,
    },
    paragraph: {
        fontSize: 11,
        color: '#1F2937',
        lineHeight: 1.6,
        marginBottom: 12,
        textAlign: 'justify',
    },
    signature: {
        marginTop: 40,
        fontSize: 12,
        fontWeight: 600,
        color: '#111827',
    }
});

export const CoverLetterReactPDF = ({ 
    content, 
    personalInfo, 
    companyName 
}: { 
    content: string; 
    personalInfo: any; 
    companyName: string; 
}) => {
    // Nettoyer et séparer les paragraphes (le contenu AI peut contenir du markdown basique ou des '\n\n')
    // On enlève quelques symboles markdown courants si besoin, puis on les split.
    const cleanContent = content.replace(/\*\*/g, '').replace(/\*/g, '');
    const paragraphs = cleanContent.split('\n').filter(p => p.trim() !== '');

    const todayDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.senderName}>{personalInfo.fullName || 'Votre Nom'}</Text>
                    {personalInfo.email && <Text style={styles.senderInfo}>{personalInfo.email}</Text>}
                    {personalInfo.phone && <Text style={styles.senderInfo}>{personalInfo.phone}</Text>}
                    {personalInfo.location && <Text style={styles.senderInfo}>{personalInfo.location}</Text>}
                    {personalInfo.linkedin && <Text style={styles.senderInfo}>{personalInfo.linkedin}</Text>}
                </View>

                <View style={styles.recipientBlock}>
                    <Text style={styles.recipientTitle}>À l&apos;attention du Responsable du Recrutement</Text>
                    <Text style={styles.senderInfo}>{companyName || "L'entreprise"}</Text>
                </View>

                <Text style={styles.dateLine}>Fait le {todayDate}</Text>

                <View style={styles.bodyContainer}>
                    {paragraphs.map((p, idx) => (
                        <Text key={idx} style={styles.paragraph}>
                            {p.trim()}
                        </Text>
                    ))}
                </View>

                <Text style={styles.signature}>{personalInfo.fullName}</Text>
            </Page>
        </Document>
    );
};
