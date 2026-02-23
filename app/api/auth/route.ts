import { NextResponse } from 'next/server';

// TODO: Implémenter les endpoints auth (Supabase wrapper)
// GET /api/auth - Récupérer la session
// POST /api/auth - Login/Signup

export async function GET() {
    return NextResponse.json({ message: 'Auth API - En construction' });
}

export async function POST() {
    return NextResponse.json({ message: 'Auth API - En construction' });
}
