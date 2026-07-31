'use client'

/**
 * MediaGalleryCarousel
 * ---------------------------------------------------------------------------
 * A 3D "cabinet screen" carousel for showcasing campaign media — posters,
 * ads, reel stills, whatever. Built on the same tokens/utilities already
 * defined in globals.css (--primary amber, --accent magenta, .tilt-card,
 * .neon-frame, .tilt-glare, .scanlines, .animate-flicker) so it drops
 * straight into the REPLAY design system without new CSS.
 *
 * Accessibility notes:
 * - role="region" + aria-roledescription="carousel", live region announces
 *   the active slide for screen readers.
 * - Full keyboard support: ArrowLeft/ArrowRight to navigate, Home/End to
 *   jump, Space/Enter on the play/pause toggle.
 * - Autoplay (opt-in) always ships with a visible pause control and pauses
 *   on hover/focus — never auto-advances silently.
 * - Pointer-tilt parallax and slide transitions are skipped under
 *   prefers-reduced-motion.
 * - Every control meets the 44×44px touch target minimum.
 */

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { prefersReducedMotion } from '@/lib/gsap-config'
import { cn } from '@/lib/utils'

export interface GalleryMediaItem {
  src: string
  alt: string
  title: string
  /** Short kicker shown like the hero's part labels, e.g. "POSTER", "REEL", "AD" */
  category: string
  href?: string
  ctaLabel?: string
}

const MAX_POINTER_TILT = 5 // degrees — subtler than the hero cards, this is a gallery not a hero

