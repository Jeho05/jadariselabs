import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listSocialAccounts } from '@/lib/social/accounts';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    try {
        const accounts = await listSocialAccounts(user.id);
        return NextResponse.json({ accounts });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
    }
}
