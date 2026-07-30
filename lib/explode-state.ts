/**
 * Single source of truth for the exploded-cabinet animation.
 *
 * The pinned GSAP timeline tweens these numbers; the R3F scene reads them in
 * useFrame and applies them to transforms only (no layout properties, no
 * per-frame React state) so the whole thing stays GPU-friendly.
 */
export const explodeState = {
  marqueeY: 0,
  marqueeRotX: 0,
  panelX: 0,
  panelRotY: 0,
  controlsY: 0,
  controlsOpacity: 1,
  screenZ: 0,
  screenGlow: 1,
  spin: 0,
}

export type ExplodeState = typeof explodeState

export function resetExplodeState() {
  explodeState.marqueeY = 0
  explodeState.marqueeRotX = 0
  explodeState.panelX = 0
  explodeState.panelRotY = 0
  explodeState.controlsY = 0
  explodeState.controlsOpacity = 1
  explodeState.screenZ = 0
  explodeState.screenGlow = 1
  explodeState.spin = 0
}
