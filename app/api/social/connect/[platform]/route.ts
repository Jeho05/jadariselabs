import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildLinkedInAuthUrl } from '@/lib/social/providers/linkedin';
import { buildXAuthUrl } from '@/lib/social/providers/x';
import { buildTikTokAuthUrl } from '@/lib/social/providers/tiktok';

function toBase64Url(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function GET(_: Request, { params }: { params: { platform: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const platform = params.platform;
    const state = crypto.randomUUID();
    const appUrl = getAppUrl();
    let authUrl: string | null = null;
    let codeVerifier: string | null = null;

    if (platform === 'linkedin') {
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        if (!clientId) {
            return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID manquant' }, { status: 500 });
        }
        const redirectUrl = process.env.LINKEDIN_REDIRECT_URI || `${appUrl}/api/social/connect/linkedin/callback`;
        authUrl = buildLinkedInAuthUrl({ clientId, redirectUri: redirectUrl, state });
    } else if (platform === 'x') {
        const clientId = process.env.X_CLIENT_ID;
        if (!clientId) {
            return NextResponse.json({ error: 'X_CLIENT_ID manquant' }, { status: 500 });
        }
        const redirectUrl = process.env.X_REDIRECT_URI || `${appUrl}/api/social/connect/x/callback`;
        codeVerifier = toBase64Url(crypto.randomBytes(32));
        const codeChallenge = toBase64Url(crypto.createHash('sha256').update(codeVerifier).digest());
        authUrl = buildXAuthUrl({
            clientId,
            redirectUri: redirectUrl,
            state,
            codeChallenge,
            codeChallengeMethod: 's256',
        });
    } else if (platform === 'tiktok') {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        if (!clientKey) {
            return NextResponse.json({ error: 'TIKTOK_CLIENT_KEY manquant' }, { status: 500 });
        }
        const redirectUrl = process.env.TIKTOK_REDIRECT_URI || `${appUrl}/api/social/connect/tiktok/callback`;
        authUrl = buildTikTokAuthUrl({ clientKey, redirectUri: redirectUrl, state });
    } else {
        return NextResponse.json({ error: 'Plateforme non supportee' }, { status: 400 });
    }

    const response = NextResponse.redirect(authUrl);
    response.cookies.set(`social_oauth_state_${platform}`, state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });

    if (codeVerifier) {
        response.cookies.set(`social_oauth_verifier_${platform}`, codeVerifier, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 600,
            path: '/',
        });
    }

    return response;
}
