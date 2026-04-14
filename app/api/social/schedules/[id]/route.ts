import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updateData: Record<string, any> = {};

    if (body.enabled !== undefined) updateData.enabled = !!body.enabled;
    if (body.platforms !== undefined) updateData.platforms = body.platforms;
    if (body.posts_per_week !== undefined) updateData.posts_per_week = body.posts_per_week;
    if (body.credits_budget_weekly !== undefined) updateData.credits_budget_weekly = body.credits_budget_weekly;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.config !== undefined) updateData.config = body.config;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('social_schedules')
        .update(updateData)
        .eq('id', params.id)
        .select('*')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { error } = await supabase
        .from('social_schedules')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: 'Erreur lors de la suppression du schedule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
