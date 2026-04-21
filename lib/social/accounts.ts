import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken, encryptToken } from '@/lib/social/crypto';

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
