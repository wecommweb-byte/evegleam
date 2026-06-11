// Tags WooCommerce products with 'bundle-1' / 'bundle-2' based on the Excel sheet
// "Bundle" column. Bundle 1 = Basic Bundle, Bundle 2 = Bridal/Gift Bundles.
// Usage: node scripts/tag-bundle-eligibility.mjs [--apply]
import { readFileSync } from 'fs';
import XLSX from 'xlsx';

const EXCEL_PATH = 'C:/Users/Junaid/Downloads/Nails Data For Website  (2).xlsx';

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

const auth = `consumer_key=${KEY}&consumer_secret=${SECRET}`;

function normalize(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function readExcelEligibility() {
  const wb = XLSX.readFile(EXCEL_PATH);
  const map = new Map(); // normalized name -> Set of bundle numbers
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
    for (const row of rows) {
      const name = row[2];
      if (!name || typeof name !== 'string' || !name.trim()) continue;
      const bundleCell = row.map(c => String(c)).find(c => /bundle\s*[\d,\s]+/i.test(c));
      if (!bundleCell) continue;
      const nums = bundleCell.match(/\d/g) || [];
      const key = normalize(name);
      if (!map.has(key)) map.set(key, new Set());
      nums.forEach(n => map.get(key).add(n));
    }
  }
  return map;
}

async function getOrCreateTag(name) {
  const res = await fetch(`${BASE}/wp-json/wc/v3/products/tags?per_page=100&${auth}`);
  const tags = await res.json();
  const existing = tags.find(t => t.slug === name || t.name === name);
  if (existing) return existing.id;
  const createRes = await fetch(`${BASE}/wp-json/wc/v3/products/tags?${auth}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const created = await createRes.json();
  if (!created.id) throw new Error(`Failed to create tag ${name}: ${JSON.stringify(created)}`);
  return created.id;
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE}/wp-json/wc/v3/products?per_page=100&page=${page}&${auth}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

async function main() {
  const eligibility = readExcelEligibility();
  console.log(`Excel: found bundle eligibility for ${eligibility.size} products.`);

  const products = (await fetchAllProducts()).filter(p => !BUNDLE_IDS.includes(p.id));

  const tag1Id = await getOrCreateTag('bundle-1');
  const tag2Id = await getOrCreateTag('bundle-2');
  console.log(`Tags: bundle-1 = ${tag1Id}, bundle-2 = ${tag2Id}\n`);

  const updates = [];
  const unmatched = [];
  for (const p of products) {
    const key = normalize(p.name);
    const bundles = eligibility.get(key);
    if (!bundles) { unmatched.push(p.name); continue; }

    const wantedTagIds = [];
    if (bundles.has('1')) wantedTagIds.push(tag1Id);
    if (bundles.has('2')) wantedTagIds.push(tag2Id);

    const currentTagIds = p.tags.map(t => t.id);
    const keepOther = currentTagIds.filter(id => id !== tag1Id && id !== tag2Id);
    const newTagIds = [...new Set([...keepOther, ...wantedTagIds])];

    const changed = newTagIds.length !== currentTagIds.length || !newTagIds.every(id => currentTagIds.includes(id));
    if (changed) {
      updates.push({ id: p.id, tags: newTagIds.map(id => ({ id })) });
      console.log(`#${p.id} ${p.name}: Bundle ${[...bundles].join(',')} -> tags [${newTagIds.join(', ')}]`);
    }
  }

  if (unmatched.length) console.log(`\nNo bundle info in Excel for: ${unmatched.join(', ')}`);
  console.log(`\n${updates.length} products to update.`);

  if (DRY_RUN) {
    console.log('Dry run. Re-run with --apply to write.');
    return;
  }

  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    const res = await fetch(`${BASE}/wp-json/wc/v3/products/batch?${auth}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ update: chunk }),
    });
    if (!res.ok) throw new Error(`Batch failed: ${res.status} ${await res.text()}`);
    const result = await res.json();
    console.log(`Updated batch: ${result.update?.length || 0} products`);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
