'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CanvasTexture, SRGBColorSpace, type Group, type MeshStandardMaterial } from 'three'
import { explodeState } from '@/lib/explode-state'
import { prefersReducedMotion } from '@/lib/gsap-config'

const NAVY = '#161c36'
const CASE = '#1e2547'
const CASE_DARK = '#131834'
const AMBER = '#ffb627'
const MAGENTA = '#ff3e9a'
const BONE = '#f4efe6'
const VOID = '#0a0d1a'
const CHROME = '#9aa3c4'

/* ------------------------------------------------------------------ */
/*  Baked canvas textures — pixel-perfect CRT art, backlit marquee    */
/*  and screen-printed side art beat flat emissive planes every time. */
/* ------------------------------------------------------------------ */

function displayFontFamily() {
  if (typeof document === 'undefined') return "'Press Start 2P', monospace"
  const fam = getComputedStyle(document.body).getPropertyValue('--font-display').trim()
  return fam || "'Press Start 2P', monospace"
}

// classic 11x8 invader sprite
const INVADER = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
]

// 11x6 player ship
const SHIP = [
  '00000100000',
  '00001110000',
  '00001110000',
  '01111111110',
  '11111111111',
  '11111111111',
]

function drawSprite(
  ctx: CanvasRenderingContext2D,
  bitmap: string[],
  x: number,
  y: number,
  px: number,
  color: string,
) {
  ctx.fillStyle = color
  for (let r = 0; r < bitmap.length; r++) {
    for (let c = 0; c < bitmap[r].length; c++) {
      if (bitmap[r][c] === '1') ctx.fillRect(x + c * px, y + r * px, px, px)
    }
  }
}

function drawCrt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // phosphor background with a soft center bloom
  const bg = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.72)
  bg.addColorStop(0, '#0f2e2a')
  bg.addColorStop(0.65, '#082019')
  bg.addColorStop(1, '#03100d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // HUD text
  const fam = displayFontFamily()
  ctx.font = `18px ${fam}`
  ctx.fillStyle = '#5ff0d2'
  ctx.fillText('1UP', 34, 40)
  ctx.fillStyle = AMBER
  ctx.fillText('012450', 96, 40)
  ctx.fillStyle = '#5ff0d2'
  ctx.fillText('HI', w - 190, 40)
  ctx.fillStyle = AMBER
  ctx.fillText('999999', w - 150, 40)

  // three ranks of invaders marching
  const px = 5
  const cols = 5
  const spriteW = 11 * px
  const gap = (w - 72 - cols * spriteW) / (cols - 1)
  const rowColors = [MAGENTA, '#5ff0d2', AMBER]
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < cols; col++) {
      const jitter = row % 2 === 0 ? 6 : -6
      drawSprite(ctx, INVADER, 36 + jitter + col * (spriteW + gap), 78 + row * 62, px, rowColors[row])
    }
  }

  // player shot
  ctx.fillStyle = BONE
  ctx.fillRect(w / 2 - 2, h - 128, 4, 34)

  // player ship
  drawSprite(ctx, SHIP, w / 2 - (11 * 5) / 2, h - 86, 5, BONE)

  // baseline
  ctx.fillStyle = '#1d5a4d'
  ctx.fillRect(24, h - 30, w - 48, 3)

  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2)

  // aperture-grille tint columns
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  for (let x = 0; x < w; x += 3) ctx.fillRect(x, 0, 1, h)

  // curved-glass corner falloff
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)
}

function drawMarquee(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // backlit amber panel, brightest in the middle like a real lightbox
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#f09b00')
  bg.addColorStop(0.42, '#ffd977')
  bg.addColorStop(0.58, '#ffd977')
  bg.addColorStop(1, '#e88f00')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // fine print texture lines
  ctx.fillStyle = 'rgba(120,60,0,0.06)'
  for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2)

  const fam = displayFontFamily()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // drop shadow pass then ink pass for a screen-printed read
  ctx.font = `86px ${fam}`
  ctx.fillStyle = 'rgba(60,20,60,0.35)'
  ctx.fillText('REPLAY', w / 2 + 5, h / 2 + 7)
  ctx.fillStyle = '#171233'
  ctx.fillText('REPLAY', w / 2, h / 2 + 2)

  // magenta side chevrons
  ctx.fillStyle = MAGENTA
  for (let i = 0; i < 3; i++) {
    const inset = 46 + i * 26
    ctx.beginPath()
    ctx.moveTo(inset, h / 2 - 26)
    ctx.lineTo(inset + 16, h / 2)
    ctx.lineTo(inset, h / 2 + 26)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(w - inset, h / 2 - 26)
    ctx.lineTo(w - inset - 16, h / 2)
    ctx.lineTo(w - inset, h / 2 + 26)
    ctx.closePath()
    ctx.fill()
  }
}

