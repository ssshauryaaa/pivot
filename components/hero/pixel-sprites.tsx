'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '@/lib/gsap-config'

/**
 * Original sprites drawn in the classic arcade visual language — a round
 * dot-muncher, a blocky invader, a drifting ghost. Rendered as pixel grids
 * (no external art), each with an idle bob + pointer parallax.
 *
 * Legend: '.' empty, 'a' amber, 'm' magenta, 'o' off-white, 'v' void
 */
const MUNCHER = [
  '..aaaa..',
  '.aaaaaa.',
  'aavaaaaa',
  'aaaaaa..',
  'aaaaa...',
  'aaaaaa..',
  '.aaaaaa.',
  '..aaaa..',
]

const INVADER = [
  '..o..o..',
  '.oooooo.',
  'oo.oo.oo',
  'oooooooo',
  '.o.oo.o.',
  'o......o',
  '.o....o.',
  '........',
]

const GHOST = [
  '..mmmm..',
  '.mmmmmm.',
  'mmommomm',
  'mmvmmvmm',
  'mmmmmmmm',
  'mmmmmmmm',
  'm.mm.mm.',
  '........',
]

const COLORS: Record<string, string> = {
  a: 'var(--primary)',
  m: 'var(--accent)',
  o: 'var(--foreground)',
  v: 'var(--void)',
}

function Sprite({ rows, label, px }: { rows: string[]; label: string; px: number }) {
  const cols = rows[0].length
  return (
    <div
      role="img"
      aria-label={label}
      className="pixelated grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${px}px)`,
        gridAutoRows: `${px}px`,
        filter: 'drop-shadow(0 0 10px rgba(255,182,39,0.25))',
      }}
    >
      {rows.flatMap((row, y) =>
        row.split('').map((cell, x) => (
          <span
            key={`${x}-${y}`}
            style={{ background: COLORS[cell] ?? 'transparent' }}
            className="block"
          />
        )),
      )}
    </div>
  )
}

export function PixelSprites({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    if (!root) return

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-sprite]'))
    const setters = items.map((item, i) => ({
      depth: 1 + i * 0.45,
      x: gsap.quickTo(item, 'x', { duration: 1, ease: 'power3.out' }),
      y: gsap.quickTo(item, 'y', { duration: 1, ease: 'power3.out' }),
    }))

    const onMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      for (const setter of setters) {
        setter.x(nx * setter.depth * 34)
        setter.y(ny * setter.depth * 22)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div ref={rootRef} className={`pointer-events-none flex items-end justify-center gap-8 sm:gap-14 ${className}`}>
      <div data-sprite className="will-animate">
        <div className="animate-sprite-bob" style={{ animationDuration: '2.6s' }}>
          <Sprite rows={MUNCHER} label="Pixel dot-muncher sprite" px={4} />
        </div>
      </div>
      <div data-sprite className="will-animate">
        <div className="animate-sprite-bob" style={{ animationDuration: '3.2s', animationDelay: '0.4s' }}>
          <Sprite rows={INVADER} label="Pixel invader sprite" px={5} />
        </div>
      </div>
      <div data-sprite className="will-animate">
        <div className="animate-sprite-bob" style={{ animationDuration: '2.9s', animationDelay: '0.8s' }}>
          <Sprite rows={GHOST} label="Pixel ghost sprite" px={4} />
        </div>
      </div>
    </div>
  )
}
