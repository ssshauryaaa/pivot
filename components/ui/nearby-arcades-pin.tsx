'use client'

/**
 * NearbyArcadesPin
 * ---------------------------------------------------------------------------
 * One big "you are here" pin that opens Google Maps centered on the
 * visitor's live location (falls back to a generic search if geolocation
 * is denied/unavailable).
 *
 * v3 layout note: the first version borrowed the original Aceternity
 * PinContainer's "ground plane" trick — a wrapper with
 * `perspective + rotateX(70deg)` holding a child re-centered with a nested
 * `translate(-50%,-50%)`. That combo was hand-tuned for their exact 40rem
 * container and 20rem card; at our larger size the flattened 3D projection
 * visibly pushed the card off-center. Replaced with plain flexbox centering
 * — the card is a normal flow child now, so it's centered the ordinary way
 * and can't drift regardless of size. The tilt on hover is a simple
 * transform-origin: bottom rotateX, which reads as the same "tipping
 * forward" effect without the projection math.
 */

import { useId, useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function buildMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function buildMapsSearchUrlFromCoords(lat: number, lng: number, query = 'arcade') {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&center=${lat},${lng}&zoom=13`
}

export function NearbyArcadesPin({ className }: { className?: string }) {
  const [href, setHref] = useState(() => buildMapsSearchUrl('arcade near me'))
  const [status, setStatus] = useState<'idle' | 'locating' | 'located' | 'denied'>('idle')
  const descId = useId()

  const handleLocate = () => {
    if (status !== 'idle' || !('geolocation' in navigator)) return
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHref(buildMapsSearchUrlFromCoords(position.coords.latitude, position.coords.longitude, 'arcade'))
        setStatus('located')
      },
      () => setStatus('denied'),
      { timeout: 5000 },
    )
  }

  const meta =
    status === 'locating'
      ? 'Finding your location…'
      : status === 'located'
        ? 'Centered on your location'
        : status === 'denied'
          ? 'Showing a general search — location wasn\'t shared'
          : 'Uses your current location'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-describedby={descId}
      onMouseEnter={handleLocate}
      onFocus={handleLocate}
      className={cn(
        'group mx-auto flex w-full max-w-xl flex-col items-center justify-center py-8 [perspective:1200px]',
        'cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary',
        className,
      )}
    >
      {/* card — a normal flow child, centered by the parent flex column.
          Tilts forward from its bottom edge on hover/focus, no absolute
          positioning or nested transform math involved. */}
      <div
        className={cn(
          'tilt-card relative w-full origin-bottom overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card p-8',
          'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover:[transform:rotateX(14deg)_scale(0.96)] group-focus-visible:[transform:rotateX(14deg)_scale(0.96)]',
        )}
        style={{
          boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 30px 70px -20px rgba(0,0,0,0.6)',
        }}
      >
        <span
          className="neon-frame opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />

        <span className="font-display rounded-sm bg-void/70 px-2.5 py-1 text-[11px] tracking-[0.2em] text-accent">
          NEARBY
        </span>

        <div className="mt-4 flex items-start gap-3">
          <MapPin className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
          <h3 className="font-display text-2xl leading-tight text-foreground text-glow-amber sm:text-3xl">
            Arcades Near You
          </h3>
        </div>

        <p className="mt-3 font-display text-sm tracking-wide text-primary/90">{meta}</p>

        <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
          Not near REPLAY downtown? Pull up every arcade Google knows about close to where you're
          standing right now — old cabinets and new ones alike.
        </p>

        <span className="font-display mt-6 flex items-center gap-2 text-sm tracking-wide text-primary">
          OPEN IN MAPS
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <PinMarker />

      <span id={descId} className="sr-only">
        Opens Google Maps in a new tab, centered on your location if you allow it
      </span>
    </a>
  )
}

/* ─── the pin itself — a normal flex sibling directly under the card ───── */

function PinMarker() {
  const ringDelays = ['0s', '0.6s', '1.2s']

  return (
    <div className="pointer-events-none relative flex flex-col items-center">
      {/* radar rings — invisible at rest, ping outward on hover/focus */}
      <div className="relative flex h-0 w-0 items-center justify-center">
        {ringDelays.map((delay) => (
          <span
            key={delay}
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-500 group-hover:animate-ping group-hover:opacity-100 group-focus-visible:animate-ping group-focus-visible:opacity-100"
            style={{
              background: 'color-mix(in oklab, var(--primary) 16%, transparent)',
              animationDelay: delay,
            }}
          />
        ))}
      </div>

      {/* tether line — visible at rest, lengthens on hover */}
      <div
        className={cn(
          'w-[3px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'h-10 group-hover:h-16 group-focus-visible:h-16',
        )}
        style={{
          background: 'linear-gradient(to bottom, color-mix(in oklab, var(--primary) 70%, transparent), transparent)',
        }}
      />

      {/* beacon dot — idle pulse always running, big enough to read as an actual pin */}
      <span className="relative -mt-1 flex h-5 w-5 items-center justify-center">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full"
          style={{ background: 'color-mix(in oklab, var(--primary) 55%, transparent)' }}
          aria-hidden="true"
        />
        <span
          className="relative h-3 w-3 rounded-full transition-transform duration-500 group-hover:scale-125 group-focus-visible:scale-125"
          style={{
            background: 'var(--primary)',
            boxShadow: '0 0 16px 4px color-mix(in oklab, var(--primary) 65%, transparent)',
          }}
          aria-hidden="true"
        />
      </span>
    </div>
  )
}