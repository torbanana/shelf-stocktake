import { db, newId } from '../db';
import type { Product } from '../types';
import { pushUndo, type UndoEntry } from './undo';

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isSample'>;

export function emptyProduct(categoryId = 'other'): ProductInput {
  return { name: '', brand: '', categoryId, quantity: 1, minQuantity: 1, unit: '', purchaseUrl: '' };
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

/** How many to buy to get back to the minimum (at least 1). */
export function suggestedBuy(p: Product): number {
  return Math.max(1, minOf(p) - p.quantity);
}

/** Accepts "shop.com/item" or "https://shop.com/item"; returns a usable https URL or '' if invalid. */
export function normalizeUrl(input: string): string | null {
  const t = input.trim();
  if (!t) return '';
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Short label for a link, e.g. "amazon.com". */
export function urlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/* ---------- Changes (each one is undoable) ---------- */

export async function createProduct(input: ProductInput, isSample = false): Promise<Product> {
  const now = Date.now();
  const p: Product = { ...input, id: newId(), isSample, createdAt: now, updatedAt: now };
  await db.products.add(p);
  if (!isSample) pushUndo({ label: `adding "${p.name}"`, revert: () => db.products.delete(p.id) });
  return p;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<void> {
  const before = await db.products.get(id);
  if (!before) return;
  await db.products.update(id, { ...patch, updatedAt: Date.now() });
  pushUndo({ label: `editing "${before.name}"`, revert: () => db.products.put(before) });
}

/** Add or subtract from the quantity; never goes below 0. */
export async function changeQuantity(id: string, delta: number): Promise<void> {
  const p = await db.products.get(id);
  if (!p) return;
  const quantity = Math.max(0, p.quantity + delta);
  if (quantity === p.quantity) return;
  await db.products.update(id, { quantity, updatedAt: Date.now() });
  pushUndo({ label: `${delta > 0 ? '+' : '−'}1 ${p.name}`, revert: () => db.products.update(id, { quantity: p.quantity, updatedAt: Date.now() }) });
}

export async function setQuantity(id: string, quantity: number, label?: string): Promise<UndoEntry | null> {
  const p = await db.products.get(id);
  if (!p) return null;
  const q = Math.max(0, quantity);
  await db.products.update(id, { quantity: q, updatedAt: Date.now() });
  return pushUndo({ label: label ?? `setting ${p.name} to ${q}`, revert: () => db.products.update(id, { quantity: p.quantity, updatedAt: Date.now() }) });
}

export async function deleteProduct(id: string): Promise<UndoEntry | null> {
  const p = await db.products.get(id);
  if (!p) return null;
  await db.products.delete(id);
  return pushUndo({ label: `deleting "${p.name}"`, revert: () => db.products.put(p) });
}

/** Put a deleted product back exactly as it was. */
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
