// One shared motion language for the whole site.
// Small UI motion stays fast; full-section transitions move slow.
export const EASE = 'power3.inOut'

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.1,
} as const

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type DeviceTier = 'high' | 'low'

/**
 * Cheap device-tier detection. Low tier gets the CSS/DOM cabinet instead of a
 * live WebGL scene, so the pinned timeline still runs at 60fps on a phone.
 */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'low'

  // ?tier=high|low forces a path — handy for checking both on one machine
  const forced = new URLSearchParams(window.location.search).get('tier')
  if (forced === 'high' || forced === 'low') return forced

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 1024
  const cores = navigator.hardwareConcurrency ?? 2
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4

  let webgl = false
  try {
    const canvas = document.createElement('canvas')
    webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webgl = false
  }

  if (!webgl) return 'low'
  if (coarse || narrow) return 'low'
  if (cores <= 4 || memory <= 4) return 'low'
  return 'high'
}
