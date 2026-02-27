/**
 * Prometheus Metrics API Endpoint
 * Exposes metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/lib/monitoring/metrics';

/**
 * GET /api/metrics
 * Prometheus metrics endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[Metrics] Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
