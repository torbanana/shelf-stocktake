import { db, newId } from '../db';
import type { Category, Product } from '../types';
import { normalizeUrl } from './products';

/**
 * CSV import/export so the shelf can be maintained in a spreadsheet.
 *
 * Columns (header row required, order does not matter, names are forgiving):
 *   Name | Brand | Category | Quantity | Buy more when fewer than | Unit | Where to buy
 * Only Name is required. Rows are matched to existing products by Name + Brand
 * (case-insensitive): matches are updated, everything else is added.
 */

export const CSV_HEADER = ['Name', 'Brand', 'Category', 'Quantity', 'Buy more when fewer than', 'Unit', 'Where to buy'] as const;

const ALIASES: Record<(typeof CSV_HEADER)[number], string[]> = {
  Name: ['name', 'product', 'product name', 'item'],
  Brand: ['brand', 'make'],
  Category: ['category', 'type', 'group'],
  Quantity: ['quantity', 'qty', 'have', 'how many', 'how many you have', 'count', 'stock'],
  'Buy more when fewer than': ['buy more when fewer than', 'min', 'minimum', 'min quantity', 'minimum quantity', 'reorder at', 'threshold'],
  Unit: ['unit', 'units'],
  'Where to buy': ['where to buy', 'where to buy it', 'link', 'url', 'shop', 'shop link', 'purchase url', 'buy link'],
};

function esc(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function productsToCSV(products: Product[], categories: Category[]): string {
  const cat = new Map(categories.map((c) => [c.id, c.name]));
  const rows = [...products]
    .sort((a, b) => (cat.get(a.categoryId) ?? '').localeCompare(cat.get(b.categoryId) ?? '') || a.name.localeCompare(b.name))
    .map((p) => [p.name, p.brand, cat.get(p.categoryId) ?? p.categoryId, p.quantity, p.minQuantity ?? 1, p.unit, p.purchaseUrl ?? '']);
  return [CSV_HEADER as unknown as unknown[], ...rows].map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
}

/** A header plus two example rows, for people starting from a blank spreadsheet. */
export function csvTemplate(): string {
  const rows = [
    ['Whitening Toothpaste', 'Colgate', 'Oral care', 1, 2, 'tubes', 'https://www.amazon.com/s?k=colgate+whitening+toothpaste'],
    ['Hydrating Face Cream', 'CeraVe', 'Skincare', 1, 1, 'tubs', ''],
  ];
  return [CSV_HEADER as unknown as unknown[], ...rows].map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
}

export function downloadCSV(text: string, filename: string) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Minimal RFC 4180 parser: quotes, escaped quotes, commas/semicolons, CRLF, BOM. */
export function parseCSV(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  // Excel in some locales saves with semicolons; use whichever appears more in the header line.
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export interface CsvImportResult {
  added: number;
  updated: number;
  skipped: number;
  problems: string[];
}

export async function importCSV(text: string): Promise<CsvImportResult> {
  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error('The file needs a header row and at least one product row.');

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (key: (typeof CSV_HEADER)[number]): number => header.findIndex((h) => ALIASES[key].includes(h));
  const iName = col('Name');
  if (iName < 0) throw new Error('No "Name" column found. The first row should be headings such as Name, Brand, Category, Quantity.');
  const iBrand = col('Brand');
  const iCat = col('Category');
  const iQty = col('Quantity');
  const iMin = col('Buy more when fewer than');
  const iUnit = col('Unit');
  const iUrl = col('Where to buy');
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

  const result: CsvImportResult = { added: 0, updated: 0, skipped: 0, problems: [] };

  await db.transaction('rw', db.products, db.categories, async () => {
    const categories = await db.categories.toArray();
    const products = await db.products.toArray();
    const catByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));
    const key = (name: string, brand: string) => `${name.trim().toLowerCase()}|${brand.trim().toLowerCase()}`;
    const byKey = new Map(products.map((p) => [key(p.name, p.brand), p]));
    const byNameOnly = new Map<string, Product[]>();
    for (const p of products) {
      const k = p.name.trim().toLowerCase();
      byNameOnly.set(k, [...(byNameOnly.get(k) ?? []), p]);
    }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const name = get(row, iName);
      if (!name) {
        result.skipped++;
        continue;
      }
      const brand = get(row, iBrand);
      const qtyRaw = get(row, iQty);
      const minRaw = get(row, iMin);
      const quantity = qtyRaw === '' ? null : Math.max(0, Math.floor(Number(qtyRaw)));
      const minQuantity = minRaw === '' ? null : Math.max(1, Math.floor(Number(minRaw)));
      if ((quantity !== null && Number.isNaN(quantity)) || (minQuantity !== null && Number.isNaN(minQuantity))) {
        result.skipped++;
        result.problems.push(`Row ${r + 1} (${name}): quantity must be a number.`);
        continue;
      }
      const urlRaw = get(row, iUrl);
      const url = urlRaw ? normalizeUrl(urlRaw) : '';
      if (url === null) result.problems.push(`Row ${r + 1} (${name}): link ignored, it is not a web address.`);

      let categoryId: string | null = null;
      const catName = get(row, iCat);
      if (catName) {
        const found = catByName.get(catName.toLowerCase());
        if (found) categoryId = found.id;
        else {
          const c: Category = { id: newId(), name: catName, emoji: '🏷️', isDefault: false, sortOrder: categories.length + catByName.size };
          await db.categories.add(c);
          catByName.set(catName.toLowerCase(), c);
          categoryId = c.id;
        }
      }

      const existing = byKey.get(key(name, brand)) ?? (brand === '' ? (byNameOnly.get(name.toLowerCase()) ?? [])[0] : undefined);
      const now = Date.now();
      if (existing) {
        await db.products.update(existing.id, {
          brand: brand || existing.brand,
          categoryId: categoryId ?? existing.categoryId,
          quantity: quantity ?? existing.quantity,
          minQuantity: minQuantity ?? existing.minQuantity ?? 1,
          unit: get(row, iUnit) || existing.unit,
          purchaseUrl: url || existing.purchaseUrl || '',
          updatedAt: now,
        });
        result.updated++;
      } else {
        const p: Product = {
          id: newId(),
          name,
          brand,
          categoryId: categoryId ?? 'other',
          quantity: quantity ?? 1,
          minQuantity: minQuantity ?? 1,
          unit: get(row, iUnit),
          purchaseUrl: url || '',
          isSample: false,
          createdAt: now,
          updatedAt: now,
        };
        await db.products.add(p);
        byKey.set(key(name, brand), p);
        result.added++;
      }
    }
  });
  return result;
}
