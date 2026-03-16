import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const CREDITS_PER_OCR = 1;

// Use Google Generative AI for multimodal OCR
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
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

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { success: false, error: 'Clé API Gemini manquante', trace_id: traceId },
                { status: 503 }
            );
        }

        let systemInstruction = "Extraire le texte de ce document.";
        if (format === 'json') {
            systemInstruction = "Extraire les informations du document et les structurer en JSON valide. Ne retourne *que* le JSON formatté, sans bloc Markdown ```json autour.";
        } else if (format === 'markdown') {
            systemInstruction = "Extraire le texte de ce document avec un formatage Markdown propre, en respectant la mise en page, les titres (h1, h2, h3), et les tableaux éventuels.";
        }
        
        // Add language hint
        systemInstruction += ` La langue principale du document est: ${language}.`;

        const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');
        const base64Data = buffer.toString('base64');

        const requestBody = {
            contents: [{
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: systemInstruction
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 1,
                maxOutputTokens: 8192,
            }
        };

        const response = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini Error:", errorText);
            return NextResponse.json(
                { success: false, error: "Erreur lors de l'extraction par l'IA", details: "Le fournisseur a renvoyé une erreur réseau.", trace_id: traceId },
                { status: 502 }
            );
        }

        const payload = await response.json();
        const contentText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!contentText) {
             return NextResponse.json(
                { success: false, error: "Aucun texte extrait par l'IA", trace_id: traceId },
                { status: 422 }
            );
        }

        let outputText = contentText.trim();
        
        // Ensure no markdown block for json
        if (format === 'json') {
            if (outputText.startsWith('```json')) {
                outputText = outputText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
            } else if (outputText.startsWith('```')) {
                outputText = outputText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
            }
            // Validate JSON
            try {
                const parsed = JSON.parse(outputText);
                outputText = JSON.stringify(parsed, null, 2);
            } catch {
                return NextResponse.json(
                    { success: false, error: 'JSON invalide retourné par le modèle', text: outputText, trace_id: traceId },
                    { status: 502 }
                );
            }
        }

        const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
        const contentType = format === 'json' ? 'application/json' : format === 'markdown' ? 'text/markdown' : 'text/plain';

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
                pages: 1, // With Gemini API direct input, it doesn't give page count easily.
                provider: 'gemini-vlm',
                structured_by: 'gemini-vlm',
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
            provider: 'gemini-vlm',
            pages: 1,
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
