// One-time / re-runnable initial population of the Supabase `products` mirror from WooCommerce.
// Reads env from .env.local (needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY + the WC_ vars).
// Usage: node scripts/seed-supabase.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const BASE = env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = env.NEXT_PUBLIC_WC_KEY;
const SECRET = env.NEXT_PUBLIC_WC_SECRET;
const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function fixEncoding(str) {
  if (!str || typeof str !== 'string') return str;
  // Only repair when mojibake markers are present; re-decoding clean UTF-8 corrupts it.
  if (!/[Â-Ãâ]/.test(str)) return str;
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8');
    if ((fixed.match(/�/g) || []).length < 3) return fixed;
    return str;
  } catch { return str; }
}

function cleanSlug(slug) {
  if (!slug) return slug;
  let s = slug.replace(/%[0-9a-fA-F]{2}/gi, '');
  try { s = decodeURIComponent(s); } catch {}
  return s.replace(/[^\x20-\x7E]/g, '').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function toNum(v) { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }

function mapWooToRow(p) {
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
    category_ids: Array.isArray(p.categories) ? p.categories.map(c => c.id) : [],
    images: Array.isArray(p.images) ? p.images.map(i => ({ id: i.id, src: i.src, alt: i.alt })) : [],
    categories: Array.isArray(p.categories) ? p.categories.map(c => ({ id: c.id, name: fixEncoding(c.name), slug: c.slug })) : [],
    tags: Array.isArray(p.tags) ? p.tags.map(t => ({ id: t.id, name: t.name, slug: t.slug })) : [],
    updated_at: new Date().toISOString(),
  };
}

async function fetchAll() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const url = new URL(`${BASE}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', KEY);
    url.searchParams.set('consumer_secret', SECRET);
    url.searchParams.set('status', 'publish');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Woo page ${page} failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

async function main() {
  console.log('Fetching products from WooCommerce...');
  const products = await fetchAll();
  const rows = products.map(mapWooToRow);
  console.log(`Upserting ${rows.length} products into Supabase...`);

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    console.log(`  upserted ${Math.min(i + 100, rows.length)}/${rows.length}`);
  }

  const { count } = await sb.from('products').select('*', { count: 'exact', head: true });
  console.log(`Done. Supabase now has ${count} products.`);
  console.log('Sample:', rows.slice(0, 3).map(r => `#${r.id} ${r.name}`).join(' | '));
}

main().catch(err => { console.error(err); process.exit(1); });
