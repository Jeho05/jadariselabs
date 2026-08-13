import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const SUBJECT_PREFIXES: Record<string, string> = {
    general: '[Contact général]',
    support: '[Support]',
    billing: '[Facturation]',
    partnership: '[Partenariat]',
};

/**
 * POST /api/contact — Send a contact form message
 * Body: { name, email, subject: 'general' | 'support' | 'billing' | 'partnership', message }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject = 'general', message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format d\'email invalide.' },
                { status: 400 }
            );
        }

        if (!message || message.trim().length < 10) {
            return NextResponse.json(
                { error: 'Votre message doit contenir au moins 10 caractères.' },
                { status: 400 }
            );
        }

        const prefix = SUBJECT_PREFIXES[subject] || SUBJECT_PREFIXES.general;

        try {
            const msg = {
                to: 'jadariselabs@gmail.com',
                from: 'jadariselabs@gmail.com',
                replyTo: email,
                subject: `${prefix} ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #7B4F2E; margin-top: 0;">Nouveau message depuis le site</h2>
                        <table style="width: 100%; font-size: 15px; color: #333; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nom</td>
                                <td style="padding: 8px 0;">${name.replace(/</g, '&lt;')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Email</td>
                                <td style="padding: 8px 0;"><a href="mailto:${email.replace(/</g, '&lt;')}">${email.replace(/</g, '&lt;')}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Sujet</td>
                                <td style="padding: 8px 0;">${prefix.replace(/[\[\]]/g, '')}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 16px; padding: 16px; background: #f9f5f0; border-radius: 8px; font-size: 15px; color: #333; white-space: pre-wrap;">
                            ${message.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}
                        </div>
                        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">© 2026 JadaRiseLabs — formulaire de contact du site</p>
                    </div>
                `,
            };
            await sgMail.send(msg);
        } catch (emailError) {
            console.error('Failed to send contact email:', emailError);
            return NextResponse.json(
                { error: 'L\'email n\'a pas pu être envoyé. Écrivez-nous directement à contact@jadariselabs.com.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: 'Une erreur interne est survenue.' },
            { status: 500 }
        );
    }
}