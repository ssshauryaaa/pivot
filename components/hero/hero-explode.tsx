'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import { CrtBackdrop } from '@/components/hero/crt-backdrop'
import { CabinetCss } from '@/components/hero/cabinet-css'
import { PixelSprites } from '@/components/hero/pixel-sprites'
import { MarqueeTicker } from '@/components/marquee-ticker'
import { explodeState, resetExplodeState } from '@/lib/explode-state'
import { DURATION, EASE, detectDeviceTier, prefersReducedMotion, type DeviceTier } from '@/lib/gsap-config'

gsap.registerPlugin(ScrollTrigger)

const CabinetScene = dynamic(() => import('@/components/hero/cabinet-scene'), { ssr: false })

const CALLOUTS = [
  { id: 'marquee', part: 'MARQUEE', text: 'Your name in lights again. High score, your rules.' },
  { id: 'screen', part: 'CRT', text: 'The game hasn\'t changed. Neither have your reflexes.' },
  { id: 'joystick', part: 'CONTROLS', text: 'Your hands already know this. Some things you never forget.' },
  { id: 'coin', part: 'COIN DOOR', text: 'One quarter. Every memory it ever bought.' },
]

const HEADLINES = [
  { line1: 'Your High Score', line2: 'Never Expires.' },
  { line1: 'Your Reflexes', line2: 'Never Retired.' },
  { line1: 'The High Score', line2: 'Remembers Your Name.' },
  { line1: 'Muscle Memory', line2: 'Never Left The Building.' },
  { line1: 'Your Best Run', line2: 'Is Still Ahead Of You.' },
]

