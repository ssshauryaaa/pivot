'use client'

const DEFAULT_ITEMS = [
  'HIGH SCORE 1,284,600 — MARGARET V.',
  'GALAXY DRIFT',
  'PERFECT RUN — RAY O.',
  'FREE PLAY TUESDAYS',
  'TOKEN CLUB OPEN',
  'HIGH SCORE 987,400 — DENISE K.',
  'NEON CIRCUIT',
  'STILL GOT IT',
]

/**
 * Attract-mode marquee ticker — the recurring visual anchor of the brand.
 * Duplicated track + CSS keyframes, so it never touches layout.
 */
export function MarqueeTicker({
  items = DEFAULT_ITEMS,
  speed = 38,
  className = '',
}: {
  items?: string[]
  speed?: number
  className?: string
}) {
  const track = [...items, ...items]

  return (
    <div
      aria-hidden="true"
      className={`relative flex overflow-hidden border-y border-primary/25 bg-void/85 py-2.5 backdrop-blur-sm ${className}`}
    >
      <div
        className="will-animate flex w-max shrink-0 items-center gap-8 pr-8"
        style={{ animation: `marquee-scroll ${speed}s linear infinite` }}
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-[10px] tracking-wide text-primary/85">
            {item}
            <span className="h-1.5 w-1.5 bg-accent" />
          </span>
        ))}
      </div>
    </div>
  )
}
