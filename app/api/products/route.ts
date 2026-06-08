import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '50';
  const category = searchParams.get('category') || '';

  const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
  const KEY = process.env.NEXT_PUBLIC_WC_KEY;
  const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

  const url = new URL(`${BASE}/wp-json/wc/v3/products`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  url.searchParams.set('page', page);
  url.searchParams.set('per_page', per_page);
  url.searchParams.set('status', 'publish');
  if (category) url.searchParams.set('category', category);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('API /products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
