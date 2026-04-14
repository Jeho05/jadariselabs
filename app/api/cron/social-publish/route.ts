import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { publishDraftById } from '@/lib/social/publish';

function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function runCron() {
    const supabase = createAdminClient();
    const now = new Date();

    const { data: drafts, error } = await supabase
        .from('social_drafts')
        .select('id')
        .eq('status', 'approved')
        .or(`planned_for.is.null,planned_for.lte.${now.toISOString()}`)
        .order('created_at', { ascending: true })
        .limit(25);

    if (error) {
        return NextResponse.json({ error: 'Failed to load drafts' }, { status: 500 });
    }

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const draft of drafts || []) {
        const result = await publishDraftById(draft.id as string);
        results.push({ id: draft.id as string, ok: result.ok, error: result.ok ? undefined : result.error });
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
}

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'Missing CRON_SECRET' }, { status: 500 });
    }

    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
        return unauthorized();
    }

    return runCron();
}

export async function POST(request: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization') || '';

    if (!secret) {
        return NextResponse.json({ error: 'Missing CRON_SECRET' }, { status: 500 });
    }

    if (auth !== `Bearer ${secret}`) {
        return unauthorized();
    }

    return runCron();
}
