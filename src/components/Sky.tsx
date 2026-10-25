/**
 * Night sky for the Overview greeting banner: gradient, stars, golden shooting stars streaking
 * across the greeting, soft clouds and a grassy hill for the pup to stand on.
 */
const STARS: [number, number, number][] = [
  [14, 18, 1.4], [38, 9, 1], [61, 26, 1.2], [92, 12, 1], [118, 31, 1.5], [150, 8, 1], [176, 22, 1.2],
  [205, 14, 1], [228, 34, 1.4], [258, 10, 1], [284, 24, 1.1], [312, 16, 1.4], [340, 30, 1], [26, 48, 1],
  [74, 56, 1.2], [132, 52, 1], [196, 48, 1.3], [246, 58, 1], [300, 50, 1.2], [352, 58, 1], [52, 78, 1],
  [168, 76, 1.1], [236, 84, 1.3], [330, 80, 1], [100, 96, 1], [210, 100, 1.2], [320, 104, 1],
];

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  const p = [0, 1, 2, 3, 4]
    .map((i) => {
      const a = (-90 + i * 72) * (Math.PI / 180);
      const b = a + (36 * Math.PI) / 180;
      return `${x + r * Math.cos(a)},${y + r * Math.sin(a)} ${x + r * 0.45 * Math.cos(b)},${y + r * 0.45 * Math.sin(b)}`;
    })
    .join(' ');
  return <polygon points={p} fill="#ffd54f" stroke="#ffe79a" strokeWidth="1.2" strokeLinejoin="round" />;
}

/** A golden trail ending in a glowing star, like the reference art. */
function Shooting({ x1, y1, x2, y2, r }: { x1: number; y1: number; x2: number; y2: number; r: number }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#trail)" strokeWidth={r * 0.45} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={r * 2.4} fill="url(#glow)" />
      <Star x={x2} y={y2} r={r} />
    </>
  );
}

export function Sky({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 210" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c3f" />
          <stop offset="1" stopColor="#2b3a74" />
        </linearGradient>
        <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd54f" stopOpacity="0" />
          <stop offset="1" stopColor="#ffe79a" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffd54f" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="210" fill="url(#skyGrad)" />
      <g fill="#fff">
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={0.6 + (i % 3) * 0.15} />
        ))}
      </g>
      {/* shooting stars across the greeting (top-left) and the top-right */}
      <Shooting x1={18} y1={14} x2={118} y2={44} r={9} />
      <Shooting x1={150} y1={8} x2={214} y2={30} r={5.5} />
      <Shooting x1={262} y1={60} x2={326} y2={82} r={6.5} />
      {/* clouds */}
      <g fill="#2a3a72" stroke="#1d2a5c" strokeWidth="2">
        <path d="M-10 172c10-22 36-26 52-14 10-16 40-14 46 4 14-6 30 2 30 16H-10z" />
        <path d="M296 178c6-18 30-22 44-10 8-10 30-8 34 6v12h-78z" />
      </g>
      {/* hill */}
      <path d="M-10 190 Q180 138 370 190 L370 220 L-10 220 Z" fill="#3a9a7c" />
      <path d="M-10 198 Q180 148 370 198 L370 220 L-10 220 Z" fill="#2f8768" opacity=".6" />
      <g stroke="#1f6b50" strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 182l2-6M46 184l1-5M120 168l2-6M126 170l1-5M300 172l2-6M306 174l1-5" />
      </g>
      <circle cx="70" cy="188" r="9" fill="url(#glow)" />
      <Star x={70} y={188} r={4.5} />
      <circle cx="286" cy="182" r="8" fill="url(#glow)" />
      <Star x={286} y={182} r={4} />
    </svg>
  );
}
