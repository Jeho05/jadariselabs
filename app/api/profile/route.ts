import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/profile — Récupère le profil du user authentifié
 */
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ profile, email: user.email });
}

/**
 * PATCH /api/profile — Met à jour le profil utilisateur
 * Body: { username?, preferred_lang?, avatar_url? }
 */
export async function PATCH(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { username, preferred_lang, avatar_url } = body;

    // Validation username
    if (username !== undefined) {
        if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: 'Le pseudo doit contenir entre 3 et 20 caractères' },
                { status: 400 }
            );
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json(
                { error: 'Le pseudo ne peut contenir que des lettres, chiffres et underscores' },
                { status: 400 }
            );
        }

        // Vérifier unicité du username (sauf pour le user actuel)
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .neq('id', user.id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Ce pseudo est déjà utilisé' },
                { status: 409 }
            );
        }
    }

    // Validation langue
    if (preferred_lang !== undefined && !['fr', 'en'].includes(preferred_lang)) {
        return NextResponse.json(
            { error: 'Langue non supportée. Utilisez "fr" ou "en"' },
            { status: 400 }
        );
    }

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {};
    if (username !== undefined) updateData.username = username;
    if (preferred_lang !== undefined) updateData.preferred_lang = preferred_lang;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Erreur mise à jour profil:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du profil' },
            { status: 500 }
        );
    }

    return NextResponse.json({ profile: updatedProfile });
}
