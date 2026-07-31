'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'

/**
 * FooterBackdrop
 * ---------------------------------------------------------------------------
 * Replaces the old scrolling-runner marquee strip. Deliberately reuses the
 * visual language from FindReplayBackdrop — compass rings, a ghosted pin
 * watermark, a dotted route, coin tokens, pixel glyphs — so the top and
 * bottom of the page read as one system instead of two different footer
 * ideas stacked on each other.
 *
 * What makes it "3D": three groups are rendered at different simulated
 * depths and drift against the cursor at different rates (classic
 * parallax), each on its own translate3d + easing, so the far compass/pin
 * layer barely moves while the near sprite layer swings the most — the
 * standard trick for faking depth with plain 2D layers. The coin tokens use
 * a scaleX "flip" keyframe to read as spinning discs rather than flat
 * circles.
 *
 * Pointer tracking is skipped entirely under prefers-reduced-motion; the
 * layers just sit still and only the slow idle bob/flicker (already wired
 * into globals.css) keeps running.
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

const ghostGrid = ['00111100', '01111110', '11111111', '11111111', '11111111', '10101010', '01010101']

const runnerGrid = ['00110000', '01111000', '10101000', '01111000', '00110000', '01101000', '01101000', '00100000']

function PixelGlyph({
  grid,
  x,
  y,
  cell = 5,
  color,
  opacity = 0.3,
}: {
  grid: string[]
  x: number
  y: number
  cell?: number
  color: string
  opacity?: number
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {grid.flatMap((row, r) =>
        row.split('').map((bit, c) =>
          bit === '1' ? (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} fillOpacity={opacity} />
          ) : null,
        ),
      )}
    </g>
  )
}

function CoinToken({ cx, cy, r = 16, delay = 0 }: { cx: number; cy: number; r?: number; delay?: number }) {
  return (
    <g className="footer-coin" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeWidth={2} strokeOpacity={0.5} />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeOpacity={0.35} />
    </g>
  )
}

function CompassRings({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {[36, 66, 96].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeWidth={1} strokeOpacity={0.18 - i * 0.02} />
      ))}
      <line x1={cx - 108} y1={cy} x2={cx - 88} y2={cy} stroke="var(--primary)" strokeOpacity={0.22} strokeWidth={1.5} />
      <line x1={cx + 88} y1={cy} x2={cx + 108} y2={cy} stroke="var(--primary)" strokeOpacity={0.22} strokeWidth={1.5} />
    </g>
  )
}

export function FooterBackdrop() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useRef(false)
  const raf = useRef<number>()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion.current) return
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setTilt({ x: px, y: py }))
  }

  function handleLeave() {
    if (raf.current) cancelAnimationFrame(raf.current)
    setTilt({ x: 0, y: 0 })
  }

  const layer = (rateX: number, rateY: number) => ({
    transform: `translate3d(${tilt.x * rateX}px, ${tilt.y * rateY}px, 0)`,
    transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
  })

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="footer-backdrop absolute inset-0 overflow-hidden bg-[#0a0d1a]"
      style={{ perspective: '900px' }}
      aria-hidden="true"
    >
      <div className="scanlines absolute inset-0 opacity-40" />
      <div className="grid-backdrop absolute -inset-24 opacity-20" />

      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" className="relative h-full w-full">
        {/* far layer — compass rings + ghosted pin watermark, barely drifts */}
        <g style={layer(-6, -4)}>
          <CompassRings cx={980} cy={70} />
          <g opacity={0.07}>
            <path d="M150 14c-26 0-46 20-46 46 0 35 46 84 46 84s46-49 46-84c0-26-20-46-46-46z" fill="var(--primary)" />
            <circle cx={150} cy={60} r={16} fill="var(--void)" />
          </g>
        </g>

        {/* mid layer — dotted route + coin tokens */}
        <g style={layer(-14, -9)}>
          <path
            d="M 10 210 C 200 170, 300 230, 480 150 S 780 70, 1160 130"
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeOpacity={0.26}
            strokeLinecap="round"
            strokeDasharray="1 14"
          />
          <CoinToken cx={300} cy={64} r={13} delay={0} />
          <CoinToken cx={880} cy={200} r={17} delay={1.4} />
        </g>

        {/* near layer — pixel sprites, moves the most, reads as foreground */}
        <g style={layer(-26, -16)}>
          <g className="animate-sprite-bob">
            <PixelGlyph grid={runnerGrid} x={110} y={168} cell={6} color="var(--accent)" opacity={0.55} />
          </g>
          <g className="animate-sprite-bob" style={{ animationDelay: '0.6s' }}>
            <PixelGlyph grid={ghostGrid} x={990} y={36} cell={5} color="var(--primary)" opacity={0.5} />
          </g>
          <g className="animate-sprite-bob" style={{ animationDelay: '1.1s' }}>
            <PixelGlyph grid={invaderGrid} x={560} y={26} cell={4} color="var(--primary)" opacity={0.4} />
          </g>
        </g>
      </svg>

      <style>{`
        .footer-coin {
          animation: footer-coin-flip 4.5s linear infinite;
        }
        @keyframes footer-coin-flip {
          0%   { transform: scaleX(1); }
          25%  { transform: scaleX(0.15); }
          50%  { transform: scaleX(1); }
          75%  { transform: scaleX(0.15); }
          100% { transform: scaleX(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .footer-coin { animation: none; }
        }
      `}</style>
    </div>
  )
}