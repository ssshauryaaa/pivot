'use client'

import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/gsap-config'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState, useCallback } from 'react'

// How many cards to keep mounted on either side of the current scroll
// position. Cards outside this window are unmounted entirely — with 30+
// games, rendering (and mouse-tracking) all of them at once is what causes
// the jank, since only a handful are ever near the visible "surf" spot.
const RENDER_WINDOW = 5

/* ─── data ───────────────────────────────────────────────────────────── */

export interface CabinetGame {
  id: number
  title: string
  genre: string
  tags: string[]
  /** Path or URL to a screenshot/photo for this cabinet. Falls back to the
   *  "INSERT COIN" placeholder screen when omitted, so you can add these
   *  one at a time. e.g. '/images/games/pac-man.jpg' */
  image?: string
}

const GAMES: CabinetGame[] = [
  { id: 1, title: 'Pac-Man', genre: 'Maze chase', tags: ['Seated play', 'No time pressure'], image: '/pacman.png' },
  { id: 2, title: 'Skee-Ball', genre: 'Roll & score', tags: ['Standing or seated', 'Big targets'], image: '/skeeball.jpeg' },
  { id: 3, title: 'Ms. Pac-Man', genre: 'Maze chase', tags: ['Seated play', 'Familiar rules'], image: '/mspacman.jpg' },
  { id: 4, title: 'Galaga', genre: 'Space shooter', tags: ['Big buttons', 'Short rounds'], image: '/galaga.png' },
  { id: 5, title: 'Centipede', genre: 'Trackball classic', tags: ['Low-effort controls', 'Seated play'], image: '/centipede.jpg' },
  { id: 6, title: 'Donkey Kong', genre: 'Platformer', tags: ['Adjustable difficulty', 'Big buttons'], image: '/donkeykong.jpg' },
  { id: 7, title: 'Frogger', genre: 'Dodge & cross', tags: ['Short rounds', 'Simple controls'], image: '/frogger.png' },
  { id: 8, title: 'Space Invaders', genre: 'Fixed shooter', tags: ['Seated play', 'Slow ramp-up'], image: '/spaceinvaders.png' },
  { id: 9, title: 'Asteroids', genre: 'Vector shooter', tags: ['Two-button controls', 'Open pacing'], image: '/asteroids.jpg' },
  { id: 10, title: 'Dig Dug', genre: 'Dig & pop', tags: ['No time pressure', 'Seated play'], image: '/digdug.png' },
  { id: 11, title: 'Q*bert', genre: 'Isometric hopper', tags: ['Short rounds', 'Bright visuals'], image: '/Qbert.png' },
  { id: 12, title: 'Tron', genre: 'Multi-game cabinet', tags: ['Big buttons', 'Standing or seated'], image: '/tron.jpg' },
  { id: 13, title: 'Joust', genre: 'Flap & bump', tags: ['Two-player friendly', 'Simple controls'], image: '/Joust.png' },
  { id: 14, title: 'Defender', genre: 'Side-scroll shooter', tags: ['Big buttons', 'Adjustable pace'], image: '/Defender.png' },
  { id: 15, title: 'Burgertime', genre: 'Platform dodge', tags: ['Seated play', 'Familiar rules'], image: '/Burgertime.png' },
  { id: 16, title: 'Tempest', genre: 'Tube shooter', tags: ['Trackball or dial', 'Low-effort controls'], image: '/Tempest.png' },
  { id: 17, title: 'Pole Position', genre: 'Racing', tags: ['Wheel control', 'Standing or seated'], image: '/Pole%20Position.jpeg' },
  { id: 18, title: 'Mario Bros.', genre: 'Platformer', tags: ['Two-player friendly', 'Short rounds'], image: '/Mario%20Bros.jpeg' },
  { id: 19, title: 'Rampage', genre: 'Smash & climb', tags: ['Big buttons', 'No time pressure'], image: '/Rampage.jpeg' },
  { id: 20, title: 'Gauntlet', genre: 'Dungeon crawl', tags: ['Four-player friendly', 'Adjustable difficulty'], image: '/Gauntlet.png' },
  { id: 21, title: 'Paperboy', genre: 'Delivery run', tags: ['Handlebar control', 'Familiar rules'], image: '/Paperboy.png' },
  { id: 22, title: 'Marble Madness', genre: 'Trackball racer', tags: ['Low-effort controls', 'Short rounds'], image: '/Marble%20Madness.jpeg' },
  { id: 23, title: 'Out Run', genre: 'Racing', tags: ['Wheel control', 'Seated play'], image: '/Out%20Run.jpeg' },
  { id: 24, title: 'Street Fighter II', genre: 'Fighting', tags: ['Big buttons', 'Two-player friendly'], image: '/Street%20Fighter%20II.jpg' },
  { id: 25, title: 'Mortal Kombat', genre: 'Fighting', tags: ['Big buttons', 'Adjustable difficulty'], image: '/Mortal%20Kombat.jpg' },
  { id: 26, title: 'NBA Jam', genre: 'Sports arcade', tags: ['Two-player friendly', 'No time pressure'], image: '/NBA%20Jam.jpeg' },
  { id: 27, title: 'Golden Tee Golf', genre: 'Trackball sports', tags: ['Low-effort controls', 'Seated play'], image: '/Golden%20Tee%20Golf.jpeg' },
  { id: 28, title: 'Big Buck Hunter', genre: 'Light gun', tags: ['Standing play', 'Simple controls'], image: '/Big%20Buck%20Hunter.jpeg' },
  { id: 29, title: 'Dance Dance Revolution', genre: 'Rhythm', tags: ['Standing play', 'Adjustable difficulty'], image: '/Dance%20Dance%20Revolution.jpeg' },
  { id: 30, title: 'Whac-A-Mole', genre: 'Reaction', tags: ['Standing play', 'Short rounds'], image: '/Whac-A-Mole.jpeg' },
  { id: 31, title: 'Pinball Wizard', genre: 'Pinball', tags: ['Standing play', 'Familiar rules'], image: '/Pinball%20Wizard.jpeg' },
  { id: 32, title: 'Time Crisis', genre: 'Light gun', tags: ['Standing play', 'Short rounds'], image: '/Time%20Crisis.jpeg' },
  { id: 33, title: 'Crazy Taxi', genre: 'Driving', tags: ['Wheel control', 'Open pacing'], image: '/Crazy%20Taxi.jpeg' },
]

