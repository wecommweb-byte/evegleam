import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

function wcUrl(endpoint: string) {
  const url = new URL(`${BASE}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  return url.toString();
}

async function wcFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// POST /api/orders — create a new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const res = await wcFetch(wcUrl('orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Failed to create order' }, { status: res.status });
    }

    // If bundle note is included, post it as an order note
    if (orderData._bundleNote && data.id) {
      await wcFetch(wcUrl(`orders/${data.id}/notes`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: orderData._bundleNote, customer_note: false }),
      }).catch(() => {}); // Non-critical — don't fail the order if note fails
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { error: error.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}
