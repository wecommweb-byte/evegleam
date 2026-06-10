import { NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;
const SITE_URL = 'https://evegleam.com';

const BUNDLE_IDS = [1000074, 1000075, 1000076];

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

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchAllProducts() {
  const all: any[] = [];
  for (const page of [1, 2, 3]) {
    const url = new URL(`${BASE}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', KEY!);
    url.searchParams.set('consumer_secret', SECRET!);
    url.searchParams.set('status', 'publish');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

export async function GET() {
  let products: any[] = [];
  try {
    products = await fetchAllProducts();
  } catch (error) {
    console.warn('API /meta-feed error:', error);
  }

  const items = products
    .filter((p: any) => !BUNDLE_IDS.includes(p.id))
    .filter((p: any) => p.price && Number(p.price) > 0)
    .map((p: any) => {
      const name = escapeXml(fixEncoding(p.name));
      const desc = escapeXml(
        fixEncoding(p.short_description || p.description || p.name)
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 5000)
      );
      const slug = cleanSlug(p.slug);
      const image = p.images?.[0]?.src || '';
      const link = `${SITE_URL}/shop/${p.id}-${slug}`;
      const availability = p.stock_status === 'instock' ? 'in stock' : 'out of stock';

      return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${name}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${p.price} PKR</g:price>
      <g:brand>Eve Gleam</g:brand>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Eve Gleam Catalog</title>
    <link>${SITE_URL}</link>
    <description>Eve Gleam product feed for Meta</description>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
