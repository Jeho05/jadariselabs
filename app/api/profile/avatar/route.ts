import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * POST /api/profile/avatar — Upload user avatar
 * Body: FormData with 'file' field
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Fichier trop volumineux (max 2MB)' },
                { status: 400 }
            );
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                upsert: true,
                contentType: file.type,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Erreur lors de l\'upload' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        const avatarUrl = urlData.publicUrl;

        // Update profile with new avatar URL
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Profile update error:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du profil' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            profile: updatedProfile,
            avatar_url: avatarUrl,
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/profile/avatar — Remove user avatar
 */
export async function DELETE() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // List all files in user's folder
        const { data: files, error: listError } = await supabase.storage
            .from('avatars')
            .list(user.id);

        if (listError) {
            console.error('List error:', listError);
        }

        // Delete all files in user's folder
        if (files && files.length > 0) {
            const filesToDelete = files.map((file) => `${user.id}/${file.name}`);
            await supabase.storage.from('avatars').remove(filesToDelete);
        }

        // Update profile to remove avatar URL
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Profile update error:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du profil' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            profile: updatedProfile,
        });
    } catch (error) {
        console.error('Avatar delete error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
