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
        
        // Log the webhook payload
        console.log('TikTok Webhook event received:', JSON.stringify(body, null, 2));
        
        // TikTok webhook verification
        // TikTok sends a POST request with a challenge string
        if (body.challenge) {
            return NextResponse.json({ challenge: body.challenge }, { status: 200 });
        }
        
        // Acknowledge receipt for other events
        return NextResponse.json({ success: true, message: 'Event received' }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors du traitement du webhook TikTok:', error);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}
