'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/gsap-config'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis drives the scroll position, GSAP's ticker drives Lenis, and
 * ScrollTrigger reads from it — one clean scroll value for every timeline.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
