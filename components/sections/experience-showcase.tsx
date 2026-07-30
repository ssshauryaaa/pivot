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
    description: 'Larger buttons. Adjustable joystick tension. No fine-motor guessing.',
    colors: [[255, 62, 154], [255, 182, 39]], // accent magenta -> amber
  },
  {
    title: 'Bigger, Brighter Screens',
    description: 'High-contrast displays with adjustable brightness at every cabinet.',
    colors: [[255, 182, 39], [244, 239, 230]], // amber -> foreground
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
    <section ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32" aria-label="The reimagined arcade experience">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-20" />

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

      <div
        data-showcase-reveal
        className="relative z-10 mx-auto mt-16 flex max-w-5xl flex-col items-center justify-center gap-6 px-6 lg:flex-row"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
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
      className="group/canvas-card relative flex h-[26rem] w-full max-w-sm items-center justify-center border border-border bg-card p-6"
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
        <h3 className="font-display text-lg text-foreground transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:text-primary group-hover/canvas-card:text-glow-amber">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground opacity-0 transition duration-200 group-hover/canvas-card:opacity-100">
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