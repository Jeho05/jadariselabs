import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Certaines plateformes utilisent GET avec un "challenge" pour vérifier le webhook
    const url = new URL(request.url);
    const challenge = url.searchParams.get('challenge');
    
    if (challenge) {
        return NextResponse.json({ challenge });
    }
    
    return NextResponse.json({ status: 'ok', service: 'TikTok Webhook Ready' }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Nous logguons le payload pour un éventuel débogage futur (statut de la vidéo, etc.)
        console.log('TikTok Webhook event received:', JSON.stringify(body, null, 2));
        
        // Il est crucial de renvoyer un statut 200 rapidement pour que TikTok sache
        // que nous avons bien reçu l'événement.
        return NextResponse.json({ success: true, message: 'Event received' }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors du traitement du webhook TikTok:', error);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}
