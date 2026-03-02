/**
 * Gallery API — Delete generation
 * DELETE /api/gallery?id=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const generationId = searchParams.get('id');

        if (!generationId) {
            return NextResponse.json({ error: 'ID de génération requis' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Verify ownership and get generation
        const { data: generation, error: findError } = await supabase
            .from('generations')
            .select('id, result_url, user_id')
            .eq('id', generationId)
            .eq('user_id', user.id)
            .single();

        if (findError || !generation) {
            return NextResponse.json({ error: 'Génération non trouvée' }, { status: 404 });
        }

        // Delete from storage if file exists
        if (generation.result_url && generation.result_url.includes('supabase')) {
            try {
                const urlParts = generation.result_url.split('/generations/');
                if (urlParts[1]) {
                    await supabase.storage.from('generations').remove([urlParts[1]]);
                }
            } catch {
                // Non-blocking — continue with DB delete
            }
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('generations')
            .delete()
            .eq('id', generationId)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Génération supprimée' });

    } catch (error) {
        console.error('[GalleryAPI] Delete error:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
