import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.evegleam.com';
const WC_URL = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;
const BUNDLE_IDS = [1000074, 1000075, 1000076];

function sanitizeSlug(slug: string): string {
  return slug
    .replace(/%[0-9a-fA-F]{2}/gi, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function fetchAllProducts() {
  const all: any[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = new URL(`${WC_URL}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', KEY!);
    url.searchParams.set('consumer_secret', SECRET!);
    url.searchParams.set('status', 'publish');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    try {
      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < 100) break;
    } catch {
      break;
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/shop`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/bundles`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/collections`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/sizing`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const products = await fetchAllProducts();

    // Regular products → /shop/{id}-{slug}
    const regularProducts = products.filter(p => !BUNDLE_IDS.includes(p.id) && p.slug);
    const productPages: MetadataRoute.Sitemap = regularProducts.map(p => ({
      url: `${BASE_URL}/shop/${p.id}-${sanitizeSlug(p.slug)}`,
      lastModified: new Date(p.date_modified || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    console.log(`Sitemap: ${staticPages.length} static + ${productPages.length} products = ${staticPages.length + productPages.length} total URLs`);

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
