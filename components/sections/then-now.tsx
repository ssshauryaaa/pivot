'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Reveal } from '@/components/reveal'
import { prefersReducedMotion } from '@/lib/gsap-config'

const THEN = [
  ['1979', 'Two dollars in quarters lasted a whole Friday night.'],
  ['Rule', 'Three initials on the board, and the whole room knew them.'],
  ['Ritual', 'You stood. You leaned. You never sat down for the last life.'],
] as const

const NOW = [
  ['Today', 'Two dollars in tokens still lasts a whole Tuesday afternoon.'],
  ['Rule', 'Same three initials. Bigger board. Longer memory.'],
  ['Ritual', 'You still stand. There is a chair if you want it — most nights you ignore it.'],
] as const

const ROW_INTERVAL = 3200
const MAX_TILT = 7 // degrees

/**
 * A card that tilts in 3D toward the cursor, with a tracked glare sheen,
 * a spinning neon frame on hover, and depth-layered children (translateZ).
 * Falls back to a static card for touch devices and reduced motion.
 */
function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return

    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.classList.add('is-tilting')
      el.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`)
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
    })
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(frame.current)
    el.classList.remove('is-tilting')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-card group relative rounded-lg ${className}`}
    >
      {children}
    </div>
  )
}

function ComparisonRows({
  rows,
  activeRow,
  tone,
}: {
  rows: readonly (readonly [string, string])[]
  activeRow: number
  tone: 'then' | 'now'
}) {
  return (
    <dl className="tilt-layer mt-8 space-y-2" style={{ '--tz': '24px' } as React.CSSProperties}>
      {rows.map(([label, copy], i) => (
        <div
          key={label}
          className={`-mx-3 rounded-sm px-3 py-3 transition-all duration-500 ease-out hover:translate-x-1 hover:bg-primary/[0.08] hover:shadow-[inset_2px_0_0_var(--primary)] ${
            activeRow === i ? 'bg-primary/[0.07] shadow-[inset_2px_0_0_var(--primary)]' : ''
          }`}
        >
          <dt
            className={`font-display text-[10px] tracking-widest transition-colors duration-500 ${
              activeRow === i ? 'text-primary text-glow-amber' : 'text-primary/70'
            }`}
          >
            {label}
          </dt>
          <dd
            className={`mt-2 leading-relaxed transition-colors duration-500 ${
              tone === 'now' ? 'text-foreground/85' : 'text-muted-foreground'
            }`}
          >
            {copy}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ThenNow() {
  const [activeRow, setActiveRow] = useState(-1)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Cycle a highlight across the comparison rows on an interval, but only
  // while the cards are actually on screen — and never for reduced motion.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timer: ReturnType<typeof setInterval> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !timer) {
          setActiveRow(0)
          timer = setInterval(() => {
            setActiveRow((prev) => (prev + 1) % THEN.length)
          }, ROW_INTERVAL)
        } else if (!entry.isIntersecting && timer) {
          clearInterval(timer)
          timer = null
          setActiveRow(-1)
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (timer) clearInterval(timer)
    }
  }, [])

  return (
    <section id="then-now" className="relative overflow-hidden border-t border-primary/15 bg-background py-24 sm:py-32">
      {/* faint arcade grid drifting behind the cards */}
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-30" />
      {/* giant ghost year watermarks */}
      <div
        aria-hidden="true"
        className="font-display pointer-events-none absolute -left-6 top-16 select-none text-[9rem] leading-none text-primary/[0.04] sm:text-[13rem]"
      >
        79
      </div>
      <div
        aria-hidden="true"
        className="font-display pointer-events-none absolute -right-6 bottom-10 select-none text-[9rem] leading-none text-primary/[0.04] sm:text-[13rem]"
      >
        26
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="max-w-2xl">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary">01 — THEN &amp; NOW</p>
          <h2 className="mt-5 text-3xl font-semibold text-balance leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            You were the original{' '}
            <span className="text-primary text-glow-amber">arcade generation</span>.
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Nobody had to explain a cabinet to you. You were there when the first one landed in the
            bowling alley. REPLAY isn&apos;t introducing you to anything — it&apos;s handing something back.
          </p>
        </Reveal>

        <div ref={sectionRef} className="tilt-stage relative mt-16 grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* connecting seam between the eras — hidden on mobile */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          >
            <div className="font-display flex size-14 items-center justify-center rounded-full border border-primary/30 bg-void text-[9px] tracking-widest text-primary shadow-[0_0_30px_-6px_var(--primary)]">
              VS
            </div>
          </div>

          <Reveal from="left">
            <TiltCard className="h-full border border-primary/15 bg-card p-8 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] hover:shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] sm:p-10">
              <div className="neon-frame" aria-hidden="true" />
              <div className="tilt-glare pointer-events-none absolute inset-0 rounded-lg" aria-hidden="true" />

              <div className="tilt-layer" style={{ '--tz': '36px' } as React.CSSProperties}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-[10px] tracking-[0.2em] text-muted-foreground">THEN</p>
                  <p className="font-display text-[10px] tracking-widest text-primary/40 transition-colors duration-500 group-hover:text-primary/80">
                    25&cent; A PLAY
                  </p>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-foreground transition-transform duration-500 group-hover:translate-x-0.5 sm:text-4xl">
                  The teenager
                </p>
                <div className="mt-3 h-px w-12 bg-primary/40 transition-all duration-500 group-hover:w-24 group-hover:bg-primary" />
              </div>

              <ComparisonRows rows={THEN} activeRow={activeRow} tone="then" />
            </TiltCard>
          </Reveal>

          <Reveal from="right">
            <TiltCard className="h-full border border-primary/25 bg-[#161c33] p-8 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] hover:shadow-[0_32px_80px_-20px_color-mix(in_oklab,var(--primary)_20%,transparent)] sm:p-10">
              <div className="neon-frame" aria-hidden="true" />
              <div className="scanlines pointer-events-none absolute inset-0 rounded-lg opacity-40" aria-hidden="true" />
              <div className="tilt-glare pointer-events-none absolute inset-0 rounded-lg" aria-hidden="true" />

              <div className="tilt-layer" style={{ '--tz': '36px' } as React.CSSProperties}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-[10px] tracking-[0.2em] text-primary">NOW</p>
                  <p className="font-display animate-flicker text-[10px] tracking-widest text-primary/40 transition-colors duration-500 group-hover:text-primary/80">
                    INSERT COIN
                  </p>
                </div>
                <p className="text-glow-amber mt-4 text-3xl font-bold tracking-tight text-primary transition-transform duration-500 group-hover:translate-x-0.5 sm:text-4xl">
                  The regular
                </p>
                <div className="mt-3 h-px w-12 bg-primary/40 transition-all duration-500 group-hover:w-24 group-hover:bg-primary" />
              </div>

              <ComparisonRows rows={NOW} activeRow={activeRow} tone="now" />
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
