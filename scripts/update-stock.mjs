import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const BASE = env.NEXT_PUBLIC_WC_URL.replace(/\/$/, '');
const KEY = env.NEXT_PUBLIC_WC_KEY;
const SECRET = env.NEXT_PUBLIC_WC_SECRET;

const BUNDLE_IDS = [1000074, 1000075, 1000076];

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const url = new URL(`${BASE}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', KEY);
    url.searchParams.set('consumer_secret', SECRET);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Fetch page ${page} failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

async function batchUpdate(updates) {
  const url = new URL(`${BASE}/wp-json/wc/v3/products/batch`);
  url.searchParams.set('consumer_key', KEY);
  url.searchParams.set('consumer_secret', SECRET);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update: updates }),
  });
  if (!res.ok) throw new Error(`Batch update failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log('Fetching all products...');
  const products = await fetchAllProducts();
  const targets = products.filter(p => !BUNDLE_IDS.includes(p.id));
  console.log(`Found ${products.length} products, updating ${targets.length} (excluding bundles).`);

  const chunkSize = 50;
  for (let i = 0; i < targets.length; i += chunkSize) {
    const chunk = targets.slice(i, i + chunkSize);
    const updates = chunk.map(p => ({
      id: p.id,
      manage_stock: true,
      stock_quantity: 10,
      stock_status: 'instock',
    }));
    const result = await batchUpdate(updates);
    console.log(`Updated batch ${i / chunkSize + 1}: ${result.update?.length || 0} products`);
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
