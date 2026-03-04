/**
 * CinetPay Client — Mobile Money Payment Integration
 * Orange Money, Wave, MTN, Moov Money, Visa/Mastercard
 * Docs: https://cinetpay.com/developer
 */

import crypto from 'crypto';

// --------------- Configuration ---------------

const CINETPAY_CONFIG = {
    apiKey: process.env.CINETPAY_API_KEY || '',
    siteId: process.env.CINETPAY_SITE_ID || '',
    secretKey: process.env.CINETPAY_SECRET_KEY || '',
    baseUrl: 'https://api-checkout.cinetpay.com/v2',
    checkUrl: 'https://api-checkout.cinetpay.com/v2/payment/check',
};

// --------------- Types ---------------

export interface CinetPayPaymentRequest {
    transaction_id: string;
    amount: number; // En F CFA
    currency: string; // 'XOF'
    description: string;
    customer_name: string;
    customer_email: string;
    customer_phone_number?: string;
    return_url: string;
    notify_url: string; // Webhook URL
    channels: string; // 'ALL' or 'MOBILE_MONEY' or 'CREDIT_CARD'
    metadata: string; // JSON stringified
}

export interface CinetPayInitResponse {
    code: string;
    message: string;
    description: string;
    data: {
        payment_token: string;
        payment_url: string;
    };
    api_response_id: string;
}

export interface CinetPayCheckResponse {
    code: string;
    message: string;
    data: {
        amount: string;
        currency: string;
        status: 'ACCEPTED' | 'REFUSED' | 'CANCELLED';
        payment_method: string;
        description: string;
        metadata: string;
        operator_id: string;
        payment_date: string;
    };
    api_response_id: string;
}

export interface CinetPayWebhookData {
    cpm_trans_id: string;
    cpm_site_id: string;
    cpm_trans_date: string;
    cpm_amount: string;
    cpm_currency: string;
    cpm_payment_config: string;
    cpm_phone_prefixe: string;
    cpm_cel_phone: string;
    cpm_designation: string;
    cpm_custom: string;
    cpm_error_message: string;
    signature: string;
}

// --------------- Functions ---------------

/**
 * Initiate a payment via CinetPay
 * Returns a payment URL to redirect the user to
 */
export async function initiatePayment(
    payment: CinetPayPaymentRequest
): Promise<CinetPayInitResponse> {
    if (!CINETPAY_CONFIG.apiKey || !CINETPAY_CONFIG.siteId) {
        throw new Error(
            'CinetPay is not configured. Add CINETPAY_API_KEY and CINETPAY_SITE_ID to .env.local'
        );
    }

    const response = await fetch(`${CINETPAY_CONFIG.baseUrl}/payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            apikey: CINETPAY_CONFIG.apiKey,
            site_id: CINETPAY_CONFIG.siteId,
            transaction_id: payment.transaction_id,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            customer_name: payment.customer_name,
            customer_email: payment.customer_email,
            customer_phone_number: payment.customer_phone_number || '',
            return_url: payment.return_url,
            notify_url: payment.notify_url,
            channels: payment.channels,
            metadata: payment.metadata,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CinetPay API error: ${response.status} — ${errorText}`);
    }

    const result: CinetPayInitResponse = await response.json();

    if (result.code !== '201') {
        throw new Error(`CinetPay error: ${result.message} — ${result.description}`);
    }

    return result;
}

/**
 * Check payment status via CinetPay
 * Used after webhook or on return URL
 */
export async function checkPaymentStatus(
    transactionId: string
): Promise<CinetPayCheckResponse> {
    if (!CINETPAY_CONFIG.apiKey || !CINETPAY_CONFIG.siteId) {
        throw new Error('CinetPay is not configured');
    }

    const response = await fetch(CINETPAY_CONFIG.checkUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            apikey: CINETPAY_CONFIG.apiKey,
            site_id: CINETPAY_CONFIG.siteId,
            transaction_id: transactionId,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CinetPay check error: ${response.status} — ${errorText}`);
    }

    return response.json();
}

/**
 * Verify CinetPay webhook signature
 * Prevents forged webhook calls
 */
export function verifyWebhookSignature(
    data: string,
    signature: string
): boolean {
    if (!CINETPAY_CONFIG.secretKey) {
        console.warn('[CinetPay] Secret key not configured, skipping signature verification');
        return true; // In dev mode, accept all
    }

    const expected = crypto
        .createHmac('sha256', CINETPAY_CONFIG.secretKey)
        .update(data)
        .digest('hex');

    return expected === signature;
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `JRL_${timestamp}_${random}`.toUpperCase();
}

/**
 * Get plan amount in F CFA
 */
export function getPlanAmountCFA(plan: 'starter' | 'pro'): number {
    const amounts: Record<string, number> = {
        starter: 500,
        pro: 1500,
    };
    return amounts[plan] || 0;
}
