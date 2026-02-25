import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Chat Conversations CRUD API
 * GET    /api/chat/conversations         — Liste conversations
 * POST   /api/chat/conversations         — Crée nouvelle conversation
 * PATCH  /api/chat/conversations?id=xxx  — Met à jour une conversation
 * DELETE /api/chat/conversations?id=xxx  — Supprime une conversation
 */

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations || [] });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const title = body.title || 'Nouvelle conversation';
    const messages = body.messages || [];

    const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
            user_id: user.id,
            title,
            messages,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Erreur création conversation' }, { status: 500 });
    }

    return NextResponse.json({ conversation }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'ID conversation manquant' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.messages) updateData.messages = body.messages;

    const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ conversation });
}

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'ID conversation manquant' }, { status: 400 });
    }

    const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
