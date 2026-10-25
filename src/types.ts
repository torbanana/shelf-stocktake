export interface Product {
  id: string;
  name: string;
  /** Optional. */
  brand: string;
  categoryId: string;
  /** How many you own right now. */
  quantity: number;
  /**
   * Buy more when you have fewer than this. 1 means "only when I run out".
   * Anything below this number is "running low" and goes on the shopping list.
   */
  minQuantity: number;
  /** Optional label such as "tubes" or "bottles". */
  unit: string;
  /** Optional link to where you buy it, shown on the shopping list. */
  purchaseUrl: string;
  isSample: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  sortOrder: number;
}
