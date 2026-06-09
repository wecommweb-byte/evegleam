import { NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

export async function GET() {
  const url = new URL(`${BASE}/wp-json/wc/v3/products/categories`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  url.searchParams.set('per_page', '50');
  url.searchParams.set('hide_empty', 'true');

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('API /categories error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
