import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

function fixEncoding(str: string): string {
  if (!str || typeof str !== 'string') return str;
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8');
    const replacements = (fixed.match(/�/g) || []).length;
    if (replacements < 3) return fixed;
    return str;
  } catch {
    return str;
  }
}

function cleanSlug(slug: string): string {
  if (!slug) return slug;
  let s = slug.replace(/%[0-9a-fA-F]{2}/gi, '');
  try { s = decodeURIComponent(s); } catch { /* ignore */ }
  return s
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(`${BASE}/wp-json/wc/v3/products/${params.id}`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json(fixProduct(data));
  } catch (error) {
    console.warn(`API /products/${params.id} error:`, error);
    return NextResponse.json(null, { status: 500 });
  }
}
