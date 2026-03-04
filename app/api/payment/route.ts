/**
 * Payment API Routes — CinetPay Integration
 * POST /api/payment — Webhook handler (called by CinetPay)
 * GET /api/payment — Initiate payment (called by frontend)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    checkPaymentStatus,
    initiatePayment,
    generateTransactionId,
    getPlanAmountCFA,
} from '@/lib/cinetpay';
import type { PlanType } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jadariselabs.vercel.app';

// --------------- POST — CinetPay Webhook ---------------

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const transactionId = body.cpm_trans_id;
        if (!transactionId) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
        }

        // Verify payment status with CinetPay
        let paymentCheck;
        try {
            paymentCheck = await checkPaymentStatus(transactionId);
        } catch (err) {
            console.error('[PaymentWebhook] CinetPay check error:', err);
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
        }

        const supabase = await createClient();

        // Find our payment record
        const { data: payment, error: findError } = await supabase
            .from('payments')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();

        if (findError || !payment) {
            console.error('[PaymentWebhook] Payment not found:', transactionId);
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Already processed
        if (payment.status === 'success') {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        if (paymentCheck.data.status === 'ACCEPTED') {
            // 1. Update payment status
            await supabase
                .from('payments')
                .update({ status: 'success' })
                .eq('id', payment.id);

            // 2. Activate subscription
            if (payment.subscription_id) {
                await supabase
                    .from('subscriptions')
                    .update({ status: 'active' })
                    .eq('id', payment.subscription_id);
            }

            // 3. Parse metadata
            let metadata: { plan?: string; user_id?: string } = {};
            try {
                metadata = JSON.parse(paymentCheck.data.metadata || '{}');
            } catch {
                /* ignore */
            }

            const targetPlan = (metadata.plan || 'starter') as PlanType;
            const creditsToSet = targetPlan === 'pro' ? -1 : 200;

            // 4. Update user profile
            await supabase
                .from('profiles')
                .update({
                    plan: targetPlan,
                    credits: creditsToSet,
                })
                .eq('id', payment.user_id);

            return NextResponse.json({ success: true, message: 'Payment processed' });

        } else if (paymentCheck.data.status === 'REFUSED' || paymentCheck.data.status === 'CANCELLED') {
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('id', payment.id);

            if (payment.subscription_id) {
                await supabase
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('id', payment.subscription_id);
            }

            return NextResponse.json({ success: true, message: 'Payment failed/cancelled' });
        }

        return NextResponse.json({ success: true, message: 'Pending' });

    } catch (error) {
        console.error('[PaymentWebhook] Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// --------------- GET — Initiate Payment ---------------

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const plan = searchParams.get('plan') as 'starter' | 'pro';

        if (!plan || !['starter', 'pro'].includes(plan)) {
            return NextResponse.json({ error: 'Plan invalide (starter ou pro)' }, { status: 400 });
        }

        // Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Get profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, plan')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
        }

        // Already on this plan
        if (profile.plan === plan) {
            return NextResponse.json({ error: 'Vous êtes déjà sur ce plan' }, { status: 400 });
        }

        const amount = getPlanAmountCFA(plan);
        const transactionId = generateTransactionId();

        // Create subscription record
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);

        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan,
                status: 'canceled', // Will be activated on webhook
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
                payment_id: transactionId,
            })
            .select()
            .single();

        if (subError) {
            console.error('[Payment] Subscription create error:', subError);
            return NextResponse.json({ error: 'Erreur lors de la création de l\'abonnement' }, { status: 500 });
        }

        // Create payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                subscription_id: subscription.id,
                amount: amount * 100, // Store in centimes
                provider: 'card', // Will be updated by CinetPay
                status: 'pending',
                transaction_id: transactionId,
            });

        if (paymentError) {
            console.error('[Payment] Payment create error:', paymentError);
            return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
        }

        // Initiate CinetPay payment
        try {
            const cinetPayResponse = await initiatePayment({
                transaction_id: transactionId,
                amount,
                currency: 'XOF',
                description: `JadaRiseLabs — Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
                customer_name: profile.username || user.email?.split('@')[0] || 'User',
                customer_email: user.email || '',
                return_url: `${APP_URL}/dashboard?payment=success&plan=${plan}`,
                notify_url: `${APP_URL}/api/payment`,
                channels: 'ALL',
                metadata: JSON.stringify({
                    user_id: user.id,
                    plan,
                    subscription_id: subscription.id,
                }),
            });

            return NextResponse.json({
                success: true,
                payment_url: cinetPayResponse.data.payment_url,
                transaction_id: transactionId,
            });

        } catch (cinetPayError) {
            console.error('[Payment] CinetPay error:', cinetPayError);

            // Cleanup on failure
            await supabase.from('payments').delete().eq('transaction_id', transactionId);
            await supabase.from('subscriptions').delete().eq('id', subscription.id);

            return NextResponse.json({
                error: 'Erreur CinetPay',
                details: cinetPayError instanceof Error ? cinetPayError.message : 'Service de paiement indisponible',
            }, { status: 500 });
        }

    } catch (error) {
        console.error('[Payment] Error:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
