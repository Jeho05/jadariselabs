import { NextResponse } from 'next/server';

// TODO: Implémenter la génération d'images via Hugging Face (FLUX/SDXL)
// POST /api/generate/image

export async function POST() {
    return NextResponse.json({ message: 'Image Generation API - En construction' });
}
