import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_gT1UMeFt_NFcu59ojTmtnY1byZ1kPVJ7n');

/**
 * POST /api/email — Send an email via Resend
 *
 * Body: { to?: string, subject?: string, html?: string }
 * Defaults: to=jadariselabs@gmail.com, subject="Hello World"
 */
export async function POST(request: NextRequest) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch {
            // Use defaults if no body provided
        }

        const { to, subject, html } = body as {
            to?: string;
            subject?: string;
            html?: string;
        };

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: to || 'jadariselabs@gmail.com',
            subject: subject || 'Hello World',
            html: html || '<p>Congrats on sending your <strong>first email</strong>!</p>',
        });

        if (error) {
            return NextResponse.json(
                { error: 'Email sending failed', details: error },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Email API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
