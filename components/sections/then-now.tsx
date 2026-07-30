'use client'

import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/gsap-config'
import {
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  motion,
  type MotionValue,
} from 'framer-motion'
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

/* ─── data ───────────────────────────────────────────────────────────── */

export interface ThenNowRow {
  label: string
  then: { heading: string; body: string }
  now: { heading: string; body: string }
}

const ROWS: ThenNowRow[] = [
  {
    label: 'Price',
    then: {
      heading: 'Two dollars, thirty minutes, gone.',
      body: 'One quarter bought you a few lives and a countdown. Blink and it was over — back in line for another turn.',
    },
    now: {
      heading: 'Two dollars, the whole afternoon.',
      body: 'Same coin, no clock. Play a round, tell a story, play another. Nobody is rushing you off the cabinet.',
    },
  },
  {
    label: 'Pace',
    then: {
      heading: 'Score attack, quarters flying.',
      body: 'Every second was a countdown to game over. The whole point was speed — react fast or lose your turn.',
    },
    now: {
      heading: 'No rush. No high score to chase.',
      body: 'Play at your own tempo. There is no leaderboard breathing down your neck — just the joy of the game itself.',
    },
  },
  {
    label: 'Company',
    then: {
      heading: 'Whoever was next in line.',
      body: 'Strangers, mostly. You traded a nod and a high five, then they moved on to the next machine.',
    },
    now: {
      heading: 'The same faces, every Tuesday.',
      body: 'A regular crowd that knows your name and your favorite cabinet. Come for the games, stay for the company.',
    },
  },
  {
    label: 'Seating',
    then: {
      heading: 'Standing room, always.',
      body: 'Arcades were built for teenagers with nowhere better to be. Nobody thought about tired legs or bad knees.',
    },
    now: {
      heading: "A chair if you want it. Most nights, you don't.",
      body: 'Comfortable seating at every station, because a good game session should never come at the cost of comfort.',
    },
  },
  {
    label: 'Hours',
    then: {
      heading: 'After school, till your ride showed up.',
      body: 'A narrow window between the last bell and dinner — arcades ran on someone else\'s schedule, not yours.',
    },
    now: {
      heading: 'Open before lunch. Easy on the knees.',
      body: 'Daytime hours built around your routine, with good lighting and zero incentive to fight the evening crowds.',
    },
  },
  {
    label: 'Accessibility',
    then: {
      heading: 'Elbow room only if you got there first.',
      body: 'Cramped aisles, dim lighting, and cabinets packed shoulder to shoulder — great for teenagers, tough on everyone else.',
    },
    now: {
      heading: 'Wide aisles, good lighting, a stool at every cabinet.',
      body: 'Designed for comfort first: clear sightlines, easy navigation, and thoughtful details at every turn.',
    },
  },
]

const TILT_PATTERN = [-1.1, 0.8, -0.6, 1.2, -0.85, 0.5]
const MAX_POINTER_TILT = 6 // degrees

/* ─── StackCard ──────────────────────────────────────────────────────── */

function StackCard({
  row,
  index,
  total,
  scrollYProgress,
  reduceMotion,
}: {
  row: ThenNowRow
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  reduceMotion: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const start = total > 1 ? index / (total + 1) : 0
  const restingScale = Math.max(0.62, 1 - (total - index - 1) * 0.07)
  const scale = useTransform(scrollYProgress, [start, 1], reduceMotion ? [1, 1] : [1, restingScale])

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    rotateX.set((0.5 - py) * MAX_POINTER_TILT)
    rotateY.set((px - 0.5) * MAX_POINTER_TILT)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
  }

  const handlePointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <section className="tilt-stage sticky top-0 grid h-screen place-items-center">
      <motion.div
        ref={cardRef}
        className="tilt-card relative m-0 w-[min(96vw,1100px)] origin-top overflow-hidden rounded-[var(--radius-lg)] bg-primary text-primary-foreground"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          scale,
          rotate: reduceMotion ? 0 : TILT_PATTERN[index % TILT_PATTERN.length],
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          top: `calc(-6vh + ${140 + index * 20}px)`,
          border: '1px solid color-mix(in oklab, var(--primary-foreground) 18%, transparent)',
          boxShadow:
            '0 2px 5px rgba(0,0,0,0.35), 0 24px 56px -18px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        <span className="neon-frame" aria-hidden="true" />
        <span className="tilt-glare pointer-events-none absolute inset-0" aria-hidden="true" />

        <p className="font-display px-8 pt-8 text-sm tracking-[0.22em] text-primary-foreground/65 sm:px-14 sm:text-base">
          {row.label}
        </p>

        <div className="relative grid grid-cols-1 sm:grid-cols-2">
          {/* center divider — hidden on mobile where columns stack */}
          <div
            className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 sm:block"
            style={{
              background:
                'linear-gradient(to bottom, transparent, color-mix(in oklab, var(--primary-foreground) 45%, transparent) 12%, color-mix(in oklab, var(--primary-foreground) 45%, transparent) 88%, transparent)',
            }}
            aria-hidden="true"
          />

          <div className="px-8 py-10 sm:px-14 sm:py-16">
            <p className="font-display text-sm tracking-[0.2em] text-primary-foreground/55">THEN</p>
            <h3 className="font-display mt-3 text-2xl font-bold leading-tight sm:text-3xl">{row.then.heading}</h3>
            <p className="mt-4 text-lg leading-snug text-primary-foreground/85 sm:text-xl">{row.then.body}</p>
          </div>
          <div
            className="relative overflow-hidden px-8 py-10 sm:px-14 sm:py-16"
            style={{ background: 'color-mix(in oklab, var(--primary-foreground) 10%, transparent)' }}
          >
            <p className="font-display animate-flicker text-glow-amber text-sm tracking-[0.2em] text-primary-foreground">
              NOW
            </p>
            <h3 className="font-display mt-3 text-2xl font-bold leading-tight sm:text-3xl">{row.now.heading}</h3>
            <p className="mt-4 text-lg leading-snug text-primary-foreground sm:text-xl">{row.now.body}</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── ThenNowStickyStack ─────────────────────────────────────────────── */

export function ThenNowStickyStack({
  rows = ROWS,
  hint = 'scroll to compare',
  className,
}: {
  rows?: ThenNowRow[]
  hint?: string
  className?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const framerReduce = useReducedMotion() ?? false
  const reduceMotion = framerReduce || prefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  return (
    <main
      ref={container}
      className={cn('relative flex w-full flex-col items-center pb-[30vh] pt-[20vh]', className)}
    >
      <div className="absolute left-1/2 top-[6%] flex -translate-x-1/2 flex-col items-center gap-3">
        <p className="font-display text-[10px] tracking-[0.2em] text-foreground/45">{hint}</p>
        <span
          className="h-12 w-px"
          style={{
            background: 'linear-gradient(to bottom, color-mix(in oklab, var(--primary) 55%, transparent), transparent)',
          }}
        />
      </div>

      {rows.map((row, index) => (
        <StackCard
          key={row.label}
          row={row}
          index={index}
          total={rows.length}
          scrollYProgress={scrollYProgress}
          reduceMotion={reduceMotion}
        />
      ))}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .tilt-stage {
            position: static;
            height: auto;
            padding-block: 1rem;
          }
        }
      `}</style>
    </main>
  )
}