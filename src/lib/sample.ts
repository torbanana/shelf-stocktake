import { db } from '../db';
import { createProduct, type ProductInput } from './products';

export function sampleProducts(): ProductInput[] {
  return [
    { name: 'Hydrating Face Cream', brand: 'CeraVe', categoryId: 'skincare', quantity: 1, unit: 'tubs' },
    { name: 'Vitamin C Serum', brand: 'The Ordinary', categoryId: 'skincare', quantity: 2, unit: 'bottles' },
    { name: 'SPF 50 Sunscreen', brand: 'La Roche-Posay', categoryId: 'skincare', quantity: 0, unit: 'tubes' },
    { name: 'Volumising Mascara', brand: 'Maybelline', categoryId: 'makeup', quantity: 1, unit: '' },
    { name: 'Tinted Lip Balm', brand: 'Burt’s Bees', categoryId: 'makeup', quantity: 3, unit: 'sticks' },
    { name: 'Foundation – Shade 220', brand: 'Fenty Beauty', categoryId: 'makeup', quantity: 1, unit: 'bottles' },
    { name: 'Moisture Shampoo', brand: 'Shea Moisture', categoryId: 'haircare', quantity: 2, unit: 'bottles' },
    { name: 'Deep Conditioner', brand: 'Shea Moisture', categoryId: 'haircare', quantity: 1, unit: 'tubs' },
    { name: 'Body Wash – Coconut', brand: 'Dove', categoryId: 'bath-body', quantity: 2, unit: 'bottles' },
    { name: 'Roll-on Deodorant', brand: 'Dove', categoryId: 'bath-body', quantity: 0, unit: '' },
    { name: 'Whitening Toothpaste', brand: 'Colgate', categoryId: 'oral-care', quantity: 1, unit: 'tubes' },
    { name: 'Soft Toothbrush', brand: 'Oral-B', categoryId: 'oral-care', quantity: 3, unit: '' },
    { name: 'Mouthwash', brand: 'Listerine', categoryId: 'oral-care', quantity: 2, unit: 'bottles' },
    { name: 'Eau de Parfum – Daisy', brand: 'Marc Jacobs', categoryId: 'fragrance', quantity: 1, unit: 'bottles' },
    { name: 'Paracetamol 500 mg', brand: 'Panadol', categoryId: 'medicine', quantity: 2, unit: 'packs' },
    { name: 'Cotton Pads', brand: '', categoryId: 'household', quantity: 1, unit: 'packs' },
    { name: 'Hand Soap Refill', brand: 'Method', categoryId: 'household', quantity: 2, unit: 'bottles' },
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
