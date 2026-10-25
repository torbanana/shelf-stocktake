import Dexie, { type EntityTable } from 'dexie';
import type { Category, Product } from './types';

export const DEFAULT_CATEGORIES: Omit<Category, 'sortOrder'>[] = [
  { id: 'makeup', name: 'Makeup', emoji: '💄', isDefault: true },
  { id: 'skincare', name: 'Skincare', emoji: '🧴', isDefault: true },
  { id: 'haircare', name: 'Haircare', emoji: '💇', isDefault: true },
  { id: 'bath-body', name: 'Bath and body', emoji: '🛁', isDefault: true },
  { id: 'oral-care', name: 'Oral care', emoji: '🪥', isDefault: true },
  { id: 'fragrance', name: 'Fragrance', emoji: '🌸', isDefault: true },
  { id: 'medicine', name: 'Medicine and wellness', emoji: '💊', isDefault: true },
  { id: 'household', name: 'Household items', emoji: '🧹', isDefault: true },
  { id: 'other', name: 'Other', emoji: '📦', isDefault: true },
];

class ShelfDB extends Dexie {
  products!: EntityTable<Product, 'id'>;
  categories!: EntityTable<Category, 'id'>;

  constructor() {
    super('shelf');
    this.version(1).stores({
      products: 'id, categoryId, name, updatedAt',
      categories: 'id, sortOrder',
    });
    this.on('populate', () => {
      this.categories.bulkAdd(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, sortOrder: i })));
    });
  }
}

export const db = new ShelfDB();

/** Make sure the default categories exist even if the database was emptied. */
export async function ensureDefaultCategories() {
  if ((await db.categories.count()) === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, sortOrder: i })));
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
