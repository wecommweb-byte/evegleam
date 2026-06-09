import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

async function wcFetch(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '50';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const orderby = searchParams.get('orderby') || '';
  const order = searchParams.get('order') || '';

  const url = new URL(`${BASE}/wp-json/wc/v3/products`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  url.searchParams.set('status', 'publish');

  if (slug) {
    // Single product lookup by slug
    url.searchParams.set('slug', slug);
  } else {
    url.searchParams.set('page', page);
    url.searchParams.set('per_page', per_page);
    if (category) url.searchParams.set('category', category);
    if (search) url.searchParams.set('search', search);
    if (orderby) url.searchParams.set('orderby', orderby);
    if (order) url.searchParams.set('order', order);
  }

  try {
    const res = await wcFetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('API /products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
