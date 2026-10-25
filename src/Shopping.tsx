import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { EmptyState } from './components/EmptyState';
import { Pup } from './components/Pup';
import { useToast } from './components/Toast';
import { db } from './db';
import { lowLevel, minOf, needsBuying, setQuantity, sortLowFirst, suggestedBuy } from './lib/products';
import type { Category, Product } from './types';

/**
 * The shopping list is simply every product that is below the amount you want to keep.
 * Tapping "Bought" tops it back up, and it drops off the list on its own.
 */
export function Shopping() {
  const toast = useToast();
  const products = useLiveQuery(() => db.products.toArray(), [], undefined);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [] as Category[]);
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const toBuy = useMemo(() => (products ?? []).filter(needsBuying).sort(sortLowFirst), [products]);

  if (products === undefined) return <div className="page" />;

  async function bought(p: Product) {
    const before = p.quantity;
    const after = Math.max(minOf(p), before + 1);
    await setQuantity(p.id, after);
    toast.show(`Bought ${after - before} × ${p.name}.`, {
      actionLabel: 'Undo',
      duration: 6000,
      onAction: () => void setQuantity(p.id, before),
    });
  }

  return (
    <div className="page">
      <header className="page-header">
        <a href="#" className="icon-btn" aria-label="Back to my shelf">
          ←
        </a>
        <div className="title">
          <h1>Shopping list</h1>
          <div className="subtitle">{toBuy.length === 0 ? 'Nothing to buy' : `${toBuy.length} item${toBuy.length === 1 ? '' : 's'} to buy`}</div>
        </div>
      </header>

      {toBuy.length === 0 ? (
        <EmptyState
          illustration={<Pup size={120} />}
          title="All stocked up"
          message="Products appear here when they drop below the amount you want to keep."
          actions={
            <a href="#" className="btn secondary">
              Back to my shelf
            </a>
          }
        />
      ) : (
        <>
          <div className="card pad-0">
            <div className="list">
              {toBuy.map((p) => {
                const cat = byId.get(p.categoryId);
                const low = lowLevel(p);
                const n = suggestedBuy(p);
                return (
                  <div key={p.id} className={`list-item low ${low}`}>
                    <div className="thumb" aria-hidden>
                      {cat?.emoji ?? '📦'}
                    </div>
                    <div className="main">
                      <span className="name clamp2">{p.name}</span>
                      <span className="sub">{[p.brand, cat?.name].filter(Boolean).join(' · ')}</span>
                      <span className={`badge ${low === 'none' ? 'danger' : 'warn'}`}>
                        {p.quantity === 0 ? 'None left' : `${p.quantity} left`} · buy {n}
                        {p.unit ? ` ${p.unit}` : ''}
                      </span>
                    </div>
                    <button className="btn primary sm" onClick={() => bought(p)}>
                      Bought
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="tiny muted" style={{ textAlign: 'center' }}>
            “Bought” tops the product back up to the amount you want to keep. Use − and + on the shelf for anything else.
          </p>
        </>
      )}
    </div>
  );
}
