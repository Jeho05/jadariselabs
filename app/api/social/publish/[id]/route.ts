import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishDraftById } from '@/lib/social/publish';

export async function POST(_: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { data: draft, error } = await supabase
        .from('social_drafts')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (error || !draft) {
        return NextResponse.json({ error: 'Draft introuvable' }, { status: 404 });
    }

    const result = await publishDraftById(params.id);

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, provider_post_id: result.providerPostId });
}
