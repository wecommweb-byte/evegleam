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

export async function getProducts(params = {}) {
  try {
    const res = await fetch(wcUrl('products', params));
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.warn('WooCommerce fetch error:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(wcUrl('products', { slug }));
    const data = await res.json();
    return data[0] ?? null;
  } catch (error) {
    console.warn('WooCommerce fetch error:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const res = await fetch(wcUrl('products/categories', { per_page: 50, hide_empty: true }));
    return res.json();
  } catch (error) {
    console.warn('WooCommerce fetch error:', error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: number, params = {}) {
  return getProducts({ category: categoryId, ...params });
}

export async function getProductVariations(productId: number) {
  try {
    const res = await fetch(wcUrl(`products/${productId}/variations`));
    return res.json();
  } catch (error) {
    console.warn('WooCommerce fetch error:', error);
    return [];
  }
}

export async function createOrder(orderData: any) {
  const res = await fetch(wcUrl('orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return res.json();
}
