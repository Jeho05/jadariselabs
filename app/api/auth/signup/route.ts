import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for profile creation
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
 * POST /api/auth/signup — Create user account with profile
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, username, preferredLang } = body;

        // Validation
        if (!email || !password || !username) {
            return NextResponse.json(
                { error: 'Email, mot de passe et pseudo sont requis.' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format d\'email invalide.' },
                { status: 400 }
            );
        }

        // Validate username
        if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json(
                { error: 'Le pseudo doit contenir au moins 3 caractères (lettres, chiffres, underscore).' },
                { status: 400 }
            );
        }

        // Use anon key for signup (public operation)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    username: username.trim(),
                    preferred_lang: preferredLang || 'fr',
                },
            },
        });

        if (authError) {
            console.error('Auth signup error:', authError);
            
            // Map common errors
            const errorMessage = authError.message.toLowerCase();
            if (errorMessage.includes('user already registered')) {
                return NextResponse.json(
                    { error: 'Un compte existe déjà avec cet email.' },
                    { status: 400 }
                );
            }
            if (errorMessage.includes('password')) {
                return NextResponse.json(
                    { error: 'Le mot de passe ne respecte pas les critères de sécurité.' },
                    { status: 400 }
                );
            }
            
            return NextResponse.json(
                { error: authError.message || 'Erreur lors de la création du compte.' },
                { status: 400 }
            );
        }

        // 2. Create profile using admin client (bypass RLS)
        if (authData.user) {
            const adminClient = getAdminClient();
            const { error: profileError } = await adminClient
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    username: username.trim(),
                    preferred_lang: preferredLang || 'fr',
                    plan: 'free',
                    credits: 50,
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                
                // If profile creation fails, we should still return success
                // The trigger might have already created it, or user can retry
                if (!profileError.message.includes('duplicate key')) {
                    // Log but don't fail - user can still verify email
                    console.warn('Profile creation failed, but auth user created:', profileError.message);
                }
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user?.id,
                email: authData.user?.email,
            },
            message: 'Compte créé avec succès. Vérifiez votre email.',
        });
    } catch (error) {
        console.error('Signup API error:', error);
        return NextResponse.json(
            { error: 'Une erreur interne est survenue.' },
            { status: 500 }
        );
    }
}
