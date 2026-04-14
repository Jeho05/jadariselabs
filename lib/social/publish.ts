import { createAdminClient } from '@/lib/supabase/admin';
import { getSocialAccountByPlatform, type SocialPlatform } from '@/lib/social/accounts';
import { publishLinkedInPost } from '@/lib/social/providers/linkedin';
import { publishXPost } from '@/lib/social/providers/x';
import { fetchTikTokCreatorInfo, publishTikTokPhoto } from '@/lib/social/providers/tiktok';
import { generateSocialImageUrl } from '@/lib/social/media';

export type PublishResult = { ok: true; providerPostId?: string } | { ok: false; error: string };

function normalizeText(text: string, maxLength: number): string {
    const cleaned = text.trim();
    if (cleaned.length <= maxLength) return cleaned;
    return `${cleaned.slice(0, maxLength - 3)}...`;
}

export async function publishDraftById(draftId: string): Promise<PublishResult> {
    const supabase = createAdminClient();

    const { data: draft, error: draftError } = await supabase
        .from('social_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

    if (draftError || !draft) {
        return { ok: false, error: 'Draft not found' };
    }

    if (draft.status !== 'approved') {
        return { ok: false, error: 'Draft not approved' };
    }

    const platform = draft.platform as SocialPlatform;
    const account = await getSocialAccountByPlatform(draft.user_id, platform);

    if (!account) {
        await supabase
            .from('social_drafts')
            .update({
                publish_error: 'Aucun compte connecte pour cette plateforme',
                publish_attempts: (draft.publish_attempts || 0) + 1,
            })
            .eq('id', draftId);

        return { ok: false, error: 'No connected account' };
    }

    try {
        let providerPostId = '';

        if (platform === 'linkedin') {
            const text = normalizeText(String(draft.content || ''), 3000);
            const result = await publishLinkedInPost({
                accessToken: account.accessToken,
                authorUrn: account.account_id,
                text,
            });
            providerPostId = result.id;
        } else if (platform === 'x') {
            const text = normalizeText(String(draft.content || ''), 280);
            const result = await publishXPost({
                accessToken: account.accessToken,
                text,
            });
            providerPostId = result.id;
        } else if (platform === 'tiktok') {
            const baseText = String(draft.topic || draft.content || '');
            const description = normalizeText(String(draft.content || ''), 4000);
            const imageUrl = await generateSocialImageUrl({
                text: baseText,
                userId: draft.user_id,
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
        } else {
            throw new Error('Platform not supported yet');
        }

        await supabase
            .from('social_drafts')
            .update({
                status: 'published',
                provider_post_id: providerPostId || null,
                published_at: new Date().toISOString(),
                publish_error: null,
                publish_attempts: (draft.publish_attempts || 0) + 1,
            })
            .eq('id', draftId);

        return { ok: true, providerPostId };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Publish failed';
        await supabase
            .from('social_drafts')
            .update({
                status: 'failed',
                publish_error: message,
                publish_attempts: (draft.publish_attempts || 0) + 1,
            })
            .eq('id', draftId);

        return { ok: false, error: message };
    }
}
