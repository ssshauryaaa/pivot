'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/gsap-config'

/* ─── constants ──────────────────────────────────────────────────────── */

const MAX_TILT = 7
const ROW_COUNT = 6

// Master diagonal: ~55/45 split.
// At the section's top edge the seam crosses at 58 % from the left;
// at the bottom edge it has drifted to 52 %.  These percentages are
// resolved per-row so the clip-paths tile into one continuous line.
const D_TOP = 58
const D_BOT = 52

const LEFT_TAG = 'THE ARCADE YOU REMEMBER'
const RIGHT_TAG = 'THE ARCADE NOW'

/* ─── comparison rows ────────────────────────────────────────────────── */

const ROWS = [
  {
    label: 'PRICE',
    left: 'Quarters burned through in minutes.',
    right: 'One pass. Play all day.',
  },
  {
    label: 'PACE',
    left: 'Score attack, quarters flying.',
    right: 'No rush. No high score to chase.',
  },
  {
    label: 'COMPANY',
    left: 'Whoever was next in line.',
    right: 'The same faces, every Tuesday.',
  },
  {
    label: 'SEATING',
    left: 'Lean on the cabinet, move on.',
    right: 'Pull up a chair. Stay a while.',
  },
  {
    label: 'HOURS',
    left: 'Open till the last quarter drops.',
    right: 'Open when you are. Mornings too.',
  },
  {
    label: 'ACCESS',
    left: 'Stairs, crowds, standing room.',
    right: 'Step-free. Well-lit. Quiet hours.',
  },
] as const

/* ─── diagonal geometry ──────────────────────────────────────────────── */
// For each row (equal height, stacked, full-width) compute where the
// master diagonal crosses its top and bottom edges, then translate those
// container-relative positions into row-relative clip-path polygons.
//
// Container diagonal: x(y) = D_TOP − (D_TOP − D_BOT) · y   (y ∈ 0–1)
// Row i occupies  y ∈ [i/N , (i+1)/N]   in container space.
// At the row's top edge the diagonal is at container-x  →  row-x% =
//   (container-x / row-width-at-top) · 100,  where row-width-at-top
//   is 1.0 (full width).  At the bottom edge the denominator is
//   (N − i) / N  because the row gets "narrower" in container terms.

function diagX(y: number) {
  return D_TOP - (D_TOP - D_BOT) * y
}

function rowClip(i: number) {
  const n = ROW_COUNT
  const yt = i / n
  const yb = (i + 1) / n
  const topX = diagX(yt) // container % at row-top
  const botX = (diagX(yb) * n) / (n - i) // row-relative % at row-bottom

  return {
    left: `polygon(0 0, ${topX.toFixed(2)}% 0, ${botX.toFixed(2)}% 100%, 0 100%)`,
    right: `polygon(${topX.toFixed(2)}% 0, 100% 0, 100% 100%, ${botX.toFixed(2)}% 100%)`,
    // Narrow glow strip centered on the seam
    seam: `polygon(${(topX - 1.2).toFixed(2)}% 0, ${(topX + 1.2).toFixed(2)}% 0, ${(botX + 1.2).toFixed(2)}% 100%, ${(botX - 1.2).toFixed(2)}% 100%)`,
  }
}

/* ─── TiltTable ──────────────────────────────────────────────────────── */
// Pointer-tracked perspective tilt for the whole comparison table.
// Gated to mouse input; skipped under prefers-reduced-motion.

