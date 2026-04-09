// ============================================
// JadaRiseLabs — Document Processing Utilities
// Extraction et traitement de PDF et images
// ============================================

import { createClient } from './supabase/client';

// Types de fichiers supportés
export const SUPPORTED_DOC_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'text/plain',
];

export const SUPPORTED_DOC_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt'];

export interface DocumentMetadata {
    filename: string;
    size: number;
    type: string;
    pages?: number;
    wordCount?: number;
}

export interface ExtractedContent {
    text: string;
    metadata: DocumentMetadata;
    chunks: string[]; // Texte découpé en segments
}

export interface SummaryOptions {
    format: 'summary' | 'bullets' | 'mindmap' | 'key-points';
    detail: 'short' | 'medium' | 'detailed';
    language: 'fr' | 'en' | 'auto';
    focus?: string; // Sujet particulier à mettre en avant
}

// Vérifier si un fichier est supporté
export function isSupportedDocument(file: File): boolean {
    return SUPPORTED_DOC_TYPES.includes(file.type) ||
        SUPPORTED_DOC_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

// Calculer le coût en crédits selon la taille
export function calculateDocumentCredits(wordCount: number): number {
    if (wordCount < 1000) return 2;
    if (wordCount < 5000) return 5;
    return 10;
}

// Découper le texte en chunks pour traitement
export function chunkText(text: string, maxChunkSize: number = 4000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    let currentChunk = '';
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    
    return chunks;
}

// Extraire le texte d'une image via l'API OCR existante
async function extractFromImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', 'text');
    
    const response = await fetch('/api/generate/ocr', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors de l\'extraction OCR');
    }
    
    const data = await response.json();
    return data.text || '';
}

// Extraire le texte d'un PDF (simulation - en prod utiliser pdf-parse ou API)
async function extractFromPDF(file: File): Promise<string> {
    // Note: Dans une implémentation réelle, on utiliserait:
    // - pdf-parse (côté serveur uniquement)
    // - Ou une API comme Cloudmersive, ILovePDF, etc.
    // - Ou l'API Google Document AI
    
    // Pour cette démo, on simule l'extraction
    // En production, déplacer vers une API route
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Simulation: retourner un placeholder
            // En vrai, il faudrait parser le PDF
            resolve(`[Contenu PDF extrait: ${file.name}]\nTaille: ${(file.size / 1024).toFixed(1)} KB\n\n[Note: L'extraction réelle de PDF nécessite une API serveur comme pdf-parse ou une solution cloud]`);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Extraire le texte d'un fichier texte
async function extractFromText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string || '');
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Fonction principale d'extraction
export async function extractDocumentContent(file: File): Promise<ExtractedContent> {
    let text = '';
    
    if (file.type.startsWith('image/')) {
        text = await extractFromImage(file);
    } else if (file.type === 'application/pdf') {
        text = await extractFromPDF(file);
    } else if (file.type === 'text/plain') {
        text = await extractFromText(file);
    } else {
        throw new Error('Type de fichier non supporté');
    }
    
    const wordCount = text.split(/\s+/).length;
    const chunks = chunkText(text);
    
    return {
        text,
        metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            wordCount,
        },
        chunks,
    };
}

// Générer le prompt de résumé
export function buildSummaryPrompt(
    content: string,
    options: SummaryOptions
): string {
    const formatDescriptions: Record<string, string> = {
        'summary': 'un résumé textuel fluide et cohérent',
        'bullets': 'une liste de points clés avec puces',
        'mindmap': 'une structure hiérarchique type carte mentale avec niveaux',
        'key-points': 'les points essentiels numérotés avec citations du texte',
    };
    
    const detailLevels: Record<string, string> = {
        'short': 'court (10-15% du texte original)',
        'medium': 'moyen (20-25% du texte original)',
        'detailed': 'détaillé (30-40% du texte original)',
    };
    
    return `En tant qu'expert en analyse de documents, rédige ${formatDescriptions[options.format]} du texte suivant.

NIVEAU DE DÉTAIL: ${detailLevels[options.detail]}
${options.focus ? `FOCUS PARTICULIER: Met en avant les aspects liés à "${options.focus}"` : ''}

TEXTE À RÉSUMER:
---
${content.substring(0, 15000)}
${content.length > 15000 ? '\n\n[Texte tronqué pour traitement, les ' + Math.round(content.length / 1000) + 'K caractères ont été réduits aux 15K premiers]' : ''}
---

Instructions:
1. Respecte le niveau de détail demandé
2. Garde les informations factuelles importantes
3. Présente les idées dans un ordre logique
4. ${options.format === 'mindmap' ? 'Utilise une indentation avec des tirets pour montrer la hiérarchie' : 'Sois concis mais complet'}
5. Réponds en ${options.language === 'auto' ? 'français (ou détecte la langue du texte)' : options.language}

Réponds directement avec le résumé, sans introduction.`;
}

// Upload document to Supabase Storage
export async function uploadDocument(file: File, userId: string): Promise<string | null> {
    const supabase = createClient();
    
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
        });
    
    if (error) {
        console.error('Upload error:', error);
        return null;
    }
    
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
}

// Détecter la langue (simplifié)
export function detectLanguage(text: string): 'fr' | 'en' | 'other' {
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'est', 'dans', 'pour'];
    const englishWords = ['the', 'a', 'an', 'and', 'is', 'in', 'for', 'to', 'of', 'that'];
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/).slice(0, 100);
    
    let frenchCount = 0;
    let englishCount = 0;
    
    for (const word of words) {
        if (frenchWords.includes(word)) frenchCount++;
        if (englishWords.includes(word)) englishCount++;
    }
    
    if (frenchCount > englishCount) return 'fr';
    if (englishCount > frenchCount) return 'en';
    return 'fr'; // Default to French for JadaRiseLabs
}
