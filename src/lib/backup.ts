import { db } from '../db';
import type { Category, Product } from '../types';

export interface BackupFile {
  app: 'shelf';
  version: 1;
  exportedAt: string;
  categories: Category[];
  products: Product[];
}

export async function exportBackup(): Promise<BackupFile> {
  const [categories, products] = await Promise.all([db.categories.toArray(), db.products.toArray()]);
  return { app: 'shelf', version: 1, exportedAt: new Date().toISOString(), categories, products };
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isBackupFile(x: unknown): x is BackupFile {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return o.app === 'shelf' && Array.isArray(o.products) && Array.isArray(o.categories);
}

/** Restore a backup. Rows with the same id are overwritten; everything else is kept. */
export async function importBackup(text: string): Promise<number> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isBackupFile(parsed)) throw new Error('That file does not look like a Shelf backup.');
  const products: Product[] = parsed.products.map((p) => ({
    id: String(p.id),
    name: String(p.name ?? ''),
    brand: String(p.brand ?? ''),
    categoryId: String(p.categoryId ?? 'other'),
    quantity: Math.max(0, Number(p.quantity) || 0),
    unit: String(p.unit ?? ''),
    isSample: Boolean(p.isSample),
    createdAt: Number(p.createdAt) || Date.now(),
    updatedAt: Number(p.updatedAt) || Date.now(),
  }));
  await db.transaction('rw', db.products, db.categories, async () => {
    await db.categories.bulkPut(parsed.categories);
    await db.products.bulkPut(products);
  });
  return products.length;
}

export async function clearAllData() {
  await db.transaction('rw', db.products, db.categories, async () => {
    await db.products.clear();
    const custom = (await db.categories.toArray()).filter((c) => !c.isDefault).map((c) => c.id);
    await db.categories.bulkDelete(custom);
  });
}
