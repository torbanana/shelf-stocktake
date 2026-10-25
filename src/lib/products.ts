import { db, newId } from '../db';
import type { Product } from '../types';

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isSample'>;

export function emptyProduct(categoryId = 'other'): ProductInput {
  return { name: '', brand: '', categoryId, quantity: 1, minQuantity: 1, unit: '' };
}

/** Products saved before the "buy more when fewer than" field existed default to 1. */
export function minOf(p: Product): number {
  return Number.isInteger(p.minQuantity) && p.minQuantity > 0 ? p.minQuantity : 1;
}

export type LowLevel = 'none' | 'low' | null;

/** 'none' = run out, 'low' = below the minimum you want to keep, null = fine. */
export function lowLevel(p: Product): LowLevel {
  if (p.quantity <= 0) return 'none';
  if (p.quantity < minOf(p)) return 'low';
  return null;
}

export function needsBuying(p: Product): boolean {
  return lowLevel(p) !== null;
}

/** Run-out items first, then running low, then everything else alphabetically. */
export function sortLowFirst(a: Product, b: Product): number {
  const rank = (p: Product) => (lowLevel(p) === 'none' ? 0 : lowLevel(p) === 'low' ? 1 : 2);
  return rank(a) - rank(b) || a.name.localeCompare(b.name);
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

export async function setQuantity(id: string, quantity: number): Promise<void> {
  await updateProduct(id, { quantity: Math.max(0, quantity) });
}

/** How many to buy to get back to the minimum (at least 1). */
export function suggestedBuy(p: Product): number {
  return Math.max(1, minOf(p) - p.quantity);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.products.delete(id);
}

/** Put a deleted product back exactly as it was (for Undo). */
export async function restoreProduct(p: Product): Promise<void> {
  await db.products.put(p);
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
