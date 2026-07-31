'use client'

/**
 * ReplayMapPin
 * ---------------------------------------------------------------------------
 * A 3D "radar pin" card, same interaction language as the reference
 * PinContainer (tilts down on hover, pulsing perspective rings under the
 * card, glowing tether line) but restyled entirely onto REPLAY's tokens —
 * amber primary instead of cyan/sky, CRT scanlines, neon-frame border,
 * font-display type. Activating it opens Google Maps in a new tab.
 *
 * Accessibility notes (the reference version was hover-only, mouse-only):
 * - The whole card is a real <a>, so it's reachable and activatable by
 *   keyboard alone — no click handler required.
 * - The tilt/reveal triggers on focus-visible as well as hover, so keyboard
 *   users see the same "opening" affordance sighted mouse users do.
 * - Opening a new tab is announced via visually-hidden text + a small
 *   external-link glyph, per WCAG guidance on links that leave the page.
 * - The pulsing radar rings are pure decoration; they're skipped entirely
 *   under prefers-reduced-motion rather than just slowed down.
 */

import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, MapPin } from 'lucide-react'
import { prefersReducedMotion } from '@/lib/gsap-config'
import { cn } from '@/lib/utils'

export interface ReplayMapPinProps {
  /** e.g. "REPLAY Downtown" or "Arcades Near You" */
  title: string
  /** short line under the title — address, or "Uses your current location" */
  meta?: string
  /** a sentence or two of body copy */
  description: string
  /** full Google Maps URL — build with buildMapsSearchUrl() below */
  mapsHref: string
  /** small kicker badge like the gallery's category labels, e.g. "FLAGSHIP" */
  badge?: string
  className?: string
}

/** Builds a Google Maps search URL — no API key required. */
export function buildMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Builds a Google Maps URL centered on the visitor's live coordinates. */
export function buildMapsSearchUrlFromCoords(lat: number, lng: number, query = 'arcade') {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&center=${lat},${lng}&zoom=13`
}

export function ReplayMapPin({ title, meta, description, mapsHref, badge, className }: ReplayMapPinProps) {
  const [active, setActive] = useState(false)
  const framerReduce = useReducedMotion() ?? false
  const reduceMotion = framerReduce || prefersReducedMotion()
  const descId = useId()

  return (
    <a
      href={mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-describedby={descId}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        'group/pin relative block h-[22rem] w-full cursor-pointer',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary',
        className,
      )}
    >
      {/* card */}
      <div
        style={{
          perspective: '1000px',
          transform: 'rotateX(70deg) translateZ(0deg)',
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="tilt-card absolute left-1/2 top-1/2 flex w-[19rem] flex-col items-start justify-start overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-700"
          style={{
            transform:
              active && !reduceMotion ? 'translate(-50%,-50%) rotateX(40deg) scale(0.86)' : 'translate(-50%,-50%) rotateX(0deg) scale(1)',
          }}
        >
          <span className="neon-frame" aria-hidden="true" style={{ opacity: active ? 1 : 0 }} />

          {badge && (
            <span className="font-display mb-3 rounded-sm bg-void/70 px-2 py-1 text-[10px] tracking-[0.2em] text-accent">
              {badge}
            </span>
          )}

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <h3 className="font-display text-lg leading-tight text-foreground">{title}</h3>
          </div>

          {meta && <p className="mt-2 text-sm text-muted-foreground">{meta}</p>}

          <p className="mt-3 text-sm leading-snug text-foreground/85">{description}</p>

          <span className="font-display mt-auto flex items-center gap-2 pt-5 text-[11px] tracking-wide text-primary">
            OPEN IN MAPS
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* radar rings + tether — pure decoration, dropped under reduced motion */}
      <PinPerspective active={active} reduceMotion={reduceMotion} />

      <span id={descId} className="sr-only">
        Opens Google Maps in a new tab
      </span>
    </a>
  )
}

function PinPerspective({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const rings = reduceMotion ? [] : [0, 2, 4]

  return (
    <div
      className={cn(
        'pointer-events-none flex h-80 w-full items-center justify-center transition-opacity duration-500',
        active ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="relative -mt-7 h-full w-full flex-none">
        <div
          style={{ perspective: '1000px', transform: 'rotateX(70deg) translateZ(0)' }}
          className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
        >
          {rings.map((delay) => (
            <motion.div
              key={delay}
              initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
              animate={active ? { opacity: [0, 1, 0.5, 0], scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 6, repeat: Infinity, delay }}
              className="absolute left-1/2 top-1/2 h-44 w-44 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
              style={{ background: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
            />
          ))}
        </div>

        {/* tether line from card down to the "ground" point */}
        <div
          className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] blur-[2px] transition-all duration-500 group-hover/pin:h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--primary))' }}
        />
        <div
          className="absolute bottom-1/2 right-1/2 h-20 w-px translate-y-[14px] transition-all duration-500 group-hover/pin:h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--primary))' }}
        />
        <div
          className="absolute bottom-1/2 right-1/2 z-40 h-1 w-1 translate-x-[1.5px] translate-y-[14px] rounded-full blur-[3px]"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute bottom-1/2 right-1/2 z-40 h-0.5 w-0.5 translate-x-[0.5px] translate-y-[14px] rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}