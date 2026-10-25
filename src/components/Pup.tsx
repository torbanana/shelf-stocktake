/**
 * The fluffy blue Maltese, drawn to match the reference art: cloud-shaped fluff, one thick black
 * outline, dot eyes, a little nose and a happy open mouth. Same drawing as the app icon.
 *
 * The outline is made by drawing every blob twice: first fat and black, then blue on top, so the
 * shapes merge into one silhouette with a single outer line.
 */
const SHAPES = (
  <>
    <circle cx="58" cy="44" r="24" />
    <circle cx="42" cy="32" r="12" />
    <circle cx="56" cy="24" r="12" />
    <circle cx="71" cy="30" r="11" />
    <circle cx="80" cy="45" r="10" />
    <circle cx="40" cy="50" r="10" />
    <ellipse cx="29" cy="58" rx="10" ry="17" />
    <circle cx="36" cy="60" r="9" />
    <ellipse cx="89" cy="58" rx="9" ry="15" />
    <circle cx="82" cy="60" r="9" />
    <rect x="34" y="60" width="50" height="36" rx="16" />
    <circle cx="38" cy="76" r="11" />
    <circle cx="80" cy="78" r="11" />
    <rect x="40" y="80" width="42" height="14" />
    <rect x="36" y="86" width="13" height="18" rx="5.5" />
    <rect x="50" y="88" width="12" height="17" rx="5.5" />
    <rect x="64" y="88" width="12" height="17" rx="5.5" />
    <rect x="78" y="86" width="12" height="17" rx="5.5" />
    <circle cx="97" cy="70" r="6.5" />
    <circle cx="102" cy="64" r="5" />
  </>
);

export function Pup({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" aria-hidden focusable="false">
      <g fill="#1b1b1b" stroke="#1b1b1b" strokeWidth="7" strokeLinejoin="round">
        {SHAPES}
      </g>
      <g fill="#a9c9ea">{SHAPES}</g>
      <g stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round">
        <path d="M49.5 92v11M63.5 93v10M77.5 92v11" />
      </g>
      <ellipse cx="52" cy="33" rx="12" ry="7.5" fill="#d6e7f6" />
      <g fill="#1b1b1b">
        <circle cx="49" cy="45" r="2.5" />
        <circle cx="66" cy="45" r="2.5" />
        <path d="M54 50h7a1.5 1.5 0 0 1 1.2 2.3l-3.5 4a1.5 1.5 0 0 1-2.4 0l-3.5-4A1.5 1.5 0 0 1 54 50z" />
        <path d="M50 58q7.5 10 15 0z" />
      </g>
      <path d="M53.5 59.5q4 5 8 0z" fill="#f08da0" />
      <g fill="none" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M43 73l2.5-3 2.5 3M69 86l2.5-3 2.5 3M57 71l2.5-3 2.5 3" />
      </g>
    </svg>
  );
}