function drawSideArt(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = CASE_DARK
  ctx.fillRect(0, 0, w, h)

  // sweeping diagonal racing stripes at the bottom
  ctx.save()
  ctx.translate(0, h * 0.68)
  ctx.rotate(-0.32)
  const stripes = [accent, BONE, accent]
  stripes.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.globalAlpha = i === 1 ? 0.55 : 0.85
    ctx.fillRect(-w * 0.3, i * 44, w * 1.8, 20)
  })
  ctx.restore()
  ctx.globalAlpha = 1

  // big hero invader
  const px = Math.floor(w / 20)
  drawSprite(ctx, INVADER, (w - 11 * px) / 2, h * 0.16, px, accent)

  // halo glow behind it
  const glow = ctx.createRadialGradient(w / 2, h * 0.26, 10, w / 2, h * 0.26, w * 0.5)
  glow.addColorStop(0, 'rgba(255,255,255,0.10)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h * 0.6)

  // small pixel dots trailing down
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(w * 0.2 + (i % 3) * w * 0.25, h * 0.5 + i * 26, 8, 8)
  }
  ctx.globalAlpha = 1
}

function useBakedTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx, width, height)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // repaint once the display webfont has actually loaded
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (cancelled) return
      const canvas = texture.image as HTMLCanvasElement
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        draw(ctx, canvas.width, canvas.height)
        texture.needsUpdate = true
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture])

  return texture
}

/* ------------------------------------------------------------------ */
/*  Cabinet                                                            */
/* ------------------------------------------------------------------ */

