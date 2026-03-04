import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

// Generate a random token for email confirmation
function generateConfirmationToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
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

        // 1. Create auth user (without email confirmation - we handle it ourselves)
        const adminClient = getAdminClient();
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: false, // We send our own confirmation email via SendGrid
            user_metadata: {
                username: username.trim(),
                preferred_lang: preferredLang || 'fr',
            },
        });

        if (authError) {
            console.error('Auth signup error:', authError.message, authError.status, authError.code);
            
            // Map common errors
            const errorMessage = authError.message.toLowerCase();
            if (errorMessage.includes('user already registered') || errorMessage.includes('already been registered')) {
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
                if (!profileError.message.includes('duplicate key')) {
                    console.warn('Profile creation failed, but auth user created:', profileError.message);
                }
            }

            // 3. Send confirmation email via SendGrid
            const confirmationToken = generateConfirmationToken();
            // Use production URL or Vercel URL
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                           (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                           'https://jadariselabs.vercel.app');
            const confirmationUrl = `${appUrl}/auth/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
            
            try {
                // Store token in user metadata for verification
                await adminClient.auth.admin.updateUserById(authData.user.id, {
                    user_metadata: {
                        ...authData.user.user_metadata,
                        confirmation_token: confirmationToken,
                        confirmation_token_expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                    },
                });

                // Send email via SendGrid
                const msg = {
                    to: email.trim().toLowerCase(),
                    from: 'jadariselabs@gmail.com', // Use your verified sender email
                    subject: 'Confirmez votre compte JadaRiseLabs',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #D97706; text-align: center;">Bienvenue sur JadaRiseLabs ! 🎉</h1>
                            <p style="font-size: 16px; color: #333;">Bonjour <strong>${username}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">Merci de créer votre compte. Pour l'activer, cliquez sur le bouton ci-dessous :</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #D97706, #B45309); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Confirmer mon compte
                                </a>
                            </div>
                            <p style="font-size: 14px; color: #666;">Ce lien expire dans 24 heures.</p>
                            <p style="font-size: 14px; color: #666;">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="font-size: 12px; color: #999; text-align: center;">© 2026 JadaRiseLabs - La Révolution IA Africaine</p>
                        </div>
                    `,
                };
                
                await sgMail.send(msg);
                console.log('Confirmation email sent to:', email);
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail the signup, but warn the user
                return NextResponse.json({
                    success: true,
                    warning: 'Compte créé mais l\'email de confirmation n\'a pas pu être envoyé. Contactez le support.',
                    user: { email: email.trim().toLowerCase() },
                });
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
