import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { rowToWooShape, fixEncoding, cleanSlug } from '@/lib/wooSync';

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

// ---- Live WooCommerce fallback (used only if Supabase is unavailable/errors) ----
function fixProduct(product: any): any {
  if (!product) return product;
  return {
    ...product,
    slug: cleanSlug(product.slug),
    name: fixEncoding(product.name),
    short_description: fixEncoding(product.short_description),
    description: fixEncoding(product.description),
  };
}

async function wooFallback(searchParams: URLSearchParams): Promise<any[]> {
  const slug = searchParams.get('slug') || '';
  const url = new URL(`${BASE}/wp-json/wc/v3/products`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  url.searchParams.set('status', 'publish');
  if (slug) {
    url.searchParams.set('slug', slug);
  } else {
    for (const k of ['page', 'per_page', 'category', 'search', 'orderby', 'order', 'offset', 'featured']) {
      const v = searchParams.get(k);
      if (v) url.searchParams.set(k, v);
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(fixProduct) : [fixProduct(data)];
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  const category = searchParams.get('category');
  const search = searchParams.get('search') || '';
  const orderby = searchParams.get('orderby') || 'date';
  const order = (searchParams.get('order') || 'desc').toLowerCase();
  const offsetParam = searchParams.get('offset');
  const featured = searchParams.get('featured');

  const sb = getSupabase();

  if (sb) {
    try {
      let query = sb.from('products').select('*');

      if (slug) {
        query = query.eq('slug', slug);
      } else {
        if (category) query = query.contains('category_ids', [parseInt(category, 10)]);
        if (search) query = query.ilike('name', `%${search}%`);
        if (featured) query = query.eq('featured', true);

        const ascending = order === 'asc';
        if (orderby === 'price') query = query.order('price', { ascending, nullsFirst: false });
        else if (orderby === 'popularity') query = query.order('total_sales', { ascending: false });
        else query = query.order('date_created', { ascending });

        const from = offsetParam ? parseInt(offsetParam, 10) : (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json((data || []).map(rowToWooShape));
    } catch (error) {
      console.warn('Supabase /products read failed, falling back to Woo:', error);
    }
  }

  try {
    return NextResponse.json(await wooFallback(searchParams));
  } catch (error) {
    console.warn('API /products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
