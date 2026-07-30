'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DURATION, EASE, prefersReducedMotion } from '@/lib/gsap-config'

gsap.registerPlugin(ScrollTrigger)

/**
 * Quiet, disciplined section reveal — one timeline per group, transforms only.
 * Reduced motion gets a plain fade-free static render.
 */
export function Reveal({
  children,
  className = '',
  stagger = 0.12,
  from = 'up',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  from?: 'up' | 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (prefersReducedMotion()) {
      gsap.set(root.children, { opacity: 1, x: 0, y: 0 })
      return
    }

    const offset =
      from === 'left' ? { x: -40, y: 0 } : from === 'right' ? { x: 40, y: 0 } : { x: 0, y: 32 }

    const ctx = gsap.context(() => {
      gsap.from(root.children, {
        ...offset,
        opacity: 0,
        duration: DURATION.slow,
        ease: EASE,
        stagger,
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      })
    }, root)

    return () => ctx.revert()
  }, [from, stagger])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
