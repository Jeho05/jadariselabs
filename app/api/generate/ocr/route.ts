import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const CREDITS_PER_OCR = 1;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

type OcrFormat = 'text' | 'markdown' | 'json';

function normalizeFormat(value: string | null): OcrFormat {
    if (value === 'markdown' || value === 'json' || value === 'text') return value;
    return 'text';
}

function normalizeLanguage(value: string | null): string {
    if (value === 'eng' || value === 'fra+eng' || value === 'fra') return value;
    return 'fra';
}

async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
    const pdfParse = (await import('pdf-parse')).default as unknown as (data: Buffer) => Promise<{
        text: string;
        numpages: number;
    }>;
    const result = await pdfParse(buffer);
    return { text: result.text || '', pages: result.numpages || 0 };
}

async function extractTextFromImage(buffer: Buffer, language: string): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = (await createWorker()) as unknown as {
        load?: () => Promise<void>;
        loadLanguage: (lang: string) => Promise<void>;
        initialize: (lang: string) => Promise<void>;
        recognize: (input: Buffer) => Promise<{ data: { text?: string } }>;
        terminate: () => Promise<void>;
    };
    try {
        if (typeof worker.load === 'function') {
            await worker.load();
        }
        await worker.loadLanguage(language);
        await worker.initialize(language);
        const { data } = await worker.recognize(buffer);
        return data.text || '';
    } finally {
        await worker.terminate();
    }
}

async function formatWithGemini(text: string, format: OcrFormat): Promise<string> {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY non configurée');
    }

    const systemPrompt =
        format === 'json'
            ? 'Tu convertis un texte OCR en JSON valide. Retourne uniquement du JSON.'
            : 'Tu convertis un texte OCR en Markdown propre et lisible, sans inventer du contenu.';

    const response = await fetch(`${GEMINI_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${geminiApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GEMINI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Texte OCR:\n${text}`,
                },
            ],
            temperature: 0.2,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.substring(0, 200));
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content?.trim();

    if (!content) {
        throw new Error('Réponse vide du modèle');
    }

    if (format === 'json') {
        try {
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, 2);
        } catch {
            throw new Error('JSON invalide retourné par le modèle');
        }
    }

    return content;
}

export async function POST(request: NextRequest) {
    const traceId = `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const format = normalizeFormat(formData.get('format') as string | null);
        const language = normalizeLanguage(formData.get('language') as string | null);

        if (!file) {
            return NextResponse.json({ success: false, error: 'Fichier manquant', trace_id: traceId }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'Fichier trop volumineux (max 15MB)', trace_id: traceId },
                { status: 400 }
            );
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('credits, plan')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        if (profile.credits !== -1 && profile.credits < CREDITS_PER_OCR) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Crédits insuffisants',
                    details: `Il vous faut ${CREDITS_PER_OCR} crédit(s). Crédits restants : ${profile.credits}`,
                    trace_id: traceId,
                },
                { status: 402 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name || 'document';
        const isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
            return NextResponse.json(
                { success: false, error: 'Format non supporté (PDF ou image)', trace_id: traceId },
                { status: 400 }
            );
        }

        let extractedText = '';
        let pages = 0;
        let provider = 'tesseract';

        if (isPdf) {
            const result = await extractTextFromPdf(buffer);
            extractedText = result.text;
            pages = result.pages;
            provider = 'pdf-parse';
        } else {
            extractedText = await extractTextFromImage(buffer, language);
            pages = 1;
            provider = 'tesseract';
        }

        const trimmedText = extractedText.trim();
        if (!trimmedText) {
            return NextResponse.json(
                { success: false, error: 'Aucun texte détecté', trace_id: traceId },
                { status: 422 }
            );
        }

        let outputText = trimmedText;
        let structuredBy: string | null = null;

        if (format !== 'text') {
            outputText = await formatWithGemini(trimmedText.slice(0, 80_000), format);
            structuredBy = 'gemini';
        }

        const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
        const contentType =
            format === 'json' ? 'application/json' : format === 'markdown' ? 'text/markdown' : 'text/plain';

        const storagePath = `${user.id}/ocr/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('generations').upload(
            storagePath,
            Buffer.from(outputText, 'utf-8'),
            {
                contentType,
                upsert: false,
            }
        );

        let resultUrl: string | null = null;
        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('generations').getPublicUrl(storagePath);
            resultUrl = urlData.publicUrl;
        }

        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - CREDITS_PER_OCR })
                .eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'ocr',
            prompt: `OCR: ${fileName}`.substring(0, 500),
            result_url: resultUrl,
            metadata: {
                format,
                language,
                pages,
                provider,
                structured_by: structuredBy,
                file_name: fileName,
                file_size: file.size,
                source_type: isPdf ? 'pdf' : 'image',
            },
            credits_used: CREDITS_PER_OCR,
        });

        return NextResponse.json({
            success: true,
            text: outputText,
            format,
            result_url: resultUrl,
            credits_charged: CREDITS_PER_OCR,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - CREDITS_PER_OCR,
            provider,
            pages,
            trace_id: traceId,
        });
    } catch (error) {
        console.error('[OCR] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur OCR',
                details: error instanceof Error ? error.message : 'Erreur inconnue',
                trace_id: traceId,
            },
            { status: 500 }
        );
    }
}
