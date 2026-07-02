// Sets regular_price = price * 2, sale_price = current price (50% off marketing tactic)
// Usage: node scripts/set-sale-prices.mjs [--apply]
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
const DRY_RUN = !process.argv.includes('--apply');

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const url = new URL(`${BASE}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', KEY);
    url.searchParams.set('consumer_secret', SECRET);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`Batch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const products = (await fetchAllProducts()).filter(p => !BUNDLE_IDS.includes(p.id));
  console.log(`Found ${products.length} products\n`);

  const updates = [];
  for (const p of products) {
    const currentPrice = parseFloat(p.price);
    if (!currentPrice) { console.log(`#${p.id} ${p.name}: skipped (no price)`); continue; }
    const newRegular = Math.round(currentPrice * 2);
    const newSale = Math.round(currentPrice);
    console.log(`#${p.id} "${p.name}": Rs.${currentPrice} → regular Rs.${newRegular}, sale Rs.${newSale}`);
    updates.push({ id: p.id, regular_price: String(newRegular), sale_price: String(newSale) });
  }

  console.log(`\n${updates.length} products to update.`);
  if (DRY_RUN) { console.log('Dry run. Re-run with --apply to write.'); return; }

  for (let i = 0; i < updates.length; i += 50) {
    const result = await batchUpdate(updates.slice(i, i + 50));
    console.log(`Updated batch: ${result.update?.length || 0} products`);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
