import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { rowToWooShape, fixEncoding, cleanSlug } from '@/lib/wooSync';

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

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

const AUTH_HEADER = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');

async function wooFallback(id: string): Promise<any | null> {
  const url = new URL(`${BASE}/wp-json/wc/v3/products/${id}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store', headers: { Authorization: AUTH_HEADER } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return fixProduct(await res.json());
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*').eq('id', Number(params.id)).maybeSingle();
      if (error) throw error;
      if (data) return NextResponse.json(rowToWooShape(data));
      // Not in mirror — fall through to Woo (product may be new/unsynced).
    } catch (error) {
      console.warn(`Supabase /products/${params.id} read failed, falling back to Woo:`, error);
    }
  }

  try {
    const product = await wooFallback(params.id);
    return NextResponse.json(product);
  } catch (error) {
    console.warn(`API /products/${params.id} error:`, error);
    return NextResponse.json(null, { status: 500 });
  }
}
