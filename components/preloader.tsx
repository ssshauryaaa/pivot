'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { EASE, DURATION, prefersReducedMotion } from '@/lib/gsap-config'

const MIN_DISPLAY = 1900 // ms — never feels rushed, never eats the demo

export function Preloader() {
  const [count, setCount] = useState(0)
  const [gone, setGone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const start = performance.now()
    document.documentElement.style.overflow = 'hidden'

    let frame = 0
    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(1, elapsed / MIN_DISPLAY)
      // ease-out so the counter surges then settles, like a boot sequence
      setCount(Math.round((1 - Math.pow(1 - progress, 2)) * 100))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        exit(reduced)
      }
    }
    frame = requestAnimationFrame(tick)

    function exit(isReduced: boolean) {
      const release = () => {
        document.documentElement.style.overflow = ''
        window.dispatchEvent(new Event('replay:ready'))
        setGone(true)
      }

      if (isReduced || !rootRef.current || !wipeRef.current) {
        gsap.to(rootRef.current, { opacity: 0, duration: 0.3, onComplete: release })
        return
      }

      gsap
        .timeline({ onComplete: release })
        .to('[data-preloader-content]', { opacity: 0, y: -16, duration: DURATION.fast, ease: EASE })
        .to(wipeRef.current, { yPercent: -100, duration: DURATION.slow, ease: EASE }, '-=0.1')
        .to(rootRef.current, { yPercent: -100, duration: DURATION.slow, ease: EASE }, '<0.12')
    }

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-void"
    >
      {/* amber color-wipe layer that slides away to reveal the page */}
      <div ref={wipeRef} className="absolute inset-0 translate-y-full bg-primary" />

      <div className="absolute inset-0 grid-backdrop opacity-40" />
      <div className="scanlines absolute inset-0" />

      <div
        data-preloader-content
        className="animate-flicker relative flex flex-col items-center gap-6 px-6 text-center"
      >
        <p className="font-display text-[11px] leading-relaxed tracking-widest text-primary md:text-sm">
          REPLAY ARCADE
        </p>
        <p className="font-display text-2xl text-foreground md:text-4xl">INSERT COIN</p>
        <p className="font-display text-5xl text-primary text-glow-amber tabular-nums md:text-7xl">
          {String(count).padStart(3, '0')}%
        </p>
        <div className="h-2 w-56 overflow-hidden bg-secondary md:w-80">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${count}%` }}
          />
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">Booting attract mode…</p>
      </div>

      <span className="sr-only">Loading REPLAY</span>
    </div>
  )
}
