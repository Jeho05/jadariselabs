import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSocialAccountByPlatform, type SocialPlatform } from '@/lib/social/accounts';
import { publishLinkedInPost } from '@/lib/social/providers/linkedin';
import { publishXPost } from '@/lib/social/providers/x';
import { fetchTikTokCreatorInfo, publishTikTokPhoto } from '@/lib/social/providers/tiktok';
import { generateSocialImageUrl } from '@/lib/social/media';

function normalizeText(text: string, maxLength: number): string {
    const cleaned = text.trim();
    if (cleaned.length <= maxLength) return cleaned;
    return `${cleaned.slice(0, maxLength - 3)}...`;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body: { platform: string; content: string; topic?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { platform, content, topic } = body;

    if (!platform || !content) {
        return NextResponse.json({ error: 'Plateforme et contenu requis' }, { status: 400 });
    }

    const supportedPlatforms: SocialPlatform[] = ['linkedin', 'x', 'tiktok'];
    if (!supportedPlatforms.includes(platform as SocialPlatform)) {
        return NextResponse.json({ error: 'Plateforme non supportée' }, { status: 400 });
    }

    const account = await getSocialAccountByPlatform(user.id, platform as SocialPlatform);
    if (!account) {
        return NextResponse.json({ error: `Aucun compte ${platform} connecté. Connectez votre compte d'abord.` }, { status: 400 });
    }

    try {
        let providerPostId = '';

        if (platform === 'linkedin') {
            const text = normalizeText(content, 3000);
            const result = await publishLinkedInPost({
                accessToken: account.accessToken,
                authorUrn: account.account_id,
                text,
            });
            providerPostId = result.id;
        } else if (platform === 'x') {
            const text = normalizeText(content, 280);
            const result = await publishXPost({
                accessToken: account.accessToken,
                text,
            });
            providerPostId = result.id;
        } else if (platform === 'tiktok') {
            const description = normalizeText(content, 4000);
            const baseText = topic || content.slice(0, 200);
            const imageUrl = await generateSocialImageUrl({
                text: baseText,
                userId: user.id,
            });
            const creatorInfo = await fetchTikTokCreatorInfo(account.accessToken);
            const privacyOptions = creatorInfo.privacyOptions || [];
            const privacyLevel = privacyOptions.includes('PUBLIC_TO_EVERYONE')
                ? 'PUBLIC_TO_EVERYONE'
                : privacyOptions[0] || 'SELF_ONLY';

            const result = await publishTikTokPhoto({
                accessToken: account.accessToken,
                imageUrls: [imageUrl],
                description,
                privacyLevel,
            });
            providerPostId = result.publishId;
        }

        return NextResponse.json({
            success: true,
            provider_post_id: providerPostId,
            message: `Contenu publié sur ${platform} avec succès !`,
        });
    } catch (err: any) {
        console.error('Direct publish error:', err);
        const message = err?.message || 'Échec de la publication';
        return NextResponse.json({ error: message, details: err?.stack }, { status: 500 });
    }
}
