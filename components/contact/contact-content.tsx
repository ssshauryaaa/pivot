'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowLeft, Phone } from 'lucide-react'
import { CabinetCss } from '@/components/hero/cabinet-css'
import { PixelSprites } from '@/components/hero/pixel-sprites'
import { explodeState, resetExplodeState } from '@/lib/explode-state'
import { detectDeviceTier, prefersReducedMotion, type DeviceTier } from '@/lib/gsap-config'

const ContactScene = dynamic(() => import('@/components/contact/contact-scene'), { ssr: false })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'sending' | 'sent'

export function ContactContent() {
  const [tier, setTier] = useState<DeviceTier | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({})
  const [status, setStatus] = useState<Status>('idle')

  const stageRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const spinTween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    setTier(detectDeviceTier())
    resetExplodeState()
    return () => {
      gsap.killTweensOf(explodeState)
      resetExplodeState()
    }
  }, [])

  /* ── cabinet reactions ──────────────────────────────────────────── */
  // The R3F scene reads explodeState in useFrame, so tweening the plain
  // object is enough — no per-frame React state.

  const canAnimate = useCallback(
    () => tier === 'high' && !prefersReducedMotion(),
    [tier],
  )

  // Focus any field → screen brightens like a credit dropped in
  const onFieldFocus = useCallback(() => {
    if (!canAnimate()) return
    gsap.to(explodeState, { screenGlow: 1.55, duration: 0.45, ease: 'power2.out', overwrite: 'auto' })
  }, [canAnimate])

  const onFieldBlur = useCallback(() => {
    if (!canAnimate()) return
    gsap.to(explodeState, { screenGlow: 1, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' })
  }, [canAnimate])

  // Each keystroke → tiny CRT flicker pulse
  const onKeystroke = useCallback(() => {
    if (!canAnimate()) return
    gsap.fromTo(
      explodeState,
      { screenGlow: 1.85 },
      { screenGlow: 1.55, duration: 0.28, ease: 'power2.out', overwrite: 'auto' },
    )
  }, [canAnimate])

  /* ── drag-to-spin ───────────────────────────────────────────────── */

  const onStageDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    lastX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onStageMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current || !canAnimate()) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      spinTween.current?.kill()
      spinTween.current = gsap.to(explodeState, {
        spin: explodeState.spin + dx * 0.0075,
        duration: 0.25,
        ease: 'power1.out',
      })
    },
    [canAnimate],
  )

  const onStageUp = useCallback(() => {
    dragging.current = false
    if (!canAnimate()) return
    // ease the cabinet back to face the room
    spinTween.current?.kill()
    spinTween.current = gsap.to(explodeState, {
      spin: 0,
      duration: 1.4,
      ease: 'elastic.out(1, 0.55)',
      delay: 0.6,
    })
  }, [canAnimate])

  /* ── submit ─────────────────────────────────────────────────────── */

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const next: { email?: string; message?: string } = {}
      if (!EMAIL_RE.test(email.trim())) next.email = 'That email doesn’t look right — check it and try again.'
      if (message.trim().length < 2) next.message = 'Give us at least a couple of words.'
      setErrors(next)
      if (Object.keys(next).length > 0) return

      setStatus('sending')

      const finish = () => setStatus('sent')

      if (canAnimate()) {
        // Celebration: the cabinet blows apart, spins once, reassembles.
        const tl = gsap.timeline({ onComplete: finish })
        tl.to(explodeState, {
          marqueeY: 0.6,
          marqueeRotX: 0.28,
          panelX: 1,
          panelRotY: 0.85,
          screenZ: 1.1,
          screenGlow: 1.9,
          controlsY: -0.65,
          duration: 0.65,
          ease: 'power3.out',
        })
          .to(explodeState, { spin: Math.PI * 2, duration: 1.5, ease: 'power2.inOut' }, 0.15)
          .to(
            explodeState,
            {
              marqueeY: 0,
              marqueeRotX: 0,
              panelX: 0,
              panelRotY: 0,
              screenZ: 0,
              screenGlow: 1,
              controlsY: 0,
              spin: 0,
              duration: 0.85,
              ease: 'power3.inOut',
            },
            '+=0.3',
          )
      } else {
        setTimeout(finish, 600)
      }
    },
    [email, message, canAnimate],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setEmail('')
    setMessage('')
    setErrors({})
  }, [])

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#14101f]">
      {/* ── warm room lighting, matched to the cabinet's neon rig ──
          amber key from the marquee side, magenta floor spill, and a faint
          cool kicker top-right — same three lights the 3D scene uses, so the
          canvas edge disappears into the page */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* amber marquee wash behind the cabinet column */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_55%_60%_at_28%_42%,rgba(255,182,39,0.16),transparent_68%)]" />
        {/* magenta under-cabinet spill along the floor */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_60%_38%_at_30%_96%,rgba(255,62,154,0.14),transparent_70%)]" />
        {/* cool back kicker, echoing the scene's blue rim light */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_45%_45%_at_88%_6%,rgba(77,99,216,0.10),transparent_70%)]" />
        {/* soft amber lift behind the form so the copy sits in the same light */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_50%_55%_at_78%_55%,rgba(255,182,39,0.06),transparent_70%)]" />
        {/* grid floor, amber-tinted, faded at the top */}
        <div className="grid-backdrop absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,transparent_10%,black_70%)]" />
      </div>

      {/* ── minimal chrome ── */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link
          href="/"
          className="font-display text-[11px] tracking-tight text-primary transition-colors duration-200 hover:text-foreground"
        >
          REPLAY
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 font-display text-[9px] tracking-widest text-muted-foreground transition-colors duration-200 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          BACK TO THE FLOOR
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 pb-20 pt-6 sm:px-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10 lg:pt-0">
        {/* ── cabinet stage ── */}
        <div
          ref={stageRef}
          onPointerDown={onStageDown}
          onPointerMove={onStageMove}
          onPointerUp={onStageUp}
          onPointerCancel={onStageUp}
          className="relative h-[42svh] min-h-[300px] cursor-grab touch-pan-y select-none active:cursor-grabbing lg:h-[calc(100svh-4rem)] lg:min-h-[560px]"
          aria-hidden="true"
        >
          {/* Edge-feather mask: the bloom pass brightens the whole canvas a
              touch, so without this the canvas rectangle reads as a hard
              outline against the page. Fading the last ~7% of every edge
              lets the glow dissolve into the page lighting instead.
              Top fade loosened to 10% (was 7%) so the invaders drifting
              overhead don't get clipped by the mask; side fades tightened
              to 4% (was 7%) since ResponsiveFraming now keeps the cabinet
              in-frame on narrow viewports, so we need less side-cropping. */}
          <div
            className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent),linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          >
            {tier === 'high' ? (
              <ContactScene />
            ) : tier === 'low' ? (
              <div className="relative flex h-full w-full flex-col items-center justify-center">
                <PixelSprites className="mb-6" />
                <div className="h-[70%] w-full">
                  <CabinetCss />
                </div>
              </div>
            ) : null}
          </div>
          {tier === 'high' && !prefersReducedMotion() && (
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-display text-[8px] tracking-[0.25em] text-muted-foreground/70">
              DRAG TO SPIN THE CABINET
            </p>
          )}
        </div>

        {/* ── form column ── */}
        <div className="max-w-xl lg:py-16">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary">CONTACT</p>
          <h1 className="font-display mt-4 text-2xl text-balance leading-snug text-foreground text-glow-amber sm:text-3xl">
            Say hi. We&apos;re at the counter.
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Question about hours, tokens, or getting your initials on the board? Two fields,
            no forms-department nonsense.
          </p>

          {status === 'sent' ? (
            /* ── arcade-style success state ── */
            <div
              className="scanlines relative mt-10 overflow-hidden border border-primary/40 bg-void p-8 text-center"
              role="status"
            >
              <p className="font-display animate-flicker text-sm tracking-[0.2em] text-primary">
                MESSAGE SENT
              </p>
              <p className="font-display mt-4 text-[10px] tracking-[0.25em] text-accent">
                +1000 PTS
              </p>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                We read everything at the counter between games. Expect a reply within a day
                or two.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-7 inline-flex min-h-[44px] items-center border border-primary/45 px-6 py-3 font-display text-[10px] tracking-wide text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10"
              >
                SEND ANOTHER
              </button>
            </div>
          ) : (
            <form className="mt-10" onSubmit={onSubmit} noValidate aria-label="Contact REPLAY">
              <label className="block">
                <span className="font-display text-[10px] tracking-[0.2em] text-primary/80">
                  EMAIL
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    onKeystroke()
                  }}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="mt-3 w-full border border-input bg-void/60 px-4 py-3.5 text-lg text-foreground transition-colors duration-200 placeholder:text-muted-foreground/60 hover:border-primary/50 focus:border-primary focus:outline-none"
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-2 text-base text-accent">
                    {errors.email}
                  </p>
                )}
              </label>

              <label className="mt-7 block">
                <span className="font-display text-[10px] tracking-[0.2em] text-primary/80">
                  MESSAGE
                </span>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    onKeystroke()
                  }}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  className="mt-3 w-full resize-y border border-input bg-void/60 px-4 py-3.5 text-lg leading-relaxed text-foreground transition-colors duration-200 placeholder:text-muted-foreground/60 hover:border-primary/50 focus:border-primary focus:outline-none"
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="mt-2 text-base text-accent">
                    {errors.message}
                  </p>
                )}
              </label>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-8 inline-flex min-h-[44px] w-full items-center justify-center bg-primary px-7 py-3.5 font-display text-[11px] tracking-wide text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,182,39,0.35)] disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:text-xs"
              >
                {status === 'sending' ? 'INSERTING COIN…' : 'INSERT COIN TO SEND'}
              </button>

              <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                <p className="text-base text-muted-foreground">
                  Prefer the phone? Call{' '}
                  <a
                    href="tel:+17185550119"
                    className="font-display text-[11px] tracking-wide text-foreground/90 underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:text-primary"
                  >
                    (718) 555-0119
                  </a>{' '}
                  — someone always picks up.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}