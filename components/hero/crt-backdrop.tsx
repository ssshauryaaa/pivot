'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '@/lib/gsap-config'

/**
 * Ambient CRT backdrop: scanlines, faint grid, drifting glow.
 * Parallax layers respond to the pointer — never a literal cursor-follow.
 */
export function CrtBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'))
    const setters = layers.map((layer) => ({
      depth: Number(layer.dataset.depth ?? 0),
      x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
    }))

    const onMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      for (const setter of setters) {
        setter.x(nx * setter.depth * -60)
        setter.y(ny * setter.depth * -40)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,#1b2242_0%,#12172b_45%,#0a0d1a_100%)]" />

      <div data-depth="0.35" className="will-animate absolute -inset-24 grid-backdrop opacity-50" />

      <div
        data-depth="0.8"
        className="will-animate absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,182,39,0.30) 0%, rgba(255,182,39,0) 70%)' }}
      />

      <div
        data-depth="1.4"
        className="will-animate absolute bottom-[8%] left-[12%] h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,62,154,0.28) 0%, rgba(255,62,154,0) 70%)' }}
      />

      {/* drifting dust motes */}
      <div data-depth="1.8" className="will-animate absolute inset-0">
        {MOTES.map((mote, i) => (
          <span
            key={i}
            className="animate-sprite-bob absolute block h-[3px] w-[3px] bg-primary/60"
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              animationDuration: `${mote.d}s`,
              animationDelay: `${mote.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="scanlines absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_55%,rgba(10,13,26,0.85)_100%)]" />
    </div>
  )
}

const MOTES = [
  { x: 12, y: 22, d: 5.5, delay: 0 },
  { x: 26, y: 68, d: 7, delay: 0.6 },
  { x: 38, y: 14, d: 6.2, delay: 1.2 },
  { x: 52, y: 82, d: 8, delay: 0.3 },
  { x: 64, y: 36, d: 5.8, delay: 1.6 },
  { x: 76, y: 60, d: 6.8, delay: 0.9 },
  { x: 84, y: 20, d: 7.4, delay: 2.1 },
  { x: 92, y: 74, d: 6, delay: 1.4 },
  { x: 18, y: 46, d: 7.8, delay: 2.4 },
  { x: 46, y: 54, d: 6.4, delay: 1.9 },
]
