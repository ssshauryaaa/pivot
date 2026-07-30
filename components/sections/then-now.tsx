'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/gsap-config'

/* ─── constants ──────────────────────────────────────────────────────── */

const MAX_TILT = 7 // slightly gentler than a hero card — this is a reading table

const ROWS = [
  { label: 'Price', then: 'Two dollars, thirty minutes, gone.', now: 'Two dollars, the whole afternoon.' },
  { label: 'Pace', then: 'Score attack, quarters flying.', now: 'No rush. No high score to chase.' },
  { label: 'Company', then: 'Whoever was next in line.', now: 'The same faces, every Tuesday.' },
  { label: 'Seating', then: 'Standing room, always.', now: "A chair if you want it. Most nights, you don't." },
  { label: 'Hours', then: 'After school, till your ride showed up.', now: 'Open before lunch. Easy on the knees.' },
  { label: 'Accessibility', then: 'Elbow room only if you got there first.', now: 'Wide aisles, good lighting, a stool at every cabinet.' },
] as const

/* ─── RowTiltCard ────────────────────────────────────────────────────── */
// Pointer-tracked 3D tilt wrapper, reused per comparison row.

function RowTiltCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const px = (e.clientX - left) / width
    const py = (e.clientY - top) / height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.classList.add('rtilt-moving')
      el.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`)
    })
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.classList.remove('rtilt-moving')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`rtilt ${className}`}>
      {children}
    </div>
  )
}

/* ─── ComparisonRow ──────────────────────────────────────────────────── */
// Sits directly over the section's full-bleed diagonal background, so the
// seam running behind every row is the SAME continuous diagonal line —
// rows don't carry their own split, they just read across it.

function ComparisonRow({
  label,
  then,
  now,
  index,
  revealed,
}: {
  label: string
  then: string
  now: string
  index: number
  revealed: boolean
}) {
  return (
    <div
      className={`row-wrap ${revealed ? 'row-in' : ''}`}
      style={{ transitionDelay: revealed ? `${index * 90}ms` : '0ms' } as React.CSSProperties}
    >
      <RowTiltCard className="row group">
        <div className="row-glare pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-2 items-center">
          <div className="row-then min-h-[44px] px-5 py-3.5 sm:px-8 sm:py-4">
            <p className="row-label font-display text-[9px] tracking-[0.2em]">{label}</p>
            <p className="row-copy mt-1 text-sm leading-snug">{then}</p>
          </div>
          <div className="row-now min-h-[44px] px-5 py-3.5 sm:px-8 sm:py-4">
            <p className="row-label font-display text-[9px] tracking-[0.2em]">{label}</p>
            <p className="row-copy row-copy-now mt-1 leading-snug">{now}</p>
          </div>
        </div>
      </RowTiltCard>
    </div>
  )
}

/* ─── PivotSplitTable ────────────────────────────────────────────────── */
// REPLAY campaign section — arcades, reframed for a senior audience.
// Renamed from the earlier generic "ThenNow"/event-info draft to avoid
// colliding with the site's actual then-vs-now nostalgia section
// (id="then-now"). This is its own anchor: id="pivot-split".

export function PivotSplitTable() {
  const [panelIn, setPanelIn] = useState(false)
  const [rowsIn, setRowsIn] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver drives both enter AND exit — the two theme
  // halves converge on entry and pull apart again on exit.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      setPanelIn(true)
      setRowsIn(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inside = entry.isIntersecting
        setPanelIn(inside)
        if (!inside) setRowsIn(false)
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Rows stagger in after the panel wipe settles.
  useEffect(() => {
    if (!panelIn) return
    const t = setTimeout(() => setRowsIn(true), 420)
    return () => clearTimeout(t)
  }, [panelIn])

  return (
    <section id="pivot-split" ref={sectionRef} className="pivot-section relative overflow-hidden">
      {/* ── Full-bleed diagonal background — the ONE continuous seam
             every row sits on top of ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className={`bg-then ${panelIn ? 'bg-in' : ''}`} />
        <div className={`bg-now ${panelIn ? 'bg-in' : ''}`} />
        <div className={`seam-glow ${panelIn ? 'seam-in' : ''}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
        {/* 1 · Intro */}
        <header className="max-w-2xl">
          <p className="p-eyebrow font-display text-[10px] tracking-[0.2em]">REPLAY — THE PIVOT</p>
          <h2 className="p-heading mt-5 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
            The arcade you remember.{' '}
            <span className="p-heading-accent">Reopened&nbsp;for&nbsp;you.</span>
          </h2>
          <p className="p-body mt-5 max-w-prose leading-relaxed">
            Same cabinets. Same coin slot. A different crowd walking through the door. Here&apos;s
            what actually changes when the arcade stops chasing teenagers and starts making room
            for the people who never really left it.
          </p>
        </header>

        {/* 2 · Diagonal comparison table */}
        <div className="mt-14" role="table" aria-label="Then versus now, arcade edition">
          <div className="mb-3 grid grid-cols-2" role="row">
            <span className="p-eyebrow font-display px-5 text-[9px] tracking-[0.2em] sm:px-8" role="columnheader">
              THEN
            </span>
            <span className="p-round-label font-display px-5 text-[9px] tracking-[0.2em] sm:px-8" role="columnheader">
              NOW
            </span>
          </div>
          <div className="space-y-2">
            {ROWS.map((r, i) => (
              <ComparisonRow key={r.label} label={r.label} then={r.then} now={r.now} index={i} revealed={rowsIn} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Scoped styles ── */}
      <style jsx>{`
        /* ═══ Section background ═══════════════════════════════════════ */

        .pivot-section {
          background: #070b18;
        }

        /* THEN panel: cold blue-black — wipes in from left */
        .bg-then {
          position: absolute;
          inset: 0;
          background: #080d1c;
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          transition: clip-path 460ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* NOW panel: warm amber-black — wipes in from right, 80ms after */
        .bg-now {
          position: absolute;
          inset: 0;
          background: #130d00;
          background-image: radial-gradient(ellipse at 85% 25%, rgba(245, 158, 11, 0.07) 0%, transparent 55%);
          clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
          transition: clip-path 460ms cubic-bezier(0.16, 1, 0.3, 1) 80ms;
        }

        .bg-in.bg-then { clip-path: polygon(0 0, 55% 0, 51% 100%, 0 100%); }
        .bg-in.bg-now  { clip-path: polygon(55% 0, 100% 0, 100% 100%, 51% 100%); }

        .seam-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 6%,
            rgba(59, 130, 246, 0.14) 40%,
            rgba(245, 158, 11, 0.14) 62%,
            transparent 94%
          );
          clip-path: polygon(53.5% 0, 55.5% 0, 51.5% 100%, 49.5% 100%);
          opacity: 0;
          transition: opacity 280ms ease 540ms;
        }
        .seam-in { opacity: 1; }

        @media (max-width: 767px) {
          .bg-then {
            clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0%);
            transition: clip-path 400ms cubic-bezier(0.16, 1, 0.3, 1);
          }
          .bg-in.bg-then { clip-path: polygon(0 0, 100% 0, 100% 50%, 0 56%); }
          .bg-now {
            clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
            transition: clip-path 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms;
          }
          .bg-in.bg-now { clip-path: polygon(0 50%, 100% 44%, 100% 100%, 0 100%); }
          .seam-glow { display: none; }
        }

        /* ═══ Content typography ════════════════════════════════════════ */

        .p-eyebrow        { color: #60a5fa; }
        .p-heading        { color: #e2e8f6; }
        .p-heading-accent {
          color: #f59e0b;
          text-shadow: 0 0 28px rgba(245, 158, 11, 0.35);
        }
        .p-body        { color: #94a3b8; }
        .p-round-label { color: #f59e0b; }

        /* ═══ Row enter/exit wrapper ═════════════════════════════════════ */

        .row-wrap {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 380ms ease-out, transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .row-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ═══ 3D tilt row ═════════════════════════════════════════════════ */

        .rtilt {
          transform-style: preserve-3d;
          will-change: transform;
        }

        .row {
          position: relative;
          overflow: hidden;
          border-radius: 0.6rem;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(148, 163, 184, 0.05);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.02) inset, 0 10px 24px -16px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(1);
          transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease,
            border-color 250ms ease, background 250ms ease;
        }
        .row.rtilt-moving {
          transition: transform 90ms linear;
        }
        .row:hover,
        .row:focus-within {
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-3px)
            scale(1.012);
          box-shadow: 0 18px 40px -14px rgba(0, 0, 0, 0.65), 0 0 18px -4px rgba(245, 158, 11, 0.22);
          border-color: rgba(148, 163, 184, 0.28);
        }

        .row-then { border-right: 1px solid rgba(148, 163, 184, 0.18); }

        .row-label { color: rgba(226, 232, 246, 0.4); }
        .row:hover .row-label,
        .row:focus-within .row-label { color: rgba(226, 232, 246, 0.65); }

        .row-copy { color: #cbd5e1; }
        /* NOW side reads slightly larger / roomier — the audience is senior,
           not teen, so give it more comfortable type by default. */
        .row-copy-now {
          color: #f1e6cf;
          font-size: 1rem;
        }

        .row-glare {
          background: radial-gradient(280px circle at var(--gx, 50%) var(--gy, 50%), rgba(244, 239, 230, 0.06), transparent 65%);
          opacity: 0;
          transition: opacity 350ms ease;
        }
        .row:hover .row-glare,
        .row:focus-within .row-glare { opacity: 1; }

        /* ═══ Reduced motion ════════════════════════════════════════════ */

        @media (prefers-reduced-motion: reduce) {
          .bg-then, .bg-now, .seam-glow, .row-wrap, .row {
            transition: none !important;
            animation: none !important;
          }
          .bg-then { clip-path: polygon(0 0, 55% 0, 51% 100%, 0 100%) !important; }
          .bg-now  { clip-path: polygon(55% 0, 100% 0, 100% 100%, 51% 100%) !important; }
          .seam-glow { opacity: 1 !important; }
          .row-wrap { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  )
}