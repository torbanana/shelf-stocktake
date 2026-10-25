import { useEffect, useState } from 'react';
import { Inventory } from './Inventory';
import { Shopping } from './Shopping';

/** Two screens, switched by the URL hash so the phone's back button works. */
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

export default function App() {
  const hash = useHash();
  return <div className="app">{hash === '#shopping' ? <Shopping /> : <Inventory />}</div>;
}
