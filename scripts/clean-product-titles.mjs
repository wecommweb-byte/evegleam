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

function fixEncoding(str) {
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

// Matches whitespace, hyphens, and any mojibake/non-ASCII bytes that may precede the size word
const JUNK = '[\\s\\-\\u0080-\\uFFFF]';

// Strip trailing size suffix (with any junk/dash/mojibake chars before it) from product name
function cleanName(name) {
  let s = fixEncoding(name);
  const re = new RegExp(JUNK + '*\\b(Long|Short|Petite)\\b\\s*$', 'i');
  s = s.replace(re, '');
  return s.trim();
}

// Strip "<junk> Long/Short/Petite" before a "|" or end-of-tag in descriptions
function cleanDescription(desc) {
  let s = fixEncoding(desc);
  const re = new RegExp(JUNK + '*\\b(Long|Short|Petite)\\b(?=\\s*(\\||</p>|$))', 'gi');
  s = s.replace(re, '');
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s;
}

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

  const updates = [];
  for (const p of targets) {
    const newName = cleanName(p.name);
    const newDesc = cleanDescription(p.description || '');
    const newShortDesc = cleanDescription(p.short_description || '');

    if (newName !== p.name || newDesc !== (p.description || '') || newShortDesc !== (p.short_description || '')) {
      updates.push({ id: p.id, name: newName, description: newDesc, short_description: newShortDesc });
      console.log(`#${p.id}: "${p.name}" -> "${newName}"`);
      if (newDesc !== (p.description || '')) {
        console.log(`     desc: ${JSON.stringify(p.description)} -> ${JSON.stringify(newDesc)}`);
      }
    }
  }

  console.log(`\n${updates.length} of ${targets.length} products would be updated.`);

  if (DRY_RUN) {
    console.log('\nDry run only. Re-run with --apply to write these changes to WooCommerce.');
    return;
  }

  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const result = await batchUpdate(chunk);
    console.log(`Updated batch ${i / chunkSize + 1}: ${result.update?.length || 0} products`);
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