function Cabinet() {
  const root = useRef<Group>(null)
  const marquee = useRef<Group>(null)
  const panelLeft = useRef<Group>(null)
  const panelRight = useRef<Group>(null)
  const controls = useRef<Group>(null)
  const screen = useRef<Group>(null)
  const screenMat = useRef<MeshStandardMaterial>(null)
  const marqueeMat = useRef<MeshStandardMaterial>(null)
  const reduced = useMemo(() => prefersReducedMotion(), [])

  const crtTex = useBakedTexture(512, 410, drawCrt)
  const marqueeTex = useBakedTexture(1024, 256, drawMarquee)
  const sideArtMagenta = useBakedTexture(256, 512, (ctx, w, h) => drawSideArt(ctx, w, h, MAGENTA))
  const sideArtAmber = useBakedTexture(256, 512, (ctx, w, h) => drawSideArt(ctx, w, h, AMBER))

  useFrame(() => {
    const s = explodeState

    if (root.current) {
      // idle: slow attract-mode sway, plus scroll-driven spin
      const t = performance.now() / 1000
      const idle = reduced ? 0 : Math.sin(t * 0.28) * 0.13
      root.current.rotation.y = idle + s.spin
      root.current.rotation.x = reduced ? 0 : Math.sin(t * 0.22) * 0.035
      root.current.position.y = reduced ? -0.15 : -0.15 + Math.sin(t * 0.5) * 0.05
    }

    if (marquee.current) {
      marquee.current.position.y = 2.02 + s.marqueeY
      marquee.current.rotation.x = -0.06 + s.marqueeRotX
    }
    // panels swing open so their painted outward faces turn toward the camera
    if (panelLeft.current) {
      panelLeft.current.position.x = -1.05 - s.panelX
      panelLeft.current.rotation.y = s.panelRotY
      panelLeft.current.rotation.z = s.panelX * 0.08
    }
    if (panelRight.current) {
      panelRight.current.position.x = 1.05 + s.panelX
      panelRight.current.rotation.y = -s.panelRotY
      panelRight.current.rotation.z = -s.panelX * 0.08
    }
    if (controls.current) {
      controls.current.position.y = -1.02 + s.controlsY
      // negative controlsY pulls the deck toward the camera, not behind the body
      controls.current.position.z = 0.62 - s.controlsY * 0.95
      controls.current.rotation.x = s.controlsY * 0.3
    }
    if (screen.current) {
      screen.current.position.z = 0 + s.screenZ
      screen.current.rotation.x = -0.08 + s.screenZ * 0.06
    }
    if (screenMat.current) {
      const flicker = reduced ? 1 : 0.96 + Math.sin(performance.now() / 95) * 0.03
      screenMat.current.emissiveIntensity = 1.15 * s.screenGlow * flicker
    }
    if (marqueeMat.current) {
      const pulse = reduced ? 1 : 1 + Math.sin(performance.now() / 700) * 0.05
      marqueeMat.current.emissiveIntensity = 1.05 * s.screenGlow * pulse
    }
  })

  return (
    <group ref={root} scale={0.82}>
      {/* ================= main body ================= */}
      <RoundedBox args={[2, 4.15, 1.42]} radius={0.06} smoothness={6} position={[0, 0.1, 0]} castShadow>
        <meshPhysicalMaterial
          color={CASE}
          roughness={0.38}
          metalness={0.05}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
        />
      </RoundedBox>

      {/* front face inset panel — gives the body a clean two-tone read */}
      <mesh position={[0, 0.1, 0.715]}>
        <planeGeometry args={[1.82, 3.95]} />
        <meshStandardMaterial color={CASE_DARK} roughness={0.55} metalness={0.08} />
      </mesh>

      {/* speaker grille between marquee and screen */}
      <group position={[0, 1.62, 0.722]}>
        <mesh>
          <planeGeometry args={[1.5, 0.22]} />
          <meshStandardMaterial color={VOID} roughness={0.7} />
        </mesh>
        {Array.from({ length: 2 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => (
            <mesh key={`${row}-${col}`} position={[-0.6 + col * 0.15, 0.045 - row * 0.09, 0.004]}>
              <circleGeometry args={[0.026, 12]} />
              <meshStandardMaterial color="#04060d" roughness={1} />
            </mesh>
          )),
        )}
      </group>

      {/* chrome reveal strips framing the front panel */}
      <mesh position={[-0.92, 0.1, 0.72]}>
        <boxGeometry args={[0.025, 3.95, 0.02]} />
        <meshStandardMaterial color={CHROME} roughness={0.18} metalness={0.9} />
      </mesh>
      <mesh position={[0.92, 0.1, 0.72]}>
        <boxGeometry args={[0.025, 3.95, 0.02]} />
        <meshStandardMaterial color={CHROME} roughness={0.18} metalness={0.9} />
      </mesh>

      {/* back service door */}
      <mesh position={[0, 0.1, -0.72]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.84, 3.98]} />
        <meshStandardMaterial color={VOID} roughness={0.85} />
      </mesh>

      {/* ================= marquee light box ================= */}
      <group ref={marquee} position={[0, 2.02, 0]} rotation={[-0.06, 0, 0]}>
        <RoundedBox args={[2.14, 0.68, 1.48]} radius={0.05} smoothness={6} castShadow>
          <meshPhysicalMaterial
            color={NAVY}
            roughness={0.35}
            metalness={0.15}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
          />
        </RoundedBox>
        {/* chrome retainer trim above and below the display face */}
        <mesh position={[0, 0.305, 0.72]}>
          <boxGeometry args={[2.08, 0.05, 0.07]} />
          <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
        </mesh>
        <mesh position={[0, -0.305, 0.72]}>
          <boxGeometry args={[2.08, 0.05, 0.07]} />
          <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
        </mesh>
        {/* backlit printed display face */}
        <mesh position={[0, 0, 0.748]}>
          <planeGeometry args={[1.96, 0.5]} />
          <meshStandardMaterial
            ref={marqueeMat}
            map={marqueeTex}
            emissiveMap={marqueeTex}
            emissive="#ffffff"
            emissiveIntensity={1.3}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
        {/* acrylic sheet over the print */}
        <mesh position={[0, 0, 0.757]}>
          <planeGeometry args={[1.96, 0.5]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.08}
            roughness={0.05}
            metalness={0}
            clearcoat={1}
          />
        </mesh>
        {/* light spill from the marquee box */}
        <pointLight position={[0, -0.1, 1]} intensity={2} distance={2.6} color={AMBER} />
      </group>

      {/* ================= screen assembly ================= */}
      <group ref={screen} position={[0, 0.72, 0]} rotation={[-0.08, 0, 0]}>
        {/* bezel surround */}
        <RoundedBox args={[1.8, 1.52, 0.2]} radius={0.05} smoothness={6} position={[0, 0, 0.66]}>
          <meshPhysicalMaterial
            color={VOID}
            roughness={0.45}
            metalness={0.2}
            clearcoat={0.5}
            clearcoatRoughness={0.35}
          />
        </RoundedBox>
        {/* inner bezel lip */}
        <mesh position={[0, 0, 0.765]}>
          <planeGeometry args={[1.6, 1.32]} />
          <meshStandardMaterial color="#05070f" roughness={0.9} />
        </mesh>
        {/* CRT face — baked pixel-art frame with scanlines */}
        <mesh position={[0, 0, 0.775]}>
          <planeGeometry args={[1.5, 1.2]} />
          <meshStandardMaterial
            ref={screenMat}
            map={crtTex}
            emissiveMap={crtTex}
            emissive="#ffffff"
            emissiveIntensity={1.15}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* curved glass over the tube */}
        <mesh position={[0, 0, 0.784]}>
          <planeGeometry args={[1.54, 1.24]} />
          <meshPhysicalMaterial
            color="#aac4ff"
            transparent
            opacity={0.07}
            roughness={0.04}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        {/* diagonal reflection sheen */}
        <mesh position={[-0.28, 0.3, 0.79]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[1.3, 0.16]} />
          <meshBasicMaterial color={BONE} transparent opacity={0.045} />
        </mesh>
        {/* CRT glow spill onto the deck */}
        <pointLight position={[0, -0.2, 1.1]} intensity={1.4} distance={2.4} color="#2f8f7f" />
      </group>

      {/* ================= side panels ================= */}
      <group ref={panelLeft} position={[-1.05, 0.1, 0]}>
        <RoundedBox args={[0.12, 4.15, 1.42]} radius={0.045} smoothness={6} castShadow>
          <meshPhysicalMaterial
            color={NAVY}
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>
        {/* T-molding edge strip along the front edge */}
        <mesh position={[0, 0, 0.7]}>
          <boxGeometry args={[0.13, 4.05, 0.035]} />
          <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
        {/* screen-printed side art on the outward face */}
        <mesh position={[-0.065, 0.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.25, 2.5]} />
          <meshStandardMaterial
            map={sideArtMagenta}
            emissiveMap={sideArtMagenta}
            emissive="#ffffff"
            emissiveIntensity={0.22}
            roughness={0.45}
          />
        </mesh>
      </group>
      <group ref={panelRight} position={[1.05, 0.1, 0]}>
        <RoundedBox args={[0.12, 4.15, 1.42]} radius={0.045} smoothness={6} castShadow>
          <meshPhysicalMaterial
            color={NAVY}
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.7]}>
          <boxGeometry args={[0.13, 4.05, 0.035]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.15} toneMapped={false} />
        </mesh>
        <mesh position={[0.065, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.25, 2.5]} />
          <meshStandardMaterial
            map={sideArtAmber}
            emissiveMap={sideArtAmber}
            emissive="#ffffff"
            emissiveIntensity={0.22}
            roughness={0.45}
          />
        </mesh>
      </group>

      {/* ================= control deck ================= */}
      <group ref={controls} position={[0, -1.02, 0.62]}>
        {/* slanted deck surface */}
        <group rotation={[-0.3, 0, 0]}>
          <RoundedBox args={[2.02, 0.14, 0.85]} radius={0.035} smoothness={6} position={[0, 0.28, 0]} castShadow>
            <meshPhysicalMaterial
              color={NAVY}
              roughness={0.35}
              metalness={0.12}
              clearcoat={0.65}
              clearcoatRoughness={0.25}
            />
          </RoundedBox>
          {/* deck overlay artwork line */}
          <mesh position={[0, 0.355, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.86, 0.7]} />
            <meshStandardMaterial color={CASE_DARK} roughness={0.5} />
          </mesh>
          {/* chrome deck edge */}
          <mesh position={[0, 0.29, 0.43]}>
            <boxGeometry args={[2.02, 0.05, 0.03]} />
            <meshStandardMaterial color={CHROME} roughness={0.18} metalness={0.9} />
          </mesh>

          {/* joystick */}
          <group position={[-0.55, 0.36, 0.05]}>
            {/* dust washer */}
            <mesh>
              <cylinderGeometry args={[0.15, 0.17, 0.05, 32]} />
              <meshPhysicalMaterial color={VOID} roughness={0.35} metalness={0.2} clearcoat={0.7} />
            </mesh>
            <mesh position={[0, 0.028, 0]}>
              <cylinderGeometry args={[0.11, 0.13, 0.012, 32]} />
              <meshStandardMaterial color="#1a1f38" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* shaft */}
            <mesh position={[0, 0.17, 0]}>
              <cylinderGeometry args={[0.026, 0.032, 0.3, 20]} />
              <meshStandardMaterial color="#b8c0dc" roughness={0.15} metalness={0.95} />
            </mesh>
            {/* ball top */}
            <mesh position={[0, 0.37, 0]}>
              <sphereGeometry args={[0.095, 32, 32]} />
              <meshPhysicalMaterial
                color={MAGENTA}
                emissive={MAGENTA}
                emissiveIntensity={0.35}
                roughness={0.12}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </mesh>
          </group>

          {/* six buttons in two staggered rows */}
          {BUTTONS.map((b, i) => (
            <group key={i} position={[b[0], 0.36, b[1]]}>
              {/* bezel ring */}
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
                <meshStandardMaterial color={VOID} roughness={0.35} metalness={0.5} />
              </mesh>
              {/* button cap */}
              <mesh position={[0, 0.028, 0]}>
                <cylinderGeometry args={[0.072, 0.08, 0.045, 32]} />
                <meshPhysicalMaterial
                  color={b[2] === 1 ? AMBER : MAGENTA}
                  emissive={b[2] === 1 ? AMBER : MAGENTA}
                  emissiveIntensity={0.4}
                  roughness={0.12}
                  clearcoat={1}
                  clearcoatRoughness={0.08}
                />
              </mesh>
              {/* concave top hint */}
              <mesh position={[0, 0.052, 0]}>
                <cylinderGeometry args={[0.052, 0.06, 0.006, 24]} />
                <meshStandardMaterial
                  color={b[2] === 1 ? '#ffd069' : '#ff7cbd'}
                  roughness={0.1}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* front lip below the deck */}
        <mesh position={[0, 0.06, 0.32]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[2.02, 0.3, 0.06]} />
          <meshStandardMaterial color={CASE_DARK} roughness={0.5} metalness={0.15} />
        </mesh>

        {/* coin door */}
        <group position={[0, -0.5, 0.14]}>
          <RoundedBox args={[0.62, 0.46, 0.05]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#141828" roughness={0.3} metalness={0.7} />
          </RoundedBox>
          {/* door frame trim */}
          <mesh position={[0, 0, 0.026]}>
            <planeGeometry args={[0.56, 0.4]} />
            <meshStandardMaterial color={VOID} roughness={0.4} metalness={0.6} />
          </mesh>
          {/* twin lit coin slots */}
          {[-0.13, 0.13].map((x) => (
            <group key={x} position={[x, 0.08, 0.032]}>
              <mesh>
                <boxGeometry args={[0.1, 0.14, 0.015]} />
                <meshStandardMaterial color="#c8cede" roughness={0.25} metalness={0.85} />
              </mesh>
              {/* glowing reject button */}
              <mesh position={[0, 0.028, 0.011]}>
                <boxGeometry args={[0.06, 0.05, 0.008]} />
                <meshStandardMaterial
                  color="#ff5b45"
                  emissive="#ff5b45"
                  emissiveIntensity={1.4}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, -0.028, 0.012]}>
                <boxGeometry args={[0.024, 0.06, 0.008]} />
                <meshStandardMaterial color={VOID} />
              </mesh>
            </group>
          ))}
          {/* barrel lock */}
          <mesh position={[0, -0.05, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
            <meshStandardMaterial color="#b8c0dc" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* coin return tray */}
          <mesh position={[0, -0.14, 0.032]}>
            <boxGeometry args={[0.2, 0.09, 0.012]} />
            <meshStandardMaterial color="#1a1f38" roughness={0.35} metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ================= base ================= */}
      {/* kick plate with vent slots */}
      <group position={[0, -1.85, 0.68]}>
        <mesh>
          <boxGeometry args={[1.9, 0.5, 0.04]} />
          <meshStandardMaterial color={VOID} roughness={0.6} metalness={0.35} />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[-0.5 + i * 0.25, -0.05, 0.022]}>
            <planeGeometry args={[0.14, 0.22]} />
            <meshStandardMaterial color="#03050c" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* plinth */}
      <RoundedBox args={[2.14, 0.28, 1.54]} radius={0.035} smoothness={4} position={[0, -2.16, 0]}>
        <meshStandardMaterial color={VOID} roughness={0.75} />
      </RoundedBox>
      {/* leg levelers */}
      {[
        [-0.9, 0.6],
        [0.9, 0.6],
        [-0.9, -0.6],
        [0.9, -0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -2.33, z]}>
          <cylinderGeometry args={[0.06, 0.075, 0.07, 16]} />
          <meshStandardMaterial color="#1a1f38" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* under-cabinet neon glow strip */}
      <mesh position={[0, -2.34, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 0.5]} />
        <meshBasicMaterial color={MAGENTA} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -2.1, 0.7]} intensity={1.6} distance={2} color={MAGENTA} />
    </group>
  )
}

