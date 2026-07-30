'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { type Group, type PerspectiveCamera as PerspectiveCameraType } from 'three'
import { Cabinet, Lights } from '@/components/hero/cabinet-scene'
import { Ghost, INVADER, MARIO, MARIO_PALETTE, PacMan, VoxelSprite } from '../retro-characters'
import { prefersReducedMotion } from '@/lib/gsap-config'

const AMBER = '#ffb627'
const MAGENTA = '#ff3e9a'

/* ------------------------------------------------------------------ */
/*  Stage — frames the (unmodified, shared) Cabinet + companions for   */
/*  this page's stage box. cabinet-scene.tsx is shared with the hero   */
/*  section, so nothing in there is touched; instead a wrapper group   */
/*  around Cabinet/RetroFriends is repositioned/rescaled from here,    */
/*  and the camera is adjusted from here too.                          */
/*                                                                      */
/*  Key insight: on the desktop two-column contact layout the stage    */
/*  box is TALL and NARROW (a half-width column filling most of the    */
/*  viewport height) — a portrait-aspect canvas even on a wide browser */
/*  window. Raw pixel width doesn't predict that; aspect ratio         */
/*  (width / height) does, so framing is driven by aspect rather than  */
/*  a width breakpoint.                                                */
/* ------------------------------------------------------------------ */

