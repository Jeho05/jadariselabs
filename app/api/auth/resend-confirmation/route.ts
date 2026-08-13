import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

function generateConfirmationToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * POST /api/auth/resend-confirmation — Resend the email confirmation link
 * Body: { email }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'L\'email est requis.' },
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

        // Always return success to avoid account enumeration
        if (!user || user.email_confirmed_at) {
            return NextResponse.json({ success: true });
        }

        const confirmationToken = generateConfirmationToken();
        await adminClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                confirmation_token: confirmationToken,
                confirmation_token_expires: Date.now() + 24 * 60 * 60 * 1000,
            },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
            'https://jadariselabs.vercel.app');
        const confirmationUrl = `${appUrl}/auth/confirm?token=${confirmationToken}&email=${encodeURIComponent(normalizedEmail)}`;

        try {
            const msg = {
                to: normalizedEmail,
                from: 'jadariselabs@gmail.com',
                subject: 'Confirmez votre compte JadaRiseLabs',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #7B4F2E; text-align: center;">Bienvenue sur JadaRiseLabs ! 🎉</h1>
                        <p style="font-size: 16px; color: #333;">Vous avez demandé un nouveau lien de confirmation. Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #7B4F2E, #5B3820); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Confirmer mon compte
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666;">Ce lien expire dans 24 heures.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">© 2026 JadaRiseLabs - La Révolution IA Africaine</p>
                    </div>
                `,
            };
            await sgMail.send(msg);
            console.log('Confirmation email resent to:', normalizedEmail);
        } catch (emailError) {
            console.error('Failed to resend confirmation email:', emailError);
            return NextResponse.json(
                { error: 'L\'email n\'a pas pu être envoyé. Réessayez dans quelques minutes.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resend confirmation API error:', error);
        return NextResponse.json(
            { error: 'Une erreur interne est survenue.' },
            { status: 500 }
        );
    }
}