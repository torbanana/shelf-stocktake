import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { BottomNav, type Route } from './components/BottomNav';
import { db } from './db';
import { Inventory } from './Inventory';
import { needsBuying } from './lib/products';
import { Overview } from './Overview';
import { Shopping } from './Shopping';

/** Three tabs switched by the URL hash so the phone's back button works: #, #products[/category], #shopping */
function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function parse(hash: string): { route: Route; category: string } {
  const h = hash.replace(/^#\/?/, '');
  if (h === 'shopping') return { route: 'shopping', category: '' };
  if (h.startsWith('products')) return { route: 'products', category: decodeURIComponent(h.split('/')[1] ?? '') };
  return { route: 'overview', category: '' };
}

export default function App() {
  const { route, category } = parse(useHash());
  const shoppingCount = useLiveQuery(async () => (await db.products.toArray()).filter(needsBuying).length, [], 0);
  return (
    <div className="app">
      {route === 'shopping' ? <Shopping /> : route === 'products' ? <Inventory key={category} initialCategory={category} /> : <Overview />}
      <BottomNav route={route} shoppingCount={shoppingCount} />
    </div>
  );
}
