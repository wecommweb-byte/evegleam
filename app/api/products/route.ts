import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

async function wcFetch(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Fixes UTF-8 mojibake in WooCommerce strings.
 * WooCommerce stores text like "Sage – Long" with wrong encoding where
 * the en-dash bytes (E2 80 93) are treated as individual Latin-1 chars.
 *
 * In Node.js we can fix this by re-interpreting the chars as latin1 bytes
 * and decoding as UTF-8.
 */
function fixEncoding(str: string): string {
  if (!str || typeof str !== 'string') return str;
  try {
    // Re-interpret the JS string as if each code point is a raw byte (latin1)
    // then decode as UTF-8 — this reverses the mojibake
    const fixed = Buffer.from(str, 'latin1').toString('utf8');
    // Only use the fixed version if it looks better (fewer replacement chars)
    const replacements = (fixed.match(/�/g) || []).length;
    if (replacements < 3) return fixed;
    return str;
  } catch {
    return str;
  }
}

/**
 * Cleans a WooCommerce slug by removing percent-encoded garbage and non-ASCII chars.
 * e.g. "lavender-meadows-a%c2%80%c2%93-long" → "lavender-meadows-a-long"
 */
function cleanSlug(slug: string): string {
  if (!slug) return slug;
  let s = slug;
  // Strip ALL percent-encoded sequences (they are garbled bytes, not real content)
  s = s.replace(/%[0-9a-fA-F]{2}/gi, '');
  // Also try URL-decoding any remaining encoded chars and strip non-ASCII
  try { s = decodeURIComponent(s); } catch { /* ignore */ }
  return s
    .replace(/[^\x20-\x7E]/g, '') // strip non-printable / non-ASCII
    .replace(/[^a-zA-Z0-9-]/g, '-') // non-slug chars → hyphen
    .replace(/-+/g, '-')             // collapse hyphens
    .replace(/^-|-$/g, '')           // trim edges
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '50';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const orderby = searchParams.get('orderby') || '';
  const order = searchParams.get('order') || '';
  const offset = searchParams.get('offset') || '';
  const featured = searchParams.get('featured') || '';

  const url = new URL(`${BASE}/wp-json/wc/v3/products`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  url.searchParams.set('status', 'publish');

  if (slug) {
    url.searchParams.set('slug', slug);
  } else {
    url.searchParams.set('page', page);
    url.searchParams.set('per_page', per_page);
    if (category) url.searchParams.set('category', category);
    if (search) url.searchParams.set('search', search);
    if (orderby) url.searchParams.set('orderby', orderby);
    if (order) url.searchParams.set('order', order);
    if (offset) url.searchParams.set('offset', offset);
    if (featured) url.searchParams.set('featured', featured);
  }

  try {
    const res = await wcFetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Fix encoding on all returned products
    const fixed = Array.isArray(data) ? data.map(fixProduct) : fixProduct(data);
    return NextResponse.json(fixed);
  } catch (error) {
    console.warn('API /products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
