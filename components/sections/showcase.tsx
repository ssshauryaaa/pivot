'use client'

import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/gsap-config'
import { useMotionValue, useSpring, motion } from 'framer-motion'
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

/* ─── data ───────────────────────────────────────────────────────────── */

export interface CabinetGame {
  title: string
  genre: string
  description: string
  tags: string[]
}

const GAMES: CabinetGame[] = [
  {
    title: 'Pac-Man',
    genre: 'Maze chase',
    description: 'Guide Pac-Man through the maze at whatever pace feels right. No penalty for taking your time.',
    tags: ['Seated play', 'No time pressure', 'Simple controls'],
  },
  {
    title: 'Skee-Ball',
    genre: 'Roll & score',
    description: 'A gentle physical game with a big, forgiving lane. Great for a light warm-up round.',
    tags: ['Standing or seated', 'Low reach', 'Big targets'],
  },
  {
    title: 'Ms. Pac-Man',
    genre: 'Maze chase',
    description: "Pac-Man's sequel, same easy pace. A favorite for folks who grew up with the original.",
    tags: ['Seated play', 'No time pressure', 'Familiar rules'],
  },
  {
    title: 'Galaga',
    genre: 'Space shooter',
    description: 'One big fire button and a joystick. Slower difficulty curve than you remember.',
    tags: ['Big buttons', 'Adjustable difficulty', 'Short rounds'],
  },
  {
    title: 'Centipede',
    genre: 'Trackball classic',
    description: 'Played with a trackball instead of a joystick — easy on the wrist, satisfying to spin.',
    tags: ['Low-effort controls', 'Seated play', 'No time pressure'],
  },
  {
    title: 'Donkey Kong',
    genre: 'Platformer',
    description: 'Climb, jump, rescue. We keep this cabinet on its gentlest difficulty setting by default.',
    tags: ['Adjustable difficulty', 'Big buttons', 'Short rounds'],
  },
]

const MAX_TILT = 4 // degrees — subtler than the hero stack, this is a dense grid

/* ─── CabinetCard ────────────────────────────────────────────────────── */

function CabinetCard({ game, reduceMotion }: { game: CabinetGame; reduceMotion: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 240, damping: 24 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 240, damping: 24 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    rotateX.set((0.5 - py) * MAX_TILT)
    rotateY.set((px - 0.5) * MAX_TILT)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
  }

  const handlePointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className="tilt-card relative flex flex-col overflow-hidden rounded-[var(--radius-lg)]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        background: 'color-mix(in oklab, var(--card) 100%, white 4%)',
        border: '1px solid color-mix(in oklab, var(--primary) 22%, var(--border))',
        boxShadow: '0 2px 5px rgba(0,0,0,0.35), 0 20px 44px -16px rgba(0,0,0,0.7)',
      }}
    >
      <span className="neon-frame" aria-hidden="true" />
      <span className="tilt-glare pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* marquee header */}
      <div className="relative bg-primary px-5 py-3">
        <p className="font-display text-sm font-bold tracking-[0.08em] text-primary-foreground">{game.title}</p>
        <p className="font-display text-[10px] tracking-[0.2em] text-primary-foreground/70">{game.genre}</p>
      </div>

      {/* screen */}
      <div
        className="relative flex min-h-[7rem] items-center justify-center overflow-hidden px-5 py-6"
        style={{
          background: 'radial-gradient(120% 140% at 50% 0%, #173a3a 0%, #0e2624 65%, #0a0d1a 100%)',
        }}
      >
        <div className="scanlines absolute inset-0 opacity-60" aria-hidden="true" />
        <p className="tn-copy relative text-center text-base leading-snug text-foreground/90">
          {game.description}
        </p>
      </div>

      {/* accessibility tags */}
      <div className="flex flex-wrap gap-2 px-5 py-4">
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="font-display rounded-sm px-2.5 py-1 text-[10px] tracking-[0.08em] text-foreground/80"
            style={{
              border: '1px solid color-mix(in oklab, var(--primary) 45%, var(--border))',
              background: 'color-mix(in oklab, var(--primary) 10%, transparent)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── CabinetShowcase ────────────────────────────────────────────────── */

export function CabinetShowcase({
  games = GAMES,
  eyebrow = 'the lineup',
  heading = 'Every cabinet, ready when you are',
  className,
}: {
  games?: CabinetGame[]
  eyebrow?: string
  heading?: string
  className?: string
}) {
  const reduceMotion = prefersReducedMotion()

  return (
    <section className={cn('tilt-stage relative w-full px-6 py-24 sm:px-10', className)}>
      <div className="mx-auto max-w-6xl">
        <p className="font-display text-xs tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {heading}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <CabinetCard key={game.title} game={game} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>
    </section>
  )
}