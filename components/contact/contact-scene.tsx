'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import {
  BoxGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type Group,
  type PerspectiveCamera as PerspectiveCameraType,
} from 'three'
import { Cabinet, Lights } from '@/components/hero/cabinet-scene'
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
/*  Voxel sprites — classic bitmaps extruded into little 3D pixels.   */
/*  One shared box geometry + one material per palette color keeps    */
/*  the draw cost tiny.                                               */
/* ------------------------------------------------------------------ */

// 12x16 plumber, NES-era palette
const MARIO = [
  '....RRRRR...',
  '...RRRRRRRRR',
  '...BBBSSBS..',
  '..BSBSSSBSSS',
  '..BSBBSSSBSS',
  '..BBSSSSBBBB',
  '....SSSSSS..',
  '..RRURRRR...',
  '.RRRURRURRR.',
  'RRRRUUUURRRR',
  'SSRUYUUYURSS',
  'SSSUUUUUUSSS',
  'SSUUUUUUUUSS',
  '..UUU..UUU..',
  '.BBB....BBB.',
  'BBBB....BBBB',
]

const MARIO_PALETTE: Record<string, string> = {
  R: '#e23b32',
  B: '#6b3f19',
  S: '#f7b28a',
  U: '#2a4bd7',
  Y: '#ffd200',
}

// 11x8 invader, same bitmap the cabinet's CRT art uses
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

function VoxelSprite({
  rows,
  palette,
  voxel = 0.065,
  emissive = 0.14,
  ...groupProps
}: {
  rows: string[]
  palette: Record<string, string>
  voxel?: number
  emissive?: number
} & React.ComponentProps<'group'>) {
  const { geometry, materials, cells } = useMemo(() => {
    const geometry = new BoxGeometry(voxel, voxel, voxel)
    const materials: Record<string, MeshStandardMaterial> = {}
    for (const [key, color] of Object.entries(palette)) {
      materials[key] = new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: emissive,
        roughness: 0.5,
        metalness: 0.05,
      })
    }
    const w = rows[0].length
    const h = rows.length
    const cells: { key: string; x: number; y: number; mat: string }[] = []
    rows.forEach((row, ry) => {
      row.split('').forEach((c, rx) => {
        if (!palette[c]) return
        cells.push({
          key: `${rx}-${ry}`,
          x: (rx - (w - 1) / 2) * voxel,
          y: ((h - 1) / 2 - ry) * voxel,
          mat: c,
        })
      })
    })
    return { geometry, materials, cells }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      geometry.dispose()
      Object.values(materials).forEach((m) => m.dispose())
    },
    [geometry, materials],
  )

  return (
    <group {...groupProps}>
      {cells.map((cell) => (
        <mesh
          key={cell.key}
          geometry={geometry}
          material={materials[cell.mat]}
          position={[cell.x, cell.y, 0]}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Pac-Man — two hemisphere jaws that chomp toward a pellet trail    */
/* ------------------------------------------------------------------ */

function PacMan(props: React.ComponentProps<'group'>) {
  const jawTop = useRef<Group>(null)
  const jawBot = useRef<Group>(null)
  const reduced = useMemo(() => prefersReducedMotion(), [])

  useFrame(() => {
    if (reduced) return
    const t = performance.now() / 1000
    const bite = (Math.sin(t * 7) * 0.5 + 0.5) * 0.42 + 0.06
    if (jawTop.current) jawTop.current.rotation.z = bite
    if (jawBot.current) jawBot.current.rotation.z = -bite
  })

  return (
    <group {...props}>
      {/* top jaw — hemisphere sealed with a darker flat cap so the open
          mouth reads as a solid wedge, not a hollow shell */}
      <group ref={jawTop}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#ffd23f"
            emissiveIntensity={0.28}
            roughness={0.35}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 32]} />
          <meshStandardMaterial color="#b57e08" roughness={0.55} side={DoubleSide} />
        </mesh>
        {/* eye rides the top jaw so it bobs with each chomp */}
        <mesh position={[0.1, 0.2, 0.22]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#0a0d1a" roughness={0.4} />
        </mesh>
      </group>
      {/* bottom jaw */}
      <group ref={jawBot}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#ffd23f"
            emissiveIntensity={0.28}
            roughness={0.35}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 32]} />
          <meshStandardMaterial color="#b57e08" roughness={0.55} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Ghost — dome head, skirt of bumps, googly eyes                    */
/* ------------------------------------------------------------------ */

function Ghost({ color = MAGENTA, ...props }: { color?: string } & React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      {/* dome */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.45} />
      </mesh>
      {/* body */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.3, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.45} />
      </mesh>
      {/* skirt bumps */}
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={[x, -0.22, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.45} />
        </mesh>
      ))}
      {/* eyes looking toward Pac-Man — pushed onto the dome surface so the
          whites actually protrude instead of sinking into the geometry */}
      {[-0.11, 0.11].map((x) => (
        <group key={x} position={[x, 0.16, 0.24]}>
          <mesh>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshStandardMaterial
              color="#f4efe6"
              emissive="#f4efe6"
              emissiveIntensity={0.22}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0.028, -0.005, 0.052]}>
            <sphereGeometry args={[0.034, 10, 10]} />
            <meshStandardMaterial color="#1d2f8f" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  RetroFriends — everyone bobbing around the cabinet                */
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