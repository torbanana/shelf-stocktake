import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { EmptyState } from './components/EmptyState';
import { Pup } from './components/Pup';
import { TopBar } from './components/TopBar';
import { useToast } from './components/Toast';
import { db } from './db';
import { lowLevel, minOf, needsBuying, setQuantity, sortLowFirst, suggestedBuy, urlHost } from './lib/products';
import { undoEntry } from './lib/undo';
import type { Category, Product } from './types';

/**
 * The shopping list is every product below the amount you want to keep. "Bought" tops it back
 * up and it drops off the list. If a product has a shop link, "Buy online" opens it.
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
    const entry = await setQuantity(p.id, after, `buying ${after - before} × ${p.name}`);
    toast.show(`Bought ${after - before} × ${p.name}.`, {
      actionLabel: 'Undo',
      duration: 6000,
      onAction: () => {
        if (entry) void undoEntry(entry);
      },
    });
  }

  return (
    <div className="page">
      <TopBar title="Shopping list" subtitle={toBuy.length === 0 ? 'Nothing to buy' : `${toBuy.length} item${toBuy.length === 1 ? '' : 's'} to buy`} />

      {toBuy.length === 0 ? (
        <EmptyState
          illustration={<Pup size={120} />}
          title="All stocked up"
          message="Products appear here when they drop below the amount you want to keep. Set that number when you add or edit a product."
          actions={
            <a href="#products" className="btn secondary">
              Go to products
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
                  <div key={p.id} className={`shop-item low ${low}`}>
                    <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
                      <div className="thumb" aria-hidden>
                        {cat?.emoji ?? '📦'}
                      </div>
                      <div className="grow" style={{ minWidth: 0 }}>
                        <span className="name clamp2" style={{ fontWeight: 700, display: 'block' }}>
                          {p.name}
                        </span>
                        <span className="sub small muted" style={{ display: 'block' }}>
                          {[p.brand, cat?.name].filter(Boolean).join(' · ')}
                        </span>
                        <span className={`badge ${low === 'none' ? 'danger' : 'warn'}`}>
                          {p.quantity === 0 ? 'None left' : `${p.quantity} left`} · buy {n}
                          {p.unit ? ` ${p.unit}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="row between" style={{ gap: 10 }}>
                      {p.purchaseUrl ? (
                        <a href={p.purchaseUrl} target="_blank" rel="noopener noreferrer" className="btn secondary sm grow" style={{ justifyContent: 'center' }}>
                          Buy online ↗ <span className="muted tiny">{urlHost(p.purchaseUrl)}</span>
                        </a>
                      ) : (
                        <span className="tiny muted grow">No shop link saved. Add one by editing the product.</span>
                      )}
                      <button className="btn primary sm" onClick={() => bought(p)}>
                        Bought
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="tiny muted" style={{ textAlign: 'center' }}>
            “Bought” tops the product back up to the amount you want to keep. Undo is in the top bar.
          </p>
        </>
      )}
    </div>
  );
}