function TiltTable({
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
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.classList.add('stilt-moving')
      el.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`)
    })
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.classList.remove('stilt-moving')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`stilt ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── SlashCompare ──────────────────────────────────────────────────── */

export function SlashCompare() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [rowsIn, setRowsIn] = useState(false)

  // IntersectionObserver — enters AND exits in both scroll directions.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      setEntered(true)
      setRowsIn(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const inside = entry.isIntersecting
        setEntered(inside)
        if (!inside) setRowsIn(false)
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Rows stagger in after the background panels seal (~420 ms).
  useEffect(() => {
    if (!entered) return
    const t = setTimeout(() => setRowsIn(true), 420)
    return () => clearTimeout(t)
  }, [entered])

  return (
    <section
      id="slash-compare"
      ref={sectionRef}
      className="slash-section relative overflow-hidden"
    >
      {/* ── Full-bleed diagonal background panels (decorative) ──────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className={`sbg-left ${entered ? 'sbg-in' : ''}`} />
        <div className={`sbg-right ${entered ? 'sbg-in' : ''}`} />
        <div className={`sbg-seam ${entered ? 'sbg-seam-in' : ''}`} />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <header className="mb-12 max-w-2xl sm:mb-16">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary/70">
            THEN &amp; NOW
          </p>
          <h2 className="font-display mt-4 text-2xl text-balance leading-snug sm:text-3xl lg:text-4xl">
            <span className="text-foreground">Same place. </span>
            <span className="text-sr-accent">Different chapter.</span>
          </h2>
        </header>

        <TiltTable>
          {/* Column tags — decorative, hidden from SR (label is in each row) */}
          <div
            className="slash-tags mb-3 hidden items-center sm:flex"
            aria-hidden="true"
          >
            <span className="font-display text-[8px] tracking-[0.2em] text-amber-400/50">
              {LEFT_TAG}
            </span>
            <span className="ml-auto font-display text-[8px] tracking-[0.2em] text-sr-muted">
              {RIGHT_TAG}
            </span>
          </div>

          <div className="slash-table" role="list" aria-label="Comparison table">
            {ROWS.map((row, i) => {
              const clip = rowClip(i)
              return (
                <div
                  key={row.label}
                  className={`slash-row ${rowsIn ? 'slash-row-in' : ''}`}
                  style={
                    {
                      transitionDelay: rowsIn ? `${i * 70}ms` : '0ms',
                      '--row-clip-left': clip.left,
                      '--row-clip-right': clip.right,
                    } as React.CSSProperties
                  }
                  role="listitem"
                >
                  {/* LEFT half — nostalgic, neon-on-dark */}
                  <div
                    className="shalf shalf-l"
                    style={{ clipPath: clip.left }}
                    aria-hidden="true"
                  />

                  {/* RIGHT half — calm, warm teal-on-charcoal */}
                  <div
                    className="shalf shalf-r"
                    style={{ clipPath: clip.right }}
                    aria-hidden="true"
                  />

                  {/* Seam glow — sharpens on row hover */}
                  <div
                    className="shalf-seam"
                    style={{ clipPath: clip.seam }}
                    aria-hidden="true"
                  />

                  {/* Accessible content — DOM order: label → left → right */}
                  <div className="srow-body">
                    <span className="sr-only">{row.label}</span>
                    <div className="scell scell-l">
                      <span
                        className="srow-label"
                        style={{ color: '#fbbf24' }}
                        aria-hidden="true"
                      >
                        {row.label}
                      </span>
                      <p className="srow-text">{row.left}</p>
                    </div>
                    <div className="scell scell-r">
                      <span
                        className="srow-label"
                        style={{ color: '#5ecec2' }}
                        aria-hidden="true"
                      >
                        {row.label}
                      </span>
                      <p className="srow-text">{row.right}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </TiltTable>
      </div>

      {/* ── Scoped styles ───────────────────────────────────────────── */}
      <style jsx>{`
        /* ═══ Section shell ═══════════════════════════════════════════ */
        .slash-section {
          background: #090d1a;
        }

        /* ═══ Background panels ══════════════════════════════════════ */

        .sbg-left {
          position: absolute;
          inset: 0;
          background: #0c1220;
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          transition: clip-path 440ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sbg-right {
          position: absolute;
          inset: 0;
          background: #141e1e;
          background-image: radial-gradient(
            ellipse at 78% 30%,
            rgba(94, 206, 194, 0.05) 0%,
            transparent 55%
          );
          clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
          transition: clip-path 440ms cubic-bezier(0.16, 1, 0.3, 1) 70ms;
        }
        .sbg-in.sbg-left {
          clip-path: polygon(0 0, ${D_TOP}% 0, ${D_BOT}% 100%, 0 100%);
        }
        .sbg-in.sbg-right {
          clip-path: polygon(${D_TOP}% 0, 100% 0, 100% 100%, ${D_BOT}% 100%);
        }

        /* Master seam glow */
        .sbg-seam {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 6%,
            rgba(251, 191, 36, 0.12) 35%,
            rgba(94, 206, 194, 0.12) 65%,
            transparent 94%
          );
          clip-path: polygon(
            ${(D_TOP - 1).toFixed(1)}% 0,
            ${(D_TOP + 1).toFixed(1)}% 0,
            ${(D_BOT + 1).toFixed(1)}% 100%,
            ${(D_BOT - 1).toFixed(1)}% 100%
          );
          opacity: 0;
          transition: opacity 300ms ease 500ms;
        }
        .sbg-seam-in {
          opacity: 1;
        }

        /* ═══ 3D tilt wrapper ════════════════════════════════════════ */

        .stilt {
          transform-style: preserve-3d;
          transform: perspective(1200px)
            rotateX(var(--rx, 0deg))
            rotateY(var(--ry, 0deg));
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .stilt.stilt-moving {
          transition: transform 90ms linear;
        }

        /* ═══ Table ══════════════════════════════════════════════════ */

        .slash-table {
          display: flex;
          flex-direction: column;
        }

        /* ═══ Row ════════════════════════════════════════════════════ */

        .slash-row {
          position: relative;
          min-height: 76px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .slash-row:last-child {
          border-bottom: none;
        }

        /* Enter / exit: halves off-screen, row invisible */
        .shalf-l {
          transform: translateX(-105%);
        }
        .shalf-r {
          transform: translateX(105%);
        }
        .srow-body {
          opacity: 0;
          transform: translateY(10px);
        }

        /* Entered: everything converges */
        .slash-row-in .shalf-l,
        .slash-row-in .shalf-r {
          transform: translateX(0);
          transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slash-row-in .srow-body {
          opacity: 1;
          transform: translateY(0);
          transition:
            opacity 360ms ease 220ms,
            transform 360ms cubic-bezier(0.16, 1, 0.3, 1) 220ms;
        }

        /* Row hover: lift */
        .slash-row:hover {
          transform: translateY(-2px);
          z-index: 2;
        }

        /* ═══ Half backgrounds (decorative) ══════════════════════════ */

        .shalf {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition:
            transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 280ms ease;
        }

        /* LEFT — nostalgic neon-on-dark */
        .shalf-l {
          background: #0c1220;
          background-image: radial-gradient(
            ellipse at 15% 50%,
            rgba(251, 191, 36, 0.06) 0%,
            transparent 55%
          );
        }

        /* RIGHT — calm warm teal-on-charcoal */
        .shalf-r {
          background: #141e1e;
          background-image: radial-gradient(
            ellipse at 85% 50%,
            rgba(94, 206, 194, 0.05) 0%,
            transparent 55%
          );
        }

        /* Row-level seam glow — sharpens on hover */
        .shalf-seam {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(251, 191, 36, 0.06),
            rgba(94, 206, 194, 0.06)
          );
          opacity: 0.25;
          transition: opacity 250ms ease;
        }
        .slash-row:hover .shalf-seam {
          opacity: 0.85;
          background: linear-gradient(
            to bottom,
            rgba(251, 191, 36, 0.22),
            rgba(94, 206, 194, 0.22)
          );
        }

        /* ═══ Row content ════════════════════════════════════════════ */

        .srow-body {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          min-height: 76px;
          padding: 14px 0;
          transition:
            opacity 360ms ease,
            transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scell {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }
        .scell-l {
          flex: 55;
          padding-right: 4%;
        }
        .scell-r {
          flex: 45;
          padding-left: 4%;
        }

        .srow-label {
          font-family: var(--font-display);
          font-size: 8px;
          letter-spacing: 0.2em;
          display: block;
        }
        .srow-text {
          margin: 0;
          line-height: 1.45;
        }

        /* LEFT text — amber / warm white */
        .scell-l .srow-text {
          color: #f5f0e8;
          font-size: 15px;
        }

        /* RIGHT text — warm cream, larger for the senior audience */
        .scell-r .srow-text {
          color: #ede8df;
          font-size: 17px;
        }

        /* ═══ Column tags ════════════════════════════════════════════ */

        .slash-tags {
          padding: 0 2px;
        }
        .slash-tags > span:first-child {
          flex: 55;
        }
        .slash-tags > span:last-child {
          flex: 45;
          text-align: right;
        }

        /* ═══ Reduced motion ═════════════════════════════════════════ */

        @media (prefers-reduced-motion: reduce) {
          .sbg-left,
          .sbg-right,
          .sbg-seam,
          .shalf,
          .shalf-seam,
          .srow-body,
          .slash-row,
          .stilt {
            transition: none !important;
            animation: none !important;
          }
          .sbg-left {
            clip-path: polygon(0 0, ${D_TOP}% 0, ${D_BOT}% 100%, 0 100%) !important;
          }
          .sbg-right {
            clip-path: polygon(${D_TOP}% 0, 100% 0, 100% 100%, ${D_BOT}% 100%) !important;
          }
          .sbg-seam {
            opacity: 1 !important;
          }
          .shalf-l,
          .shalf-r {
            transform: translateX(0) !important;
          }
          .srow-body {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        }

        /* ═══ Mobile — stacked blocks with angled edges ══════════════ */

        @media (max-width: 767px) {
          .sbg-left,
          .sbg-right,
          .sbg-seam {
            display: none;
          }

          .slash-row {
            display: flex;
            flex-direction: column;
            min-height: auto;
            gap: 3px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          }

          .shalf {
            position: relative;
            inset: auto;
          }
          .shalf-l {
            clip-path: polygon(0 0, 100% 0, 100% 82%, 0 100%) !important;
            background: #0c1220 !important;
            min-height: 68px;
          }
          .shalf-r {
            clip-path: polygon(0 18%, 100% 0, 100% 100%, 0 100%) !important;
            background: #141e1e !important;
            min-height: 68px;
            margin-top: -10px;
          }
          .shalf-seam {
            display: none;
          }

          .srow-body {
            position: absolute;
            inset: 0;
            flex-direction: column;
            min-height: auto;
            padding: 0;
          }
          .scell {
            padding: 14px 20px !important;
            flex: none !important;
          }
          .scell-l {
            clip-path: polygon(0 0, 100% 0, 100% 82%, 0 100%);
          }
          .scell-r {
            clip-path: polygon(0 18%, 100% 0, 100% 100%, 0 100%);
            margin-top: -10px;
          }
          .scell-l .srow-text,
          .scell-r .srow-text {
            font-size: 16px;
          }

          .slash-tags {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
