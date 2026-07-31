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
  const coinRef = useRef<HTMLDivElement>(null)
  const coinLoopRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const start = performance.now()
    document.documentElement.style.overflow = 'hidden'

    if (!reduced && coinRef.current) {
      coinLoopRef.current = gsap.to(coinRef.current, {
        rotateY: '+=360',
        duration: 0.9,
        repeat: -1,
        ease: 'none',
      })
    }

    let frame = 0
    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(1, elapsed / MIN_DISPLAY)
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

      coinLoopRef.current?.kill()

      if (isReduced || !rootRef.current || !wipeRef.current || !coinRef.current) {
        gsap.to(rootRef.current, { opacity: 0, duration: 0.3, onComplete: release })
        return
      }

      // the idle loop can be killed mid-rotation at any arbitrary angle —
      // snap forward to the next "flat" multiple of 360 before spinning for
      // real, so every later value below is an absolute, known-flat target
      const current = (gsap.getProperty(coinRef.current, 'rotateY') as number) || 0
      const flat = Math.ceil(current / 360) * 360 || 360

      gsap
        .timeline({ onComplete: release })
        // settle onto a flat front-facing angle first
        .to(coinRef.current, { rotateY: flat, duration: 0.15, ease: 'power1.out' })
        // a couple of fast final spins — the coin "deciding" to land
        .to(coinRef.current, { rotateY: flat + 720, duration: 0.5, ease: 'power2.in' })
        // lands exactly on the back face (flat + 900 => 180 mod 360), then
        // rushes the camera — its amber face becomes the wipe
        .to(
          coinRef.current,
          { rotateY: flat + 900, scale: 16, duration: 0.55, ease: 'power3.in' },
          '-=0.05',
        )
        .to('[data-preloader-content]', { opacity: 0, duration: DURATION.fast, ease: EASE }, '<')
        .to(wipeRef.current, { yPercent: -100, duration: DURATION.slow, ease: EASE }, '-=0.2')
        .to(rootRef.current, { yPercent: -100, duration: DURATION.slow, ease: EASE }, '<0.12')
    }

    return () => {
      cancelAnimationFrame(frame)
      coinLoopRef.current?.kill()
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
      <div ref={wipeRef} className="absolute inset-0 translate-y-full bg-primary" />
      <div className="absolute inset-0 grid-backdrop opacity-40" />
      <div className="scanlines absolute inset-0" />

      <div
        data-preloader-content
        className="animate-flicker relative flex flex-col items-center gap-6 px-6 text-center"
      >
        <p className="font-display text-[11px] leading-relaxed tracking-widest text-primary md:text-sm">
           ARCADE
        </p>

        <div style={{ perspective: '600px' }}>
          <div
            ref={coinRef}
            className="relative h-14 w-14 md:h-16 md:w-16"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-primary bg-secondary text-primary shadow-[0_0_24px_rgba(255,182,39,0.35)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="font-display text-2xl md:text-3xl">R</span>
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_28px_rgba(255,182,39,0.5)]"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="font-display text-2xl md:text-3xl">¤</span>
            </div>
          </div>
        </div>

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