const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_ME_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_UGC_URL = 'https://api.linkedin.com/v2/ugcPosts';

export function getLinkedInScopes(): string {
    return process.env.LINKEDIN_SCOPES?.trim() || 'openid profile email w_member_social';
}

export function buildLinkedInAuthUrl({
    clientId,
    redirectUri,
    state,
}: {
    clientId: string;
    redirectUri: string;
    state: string;
}): string {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: getLinkedInScopes(),
    });

    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

export async function exchangeLinkedInCode({
    code,
    clientId,
    clientSecret,
    redirectUri,
}: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; refreshExpiresIn?: number; scope?: string }> {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
    });

    const res = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LinkedIn token exchange failed: ${text}`);
    }

    const data = await res.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        refreshExpiresIn: data.refresh_token_expires_in,
        scope: data.scope,
    };
}

export async function refreshLinkedInToken({
    refreshToken,
    clientId,
    clientSecret,
    redirectUri,
}: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; scope?: string }> {
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
    });

    const res = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LinkedIn token refresh failed: ${text}`);
    }

    const data = await res.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
    };
}

export async function fetchLinkedInProfile(accessToken: string): Promise<{ id: string; name: string; urn: string }>{
    const res = await fetch(LINKEDIN_ME_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LinkedIn profile fetch failed: ${text}`);
    }

    const data = await res.json();
    const id = data.sub as string;
    const name = data.name || id;

    return {
        id,
        name,
        urn: `urn:li:person:${id}`,
    };
}

export async function publishLinkedInPost({
    accessToken,
    authorUrn,
    text,
}: {
    accessToken: string;
    authorUrn: string;
    text: string;
}): Promise<{ id: string }>{
    const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text,
                },
                shareMediaCategory: 'NONE',
                media: [],
            },
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
    };

    const res = await fetch(LINKEDIN_UGC_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LinkedIn publish failed: ${text}`);
    }

    const id = res.headers.get('x-restli-id') || '';
    return { id };
}
