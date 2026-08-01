// components/sections/testimonials.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  DraggableCardBody,
  DraggableCardContainer,
} from '@/components/ui/draggable-card'
import { DURATION, EASE, prefersReducedMotion } from '@/lib/gsap-config'

gsap.registerPlugin(ScrollTrigger)

type Testimonial = {
  name: string
  age: string
  quote: string
  image: string
  className: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Margaret H.',
    age: '71',
    quote:
      '"I grew up in a neighborhood arcade, and this place brought all of that right back. The sound, the smell, even the ticket counter made me grin."',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-4 left-[4%] rotate-[-6deg]',
  },
  {
    name: 'Robert C.',
    age: '68',
    quote:
      '"I came with my grandson to show him the old games. He ended up wanting to stay for another hour after I beat him at Centipede."',
    image:
      'https://images.unsplash.com/photo-1583468982228-19f19164aee2?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-36 left-[20%] rotate-[5deg]',
  },
  {
    name: 'Diane P.',
    age: '74',
    quote:
      '"I haven\'t played pinball since my kids were little. The chairs were comfy and I actually played through three games without stopping."',
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-2 left-[38%] rotate-[3deg]',
  },
  {
    name: 'Walter B.',
    age: '77',
    quote:
      '"Senior Hour is exactly what it says: good light, quieter machines, and staff who know when to check in and when to leave you alone."',
    image:
      'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-40 left-[54%] rotate-[-4deg]',
  },
  {
    name: 'Evelyn S.',
    age: '69',
    quote:
      '"I used to bowl on the weekends. This felt like that, only with neon and skee-ball. I laughed more than I expected to."',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-8 left-[68%] rotate-[6deg]',
  },
  {
    name: 'Harold T.',
    age: '80',
    quote:
      '"Nobody treated me like a problem. Just another player trying to hit the high score. That meant a lot."',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-44 left-[80%] rotate-[-3deg]',
  },
  {
    name: 'Patricia L.',
    age: '72',
    quote:
      '"I brought the bridge group for a Tuesday afternoon. We stayed longer than planned and still had energy to grab pizza after."',
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-16 left-[12%] rotate-[4deg]',
  },
  {
    name: 'Gerald M.',
    age: '75',
    quote:
      '"There was a Pac-Man bracket on Saturday. I got second place and I already told the guy I\'m coming back to take first."',
    image:
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=1200&auto=format&fit=crop',
    className: 'absolute top-52 left-[42%] rotate-[7deg]',
  },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-testimonial-reveal]',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
      aria-label="Player testimonials"
    >
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <p
          data-testimonial-reveal
          className="font-display text-[10px] tracking-[0.2em] text-accent sm:text-xs"
        >
          PLAYER TESTIMONIALS
        </p>
        <p
          data-testimonial-reveal
          className="mt-4 text-pretty leading-relaxed text-muted-foreground"
        >
          Drag the cards apart. See what regulars are saying underneath.
        </p>
      </div>

      <DraggableCardContainer
        className={`relative mx-auto mt-16 flex ${
          reduced ? 'min-h-[460px]' : 'min-h-[600px]'
        } w-full max-w-6xl items-center justify-center`}
      >
        {TESTIMONIALS.map((t) => (
          <DraggableCardBody
            key={t.name}
            className={`${t.className} group !bg-card !shadow-[0_10px_40px_rgba(0,0,0,0.45)] border border-border`}
          >
            <div className="neon-frame" />
            <img
              src={t.image}
              alt=""
              aria-hidden="true"
              className="pointer-events-none relative z-10 h-40 w-full rounded-sm object-cover grayscale-[15%]"
            />
            <p className="relative z-10 mt-5 text-pretty text-sm leading-relaxed text-foreground">
              {t.quote}
            </p>
            <div className="relative z-10 mt-4 flex items-baseline gap-2 border-t border-border pt-3">
              <span className="font-display text-sm text-primary text-glow-amber">
                {t.name}
              </span>
              <span className="text-xs text-muted-foreground">Age {t.age}</span>
            </div>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>

      <div className="relative z-10 mx-auto mt-4 max-w-2xl px-6 text-center">
        <h2
          data-testimonial-reveal
          className="font-display text-3xl text-balance text-foreground text-glow-amber sm:text-4xl"
        >
          High Scores in the <span className="text-primary">Social Department.</span>
        </h2>
      </div>
    </section>
  )
}