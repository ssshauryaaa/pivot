'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'

/**
 * ReserveTokenCard
 * ---------------------------------------------------------------------------
 * The flat "Reserve a token" panel, rebuilt as an actual 3D object:
 *  - the card tilts toward the cursor (perspective + rotateX/rotateY)
 *  - a spotlight glare tracks the pointer across its surface
 *  - a token sits in the corner on its own orbit (translateZ + rotateY),
 *    popping further toward the viewer while the card is hovered
 *  - the CTA is pinned to its own translateZ layer so it visibly sits
 *    "above" the card surface rather than flattening into the tilt
 *
 * The tilt/glare are pointer-driven and skipped entirely under
 * prefers-reduced-motion — the card just sits flat and the coin's
 * orbit animation stops, per the reduced-motion handling used
 * elsewhere on this page. None of this affects the CTA itself, which
 * stays a normal, always-tappable link regardless of hover support.
 */

export function ReserveTokenCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useRef(false)
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
  })
  const [glare, setGlare] = useState({ x: 50, y: 50, active: false })

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion.current) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 14
    const rotateX = (0.5 - py) * 10
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`,
    })
    setGlare({ x: px * 100, y: py * 100, active: true })
  }

  function handleLeave() {
    setTiltStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' })
    setGlare((g) => ({ ...g, active: false }))
  }

  return (
    <div className="mt-16" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ ...tiltStyle, transformStyle: 'preserve-3d' }}
        className="reserve-card relative overflow-hidden border border-primary/25 bg-card p-6 transition-transform duration-300 ease-out will-change-transform sm:p-9"
      >
        {/* pointer-tracked spotlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glare.active ? 1 : 0,
            background: `radial-gradient(320px circle at ${glare.x}% ${glare.y}%, rgba(255,182,39,0.16), transparent 60%)`,
          }}
          aria-hidden="true"
        />

        {/* floating token — own orbit, pops toward the viewer on hover */}
        <div className="reserve-coin pointer-events-none absolute -top-6 right-6 h-14 w-14 sm:h-16 sm:w-16" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_8px_18px_rgba(255,182,39,0.35)]">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--primary)" strokeWidth="3" />
            <circle cx="32" cy="32" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" strokeOpacity="0.6" />
            <text x="32" y="39" textAnchor="middle" className="font-display" fontSize="16" fill="var(--primary)">
              R
            </text>
          </svg>
        </div>

        <h3 className="font-display relative text-base text-foreground sm:text-lg">Reserve a token</h3>
        <p className="relative mt-3 text-lg leading-relaxed text-muted-foreground">
          Leave your name with us and we&apos;ll have a token waiting at the counter. That&apos;s the whole
          process — no forms to fill out here.
        </p>
        <Link
          href="/contact"
          style={{ transform: 'translateZ(20px)' }}
          className="relative mt-7 inline-flex items-center justify-center gap-2 bg-primary px-8 py-4 font-display text-[11px] tracking-wide text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,182,39,0.35)] active:scale-95 sm:text-xs"
        >
          HOLD MY TOKEN
        </Link>
      </div>

      <style>{`
        .reserve-coin {
          animation: reserve-coin-orbit 6s ease-in-out infinite;
        }
        @keyframes reserve-coin-orbit {
          0%, 100% { transform: translateZ(10px) rotateY(0deg) translateY(0px); }
          50%      { transform: translateZ(30px) rotateY(180deg) translateY(-6px); }
        }
        .reserve-card:hover {
          box-shadow: 0 24px 60px -20px rgba(255,182,39,0.25);
        }
        @media (prefers-reduced-motion: reduce) {
          .reserve-coin { animation: none; }
        }
      `}</style>
    </div>
  )
}