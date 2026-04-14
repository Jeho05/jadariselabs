import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteSocialAccount } from '@/lib/social/accounts';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    try {
        await deleteSocialAccount(user.id, params.id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
    }
}
