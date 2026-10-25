export interface Product {
  id: string;
  name: string;
  /** Optional. */
  brand: string;
  categoryId: string;
  /** How many you own right now. */
  quantity: number;
  /** Optional label such as "tubes" or "bottles". */
  unit: string;
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