// [x, z, colorKey] — two staggered rows of three, arcade-standard
const BUTTONS: [number, number, number][] = [
  [0.14, 0.02, 1],
  [0.38, -0.04, 1],
  [0.62, 0.02, 1],
  [0.2, 0.24, 2],
  [0.44, 0.18, 2],
  [0.68, 0.24, 2],
]

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#9aa6dd" />
      {/* key light */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={0.9}
        color="#dfe6ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      {/* rim + fill neon */}
      <pointLight position={[-3.6, 0.8, 3]} intensity={9} distance={12} color={MAGENTA} />
      <pointLight position={[2.8, 2, 3.6]} intensity={7} distance={11} color={AMBER} />
      {/* cool back kicker separates the silhouette from the backdrop */}
      <pointLight position={[0, 2.4, -4]} intensity={7} distance={12} color="#4d63d8" />
      {/* overhead spot for a showroom read */}
      <spotLight position={[0, 6.5, 2.5]} angle={0.5} penumbra={0.9} intensity={5} distance={14} color="#cdd8ff" />
    </>
  )
}

export default function CabinetScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [0, 0.15, 9.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <Lights />
      {/* procedural neon-room environment — built locally, no HDR download,
          gives the clearcoat panels believable reflections instantly */}
      <Environment resolution={64} environmentIntensity={0.5}>
        <color attach="background" args={['#0a0d1a']} />
        {/* soft ceiling panel */}
        <Lightformer form="rect" intensity={2.2} color="#cdd8ff" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
        {/* magenta neon strip, camera-left */}
        <Lightformer form="rect" intensity={3} color={MAGENTA} position={[-5, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[8, 0.8, 1]} />
        {/* amber neon strip, camera-right */}
        <Lightformer form="rect" intensity={2.4} color={AMBER} position={[5, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[7, 0.7, 1]} />
        {/* cool bounce behind the camera */}
        <Lightformer form="rect" intensity={1.2} color="#4d63d8" position={[0, 1, 6]} scale={[7, 3, 1]} />
      </Environment>
      <Cabinet />
      <ContactShadows position={[0, -2.08, 0]} opacity={0.6} scale={8} blur={2.4} far={3} color="#05070f" />
      <fog attach="fog" args={[NAVY, 9, 18]} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1} luminanceSmoothing={0.25} />
      </EffectComposer>
    </Canvas>
  )
}
