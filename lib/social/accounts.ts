import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken, encryptToken } from '@/lib/social/crypto';
import { refreshXToken } from '@/lib/social/providers/x';
import { refreshTikTokToken } from '@/lib/social/providers/tiktok';
import { refreshLinkedInToken } from '@/lib/social/providers/linkedin';

export type SocialPlatform = 'linkedin' | 'x' | 'tiktok' | 'facebook' | 'instagram' | 'whatsapp';

export interface SocialAccountInput {
    userId: string;
    platform: SocialPlatform;
    accountId: string;
    accountName?: string;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string | null;
    scopes?: string[];
    metadata?: Record<string, unknown>;
}

export interface SocialAccountRecord {
    id: string;
    user_id: string;
    platform: SocialPlatform;
    account_id: string;
    account_name: string | null;
    access_token: string;
    refresh_token: string | null;
    expires_at: string | null;
    scopes: string[] | null;
    metadata: Record<string, unknown> | null;
}

export async function upsertSocialAccount(input: SocialAccountInput): Promise<SocialAccountRecord> {
    const supabase = createAdminClient();
    const encryptedAccess = encryptToken(input.accessToken);
    const encryptedRefresh = input.refreshToken ? encryptToken(input.refreshToken) : null;

    const payload = {
        user_id: input.userId,
        platform: input.platform,
        account_id: input.accountId,
        account_name: input.accountName || null,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        expires_at: input.expiresAt || null,
        scopes: input.scopes || null,
        metadata: input.metadata || {},
        is_default: true,
    };

    // Vérifier si le compte existe déjà pour éviter l'erreur de contrainte ON CONFLICT de Postgres
    const { data: existing } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', input.userId)
        .eq('platform', input.platform)
        .maybeSingle();

    let result;
    if (existing?.id) {
        result = await supabase
            .from('social_accounts')
            .update(payload)
            .eq('id', existing.id)
            .select('*')
            .single();
    } else {
        result = await supabase
            .from('social_accounts')
            .insert(payload)
            .select('*')
            .single();
    }

    if (result.error || !result.data) {
        throw new Error(`Failed to save social account: ${result.error?.message || 'unknown error'}`);
    }

    return result.data as SocialAccountRecord;
}

export async function listSocialAccounts(userId: string): Promise<Array<{ id: string; platform: SocialPlatform; accountId: string; accountName: string | null; expiresAt: string | null; metadata: Record<string, unknown> | null }>> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('social_accounts')
        .select('id, platform, account_id, account_name, expires_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(`Failed to list social accounts: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        platform: row.platform,
        accountId: row.account_id,
        accountName: row.account_name,
        expiresAt: row.expires_at,
        metadata: row.metadata || null,
    }));
}

export async function getSocialAccountByPlatform(userId: string, platform: SocialPlatform): Promise<SocialAccountRecord & { accessToken: string; refreshToken?: string | null } | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to get social account: ${error.message}`);
    }

    if (!data) return null;

    return {
        ...(data as SocialAccountRecord),
        accessToken: decryptToken(data.access_token),
        refreshToken: data.refresh_token ? decryptToken(data.refresh_token) : null,
    };
}

export async function deleteSocialAccount(userId: string, accountId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', userId);

    if (error) {
        throw new Error(`Failed to delete social account: ${error.message}`);
    }
}

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

function isTokenExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true; // no expiry info = assume expired to be safe
    return new Date(expiresAt).getTime() - Date.now() < TOKEN_REFRESH_BUFFER_MS;
}

export async function ensureFreshToken(
    userId: string,
    platform: SocialPlatform,
): Promise<SocialAccountRecord & { accessToken: string; refreshToken?: string | null } | null> {
    const account = await getSocialAccountByPlatform(userId, platform);
    if (!account) return null;

    // If token is still fresh, return as-is
    if (!isTokenExpired(account.expires_at)) {
        return account;
    }

    // No refresh token available — can't refresh, return stale token (will likely fail)
    if (!account.refreshToken) {
        console.warn(`[ensureFreshToken] ${platform} token expired and no refresh_token available for user ${userId}`);
        return account;
    }

    try {
        let refreshed: { accessToken: string; refreshToken?: string; expiresIn?: number; scope?: string };

        if (platform === 'x') {
            const clientId = process.env.X_CLIENT_ID?.trim();
            const clientSecret = process.env.X_CLIENT_SECRET?.trim();
            const redirectUri = process.env.X_REDIRECT_URI?.trim() || `${process.env.NEXT_PUBLIC_APP_URL}/api/social/connect/x/callback`;
            if (!clientId) throw new Error('X_CLIENT_ID manquant pour le refresh');
            refreshed = await refreshXToken({
                refreshToken: account.refreshToken,
                clientId,
                clientSecret,
                redirectUri,
            });
        } else if (platform === 'tiktok') {
            const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
            const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
            if (!clientKey || !clientSecret) throw new Error('TikTok credentials manquants pour le refresh');
            refreshed = await refreshTikTokToken({
                refreshToken: account.refreshToken,
                clientKey,
                clientSecret,
            });
        } else if (platform === 'linkedin') {
            const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
            const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
            const redirectUri = process.env.LINKEDIN_REDIRECT_URI?.trim() || `${process.env.NEXT_PUBLIC_APP_URL}/api/social/connect/linkedin/callback`;
            if (!clientId || !clientSecret) throw new Error('LinkedIn credentials manquants pour le refresh');
            refreshed = await refreshLinkedInToken({
                refreshToken: account.refreshToken,
                clientId,
                clientSecret,
                redirectUri,
            });
        } else {
            return account;
        }

        // Update tokens in DB
        const expiresAt = refreshed.expiresIn
            ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
            : null;

        await upsertSocialAccount({
            userId,
            platform,
            accountId: account.account_id,
            accountName: account.account_name || undefined,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || null,
            expiresAt,
            scopes: refreshed.scope
                ? (platform === 'tiktok' ? refreshed.scope.split(',') : refreshed.scope.split(' '))
                : account.scopes || undefined,
            metadata: account.metadata || undefined,
        });

        return {
            ...account,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || null,
            expires_at: expiresAt,
        };
    } catch (err) {
        console.error(`[ensureFreshToken] Failed to refresh ${platform} token:`, err);
        // Return stale token — the API call will fail with a clear 401 error
        return account;
    }
}
