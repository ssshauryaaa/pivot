// components/sections/experience-showcase.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CanvasRevealEffect } from '@/components/ui/canvas-reveal-effect'
import { DURATION, EASE, prefersReducedMotion } from '@/lib/gsap-config'

gsap.registerPlugin(ScrollTrigger)

type Feature = {
  title: string
  description: string
  colors: number[][]
}

const FEATURES: Feature[] = [
  {
    title: 'Seated Stations',
    description: 'Play standing or seated — every cabinet, every station.',
    colors: [[255, 182, 39]], // primary amber
  },
  {
    title: 'Accessible Controls',
    description: 'Larger buttons, adjustable joystick tension — no fine-motor guessing.',
    colors: [[255, 62, 154], [255, 182, 39]], // accent magenta -> amber
  },
  {
    title: 'Bigger, Brighter Screens',
    description: 'High-contrast displays, adjustable brightness, built for every set of eyes.',
    colors: [[255, 182, 39], [244, 239, 230]], // amber -> foreground
  },
  {
    title: 'Volume & Pace Control',
    description: 'Adjustable sound levels and slower game modes, no rush, no overwhelm.',
    colors: [[255, 62, 154], [244, 239, 230]], // accent magenta -> foreground
  },
  {
    title: 'Made for Company',
    description: 'Wide aisles, shared seating, side-by-side cabinets — built for playing together.',
    colors: [[244, 239, 230], [255, 182, 39]], // foreground -> amber
  },
]

export function ExperienceShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-showcase-reveal]',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="accessibility" ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32" aria-label="The reimagined arcade experience">
      <ExperienceBackdrop />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <p data-showcase-reveal className="font-display text-[10px] tracking-[0.2em] text-accent sm:text-xs">
          THE CABINET, REBUILT
        </p>
        <h2 data-showcase-reveal className="font-display mt-4 text-3xl text-balance text-foreground text-glow-amber sm:text-4xl">
          Same Games. <span className="text-primary">Zero Barriers.</span>
        </h2>
        <p data-showcase-reveal className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Hover a cabinet to see what changed.
        </p>
      </div>

      <div data-showcase-reveal className="relative z-10 mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 justify-items-center">
          {FEATURES.slice(3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/canvas-card relative flex min-h-[20rem] w-full max-w-[22rem] items-center justify-center border border-border bg-card p-5 sm:p-6"
    >
      <Corner className="absolute -top-3 -left-3 h-6 w-6 text-primary/70" />
      <Corner className="absolute -bottom-3 -left-3 h-6 w-6 text-primary/70" />
      <Corner className="absolute -top-3 -right-3 h-6 w-6 text-primary/70" />
      <Corner className="absolute -bottom-3 -right-3 h-6 w-6 text-primary/70" />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full"
          >
            <CanvasRevealEffect animationSpeed={4} colors={feature.colors} dotSize={2} containerClassName="bg-void" />
            <div className="absolute inset-0 [mask-image:radial-gradient(380px_at_center,white,transparent)] bg-void/70" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 text-center">
        <h3 className="font-display text-lg sm:text-xl text-foreground transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:text-primary group-hover/canvas-card:text-glow-amber">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-full text-pretty text-sm leading-relaxed text-muted-foreground opacity-0 transition duration-200 group-hover/canvas-card:opacity-100">
          {feature.description}
        </p>
      </div>
    </div>
  )
}

function Corner({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  )
}

function ExperienceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,182,39,0.15),transparent_26%),radial-gradient(circle_at_85%_12%,rgba(255,62,154,0.09),transparent_24%)]" />
      <div className="absolute inset-0 grid-backdrop opacity-14" />

      <svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <circle cx="160" cy="120" r="80" fill="rgba(255,182,39,0.07)" />
        <circle cx="960" cy="100" r="56" fill="rgba(255,62,154,0.06)" />

        <path
          d="M 48 420 C 220 360, 360 520, 560 430 S 820 260, 1080 340"
          fill="none"
          stroke="rgba(255,182,39,0.18)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 18"
        />

        <g className="animate-sprite-bob" style={{ animationDelay: '0s' }}>
          <rect x="260" y="334" width="16" height="16" rx="3" fill="rgba(255,62,154,0.22)" />
          <rect x="292" y="306" width="12" height="12" rx="2" fill="rgba(255,182,39,0.2)" />
        </g>

        <g className="animate-sprite-bob" style={{ animationDelay: '0.7s' }}>
          <rect x="720" y="84" width="18" height="18" rx="4" fill="rgba(255,182,39,0.24)" />
          <rect x="748" y="108" width="14" height="14" rx="3" fill="rgba(255,62,154,0.18)" />
        </g>

        <g className="animate-sprite-bob" style={{ animationDelay: '1.4s' }}>
          <rect x="520" y="460" width="20" height="20" rx="4" fill="rgba(255,182,39,0.16)" />
          <rect x="546" y="432" width="14" height="14" rx="3" fill="rgba(255,62,154,0.16)" />
        </g>
      </svg>
    </div>
  )
}