import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertSocialAccount } from '@/lib/social/accounts';
import { exchangeLinkedInCode, fetchLinkedInProfile, getLinkedInScopes } from '@/lib/social/providers/linkedin';
import { exchangeXCode, fetchXProfile, getXScopes } from '@/lib/social/providers/x';
import { exchangeTikTokCode, getTikTokScopes } from '@/lib/social/providers/tiktok';

function computeExpiresAt(expiresIn?: number): string | null {
    if (!expiresIn) return null;
    return new Date(Date.now() + expiresIn * 1000).toISOString();
}

export async function GET(request: Request, { params }: { params: { platform: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const platform = params.platform;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return NextResponse.json({ error: 'Code ou state manquant' }, { status: 400 });
    }

    const stateCookie = cookies().get(`social_oauth_state_${platform}`)?.value;

    if (!stateCookie || stateCookie !== state) {
        return NextResponse.json({ error: 'State invalide' }, { status: 400 });
    }

    try {
        if (platform === 'linkedin') {
            const clientId = process.env.LINKEDIN_CLIENT_ID;
            const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                return NextResponse.json({ error: 'LinkedIn credentials manquants' }, { status: 500 });
            }
            const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/social/connect/linkedin/callback`;
            const token = await exchangeLinkedInCode({ code, clientId, clientSecret, redirectUri });
            const profile = await fetchLinkedInProfile(token.accessToken);

            await upsertSocialAccount({
                userId: user.id,
                platform: 'linkedin',
                accountId: profile.urn,
                accountName: profile.name,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken || null,
                expiresAt: computeExpiresAt(token.expiresIn || undefined),
                scopes: (token.scope || getLinkedInScopes()).split(' '),
                metadata: {
                    profile_id: profile.id,
                },
            });
        } else if (platform === 'x') {
            const clientId = process.env.X_CLIENT_ID?.trim();
            if (!clientId) {
                return NextResponse.json({ error: 'X credentials manquants' }, { status: 500 });
            }
            const clientSecret = process.env.X_CLIENT_SECRET?.trim();
            const redirectUri = process.env.X_REDIRECT_URI?.trim() || `${process.env.NEXT_PUBLIC_APP_URL}/api/social/connect/x/callback`;
            const codeVerifier = cookies().get('social_oauth_verifier_x')?.value;

            if (!codeVerifier) {
                return NextResponse.json({ error: 'PKCE verifier manquant' }, { status: 400 });
            }

            const token = await exchangeXCode({ code, clientId, clientSecret, redirectUri, codeVerifier });
            const profile = await fetchXProfile(token.accessToken);

            await upsertSocialAccount({
                userId: user.id,
                platform: 'x',
                accountId: profile.id,
                accountName: profile.username ? `@${profile.username}` : profile.name,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken || null,
                expiresAt: computeExpiresAt(token.expiresIn || undefined),
                scopes: (token.scope || getXScopes()).split(' '),
                metadata: {
                    username: profile.username,
                },
            });
        } else if (platform === 'tiktok') {
            const clientKey = process.env.TIKTOK_CLIENT_KEY;
            const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
            if (!clientKey || !clientSecret) {
                return NextResponse.json({ error: 'TikTok credentials manquants' }, { status: 500 });
            }
            const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/social/connect/tiktok/callback`;
            const token = await exchangeTikTokCode({ code, clientKey, clientSecret, redirectUri });

            await upsertSocialAccount({
                userId: user.id,
                platform: 'tiktok',
                accountId: token.openId || 'tiktok_user',
                accountName: token.openId || 'TikTok',
                accessToken: token.accessToken,
                refreshToken: token.refreshToken || null,
                expiresAt: computeExpiresAt(token.expiresIn || undefined),
                scopes: (token.scope || getTikTokScopes()).split(','),
                metadata: {
                    open_id: token.openId,
                },
            });
        } else {
            return NextResponse.json({ error: 'Plateforme non supportee' }, { status: 400 });
        }

        const redirectTo = new URL('/studio/social', request.url);
        redirectTo.searchParams.set('connected', platform);

        const response = NextResponse.redirect(redirectTo);
        response.cookies.delete(`social_oauth_state_${platform}`);
        response.cookies.delete(`social_oauth_verifier_${platform}`);
        return response;
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
    }
}