export type CabinetSurferVariant = 'magnetic' | 'uplift' | 'simple'

interface CabinetSurferProps {
  games?: CabinetGame[]
  variant?: CabinetSurferVariant
  /** Scroll distance per item, in viewport-heights. Lower = faster surf. */
  vhPerItem?: number
}

/* ─── CabinetSurfer ──────────────────────────────────────────────────── */

export function CabinetSurfer({ games = GAMES, variant = 'magnetic', vhPerItem = 1.4 }: CabinetSurferProps) {
  const reduceMotion = prefersReducedMotion()
  const container = useRef<HTMLDivElement>(null)

  // Scoped to this section's own scroll range — not the window's.
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  const stepX = 260
  const stepY = -70
  const stepZ = -260

  const x = useTransform(scrollYProgress, [0, 1], [0, -(games.length - 1) * stepX])
  const y = useTransform(scrollYProgress, [0, 1], [0, -(games.length - 1) * stepY])
  const z = useTransform(scrollYProgress, [0, 1], [0, -(games.length - 1) * stepZ])

  const smoothX = useSpring(x, { mass: 0.1, stiffness: 100, damping: 20 })
  const smoothY = useSpring(y, { mass: 0.1, stiffness: 100, damping: 20 })
  const smoothZ = useSpring(z, { mass: 0.1, stiffness: 100, damping: 20 })

  const mouseX = useMotionValue(-10000)
  const mouseY = useMotionValue(-10000)

  // Only mousemove-driven variants need per-frame tracking at all.
  const tracksMouse = variant !== 'simple'
  const rafId = useRef<number | null>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!tracksMouse) return
      // Coalesce to one update per animation frame instead of one per
      // native mousemove event (which can fire 60-120+ times/sec).
      const clientX = e.clientX
      const clientY = e.clientY
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        mouseX.set(clientX)
        mouseY.set(clientY)
      })
    },
    [tracksMouse, mouseX, mouseY]
  )
  const handleMouseLeave = useCallback(() => {
    if (!tracksMouse) return
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    mouseX.set(-10000)
    mouseY.set(-10000)
  }, [tracksMouse, mouseX, mouseY])

  // Which cards are actually near the visible "surf" position right now.
  // Everything else stays unmounted — no transforms, no listeners, no paint.
  const [currentIndex, setCurrentIndex] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.round(v * (games.length - 1))
    setCurrentIndex((prev) => (prev === idx ? prev : idx))
  })

  const handleSkip = useCallback(() => {
    if (!container.current) return
    const targetY = container.current.offsetTop + container.current.offsetHeight
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }, [])

  if (reduceMotion) {
    return <CabinetSurferStaticFallback games={games} />
  }

  return (
    // This element's HEIGHT is the only scroll distance the surfer consumes —
    // once you scroll past it, the page continues normally into whatever comes next.
    <div ref={container} className="relative w-full" style={{ height: `${games.length * vhPerItem * 100}vh` }}>
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,#1b2242_0%,#12172b_45%,#0a0d1a_100%)]" />
        <div className="grid-backdrop absolute -inset-24 opacity-30" aria-hidden="true" />

        <div className="pointer-events-none absolute left-[4vw] top-[5vw] z-50">
          <p className="font-display text-xs tracking-[0.22em] text-primary">the lineup</p>
          <h1 className="font-display mt-2 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground">
            Every cabinet,
            <br />
            ready when you are
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-[4vw] top-[4vw] z-50 rounded-full border border-primary/40 bg-background/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground backdrop-blur transition hover:border-primary hover:bg-background"
        >
          skip
        </button>

        <p className="font-display absolute bottom-[4vw] right-[4vw] z-50 text-[10px] tracking-[0.2em] text-foreground/50">
          scroll to surf
        </p>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: '2000px', perspectiveOrigin: '15% 15%' }}
        >
          <motion.div
            className="relative h-0 w-0"
            style={{ x: smoothX, y: smoothY, z: smoothZ, transformStyle: 'preserve-3d' }}
          >
            {games.map((game, i) => {
              if (Math.abs(i - currentIndex) > RENDER_WINDOW) return null
              return (
                <SurferCard
                  key={game.id}
                  game={game}
                  i={i}
                  stepX={stepX}
                  stepY={stepY}
                  stepZ={stepZ}
                  mouseX={mouseX}
                  mouseY={mouseY}
                  variant={variant}
                />
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ─── SurferCard ─────────────────────────────────────────────────────── */

function SurferCard({
  game,
  i,
  stepX,
  stepY,
  stepZ,
  mouseX,
  mouseY,
  variant,
}: {
  game: CabinetGame
  i: number
  stepX: number
  stepY: number
  stepZ: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  variant: CabinetSurferVariant
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform([mouseX, mouseY], ([mx, my]) => {
    if (!ref.current || variant === 'simple') return 200
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return Math.sqrt((Number(mx) - cx) ** 2 + (Number(my) - cy) ** 2)
  })

  const targetScale = useTransform(distance, [0, 400], [1.35, 1])
  const springScale = useSpring(targetScale, { mass: 0.5, stiffness: 300, damping: 20 })

  const targetUplift = useTransform(distance, [0, 400], [-80, 0])
  const springUplift = useSpring(targetUplift, { mass: 0.5, stiffness: 300, damping: 20 })

  const transform = useTransform([springScale, springUplift], ([s, u]) => {
    let scaleValue = 1
    let upliftValue = 0
    if (variant === 'magnetic') scaleValue = Number(s)
    if (variant === 'uplift') upliftValue = Number(u)

    const baseX = i * stepX
    const baseY = i * stepY
    const baseZ = i * stepZ
    return `translate3d(${baseX}px, ${baseY + upliftValue}px, ${baseZ}px) rotateY(-42deg) scale(${scaleValue})`
  })

  return (
    <motion.div
      ref={ref}
      className="tilt-card group absolute h-[340px] w-[260px] overflow-hidden rounded-[var(--radius-lg)]"
      style={{
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        background: 'color-mix(in oklab, var(--card) 100%, white 4%)',
        border: '1px solid color-mix(in oklab, var(--primary) 22%, var(--border))',
        boxShadow: '0 2px 5px rgba(0,0,0,0.4), 0 20px 44px -14px rgba(0,0,0,0.75)',
      }}
    >
      <span className="neon-frame" aria-hidden="true" />

      <div className="bg-primary px-4 py-3">
        <p className="font-display text-sm font-bold tracking-[0.06em] text-primary-foreground">{game.title}</p>
        <p className="font-display text-[9px] tracking-[0.2em] text-primary-foreground/70">{game.genre}</p>
      </div>

      <div
        className="relative flex h-[190px] items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(120% 140% at 50% 0%, #173a3a 0%, #0e2624 65%, #0a0d1a 100%)' }}
      >
        {game.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.image}
              alt={`${game.title} cabinet`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              draggable={false}
            />
            {/* keep a faint scanline pass over real photos too, for consistency */}
            <div className="scanlines absolute inset-0 opacity-25" aria-hidden="true" />
          </>
        ) : (
          <>
            <div className="scanlines absolute inset-0 opacity-60" aria-hidden="true" />
            <span className="font-display text-glow-amber animate-flicker text-[11px] tracking-[0.3em] text-primary">
              INSERT COIN
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="font-display rounded-sm px-2 py-1 text-[9px] tracking-[0.06em] text-foreground/80"
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

/* ─── Reduced-motion fallback ────────────────────────────────────────── */

function CabinetSurferStaticFallback({ games }: { games: CabinetGame[] }) {
  return (
    <section className="w-full px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="font-display text-xs tracking-[0.22em] text-primary">the lineup</p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Every cabinet, ready when you are
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="overflow-hidden rounded-[var(--radius-lg)]"
              style={{
                background: 'color-mix(in oklab, var(--card) 100%, white 4%)',
                border: '1px solid color-mix(in oklab, var(--primary) 22%, var(--border))',
              }}
            >
              <div className="bg-primary px-4 py-3">
                <p className="font-display text-sm font-bold text-primary-foreground">{game.title}</p>
                <p className="font-display text-[9px] tracking-[0.2em] text-primary-foreground/70">{game.genre}</p>
              </div>
              {game.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.image}
                  alt={`${game.title} cabinet`}
                  className="h-[160px] w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-wrap gap-1.5 px-4 py-3">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-display rounded-sm px-2 py-1 text-[9px] text-foreground/80"
                    style={{ border: '1px solid var(--border)', background: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}