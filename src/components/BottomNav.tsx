export type Route = 'overview' | 'products' | 'shopping';

interface Props {
  route: Route;
  shoppingCount: number;
}

const ITEMS: { route: Route; href: string; label: string; ico: string }[] = [
  { route: 'overview', href: '#', label: 'Overview', ico: '✨' },
  { route: 'products', href: '#products', label: 'Products', ico: '🧴' },
  { route: 'shopping', href: '#shopping', label: 'Shopping', ico: '🛒' },
];

export function BottomNav({ route, shoppingCount }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <div className="inner">
        {ITEMS.map((it) => (
          <a key={it.route} href={it.href} className={route === it.route ? 'active' : ''} aria-current={route === it.route ? 'page' : undefined}>
            <span className="ico" aria-hidden>
              {it.ico}
            </span>
            {it.label}
            {it.route === 'shopping' && shoppingCount > 0 && <span className="dot">{shoppingCount}</span>}
          </a>
        ))}
      </div>
    </nav>
  );
}
