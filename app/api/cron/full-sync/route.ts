import { NextRequest, NextResponse } from 'next/server';
import { syncAllProducts } from '@/lib/wooSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Vercel Cron auto-sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
  const auth = request.headers.get('authorization');
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncAllProducts();
  const status = result.ok ? 200 : 500;
  return NextResponse.json(result, { status });
}
