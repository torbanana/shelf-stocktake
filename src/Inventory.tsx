import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { MenuSheet } from './MenuSheet';
import { ProductSheet } from './ProductSheet';
import { QuantityStepper } from './components/QuantityStepper';
import { useToast } from './components/Toast';
import { db } from './db';
import { changeQuantity } from './lib/products';
import { loadSampleProducts } from './lib/sample';
import type { Category, Product } from './types';

/** 0 left = none, 1 left = last one. Both count as "low" and float to the top of every list. */
export function lowLevel(p: Product): 'none' | 'last' | null {
  if (p.quantity <= 0) return 'none';
  if (p.quantity === 1) return 'last';
  return null;
}

function sortLowFirst(a: Product, b: Product) {
  return a.quantity - b.quantity || a.name.localeCompare(b.name);
}

export function Inventory() {
  const toast = useToast();
  const products = useLiveQuery(() => db.products.toArray(), [], undefined);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [] as Category[]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | null | 'new'>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const visible = useMemo(() => {
    if (!products) return [];
    const needle = query.trim().toLowerCase();
    return products
      .filter((p) => !category || p.categoryId === category)
      .filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle))
      .sort(sortLowFirst);
  }, [products, query, category]);

  if (products === undefined) return <div className="page" />;

  const outCount = products.filter((p) => p.quantity <= 0).length;
  const usedCategories = categories.filter((c) => products.some((p) => p.categoryId === c.id));

  async function loadSamples() {
    const n = await loadSampleProducts();
    toast.show(`${n} sample products added. Remove them from the ⋯ menu when you like.`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="title">
          <h1>My shelf</h1>
          <div className="subtitle">
            {products.length === 0
              ? 'Nothing added yet'
              : `${products.length} product${products.length === 1 ? '' : 's'}${outCount ? ` · ${outCount} run out` : ''}`}
          </div>
        </div>
        <button className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}>
          ⋯
        </button>
      </header>

      {products.length === 0 ? (
        <EmptyState
          icon="🧴"
          title="Your shelf is empty"
          message="Add the products you own and use − and + as you use them up or buy more."
          actions={
            <>
              <button className="btn primary" onClick={() => setEditing('new')}>
                Add a product
              </button>
              <button className="btn secondary" onClick={loadSamples}>
                Load sample products
              </button>
            </>
          }
        />
      ) : (
        <>
          <div className="sticky-top stack" style={{ gap: 10 }}>
            <div className="search">
              <span className="ico" aria-hidden>
                🔍
              </span>
              <input className="input" type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
            </div>
            <div className="chips" role="tablist" aria-label="Category">
              <button className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>
                All
              </button>
              {usedCategories.map((c) => (
                <button key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(category === c.id ? '' : c.id)}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="🔎"
              title="Nothing matches"
              message="Try a different search or another category."
              actions={
                <button
                  className="btn secondary"
                  onClick={() => {
                    setQuery('');
                    setCategory('');
                  }}
                >
                  Show everything
                </button>
              }
            />
          ) : (
            <div className="card pad-0">
              <div className="list">
                {visible.map((p) => (
                  <Row key={p.id} p={p} category={byId.get(p.categoryId)} showCategory={!category} onEdit={() => setEditing(p)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button className="fab" aria-label="Add product" onClick={() => setEditing('new')}>
        +
      </button>

      <ProductSheet
        key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
        open={editing !== null}
        product={editing === 'new' ? null : editing}
        categories={categories}
        defaultCategoryId={category || 'other'}
        onClose={() => setEditing(null)}
      />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} products={products} />
    </div>
  );
}

function Row({ p, category, showCategory, onEdit }: { p: Product; category: Category | undefined; showCategory: boolean; onEdit: () => void }) {
  const low = lowLevel(p);
  const sub = [p.brand, showCategory ? category?.name : null].filter(Boolean).join(' · ');
  return (
    <div className={`list-item ${low ? `low ${low}` : ''}`}>
      <button className="row grow" style={{ gap: 12, minWidth: 0, textAlign: 'left' }} onClick={onEdit} aria-label={`Edit ${p.name}`}>
        <div className="thumb" aria-hidden>
          {category?.emoji ?? '📦'}
        </div>
        <div className="main">
          <span className="name clamp2">{p.name}</span>
          {sub && <span className="sub">{sub}</span>}
          {low && <span className={`badge ${low === 'none' ? 'danger' : 'warn'}`}>{low === 'none' ? 'None left' : 'Last one'}</span>}
        </div>
      </button>
      <div className="qty">
        <QuantityStepper value={p.quantity} onChange={(d) => changeQuantity(p.id, d)} label={`${p.name} quantity`} />
        {p.unit && <span className="tiny muted">{p.unit}</span>}
      </div>
    </div>
  );
}
