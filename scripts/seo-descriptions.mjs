// Generates keyword-rich SEO descriptions for all products and writes them to WooCommerce.
// Descriptions are built from the product's design category with rotated phrasing so each
// one is unique. Usage: node scripts/seo-descriptions.mjs [--apply]
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const BASE = env.NEXT_PUBLIC_WC_URL.replace(/\/$/, '');
const AUTH = 'Basic ' + Buffer.from(`${env.NEXT_PUBLIC_WC_KEY}:${env.NEXT_PUBLIC_WC_SECRET}`).toString('base64');
const BUNDLE_IDS = [1000074, 1000075, 1000076];
const DRY_RUN = !process.argv.includes('--apply');

// Design-category → style descriptors (checked in priority order; audience tags like
// "Campus Cuties" / "Vanilla Days" / "The Statement" are too broad to describe a design).
const STYLES = [
  { slug: 'bridal-couture', label: 'bridal', line: 'an elegant bridal design made for weddings, engagements and special occasions' },
  { slug: 'french-tips',    label: 'French tip', line: 'a timeless French tip design that works for both everyday wear and formal events' },
  { slug: 'ombre',          label: 'ombre', line: 'a soft ombre gradient that blends shades beautifully from base to tip' },
  { slug: 'cat-eye',        label: 'cat-eye', line: 'a magnetic cat-eye finish with a velvet shimmer that catches the light' },
  { slug: 'metallic',       label: 'metallic', line: 'a mirror-like metallic chrome finish for a bold, modern look' },
  { slug: 'floral-series',  label: 'floral', line: 'a delicate floral design, hand-finished for a soft feminine look' },
  { slug: 'red-series',     label: 'red', line: 'a classic red design — bold, confident and always in style' },
  { slug: 'black-series',   label: 'black', line: 'a sleek black design with an edgy, statement-making finish' },
  { slug: 'fancy',          label: 'embellished', line: 'an embellished party design with eye-catching detail and sparkle' },
  { slug: 'solids',         label: 'solid color', line: 'a clean solid-color design that pairs with any outfit, day or night' },
];

// Rotated openers / benefit lines / closers (picked by product id → unique combinations).
const OPENERS = [
  (n, s) => `${n} is ${s.line}.`,
  (n, s) => `Meet ${n} — ${s.line}.`,
  (n, s) => `Turn heads with ${n}, ${s.line}.`,
  (n, s) => `${n} brings you ${s.line}.`,
];
const BENEFITS = [
  'These premium press-on nails give you a salon-quality manicure at home in minutes — no glue mess, no salon prices, and no damage to your natural nails.',
  'Get a flawless salon-style manicure at home in under 10 minutes. These artificial nails are lightweight, comfortable and gentle on your natural nails.',
  'Skip the salon — these reusable press-on nails apply in minutes and deliver a professional manicure look that lasts up to two weeks.',
  'Designed for easy at-home application, these fake nails look hand-painted, feel lightweight and can be reused with proper care.',
];
const KIT_LINE = 'Each set includes nails in multiple sizes for a perfect fit, plus an application kit with glue, adhesive tabs, a nail file and a prep pad.';
const CLOSERS = [
  'Order online with cash on delivery anywhere in Pakistan — free shipping on orders above Rs. 3,000.',
  'Delivered across Pakistan with cash on delivery. Free shipping on orders over Rs. 3,000.',
  'Available with cash on delivery across Pakistan, with free delivery on orders above Rs. 3,000.',
];

const SHORT_TEMPLATES = [
  (n, l) => `${n} ${l}press-on nails in Pakistan — salon-quality, reusable & easy to apply at home. Cash on delivery available.`,
  (n, l) => `Buy ${n} ${l}press-on nails online in Pakistan. Reusable salon-quality artificial nails with easy at-home application.`,
  (n, l) => `${n} — premium ${l}press-on nails delivered across Pakistan. Reusable, damage-free & ready in minutes.`,
];

// Name hints beat category priority (e.g. "Ombre Red" should read as ombre, not bridal).
const NAME_HINTS = [
  { match: /french/i, slug: 'french-tips' },
  { match: /ombre/i, slug: 'ombre' },
  { match: /floral|blossom|daisy|rose|orchid|lavender|sage|meadow/i, slug: 'floral-series' },
  { match: /marble|matt|matte/i, slug: 'solids' },
];

function pickStyle(name, categories) {
  const slugs = (categories || []).map(c => c.slug);
  for (const h of NAME_HINTS) {
    if (h.match.test(name) && slugs.includes(h.slug)) {
      const s = STYLES.find(x => x.slug === h.slug);
      if (s) return s;
    }
  }
  for (const s of STYLES) if (slugs.includes(s.slug)) return s;
  return { label: 'press-on', line: 'a premium hand-finished design made to elevate any look' };
}

function buildDescription(p) {
  const style = pickStyle(p.name, p.categories);
  const opener = OPENERS[p.id % OPENERS.length](p.name, style);
  const benefit = BENEFITS[p.id % BENEFITS.length];
  const closer = CLOSERS[p.id % CLOSERS.length];
  const description = `<p>${opener} ${benefit}</p>\n<p>${KIT_LINE} ${closer}</p>`;
  // Avoid awkward doubling like "Moonlight French French tip nails"
  const labelWord = style.label.split(/[\s-]/)[0].toLowerCase();
  const label = p.name.toLowerCase().includes(labelWord) ? '' : `${style.label} `;
  const short = SHORT_TEMPLATES[p.id % SHORT_TEMPLATES.length](p.name, label);
  return { description, short };
}

async function fetchAll() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE}/wp-json/wc/v3/products?status=publish&per_page=100&page=${page}`, {
      headers: { Authorization: AUTH },
    });
    if (!res.ok) throw new Error(`Fetch page ${page}: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

async function main() {
  const products = (await fetchAll()).filter(p => !BUNDLE_IDS.includes(p.id));
  console.log(`Found ${products.length} products.\n`);

  const updates = [];
  for (const p of products) {
    const { description, short } = buildDescription(p);
    updates.push({ id: p.id, description, short_description: short });
  }

  // Preview a spread of products (different categories / template rotations)
  const previewIds = [108, 91, 88, 68, 47, 44, 55, 30];
  console.log('================ PREVIEW ================\n');
  for (const u of updates.filter(u => previewIds.includes(u.id))) {
    const p = products.find(x => x.id === u.id);
    console.log(`--- #${u.id} ${p.name} [${(p.categories || []).map(c => c.name).join(', ')}]`);
    console.log('SHORT: ' + u.short_description);
    console.log('DESC : ' + u.description.replace(/\n/g, ' '));
    console.log('');
  }
  console.log(`${updates.length} products ready.`);

  if (DRY_RUN) { console.log('Dry run. Re-run with --apply to write to WooCommerce.'); return; }

  for (let i = 0; i < updates.length; i += 50) {
    const res = await fetch(`${BASE}/wp-json/wc/v3/products/batch`, {
      method: 'POST',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ update: updates.slice(i, i + 50) }),
    });
    if (!res.ok) throw new Error(`Batch failed: ${res.status} ${await res.text()}`);
    const result = await res.json();
    console.log(`Updated batch: ${result.update?.length || 0} products`);
  }
  console.log('Done. Remember to run the full-sync so Supabase picks up the new descriptions.');
}

main().catch(err => { console.error(err); process.exit(1); });
