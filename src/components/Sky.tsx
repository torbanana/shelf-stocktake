/**
 * Decorative night sky for the Overview hero: gradient, stars, two shooting stars with glowing
 * heads, soft clouds and a grassy hill for the pup to stand on. Pure SVG, scales to its box.
 */
const STARS: [number, number, number][] = [
  [14, 18, 1.4], [38, 9, 1], [61, 26, 1.2], [92, 12, 1], [118, 31, 1.5], [150, 8, 1], [176, 22, 1.2],
  [205, 14, 1], [228, 34, 1.4], [258, 10, 1], [284, 24, 1.1], [312, 16, 1.4], [340, 30, 1], [26, 48, 1],
  [74, 56, 1.2], [132, 52, 1], [196, 48, 1.3], [246, 58, 1], [300, 50, 1.2], [352, 58, 1], [52, 78, 1],
  [168, 76, 1.1], [236, 84, 1.3], [330, 80, 1],
];

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  const p = [0, 1, 2, 3, 4]
    .map((i) => {
      const a = (-90 + i * 72) * (Math.PI / 180);
      const b = a + (36 * Math.PI) / 180;
      return `${x + r * Math.cos(a)},${y + r * Math.sin(a)} ${x + r * 0.45 * Math.cos(b)},${y + r * 0.45 * Math.sin(b)}`;
    })
    .join(' ');
  return <polygon points={p} fill="#ffd54f" stroke="#ffe79a" strokeWidth="1" strokeLinejoin="round" />;
}

export function Sky({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 190" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151d3f" />
          <stop offset="1" stopColor="#2b3a74" />
        </linearGradient>
        <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd54f" stopOpacity="0" />
          <stop offset="1" stopColor="#ffe79a" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffd54f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="190" fill="url(#skyGrad)" />
      <g fill="#fff">
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={0.6 + (i % 3) * 0.15} />
        ))}
      </g>
      {/* shooting stars */}
      <g strokeLinecap="round" strokeWidth="2.2">
        <path d="M110 70 L190 42" stroke="url(#trail)" />
        <path d="M250 46 L318 24" stroke="url(#trail)" />
      </g>
      <circle cx="194" cy="41" r="16" fill="url(#glow)" />
      <circle cx="322" cy="23" r="13" fill="url(#glow)" />
      <Star x={194} y={41} r={8} />
      <Star x={322} y={23} r={6} />
      {/* clouds */}
      <g fill="#2a3a72" stroke="#1d2a5c" strokeWidth="2">
        <path d="M-10 150c10-22 36-26 52-14 10-16 40-14 46 4 14-6 30 2 30 16H-10z" />
        <path d="M300 156c6-18 30-22 44-10 8-10 30-8 34 6v12h-78z" />
      </g>
      {/* hill */}
      <path d="M-10 168 Q180 118 370 168 L370 200 L-10 200 Z" fill="#3a9a7c" />
      <path d="M-10 176 Q180 128 370 176 L370 200 L-10 200 Z" fill="#2f8768" opacity=".6" />
      <g stroke="#1f6b50" strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 160l2-6M46 162l1-5M120 146l2-6M126 148l1-5M300 150l2-6M306 152l1-5" />
      </g>
      <circle cx="70" cy="166" r="9" fill="url(#glow)" />
      <Star x={70} y={166} r={4.5} />
      <circle cx="280" cy="160" r="8" fill="url(#glow)" />
      <Star x={280} y={160} r={4} />
    </svg>
  );
}
