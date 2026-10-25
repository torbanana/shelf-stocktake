import { db, newId } from '../db';
import type { Product } from '../types';

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isSample'>;

export function emptyProduct(categoryId = 'other'): ProductInput {
  return { name: '', brand: '', categoryId, quantity: 1, unit: '' };
}

export async function createProduct(input: ProductInput, isSample = false): Promise<Product> {
  const now = Date.now();
  const p: Product = { ...input, id: newId(), isSample, createdAt: now, updatedAt: now };
  await db.products.add(p);
  return p;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<void> {
  await db.products.update(id, { ...patch, updatedAt: Date.now() });
}

/** Add or subtract from the quantity; never goes below 0. */
export async function changeQuantity(id: string, delta: number): Promise<void> {
  const p = await db.products.get(id);
  if (!p) return;
  await updateProduct(id, { quantity: Math.max(0, p.quantity + delta) });
}

export async function deleteProduct(id: string): Promise<void> {
  await db.products.delete(id);
}

/** Distinct, non-empty values for suggestion lists. */
export function distinct(values: (string | null | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v ?? '').trim();
    if (t) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export const UNIT_SUGGESTIONS = ['bottles', 'tubes', 'pieces', 'jars', 'packs', 'sticks', 'boxes', 'bars', 'rolls', 'cans'];
