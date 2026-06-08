const BASE = process.env.NEXT_PUBLIC_WC_URL;
const KEY = process.env.NEXT_PUBLIC_WC_KEY;
const SECRET = process.env.NEXT_PUBLIC_WC_SECRET;

function wcUrl(endpoint: string, params: Record<string, any> = {}) {
  const baseUrl = BASE?.replace(/\/$/, '') || '';
  const url = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set('consumer_key', KEY!);
  url.searchParams.set('consumer_secret', SECRET!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return url.toString();
}

async function wcFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function getProducts(params: Record<string, any> = {}) {
  try {
    const res = await wcFetch(wcUrl('products', params));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.warn('WooCommerce getProducts error:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await wcFetch(wcUrl('products', { slug }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data[0] ?? null;
  } catch (error) {
    console.warn('WooCommerce getProductBySlug error:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const res = await wcFetch(wcUrl('products/categories', { per_page: 50, hide_empty: true }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.warn('WooCommerce getCategories error:', error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: number, params: Record<string, any> = {}) {
  return getProducts({ category: categoryId, ...params });
}

export async function getProductVariations(productId: number) {
  try {
    const res = await wcFetch(wcUrl(`products/${productId}/variations`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.warn('WooCommerce getProductVariations error:', error);
    return [];
  }
}

export async function createOrder(orderData: any) {
  const res = await wcFetch(wcUrl('orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addOrderNote(orderId: number, note: string) {
  const res = await wcFetch(wcUrl(`orders/${orderId}/notes`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, customer_note: false }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
