// Prajesh Shakya's interlocked PS monogram (from the brand kit). The P sits over
// the S at the bowl and under it everywhere else; the masks cut the gaps.
// Give each instance on a page its own idPrefix so the mask ids don't collide.

const P_PATH = "M25.4 96Q23.9 96 23.9 94.9Q23.9 94 25.2 93.7L27.5 93.3Q29.6 92.9 30.25 92.2Q30.9 91.5 30.9 89.4V30.6Q30.9 28.5 30.25 27.8Q29.6 27.1 27.5 26.7L25.2 26.3Q23.9 26 23.9 25.1Q23.9 24 25.4 24H46.3Q52.2 24 56.7 26.55Q61.2 29.1 63.7 33.6Q66.2 38.1 66.2 44Q66.2 49.7 63.7 54.1Q61.2 58.5 56.8 60.95Q52.4 63.4 46.6 63.4H39.4Q38 63.4 38 64.8V89Q38 91.1 38.8 91.85Q39.6 92.6 42.4 93.1L46.1 93.7Q47.2 93.9 47.2 94.8Q47.2 96 45.7 96ZM38 55.4Q38 60.9 44.7 60.9Q51.2 60.9 54.95 56.3Q58.7 51.7 58.7 43.7Q58.7 35.5 54.9 31Q51.1 26.5 44.1 26.5Q38 26.5 38 30.5Z"
const S_PATH = "M58.4 96.9Q56.4 96.9 53.95 96.5Q51.5 96.1 49.35 95.5Q47.2 94.9 46 94.2Q45.3 93.8 44.95 93.35Q44.6 92.9 44.6 91.8L44.1 76.1Q44.1 74.1 45.4 74.1Q46.5 74.1 46.9 75.9L47.8 79.7Q51.2 94 60.5 94Q65.5 94 68.45 90.65Q71.4 87.3 71.4 81.2Q71.4 75.3 68.35 70.2Q65.3 65.1 58.6 60.1Q51.2 54.8 47.8 49.85Q44.4 44.9 44.4 39.3Q44.4 31.9 49.55 27.45Q54.7 23 62.7 23Q65.7 23 68.5 23.7Q71.3 24.4 73.1 25.7Q73.7 26.1 74.05 26.6Q74.4 27.1 74.4 27.9L74.7 43Q74.7 44.7 73.4 44.7Q72.5 44.7 72.1 43.3L71.4 40.8Q69.2 33.1 66.85 29.55Q64.5 26 60.1 26Q55.8 26 53.25 28.8Q50.7 31.6 50.7 36.7Q50.7 41 53.5 44.9Q56.3 48.8 63.3 54.4Q70.8 60.5 74.25 66.15Q77.7 71.8 77.7 78.2Q77.7 83.8 75.2 88Q72.7 92.2 68.35 94.55Q64 96.9 58.4 96.9Z"

type BrandMarkProps = { className?: string; idPrefix?: string; title?: string }

export function BrandMark({ className, idPrefix = "ps", title }: BrandMarkProps) {
  const top = `${idPrefix}-top`
  const maskP = `${idPrefix}-mask-p`
  const maskS = `${idPrefix}-mask-s`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="23 22 56 76"
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={top}>
          <circle cx="55" cy="44" r="16" />
        </clipPath>
        <mask id={maskP} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <path d={S_PATH} fill="#000" stroke="#000" strokeWidth="13" strokeLinejoin="round" />
          <circle cx="55" cy="44" r="16" fill="#fff" />
        </mask>
        <mask id={maskS} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <g clipPath={`url(#${top})`}>
            <path d={P_PATH} fill="#000" stroke="#000" strokeWidth="13" strokeLinejoin="round" />
          </g>
        </mask>
      </defs>
      <path d={P_PATH} mask={`url(#${maskP})`} />
      <path d={S_PATH} mask={`url(#${maskS})`} />
    </svg>
  )
}