export function MediaGalleryCarousel({
  items,
  autoPlay = false,
  intervalMs = 6000,
  /** CSS aspect-ratio value, e.g. "3 / 4". Drives both the reserved layout
   *  box and the card size — keep this in sync, don't size cards separately. */
  aspect = '3 / 4',
  className,
}: {
  items: GalleryMediaItem[]
  autoPlay?: boolean
  intervalMs?: number
  aspect?: string
  className?: string
}) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const framerReduce = useReducedMotion() ?? false
  const reduceMotion = framerReduce || prefersReducedMotion()
  const total = items.length
  const headingId = useId()
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const trackWrapRef = useRef<HTMLDivElement>(null)

  const goTo = (index: number) => {
    const next = ((index % total) + total) % total
    setCurrent(next)
  }
  const goPrev = () => goTo(current - 1)
  const goNext = () => goTo(current + 1)

  // autoplay, paused on hover/focus/reduced-motion, resumes on blur/mouseleave
  useEffect(() => {
    if (!playing || reduceMotion || total <= 1) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), intervalMs)
    return () => clearInterval(id)
  }, [playing, reduceMotion, total, intervalMs])

  // announce slide changes to assistive tech
  useEffect(() => {
    if (!liveRegionRef.current) return
    liveRegionRef.current.textContent = `Slide ${current + 1} of ${total}: ${items[current]?.title}`
  }, [current, items, total])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    } else if (event.key === 'Home') {
      event.preventDefault()
      goTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goTo(total - 1)
    }
  }

  return (
    <section
      className={cn('relative w-full', className)}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => autoPlay && setPlaying(true)}
      onFocus={() => setPlaying(false)}
      onBlur={(event) => {
        if (autoPlay && !event.currentTarget.contains(event.relatedTarget as Node)) {
          setPlaying(true)
        }
      }}
    >
      <h2 id={headingId} className="sr-only">
        Campaign media gallery
      </h2>

      {/* visually-hidden live region for slide announcements */}
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />

      <div
        ref={trackWrapRef}
        className="tilt-stage relative"
        tabIndex={0}
        role="group"
        aria-label={`Slide ${current + 1} of ${total}`}
        onKeyDown={handleKeyDown}
      >
        {/* This box is what reserves real document height — cards below are
            absolutely positioned inside it (inset-0), which by itself never
            contributes height to a parent. Without this, the whole section
            collapses to 0px and everything after it renders on top of it. */}
        <div
          className="relative mx-auto w-[min(78vw,420px)] overflow-visible"
          style={{ aspectRatio: aspect }}
        >
          {items.map((item, index) => (
            <GalleryCard
              key={item.src + index}
              item={item}
              index={index}
              current={current}
              total={total}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="relative z-20 mt-8 flex items-center justify-center gap-4">
        <NavButton direction="previous" onClick={goPrev} />

        {autoPlay && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause automatic slideshow' : 'Play automatic slideshow'}
            aria-pressed={playing}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/45 text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10"
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}

        <NavButton direction="next" onClick={goNext} />
      </div>

      {/* dot / index strip */}
      <ul className="relative z-20 mt-5 flex flex-wrap items-center justify-center gap-3" role="tablist" aria-label="Choose slide">
        {items.map((item, index) => (
          <li key={item.src + index}>
            <button
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Go to slide ${index + 1}: ${item.title}`}
              onClick={() => goTo(index)}
              className={cn(
                'flex h-11 min-w-11 items-center justify-center rounded-full border px-3 font-display text-[10px] tracking-[0.15em] transition-all duration-200 ease-out',
                index === current
                  ? 'border-primary bg-primary/15 text-primary text-glow-amber'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ─── individual card ────────────────────────────────────────────────── */

function GalleryCard({
  item,
  index,
  current,
  total,
  reduceMotion,
}: {
  item: GalleryMediaItem
  index: number
  current: number
  total: number
  reduceMotion: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isActive = index === current

  // signed distance from active slide, wrapped for a short carousel
  let offset = index - current
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !isActive) return
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

  // hide slides far outside view instead of rendering an ever-widening row
  if (Math.abs(offset) > 2) {
    return null
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'tilt-card absolute inset-0 overflow-hidden rounded-[var(--radius-lg)] bg-card',
        isActive ? 'z-10' : 'z-0',
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden={!isActive}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        border: '1px solid color-mix(in oklab, var(--foreground) 12%, transparent)',
        boxShadow: isActive
          ? '0 2px 5px rgba(0,0,0,0.35), 0 24px 56px -18px rgba(0,0,0,0.7)'
          : '0 4px 18px -6px rgba(0,0,0,0.5)',
      }}
      animate={
        reduceMotion
          ? { x: `${offset * 92}%`, scale: isActive ? 1 : 0.86, opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.55 }
          : {
              x: `${offset * 92}%`,
              scale: isActive ? 1 : 0.86,
              rotate: isActive ? 0 : offset * 4,
              opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.55,
            }
      }
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <span className="neon-frame" aria-hidden="true" />
      {isActive && <span className="tilt-glare pointer-events-none absolute inset-0" aria-hidden="true" />}

      <div className="scanlines relative h-[62%] w-full overflow-hidden">
        <img
          src={item.src}
          alt={item.alt}
          className="h-full w-full object-cover"
          loading={isActive ? 'eager' : 'lazy'}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span className="font-display absolute left-3 top-3 rounded-sm bg-void/70 px-2 py-1 text-[10px] tracking-[0.2em] text-accent">
          {item.category}
        </span>
      </div>

      <div className="relative flex h-[38%] flex-col justify-between p-5">
        <h3 className="font-display text-lg leading-tight text-foreground sm:text-xl">{item.title}</h3>
        {item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="font-display mt-3 inline-flex w-fit items-center gap-2 border border-primary/45 px-4 py-2 text-[10px] tracking-wide text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10"
            tabIndex={isActive ? 0 : -1}
          >
            {item.ctaLabel ?? 'VIEW FULL PIECE'}
          </a>
        )}
      </div>
    </motion.div>
  )
}

/* ─── nav buttons ────────────────────────────────────────────────────── */

function NavButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'previous' ? 'Previous slide' : 'Next slide'}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/45 text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-primary"
    >
      {direction === 'previous' ? (
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      ) : (
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}