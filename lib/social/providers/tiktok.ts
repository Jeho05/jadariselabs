const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_REVOKE_URL = 'https://open.tiktokapis.com/v2/oauth/revoke/';
const TIKTOK_CREATOR_INFO_URL = 'https://open.tiktokapis.com/v2/post/publish/creator_info/query/';
const TIKTOK_PUBLISH_URL = 'https://open.tiktokapis.com/v2/post/publish/content/init/';

export function getTikTokScopes(): string {
    return process.env.TIKTOK_SCOPES || 'user.info.basic,video.publish';
}

export function buildTikTokAuthUrl({
    clientKey,
    redirectUri,
    state,
}: {
    clientKey: string;
    redirectUri: string;
    state: string;
}): string {
    const params = new URLSearchParams({
        client_key: clientKey,
        response_type: 'code',
        scope: getTikTokScopes(),
        redirect_uri: redirectUri,
        state,
    });

    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

export async function exchangeTikTokCode({
    code,
    clientKey,
    clientSecret,
    redirectUri,
}: {
    code: string;
    clientKey: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; refreshExpiresIn?: number; scope?: string; openId?: string }>{
    const body = new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
    });

    const res = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TikTok token exchange failed: ${text}`);
    }

    const data = await res.json();

    if (data.error) {
        throw new Error(`TikTok token exchange error: ${data.error_description || data.error}`);
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        refreshExpiresIn: data.refresh_expires_in,
        scope: data.scope,
        openId: data.open_id,
    };
}

export async function revokeTikTokToken({
    clientKey,
    clientSecret,
    accessToken,
}: {
    clientKey: string;
    clientSecret: string;
    accessToken: string;
}): Promise<void> {
    const body = new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        token: accessToken,
    });

    await fetch(TIKTOK_REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}

export async function fetchTikTokCreatorInfo(accessToken: string): Promise<{ privacyOptions: string[] }>{
    const res = await fetch(TIKTOK_CREATOR_INFO_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TikTok creator info failed: ${text}`);
    }

    const data = await res.json();
    const privacyOptions = data?.data?.privacy_level_options || [];
    return { privacyOptions };
}

export async function publishTikTokPhoto({
    accessToken,
    imageUrls,
    description,
    privacyLevel,
}: {
    accessToken: string;
    imageUrls: string[];
    description: string;
    privacyLevel: string;
}): Promise<{ publishId: string }>{
    const payload = {
        media_type: 'PHOTO',
        post_mode: 'DIRECT_POST',
        post_info: {
            description,
            privacy_level: privacyLevel,
        },
        source_info: {
            source: 'PULL_FROM_URL',
            photo_images: imageUrls,
            photo_cover_index: 0,
        },
    };

    const res = await fetch(TIKTOK_PUBLISH_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TikTok publish failed: ${text}`);
    }

    const data = await res.json();
    if (data?.error?.code && data.error.code !== 'ok') {
        throw new Error(`TikTok publish error: ${data.error.message || data.error.code}`);
    }

    return { publishId: data?.data?.publish_id || '' };
}
