import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

/**
 * GET /auth/confirm — Verify email confirmation token
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            return NextResponse.redirect(
                new URL('/signup?error=invalid-link', request.url)
            );
        }

        const adminClient = getAdminClient();

        // Find user by email (listUsers doesn't support filter, we fetch and filter manually)
        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();

        if (usersError) {
            console.error('Error listing users:', usersError);
            return NextResponse.redirect(
                new URL('/signup?error=user-not-found', request.url)
            );
        }

        const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.error('User not found:', email);
            return NextResponse.redirect(
                new URL('/signup?error=user-not-found', request.url)
            );
        }
        const storedToken = user.user_metadata?.confirmation_token;
        const tokenExpires = user.user_metadata?.confirmation_token_expires;

        // Verify token
        if (storedToken !== token) {
            console.error('Invalid token for user:', email);
            return NextResponse.redirect(
                new URL('/signup?error=invalid-token', request.url)
            );
        }

        // Check expiration
        if (tokenExpires && Date.now() > tokenExpires) {
            console.error('Token expired for user:', email);
            return NextResponse.redirect(
                new URL('/signup?error=token-expired', request.url)
            );
        }

        // Confirm email in Supabase
        const { error: confirmError } = await adminClient.auth.admin.updateUserById(user.id, {
            email_confirm: true,
            user_metadata: {
                ...user.user_metadata,
                confirmation_token: null,
                confirmation_token_expires: null,
            },
        });

        if (confirmError) {
            console.error('Failed to confirm email:', confirmError);
            return NextResponse.redirect(
                new URL('/signup?error=confirmation-failed', request.url)
            );
        }

        // Redirect to login with success message
        return NextResponse.redirect(
            new URL('/login?message=email-confirmed', request.url)
        );
    } catch (error) {
        console.error('Confirmation error:', error);
        return NextResponse.redirect(
            new URL('/signup?error=unexpected-error', request.url)
        );
    }
}
