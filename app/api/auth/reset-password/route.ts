import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
 * POST /api/auth/reset-password — Set a new password using a reset token
 * Body: { token, email, newPassword }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, email, newPassword } = body;

        if (!token || !email || !newPassword) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis.' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
                { status: 400 }
            );
        }

        const adminClient = getAdminClient();
        const normalizedEmail = email.trim().toLowerCase();

        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
        if (usersError) {
            console.error('Error listing users:', usersError);
            return NextResponse.json(
                { error: 'Une erreur est survenue. Réessayez.' },
                { status: 500 }
            );
        }

        const user = usersData.users.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (!user) {
            return NextResponse.json(
                { error: 'Compte introuvable. Vérifiez le lien reçu par email.' },
                { status: 400 }
            );
        }

        const storedToken = user.user_metadata?.reset_token;
        const tokenExpires = user.user_metadata?.reset_token_expires;

        if (storedToken !== token) {
            return NextResponse.json(
                { error: 'Lien invalide. Demandez un nouveau lien.' },
                { status: 400 }
            );
        }

        if (tokenExpires && Date.now() > tokenExpires) {
            return NextResponse.json(
                { error: 'Ce lien a expiré. Demandez un nouveau lien.' },
                { status: 400 }
            );
        }

        // Update password and clear the reset token
        const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
            password: newPassword,
            user_metadata: {
                ...user.user_metadata,
                reset_token: null,
                reset_token_expires: null,
            },
        });

        if (updateError) {
            console.error('Password reset update error:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la réinitialisation du mot de passe.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset password API error:', error);
        return NextResponse.json(
            { error: 'Une erreur interne est survenue.' },
            { status: 500 }
        );
    }
}