function Stage() {
  const { size, camera } = useThree()
  const rig = useRef<Group>(null)
  const friends = useRef<Group>(null)

  useEffect(() => {
    const aspect = size.width / size.height
    // t: 0 on a wide/landscape canvas (plenty of horizontal room),
    //    1 on a tall/portrait canvas (the desktop two-column stage box,
    //    and very narrow phones) — needs the strongest correction.
    const t = Math.min(1, Math.max(0, (1.15 - aspect) / 0.65))

    // constant left-pan applied at every aspect, so the assembly sits a
    // little left-of-center even on wide/landscape canvases
    const basePanX = -0.1

    const perspCam = camera as unknown as PerspectiveCameraType
    // pulled the base distance/fov in from 10.4/44 so the cabinet reads
    // bigger by default; the t-scaled part still pulls back further on
    // portrait-ish frames so nothing clips
    perspCam.fov = 40 + 12 * t
    perspCam.position.z = 5.5 + 2.2 * t
    perspCam.position.x = basePanX - 0.7 * t
    camera.lookAt(basePanX - 0.7 * t, 0, 0)
    perspCam.updateProjectionMatrix()

    if (rig.current) {
      // pan the cabinet+companions assembly left to compensate further
      rig.current.position.x = -0.35 - 0.45 * t
    }
    if (friends.current) {
      // pull Pac-Man/ghost/Mario/invaders in toward the cabinet — they're
      // what sticks out furthest, so shrinking their spread (rather than
      // the cabinet itself) is what actually stops the edge clipping
      friends.current.scale.setScalar(1 - 0.35 * t)
    }
  }, [size, camera])

  return (
    <group ref={rig}>
      <Cabinet />
      <group ref={friends}>
        <RetroFriends />
      </group>
      <ContactShadows position={[0, -2.08, 0]} opacity={0.6} scale={9} blur={2.4} far={3} color="#0d0812" />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  RetroFriends — everyone bobbing around the cabinet. Character      */
/*  components (Pac-Man, Ghost, Mario voxel, invaders) now live in     */
/*  ./retro-characters so the hero scene can share the same cast.      */
/* ------------------------------------------------------------------ */

function RetroFriends() {
  const pac = useRef<Group>(null)
  const ghost = useRef<Group>(null)
  const mario = useRef<Group>(null)
  const invaderA = useRef<Group>(null)
  const invaderB = useRef<Group>(null)
  const reduced = useMemo(() => prefersReducedMotion(), [])

  useFrame(() => {
    if (reduced) return
    const t = performance.now() / 1000
    if (pac.current) {
      pac.current.position.y = 0.55 + Math.sin(t * 1.1) * 0.09
      pac.current.position.x = -2.0 + Math.sin(t * 0.5) * 0.12
    }
    if (ghost.current) {
      ghost.current.position.y = 1.5 + Math.sin(t * 1.1 + 1.4) * 0.1
      ghost.current.position.x = -2.3 + Math.sin(t * 0.5) * 0.12
      ghost.current.rotation.z = Math.sin(t * 1.6) * 0.07
    }
    if (mario.current) {
      // little idle hop every couple of seconds
      const hop = Math.max(0, Math.sin(t * 2.4))
      mario.current.position.y = -1.15 + hop * hop * 0.22
      mario.current.rotation.y = -0.35 + Math.sin(t * 0.4) * 0.08
    }
    if (invaderA.current) {
      // pulled down from 2.05 so it clears the top edge-fade mask
      invaderA.current.position.y = 1.85 + Math.sin(t * 0.9 + 0.6) * 0.12
      invaderA.current.rotation.z = Math.sin(t * 0.7) * 0.06
    }
    if (invaderB.current) {
      // pulled down from 2.5 so it clears the top edge-fade mask
      invaderB.current.position.y = 2.15 + Math.sin(t * 0.8 + 2.1) * 0.1
      invaderB.current.rotation.z = Math.sin(t * 0.6 + 1) * 0.06
    }
  })

  return (
    <group>
      {/* soft warm fill over the left cluster — the key lights all sit on
          the cabinet, so without this the characters render murky */}
      <pointLight position={[-2.2, 1.2, 2.6]} intensity={4.5} distance={7} color="#ffe0bb" />

      {/* Pac-Man chomping a pellet trail that leads to the cabinet */}
      <group ref={pac} position={[-2.0, 0.55, 0.5]}>
        <PacMan rotation={[0, 0.35, 0]} />
      </group>
      {[-1.55, -1.3, -1.05].map((x, i) => (
        <mesh key={x} position={[x, 0.55, 0.5]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial
            color="#ffe9b0"
            emissive="#ffe9b0"
            emissiveIntensity={1.1 - i * 0.2}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* ghost on his tail, floating in from above */}
      <group ref={ghost} position={[-2.3, 1.5, 0]}>
        <Ghost />
      </group>

      {/* voxel Mario, right of the cabinet at floor level */}
      <group ref={mario} position={[1.85, -1.15, 0.7]} rotation={[0, -0.35, 0]}>
        <VoxelSprite rows={MARIO} palette={MARIO_PALETTE} voxel={0.075} />
      </group>

      {/* invaders drifting overhead — start positions lowered to match the
          RAF-driven positions above, so there's no pop on first frame */}
      <group ref={invaderA} position={[1.95, 1.85, -0.2]}>
        <VoxelSprite rows={INVADER} palette={{ '1': AMBER }} voxel={0.055} emissive={0.5} />
      </group>
      <group ref={invaderB} position={[-2.35, 2.15, -0.5]}>
        <VoxelSprite rows={INVADER} palette={{ '1': MAGENTA }} voxel={0.045} emissive={0.5} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene                                                             */
/* ------------------------------------------------------------------ */

export default function ContactScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [0, 0.15, 10.4], fov: 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <Lights />
      {/* same procedural neon room as the hero, biased a touch warmer so the
          reflections agree with the page's amber lighting */}
      <Environment resolution={64} environmentIntensity={0.5}>
        <color attach="background" args={['#120d18']} />
        <Lightformer form="rect" intensity={2.2} color="#ffe2b8" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={3} color={MAGENTA} position={[-5, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[8, 0.8, 1]} />
        <Lightformer form="rect" intensity={2.8} color={AMBER} position={[5, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[7, 0.7, 1]} />
        <Lightformer form="rect" intensity={1} color="#8a5b8f" position={[0, 1, 6]} scale={[7, 3, 1]} />
      </Environment>
      <Stage />
      {/* fog matched to the page's warm charcoal so the canvas edge vanishes */}
      <fog attach="fog" args={['#171126', 10, 20]} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1} luminanceSmoothing={0.25} />
      </EffectComposer>
    </Canvas>
  )
}