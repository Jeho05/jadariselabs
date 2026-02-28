/**
 * Replicate Webhook Handler
 * Receives callbacks when video generation completes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Handle Replicate webhook callbacks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook secret (optional but recommended)
    const webhookSecret = process.env.REPLICATE_WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-replicate-webhook-secret');
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
    }

    const { id: predictionId, status, output, error } = body;

    if (!predictionId) {
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
    }

    // Find generation by prediction ID
    const supabase = await createClient();
    
    const { data: generations, error: findError } = await supabase
      .from('generations')
      .select('*')
      .eq('type', 'video');

    if (findError) {
      console.error('[Webhook] Error finding generations:', findError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Find the generation with matching prediction ID
    const generation = generations?.find((g: Record<string, unknown>) => {
      const metadata = g.metadata as Record<string, unknown> | null;
      return metadata?.predictionId === predictionId;
    });

    if (!generation) {
      console.log('[Webhook] No generation found for prediction:', predictionId);
      return NextResponse.json({ success: true, message: 'No matching generation' });
    }

    // Update generation based on status
    if (status === 'succeeded' && output) {
      const videoUrl = typeof output === 'string' ? output : output[0];
      
      const { error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'completed',
          result_url: videoUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('[Webhook] Error updating generation:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('[Webhook] Generation completed:', generation.id);
      
    } else if (status === 'failed') {
      const { error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'failed',
          error: error || 'Generation failed',
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('[Webhook] Error updating failed generation:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('[Webhook] Generation failed:', generation.id);
      
    } else if (status === 'cancelled') {
      const { error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'cancelled',
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('[Webhook] Error updating cancelled generation:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('[Webhook] Generation cancelled:', generation.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
