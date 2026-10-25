import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { Pup } from './components/Pup';
import { Sky } from './components/Sky';
import { TopBar } from './components/TopBar';
import { useToast } from './components/Toast';
import { db } from './db';
import { lowLevel, needsBuying, sortLowFirst } from './lib/products';
import { loadSampleProducts } from './lib/sample';
import { MenuSheet } from './MenuSheet';
import { ProductSheet } from './ProductSheet';
import type { Category } from './types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Up late?';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Overview() {
  const toast = useToast();
  const products = useLiveQuery(() => db.products.toArray(), [], undefined);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [] as Category[]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const stats = useMemo(() => {
    const list = products ?? [];
    const none = list.filter((p) => lowLevel(p) === 'none').length;
    const low = list.filter((p) => lowLevel(p) === 'low').length;
    return { total: list.length, none, low, ok: list.length - none - low, toBuy: none + low };
  }, [products]);

  const attention = useMemo(() => (products ?? []).filter(needsBuying).sort(sortLowFirst).slice(0, 4), [products]);

  const byCategory = useMemo(
    () =>
      categories
        .map((c) => {
          const items = (products ?? []).filter((p) => p.categoryId === c.id);
          return { c, count: items.length, low: items.filter(needsBuying).length };
        })
        .filter((x) => x.count > 0),
    [categories, products],
  );

  if (products === undefined) return <div className="page" />;

  async function loadSamples() {
    const n = await loadSampleProducts();
    toast.show(`${n} sample products added. Remove them from the ⋯ menu when you like.`);
  }

  return (
    <div className="page">
      <TopBar
        title="Overview"
        subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <button className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            ⋯
          </button>
        }
      />

      <section className="hero" aria-label="Summary">
        <Sky className="hero-sky" />
        <div className="hero-text">
          <div className="hero-greet">{greeting()}</div>
          <div className="hero-big">
            {stats.total === 0 ? 'Your shelf is empty' : stats.toBuy === 0 ? 'Everything is stocked' : `${stats.toBuy} thing${stats.toBuy === 1 ? '' : 's'} to buy`}
          </div>
          <div className="hero-sub">{stats.total === 0 ? 'Add what you own to get started.' : `${stats.total} product${stats.total === 1 ? '' : 's'} on your shelf`}</div>
        </div>
        <Pup size={118} className="hero-pup" />
      </section>

      {stats.total === 0 ? (
        <EmptyState
          icon="🌙"
          title="Nothing here yet"
          message="Add the products you own, or load some samples to see how it works."
          actions={
            <>
              <button className="btn primary" onClick={() => setAdding(true)}>
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
          <div className="tiles">
            <a href="#shopping" className={`tile ${stats.none ? 'danger' : ''}`}>
              <span className="num">{stats.none}</span>
              <span className="lbl">None left</span>
            </a>
            <a href="#shopping" className={`tile ${stats.low ? 'warn' : ''}`}>
              <span className="num">{stats.low}</span>
              <span className="lbl">Running low</span>
            </a>
            <a href="#products" className="tile ok">
              <span className="num">{stats.ok}</span>
              <span className="lbl">Stocked</span>
            </a>
            <a href="#products" className="tile">
              <span className="num">{stats.total}</span>
              <span className="lbl">Total products</span>
            </a>
          </div>

          {attention.length > 0 && (
            <div className="card pad-0">
              <div className="card-title" style={{ padding: '14px 14px 0' }}>
                <h2>Needs buying</h2>
                <a href="#shopping" className="link">
                  Shopping list ›
                </a>
              </div>
              <div className="list" style={{ marginTop: 8 }}>
                {attention.map((p) => {
                  const low = lowLevel(p);
                  return (
                    <a key={p.id} href="#shopping" className={`list-item compact low ${low}`}>
                      <div className="thumb" aria-hidden>
                        {categories.find((c) => c.id === p.categoryId)?.emoji ?? '📦'}
                      </div>
                      <div className="main">
                        <span className="name clamp2">{p.name}</span>
                        {p.brand && <span className="sub">{p.brand}</span>}
                      </div>
                      <span className={`badge ${low === 'none' ? 'danger' : 'warn'}`}>{low === 'none' ? 'None left' : `${p.quantity} left`}</span>
                    </a>
                  );
                })}
              </div>
              {stats.toBuy > attention.length && (
                <a href="#shopping" className="link" style={{ display: 'block', padding: '10px 14px 14px' }}>
                  and {stats.toBuy - attention.length} more
                </a>
              )}
            </div>
          )}

          <div className="card pad-0">
            <div className="card-title" style={{ padding: '14px 14px 0' }}>
              <h2>By category</h2>
              <a href="#products" className="link">
                All products ›
              </a>
            </div>
            <div className="list" style={{ marginTop: 8 }}>
              {byCategory.map(({ c, count, low }) => (
                <a key={c.id} href={`#products/${encodeURIComponent(c.id)}`} className="list-item compact">
                  <div className="thumb" aria-hidden>
                    {c.emoji}
                  </div>
                  <div className="main">
                    <span className="name">{c.name}</span>
                    <span className="sub">
                      {count} product{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  {low > 0 ? <span className="badge warn">{low} to buy</span> : <span className="badge ok">Stocked</span>}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <button className="fab" aria-label="Add product" onClick={() => setAdding(true)}>
        +
      </button>

      <ProductSheet key={adding ? 'new' : 'closed'} open={adding} product={null} categories={categories} defaultCategoryId="other" onClose={() => setAdding(false)} />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} products={products} />
    </div>
  );
}
