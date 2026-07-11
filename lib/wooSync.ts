import { getSupabase } from './supabase';

// ---- WooCommerce auth (reused across the app, not duplicated) ----
const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

// ---- Canonical mojibake / slug cleaners (single source of truth) ----

/**
 * Fixes UTF-8 mojibake in WooCommerce strings (e.g. "Sage – Long" where the en-dash
 * bytes E2 80 93 were stored as individual Latin-1 chars). Re-interprets the string as
 * latin1 bytes and decodes as UTF-8, but only if the result looks cleaner.
 */
export function fixEncoding(str: string): string {
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

/**
 * Cleans a WooCommerce slug by removing percent-encoded garbage and non-ASCII chars.
 * e.g. "lavender-meadows-a%c2%80%c2%93-long" → "lavender-meadows-a-long"
 */
export function cleanSlug(slug: string): string {
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

// ---- Row shape stored in Supabase ----
export interface ProductRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number | null;
  regular_price: number | null;
  sale_price: number | null;
  stock_status: string;
  stock_quantity: number | null;
  featured: boolean;
  total_sales: number;
  date_created: string | null;
  category_ids: number[];
  images: any[];
  categories: any[];
  tags: any[];
  updated_at: string;
}

function toNum(v: any): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Maps a raw WooCommerce product object into a clean Supabase row. */
export function mapWooToRow(p: any): ProductRow {
  return {
    id: p.id,
    name: fixEncoding(p.name || ''),
    slug: cleanSlug(p.slug || ''),
    description: fixEncoding(p.description || ''),
    short_description: fixEncoding(p.short_description || ''),
    price: toNum(p.price),
    regular_price: toNum(p.regular_price),
    sale_price: toNum(p.sale_price),
    stock_status: p.stock_status || 'instock',
    stock_quantity: p.stock_quantity ?? null,
    featured: !!p.featured,
    total_sales: Number(p.total_sales) || 0,
    date_created: p.date_created || null,
    category_ids: Array.isArray(p.categories) ? p.categories.map((c: any) => c.id) : [],
    images: Array.isArray(p.images) ? p.images.map((i: any) => ({ id: i.id, src: i.src, alt: i.alt })) : [],
    categories: Array.isArray(p.categories) ? p.categories.map((c: any) => ({ id: c.id, name: fixEncoding(c.name), slug: c.slug })) : [],
    tags: Array.isArray(p.tags) ? p.tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })) : [],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Reshapes a stored Supabase row back into the WooCommerce-style product object the
 * frontend expects (price fields as strings, image/category/tag arrays).
 */
export function rowToWooShape(row: any): any {
  const str = (v: any) => (v === null || v === undefined ? '' : String(v));
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || '',
    description: row.description || '',
    short_description: row.short_description || '',
    price: str(row.price),
    regular_price: str(row.regular_price),
    sale_price: str(row.sale_price),
    stock_status: row.stock_status || 'instock',
    stock_quantity: row.stock_quantity ?? null,
    featured: !!row.featured,
    total_sales: row.total_sales ?? 0,
    date_created: row.date_created || null,
    images: Array.isArray(row.images) ? row.images : [],
    categories: Array.isArray(row.categories) ? row.categories : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

// ---- WooCommerce fetch helpers ----
// Hostinger's LiteSpeed cache caches authenticated REST GETs when the credentials are in
// the query string (consumer_key/secret) — serving STALE data to the sync for ~23 min.
// Sending credentials via the Authorization header instead makes LiteSpeed treat the
// request as logged-in and bypass its cache entirely (verified: x-litespeed-cache: miss).
const AUTH_HEADER = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');
const FETCH_HEADERS = { Authorization: AUTH_HEADER, 'Cache-Control': 'no-cache' };

function wcUrl(path: string): URL {
  return new URL(`${BASE}/wp-json/wc/v3/${path}`);
}

async function fetchWooProduct(id: number | string): Promise<any | null> {
  const res = await fetch(wcUrl(`products/${id}`).toString(), { cache: 'no-store', headers: FETCH_HEADERS });
  if (!res.ok) return null;
  return res.json();
}

async function fetchAllWooProducts(): Promise<any[]> {
  const all: any[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = wcUrl('products');
    url.searchParams.set('status', 'publish');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const res = await fetch(url.toString(), { cache: 'no-store', headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`Woo fetch page ${page} failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

// ---- Sync operations ----

/** Fetch a single product from Woo and upsert into Supabase. Used by the webhook. */
export async function syncProduct(id: number | string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured' };
  const product = await fetchWooProduct(id);
  if (!product || !product.id) return { ok: false, error: 'Product not found in Woo' };
  // Only mirror published products; if unpublished, remove from mirror.
  if (product.status && product.status !== 'publish') {
    await sb.from('products').delete().eq('id', product.id);
    return { ok: true };
  }
  const { error } = await sb.from('products').upsert(mapWooToRow(product), { onConflict: 'id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Remove a product from the Supabase mirror. Used by the webhook delete topic. */
export async function deleteProduct(id: number | string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured' };
  const { error } = await sb.from('products').delete().eq('id', Number(id));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Full catalog sync: upsert all published products and prune rows no longer published. */
export async function syncAllProducts(): Promise<{ ok: boolean; count?: number; pruned?: number; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured' };

  const products = await fetchAllWooProducts();
  const rows = products.map(mapWooToRow);

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) return { ok: false, error: error.message };
  }

  // Prune: delete any Supabase rows whose IDs are no longer in the published set.
  const liveIds = new Set(rows.map(r => r.id));
  const { data: existing, error: readErr } = await sb.from('products').select('id');
  let pruned = 0;
  if (!readErr && Array.isArray(existing)) {
    const stale = existing.map((r: any) => r.id).filter((id: number) => !liveIds.has(id));
    if (stale.length) {
      const { error: delErr } = await sb.from('products').delete().in('id', stale);
      if (!delErr) pruned = stale.length;
    }
  }

  return { ok: true, count: rows.length, pruned };
}