export function HeroExplode() {
  const [tier, setTier] = useState<DeviceTier | null>(null)
  const [reduced, setReduced] = useState(false)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    setTier(detectDeviceTier())
  }, [])

  useEffect(() => {
    if (tier === null) return
    const play = () => {
      if (prefersReducedMotion()) {
        gsap.set('[data-hero-reveal]', { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        '[data-hero-reveal]',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE, stagger: 0.1 },
      )
    }
    window.addEventListener('replay:ready', play, { once: true })
    return () => window.removeEventListener('replay:ready', play)
  }, [tier])

  useEffect(() => {
    if (reduced) return

    const interval = setInterval(() => {
      if (!headlineRef.current) return
      gsap.to(headlineRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        ease: EASE,
        onComplete: () => {
          setHeadlineIndex((i) => (i + 1) % HEADLINES.length)
        },
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [reduced])

  useEffect(() => {
    if (reduced || !headlineRef.current) return
    gsap.fromTo(
      headlineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: EASE },
    )
  }, [headlineIndex, reduced])

  useEffect(() => {
    if (tier === null) return
    if (prefersReducedMotion()) {
      resetExplodeState()
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-explode',
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      })

      if (tier === 'high') {
        tl.to(explodeState, { spin: 0.2, ease: 'none', duration: 2.4 }, 0)
          .to(explodeState, { marqueeY: 0.75, marqueeRotX: 0.34, ease: EASE, duration: 0.7 }, 0.1)
          .to(explodeState, { panelX: 1.25, panelRotY: 1.05, ease: EASE, duration: 0.8 }, 0.45)
          .to(explodeState, { screenZ: 1.45, screenGlow: 1.7, ease: EASE, duration: 0.8 }, 0.85)
          .to(explodeState, { controlsY: -0.85, controlsOpacity: 0.9, ease: EASE, duration: 0.7 }, 1.2)
      } else {
        tl.to('.marquee', { y: -140, rotateX: 18, ease: EASE, duration: 0.7 }, 0.1)
          .to('.side-panel-left', { x: -170, rotateY: -24, ease: EASE, duration: 0.8 }, 0.45)
          .to('.side-panel-right', { x: 170, rotateY: 24, ease: EASE, duration: 0.8 }, 0.45)
          .to('.screen', { scale: 1.22, y: -24, ease: EASE, duration: 0.8 }, 0.85)
          .to(
            '.joystick, .buttons',
            { y: -46, opacity: 0.9, stagger: 0.08, ease: EASE, duration: 0.7 },
            1.2,
          )
      }

      tl.to('[data-hero-copy]', { opacity: 0, y: -40, ease: EASE, duration: 0.6 }, 0)
        .to('[data-hero-sprites]', { opacity: 0, y: -60, ease: EASE, duration: 0.5 }, 0)
        .to('[data-scroll-cue]', { opacity: 0, ease: EASE, duration: 0.3 }, 0)
        .from(
          '.callout-label',
          { opacity: 0, x: -36, filter: 'blur(6px)', stagger: 0.32, ease: 'power3.out', duration: 0.55 },
          0.35,
        )
        .from(
          '.callout-label .callout-rule',
          { scaleX: 0, transformOrigin: 'left center', stagger: 0.32, ease: 'power3.out', duration: 0.5 },
          0.38,
        )
    }, sectionRef)

    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
      resetExplodeState()
    }
  }, [tier])

  return (
    <div ref={sectionRef}>
      <section
        className="hero-explode relative flex h-svh min-h-[620px] flex-col overflow-hidden"
        aria-label="REPLAY — your high score never expires"
      >
        <CrtBackdrop />

        <div className="pointer-events-none absolute inset-0 lg:left-[26%]">
          {tier === 'high' ? <CabinetScene /> : tier === 'low' ? <CabinetCss /> : null}
        </div>

        <div
          data-hero-sprites
          className="will-animate pointer-events-none absolute left-1/2 top-[13%] -translate-x-1/2 lg:left-[63%] lg:top-[10%]"
        >
          <PixelSprites />
        </div>

        <div className="relative z-10 flex flex-1 items-end px-6 pb-24 sm:px-10 lg:items-center lg:pb-0">
          <div data-hero-copy className="will-animate max-w-xl">
            <p
              data-hero-reveal
              className="font-display text-[10px] tracking-[0.2em] text-primary sm:text-xs"
            >
              REPLAY ARCADE — EST. 1979, REOPENED FOR YOU
            </p>
            <h1
              data-hero-reveal
              ref={headlineRef}
              className="font-display mt-5 min-h-[4.5rem] text-3xl text-balance text-foreground text-glow-amber sm:min-h-[3.5rem] sm:text-4xl lg:min-h-[4rem] lg:text-5xl"
            >
              {HEADLINES[headlineIndex].line1}
              <br />
              <span className="text-primary">{HEADLINES[headlineIndex].line2}</span>
            </h1>
            <p data-hero-reveal className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
              You didn&apos;t discover arcades. You built them — quarter by quarter, Friday by Friday.
              REPLAY is the room you left, wired for the people who never actually stopped playing.
            </p>
            <div data-hero-reveal className="mt-8 flex flex-wrap items-center gap-4">
  <a
    href="#visit"
    className="group inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-[11px] tracking-wide text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,182,39,0.35)] sm:text-xs"
  >
    CLAIM YOUR TOKENS
  </a>

  <a
    href="#high-scores"
    className="inline-flex items-center gap-2 border border-primary/45 px-6 py-3 font-display text-[11px] tracking-wide text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 sm:text-xs"
  >
    SEE THE BOARD
  </a>
</div>
          </div>
        </div>

        <ul className="pointer-events-none absolute bottom-24 left-6 z-10 flex flex-col gap-6 sm:left-10 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:gap-8">
          {CALLOUTS.map((callout, i) => (
            <li key={callout.id} className="callout-label will-animate max-w-[22rem]">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[10px] tracking-[0.2em] text-accent/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[11px] tracking-[0.22em] text-accent sm:text-xs">
                  {callout.part}
                </span>
              </div>
              <span className="callout-rule mt-2 block h-px w-full bg-gradient-to-r from-accent/80 via-accent/30 to-transparent" />
              <span className="font-display mt-3 block text-sm leading-relaxed text-primary text-glow-amber sm:text-base lg:text-lg">
                {callout.text}
              </span>
            </li>
          ))}
        </ul>

        {!reduced && (
          <div data-scroll-cue className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground lg:left-auto lg:right-8 lg:translate-x-0">
            <span className="font-display text-[9px] tracking-widest">SCROLL TO OPEN THE CABINET</span>
            <ArrowDown className="h-4 w-4 animate-bounce text-primary" aria-hidden="true" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <MarqueeTicker />
        </div>
      </section>
    </div>
  )
}