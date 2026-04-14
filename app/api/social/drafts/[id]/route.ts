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

    if (body.status !== undefined) updateData.status = body.status;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.planned_for !== undefined) updateData.planned_for = body.planned_for;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('social_drafts')
        .update(updateData)
        .eq('id', params.id)
        .select('*')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du draft' }, { status: 500 });
    }

    return NextResponse.json({ draft: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { error } = await supabase
        .from('social_drafts')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: 'Erreur lors de la suppression du draft' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
