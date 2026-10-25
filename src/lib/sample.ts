import { db } from '../db';
import { createProduct, type ProductInput } from './products';

type S = Omit<ProductInput, 'purchaseUrl'> & { purchaseUrl?: string };
const s = (p: S): ProductInput => ({ purchaseUrl: '', ...p });

export function sampleProducts(): ProductInput[] {
  return [
    s({ name: 'Hydrating Face Cream', brand: 'CeraVe', categoryId: 'skincare', quantity: 1, minQuantity: 1, unit: 'tubs' }),
    s({ name: 'Vitamin C Serum', brand: 'The Ordinary', categoryId: 'skincare', quantity: 2, minQuantity: 1, unit: 'bottles' }),
    s({ name: 'SPF 50 Sunscreen', brand: 'La Roche-Posay', categoryId: 'skincare', quantity: 0, minQuantity: 1, unit: 'tubes', purchaseUrl: 'https://www.amazon.com/s?k=la+roche-posay+spf+50' }),
    s({ name: 'Volumising Mascara', brand: 'Maybelline', categoryId: 'makeup', quantity: 1, minQuantity: 1, unit: '' }),
    s({ name: 'Tinted Lip Balm', brand: 'Burt’s Bees', categoryId: 'makeup', quantity: 3, minQuantity: 1, unit: 'sticks' }),
    s({ name: 'Foundation – Shade 220', brand: 'Fenty Beauty', categoryId: 'makeup', quantity: 1, minQuantity: 1, unit: 'bottles' }),
    s({ name: 'Moisture Shampoo', brand: 'Shea Moisture', categoryId: 'haircare', quantity: 1, minQuantity: 2, unit: 'bottles' }),
    s({ name: 'Deep Conditioner', brand: 'Shea Moisture', categoryId: 'haircare', quantity: 1, minQuantity: 1, unit: 'tubs' }),
    s({ name: 'Body Wash – Coconut', brand: 'Dove', categoryId: 'bath-body', quantity: 2, minQuantity: 1, unit: 'bottles' }),
    s({ name: 'Roll-on Deodorant', brand: 'Dove', categoryId: 'bath-body', quantity: 0, minQuantity: 2, unit: '', purchaseUrl: 'https://www.amazon.com/s?k=dove+roll-on+deodorant' }),
    s({ name: 'Whitening Toothpaste', brand: 'Colgate', categoryId: 'oral-care', quantity: 1, minQuantity: 2, unit: 'tubes', purchaseUrl: 'https://www.amazon.com/s?k=colgate+whitening+toothpaste' }),
    s({ name: 'Soft Toothbrush', brand: 'Oral-B', categoryId: 'oral-care', quantity: 3, minQuantity: 2, unit: '' }),
    s({ name: 'Mouthwash', brand: 'Listerine', categoryId: 'oral-care', quantity: 2, minQuantity: 1, unit: 'bottles' }),
    s({ name: 'Eau de Parfum – Daisy', brand: 'Marc Jacobs', categoryId: 'fragrance', quantity: 1, minQuantity: 1, unit: 'bottles' }),
    s({ name: 'Paracetamol 500 mg', brand: 'Panadol', categoryId: 'medicine', quantity: 2, minQuantity: 1, unit: 'packs' }),
    s({ name: 'Cotton Pads', brand: '', categoryId: 'household', quantity: 1, minQuantity: 2, unit: 'packs' }),
    s({ name: 'Hand Soap Refill', brand: 'Method', categoryId: 'household', quantity: 2, minQuantity: 1, unit: 'bottles' }),
  ];
}

export async function loadSampleProducts(): Promise<number> {
  const list = sampleProducts();
  for (const p of list) await createProduct(p, true);
  return list.length;
}

export async function removeSampleProducts(): Promise<number> {
  const ids = (await db.products.filter((p) => p.isSample).toArray()).map((p) => p.id);
  await db.products.bulkDelete(ids);
  return ids.length;
}
