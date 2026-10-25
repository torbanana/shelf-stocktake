import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { Field } from './components/Field';
import { ConfirmDialog, Sheet } from './components/Modal';
import { useToast } from './components/Toast';
import { db, newId } from './db';
import { UNIT_SUGGESTIONS, createProduct, deleteProduct, distinct, emptyProduct, minOf, restoreProduct, updateProduct, type ProductInput } from './lib/products';
import type { Category, Product } from './types';

interface Props {
  open: boolean;
  /** null = adding a new product */
  product: Product | null;
  categories: Category[];
  defaultCategoryId: string;
  onClose: () => void;
}

export function ProductSheet({ open, product, categories, defaultCategoryId, onClose }: Props) {
  const toast = useToast();
  const all = useLiveQuery(() => db.products.toArray(), [], [] as Product[]);
  const [form, setForm] = useState<ProductInput>(() =>
    product
      ? { name: product.name, brand: product.brand, categoryId: product.categoryId, quantity: product.quantity, minQuantity: minOf(product), unit: product.unit }
      : emptyProduct(defaultCategoryId),
  );
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const units = useMemo(() => distinct([...UNIT_SUGGESTIONS, ...all.map((p) => p.unit)]), [all]);
  const duplicate = useMemo(() => {
    const n = form.name.trim().toLowerCase();
    if (!n) return null;
    return all.find((p) => p.id !== product?.id && p.name.trim().toLowerCase() === n) ?? null;
  }, [all, form.name, product]);

  function patch<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Give the product a name.');
    if (!Number.isInteger(form.quantity) || form.quantity < 0) return setError('Quantity must be a whole number of 0 or more.');
    if (!Number.isInteger(form.minQuantity) || form.minQuantity < 1) return setError('“Buy more when fewer than” must be 1 or more.');
    if (newCategory !== null && !newCategory.trim()) return setError('Enter a name for the new category.');
    setSaving(true);
    try {
      let categoryId = form.categoryId;
      if (newCategory !== null) {
        const catName = newCategory.trim();
        const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
        if (found) categoryId = found.id;
        else {
          categoryId = newId();
          await db.categories.add({ id: categoryId, name: catName, emoji: '🏷️', isDefault: false, sortOrder: categories.length });
        }
      }
      const data: ProductInput = { ...form, name, brand: form.brand.trim(), unit: form.unit.trim(), categoryId };
      if (product) {
        await updateProduct(product.id, data);
        toast.show('Saved.');
      } else {
        await createProduct(data);
        toast.show(`"${name}" added.`);
      }
      onClose();
    } catch (e) {
      console.error(e);
      setError('Sorry, saving failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product) return;
    const snapshot = product;
    setConfirmDelete(false);
    await deleteProduct(snapshot.id);
    onClose();
    toast.show(`"${snapshot.name}" deleted.`, {
      actionLabel: 'Undo',
      duration: 6000,
      onAction: () => void restoreProduct(snapshot),
    });
  }

  const numOrZero = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <>
      <Sheet open={open} onClose={onClose} title={product ? 'Edit product' : 'Add product'}>
        <form className="stack" onSubmit={save} noValidate>
          <Field label="Name" htmlFor="p-name">
            <input id="p-name" className={`input ${error && !form.name.trim() ? 'invalid' : ''}`} value={form.name} onChange={(e) => patch('name', e.target.value)} placeholder="e.g. Toothpaste" autoFocus={!product} />
          </Field>
          {duplicate && (
            <div className="notice small">
              <span>🐶</span>
              <span>You already have “{duplicate.name}”. You may just want to use + on that one instead.</span>
            </div>
          )}
          <Field label="Brand (optional)" htmlFor="p-brand">
            <input id="p-brand" className="input" value={form.brand} onChange={(e) => patch('brand', e.target.value)} placeholder="e.g. Colgate" />
          </Field>
          <Field label="Category" htmlFor="p-cat">
            {newCategory === null ? (
              <select
                id="p-cat"
                className="input"
                value={form.categoryId}
                onChange={(e) => (e.target.value === '__new' ? setNewCategory('') : patch('categoryId', e.target.value))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
                <option value="__new">+ New category…</option>
              </select>
            ) : (
              <div className="row">
                <input className="input grow" value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setError(null); }} placeholder="New category name" autoFocus />
                <button type="button" className="btn ghost sm" onClick={() => setNewCategory(null)}>
                  Cancel
                </button>
              </div>
            )}
          </Field>
          <div className="grid-2">
            <Field label="How many you have" htmlFor="p-qty">
              <input id="p-qty" className="input" type="number" inputMode="numeric" min={0} step={1} value={form.quantity} onChange={(e) => patch('quantity', numOrZero(e.target.value))} />
            </Field>
            <Field label="Unit (optional)" htmlFor="p-unit">
              <input id="p-unit" className="input" list="unit-options" value={form.unit} onChange={(e) => patch('unit', e.target.value)} placeholder="e.g. tubes" />
              <datalist id="unit-options">
                {units.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field label="Buy more when fewer than" htmlFor="p-min" hint="1 = only when it runs out. Use 2 to always keep a spare. Anything below this shows as running low and goes on the shopping list.">
            <input id="p-min" className="input" type="number" inputMode="numeric" min={1} step={1} value={form.minQuantity} onChange={(e) => patch('minQuantity', numOrZero(e.target.value))} style={{ maxWidth: 140 }} />
          </Field>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          <div className="btn-row">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : product ? 'Save' : 'Add'}
            </button>
          </div>
          {product && (
            <button type="button" className="btn danger-ghost block" onClick={() => setConfirmDelete(true)}>
              Delete this product
            </button>
          )}
        </form>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        message={`"${product?.name}" will be removed from your shelf. You can undo for a few seconds afterwards.`}
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
