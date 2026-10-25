/**
 * The two dogs from the reference picture (public/dogs.png) or just the white Maltese
 * (public/dog-white.png). Edges are faded with a CSS mask so the picture melts into the
 * night-sky background instead of sitting in a hard rectangle.
 */
const BASE = import.meta.env.BASE_URL;

export function Pup({ size = 64, variant = 'white', className = '' }: { size?: number; variant?: 'white' | 'both'; className?: string }) {
  const src = variant === 'both' ? `${BASE}dogs.png` : `${BASE}dog-white.png`;
  const width = variant === 'both' ? Math.round(size * 1.5) : size;
  return <img src={src} alt="" width={width} height={size} className={`pup ${className}`} draggable={false} />;
}
