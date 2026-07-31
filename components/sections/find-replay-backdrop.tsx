/**
 * FindReplayBackdrop
 * ---------------------------------------------------------------------------
 * Purely decorative background layer for the "Find A Cabinet" section —
 * blends the two themes the section sits between: navigating to a real
 * place (dotted route, compass rings, a ghosted watermark pin) and the
 * arcade's retro identity (a classic space-invader glyph, a pac-man-style
 * ghost, a coin token), all rendered as low-opacity pixel/blocky shapes so
 * they read as texture, not competing content.
 *
 * Server component — no interactivity, no client JS needed. Reuses
 * .animate-sprite-bob and .animate-flicker from globals.css, which are
 * already wired into the project's global prefers-reduced-motion rule, so
 * this needs no reduced-motion handling of its own.
 *
 * Usage: render as the first child of a `relative overflow-hidden` section,
 * before the real content — it's `absolute inset-0 -z-10` and
 * `aria-hidden` so it never interferes with layout or screen readers.
 */

const invaderGrid = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
]

const ghostGrid = [
  '00111100',
  '01111110',
  '11111111',
  '11111111',
  '11111111',
  '10101010',
  '01010101',
]

const runnerGrid = [
  '00110000',
  '01111000',
  '10101000',
  '01111000',
  '00110000',
  '01101000',
  '01101000',
  '00100000',
]

const arcadeGrid = [
  '00111100',
  '01111110',
  '11111111',
  '11011011',
  '11111111',
  '10111101',
  '10100101',
  '11111111',
]

function PixelGlyph({
  grid,
  x,
  y,
  cell = 5,
  color,
  opacity = 0.26,
  className,
}: {
  grid: string[]
  x: number
  y: number
  cell?: number
  color: string
  opacity?: number
  className?: string
}) {
  return (
    <g transform={`translate(${x} ${y})`} className={className}>
      {grid.flatMap((row, rowIndex) =>
        row.split('').map((bit, colIndex) =>
          bit === '1' ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cell}
              y={rowIndex * cell}
              width={cell}
              height={cell}
              fill={color}
              fillOpacity={opacity}
            />
          ) : null,
        ),
      )}
    </g>
  )
}

function CoinToken({ cx, cy, r = 20, opacity = 0.22 }: { cx: number; cy: number; r?: number; opacity?: number }) {
  return (
    <g className="animate-flicker">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeWidth={2} strokeOpacity={Math.min(1, opacity * 2.7)} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeOpacity={Math.min(1, opacity * 2.2)} />
    </g>
  )
}

function CompassRings({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {[60, 110, 160].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1}
          strokeOpacity={0.18 - i * 0.02}
        />
      ))}
      {/* crosshair ticks, like a map/radar reticle */}
      <line x1={cx - 172} y1={cy} x2={cx - 150} y2={cy} stroke="var(--primary)" strokeOpacity={0.22} strokeWidth={1.5} />
      <line x1={cx + 150} y1={cy} x2={cx + 172} y2={cy} stroke="var(--primary)" strokeOpacity={0.22} strokeWidth={1.5} />
      <line x1={cx} y1={cy - 172} x2={cx} y2={cy - 150} stroke="var(--primary)" strokeOpacity={0.22} strokeWidth={1.5} />
    </g>
  )
}

export function FindReplayBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="findReplayGlow" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="700" fill="url(#findReplayGlow)" opacity="0.18" />
        <circle cx={260} cy={120} r={92} fill="var(--primary)" fillOpacity={0.06} />
        <circle cx={950} cy={140} r={70} fill="var(--primary)" fillOpacity={0.05} />
        <path
          d="M200 120c-40 0-72 32-72 72 0 58 72 132 72 132s72-74 72-132c0-40-32-72-72-72z"
          fill="var(--primary)"
          fillOpacity={0.07}
        />
        <circle cx={200} cy={120} r={20} fill="var(--background)" />
        <path
          d="M 40 60 C 220 40, 260 180, 460 200 S 740 260, 780 380 S 640 520, 600 560"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeOpacity={0.24}
          strokeLinecap="round"
          strokeDasharray="1 14"
        />

        {/* faint radar/compass reticle, upper-right — reinforces "find your
            way here" without competing with the interactive pin below */}
        <CompassRings cx={950} cy={140} />

        {/* oversized ghosted pin watermark, upper-left, purely textural */}
        <g opacity={0.05}>
          <path
            d="M300 40c-38 0-68 30-68 68 0 51 68 122 68 122s68-71 68-122c0-38-30-68-68-68z"
            fill="var(--primary)"
          />
          <circle cx={300} cy={108} r={26} fill="var(--void)" />
        </g>

        {/* retro sprites, scattered, slow independent bob */}
        <g className="animate-sprite-bob" style={{ animationDelay: '0s' }}>
          <PixelGlyph grid={invaderGrid} x={90} y={420} cell={6} color="var(--accent)" opacity={0.14} />
        </g>
        <g className="animate-sprite-bob" style={{ animationDelay: '0.8s' }}>
          <PixelGlyph grid={ghostGrid} x={1020} y={480} cell={5} color="var(--primary)" opacity={0.14} />
        </g>
        <g className="animate-sprite-bob" style={{ animationDelay: '1.6s' }}>
          <PixelGlyph grid={invaderGrid} x={1060} y={100} cell={4} color="var(--primary)" opacity={0.1} />
        </g>
        <g className="animate-sprite-bob" style={{ animationDelay: '0.4s' }}>
          <PixelGlyph grid={ghostGrid} x={140} y={180} cell={4} color="var(--accent)" opacity={0.1} />
        </g>

        <g className="animate-sprite-bob" style={{ animationDelay: '0.5s' }}>
          <PixelGlyph grid={arcadeGrid} x={140} y={120} cell={4} color="var(--primary)" opacity={0.18} />
        </g>
        <g className="animate-jump" style={{ animationDelay: '0.2s' }}>
          <PixelGlyph grid={runnerGrid} x={760} y={520} cell={4} color="var(--accent)" opacity={0.18} />
        </g>
        <CoinToken cx={520} cy={90} r={16} opacity={0.16} />
        <CoinToken cx={860} cy={560} r={22} opacity={0.14} />
      </svg>
    </div>
  )
}
