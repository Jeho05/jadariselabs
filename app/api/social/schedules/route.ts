import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('social_schedules')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Erreur lors du chargement des schedules' }, { status: 500 });
    }

    return NextResponse.json({ schedules: data || [] });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const {
        enabled = true,
        platforms = ['tiktok', 'instagram', 'facebook', 'linkedin', 'whatsapp'],
        posts_per_week = 3,
        credits_budget_weekly = 10,
        timezone = 'Africa/Porto-Novo',
        config = {},
    } = body;

    if (!Array.isArray(platforms) || platforms.length === 0) {
        return NextResponse.json({ error: 'Plateformes invalides' }, { status: 400 });
    }

    if (typeof posts_per_week !== 'number' || posts_per_week < 1 || posts_per_week > 21) {
        return NextResponse.json({ error: 'posts_per_week invalide' }, { status: 400 });
    }

    if (typeof credits_budget_weekly !== 'number' || credits_budget_weekly < 1 || credits_budget_weekly > 1000) {
        return NextResponse.json({ error: 'credits_budget_weekly invalide' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('social_schedules')
        .insert({
            user_id: user.id,
            enabled,
            platforms,
            posts_per_week,
            credits_budget_weekly,
            timezone,
            config,
        })
        .select('*')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Erreur lors de la création du schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule: data });
}
