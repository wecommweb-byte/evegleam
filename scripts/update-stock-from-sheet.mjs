// Updates WooCommerce stock quantities from the "Nails Data For Website" spreadsheet.
// The Quantity column sits at a different index on different sheets, so the column is
// located per-sheet from its header rather than assumed.
// Blank quantities are SKIPPED (treated as "not filled in"), never written as zero.
// Usage: node scripts/update-stock-from-sheet.mjs [--apply]
import { readFileSync } from 'fs';
import XLSX from 'xlsx';

const EXCEL_PATH = 'C:/Users/Junaid/Downloads/Nails Data For Website  (3).xlsx';

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

const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function readSheetStock() {
  const wb = XLSX.readFile(EXCEL_PATH);
  const rows = [];
  for (const sheetName of wb.SheetNames) {
    const grid = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
    const header = grid.find(r => r.some(c => String(c).toLowerCase().includes('model name')));
    if (!header) { console.warn(`No header found in sheet "${sheetName}" — skipped`); continue; }
    const nameIdx = header.findIndex(c => String(c).toLowerCase().includes('model name'));
    const qtyIdx = header.findIndex(c => String(c).toLowerCase().trim().startsWith('quantity'));
    if (qtyIdx < 0) { console.warn(`No Quantity column in sheet "${sheetName}" — skipped`); continue; }

    for (const r of grid) {
      const name = String(r[nameIdx] || '').trim();
      if (!name || name.toLowerCase() === 'model name') continue;
      const raw = r[qtyIdx];
      const blank = raw === '' || raw === null || raw === undefined;
      rows.push({ sheet: sheetName, name, qty: blank ? null : Number(raw), blank });
    }
  }
  return rows;
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE}/wp-json/wc/v3/products?status=publish&per_page=100&page=${page}`, {
      headers: { Authorization: AUTH },
    });
    if (!res.ok) throw new Error(`Fetch page ${page} failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all.filter(p => !BUNDLE_IDS.includes(p.id));
}

async function main() {
  const sheetRows = readSheetStock();
  const withQty = sheetRows.filter(r => !r.blank && Number.isFinite(r.qty));
  const blanks = sheetRows.filter(r => r.blank);

  const products = await fetchAllProducts();
  const byName = new Map(products.map(p => [normalize(p.name), p]));

  const updates = [];
  const unmatched = [];
  const unchanged = [];

  for (const row of withQty) {
    const p = byName.get(normalize(row.name));
    if (!p) { unmatched.push(row); continue; }
    const newStatus = row.qty > 0 ? 'instock' : 'outofstock';
    if (p.stock_quantity === row.qty && p.stock_status === newStatus && p.manage_stock) {
      unchanged.push(`${p.name} (${row.qty})`);
      continue;
    }
    updates.push({
      id: p.id,
      manage_stock: true,
      stock_quantity: row.qty,
      stock_status: newStatus,
      _label: `#${p.id} ${p.name}: ${p.stock_quantity} -> ${row.qty}${row.qty === 0 ? '  [OUT OF STOCK]' : ''}`,
    });
  }

  // Products in WooCommerce that the sheet says nothing about
  const sheetNames = new Set(withQty.map(r => normalize(r.name)));
  const notInSheet = products.filter(p => !sheetNames.has(normalize(p.name)));

  console.log(`Sheet rows: ${sheetRows.length}  (${withQty.length} with quantity, ${blanks.length} blank)`);
  console.log(`WooCommerce products: ${products.length}\n`);

  console.log('--- CHANGES ---');
  updates.forEach(u => console.log('  ' + u._label));
  if (!updates.length) console.log('  (none)');

  if (unchanged.length) console.log(`\n--- ALREADY CORRECT (${unchanged.length}) ---\n  ${unchanged.join(', ')}`);

  if (blanks.length) {
    console.log(`\n--- BLANK IN SHEET — SKIPPED, stock left untouched (${blanks.length}) ---`);
    blanks.forEach(b => console.log(`  ${b.name}  [${b.sheet}]`));
  }

  if (unmatched.length) {
    console.log(`\n--- IN SHEET BUT NOT IN WOOCOMMERCE (${unmatched.length}) ---`);
    unmatched.forEach(u => console.log(`  ${u.name}  [${u.sheet}]  qty=${u.qty}`));
  }

  if (notInSheet.length) {
    console.log(`\n--- IN WOOCOMMERCE BUT NOT IN SHEET — stock left untouched (${notInSheet.length}) ---`);
    notInSheet.forEach(p => console.log(`  #${p.id} ${p.name} (current stock: ${p.stock_quantity})`));
  }

  console.log(`\n${updates.length} products to update.`);
  if (DRY_RUN) { console.log('Dry run. Re-run with --apply to write to WooCommerce.'); return; }

  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50).map(({ _label, ...rest }) => rest);
    const res = await fetch(`${BASE}/wp-json/wc/v3/products/batch`, {
      method: 'POST',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ update: chunk }),
    });
    if (!res.ok) throw new Error(`Batch failed: ${res.status} ${await res.text()}`);
    const result = await res.json();
    console.log(`Updated batch: ${result.update?.length || 0} products`);
  }
  console.log('Done. Run the Supabase full-sync so the site reflects the new stock.');
}

main().catch(err => { console.error(err); process.exit(1); });
