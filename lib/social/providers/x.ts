const X_AUTH_URL = 'https://x.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.x.com/2/oauth2/token';
const X_ME_URL = 'https://api.x.com/2/users/me';
const X_POST_URL = 'https://api.x.com/2/tweets';

export function getXScopes(): string {
    return process.env.X_SCOPES || 'tweet.read tweet.write users.read offline.access';
}

export function buildXAuthUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
    codeChallengeMethod,
}: {
    clientId: string;
    redirectUri: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: 's256' | 'plain';
}): string {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: getXScopes(),
        state,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
    });

    return `${X_AUTH_URL}?${params.toString()}`;
}

export async function exchangeXCode({
    code,
    clientId,
    clientSecret,
    redirectUri,
    codeVerifier,
}: {
    code: string;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    codeVerifier: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; scope?: string; tokenType?: string }> {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (clientSecret) {
        const encodedId = encodeURIComponent(clientId);
        const encodedSecret = encodeURIComponent(clientSecret);
        const auth = Buffer.from(`${encodedId}:${encodedSecret}`).toString('base64');
        headers.Authorization = `Basic ${auth}`;
    }

    const res = await fetch(X_TOKEN_URL, {
        method: 'POST',
        headers,
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`X token exchange failed: ${text}`);
    }

    const data = await res.json();
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
        tokenType: data.token_type,
    };
}

export async function fetchXProfile(accessToken: string): Promise<{ id: string; name: string; username?: string }>{
    const res = await fetch(`${X_ME_URL}?user.fields=profile_image_url,username,name`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`X profile fetch failed: ${text}`);
    }

    const data = await res.json();
    const user = data.data || {};
    return {
        id: user.id,
        name: user.name || user.username || user.id,
        username: user.username,
    };
}

export async function publishXPost({
    accessToken,
    text,
}: {
    accessToken: string;
    text: string;
}): Promise<{ id: string }>{
    const res = await fetch(X_POST_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`X publish failed: ${errorText}`);
    }

    const data = await res.json();
    return { id: data?.data?.id || '' };
}
