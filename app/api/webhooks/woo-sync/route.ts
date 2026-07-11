import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { syncProduct, deleteProduct } from '@/lib/wooSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.WOO_WEBHOOK_SECRET;

/** WooCommerce signs the raw body: base64( HMAC-SHA256(body, secret) ) in x-wc-webhook-signature. */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody, 'utf8').digest('base64');
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-wc-webhook-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const topic = request.headers.get('x-wc-webhook-topic') || '';

  let payload: any = {};
  try { payload = rawBody ? JSON.parse(rawBody) : {}; } catch { /* ping/empty body */ }

  const id = payload?.id;
  if (!id) return NextResponse.json({ ok: true, note: 'no product id (ping)' });

  // Respond fast; a single upsert/delete is quick, so we await but keep it minimal.
  try {
    if (topic === 'product.deleted') {
      await deleteProduct(id);
    } else if (topic === 'product.created' || topic === 'product.updated' || topic === 'product.restored') {
      await syncProduct(id);
    }
  } catch (e) {
    console.warn('Webhook sync error:', e);
    // Still return 200 so Woo doesn't disable the webhook; cron will reconcile.
  }

  return NextResponse.json({ ok: true });
}
