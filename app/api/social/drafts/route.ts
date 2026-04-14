import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let query = supabase
        .from('social_drafts')
        .select('*')
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Erreur lors du chargement des drafts' }, { status: 500 });
    }

    return NextResponse.json({ drafts: data || [] });
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
        schedule_id = null,
        platform,
        content_type = 'promo',
        topic,
        context = null,
        tone = 'professionnel',
        sector = 'general',
        content,
        planned_for = null,
        metadata = {},
        credits_used = 1,
    } = body;

    if (!platform || !['tiktok', 'facebook', 'whatsapp', 'linkedin', 'instagram'].includes(platform)) {
        return NextResponse.json({ error: 'Plateforme invalide' }, { status: 400 });
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return NextResponse.json({ error: 'Topic invalide' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Contenu invalide' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('social_drafts')
        .insert({
            user_id: user.id,
            schedule_id,
            platform,
            content_type,
            topic: topic.trim(),
            context,
            tone,
            sector,
            content,
            planned_for,
            metadata,
            credits_used,
        })
        .select('*')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Erreur lors de la création du draft' }, { status: 500 });
    }

    return NextResponse.json({ draft: data });
}
