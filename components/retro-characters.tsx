'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, DoubleSide, MeshStandardMaterial, type Group } from 'three'
import { prefersReducedMotion } from '@/lib/gsap-config'

/* ------------------------------------------------------------------ */
/*  Shared bitmaps                                                     */
/* ------------------------------------------------------------------ */

// 12x16 plumber, NES-era palette
export const MARIO = [
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

export const MARIO_PALETTE: Record<string, string> = {
  R: '#e23b32',
  B: '#6b3f19',
  S: '#f7b28a',
  U: '#2a4bd7',
  Y: '#ffd200',
}

// 11x8 invader
export const INVADER = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
]

// tetromino silhouettes — 'X' is the single palette key each piece uses
export const TETRIS_T = ['.X.', 'XXX']
export const TETRIS_S = ['.XX', 'XX.']
export const TETRIS_L = ['X.', 'X.', 'XX']

/* ------------------------------------------------------------------ */
/*  Voxel sprite — classic bitmaps extruded into little 3D pixels     */
/* ------------------------------------------------------------------ */

export function VoxelSprite({
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
/*  Shared pointer-affordance helper — swaps in a real cursor so       */
/*  clickable characters don't look like inert scenery.                */
/* ------------------------------------------------------------------ */

function useCharacterCursor() {
  return {
    onPointerOver: (e: any) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: (e: any) => {
      e.stopPropagation()
      document.body.style.cursor = 'auto'
    },
  }
}

/* ------------------------------------------------------------------ */
/*  InteractiveVoxel — wraps VoxelSprite (used for Mario, invaders,     */
/*  anything else voxel-based) with a click-triggered bounce.          */
/* ------------------------------------------------------------------ */

export function InteractiveVoxel({
  onActivate,
  ...voxelProps
}: React.ComponentProps<typeof VoxelSprite> & { onActivate?: () => void }) {
  const inner = useRef<Group>(null)
  const clickedAt = useRef(0)
  const cursor = useCharacterCursor()

  useFrame(() => {
    if (!inner.current) return
    const elapsed = performance.now() - clickedAt.current
    const bounce = elapsed < 420 ? 1 + Math.sin((elapsed / 420) * Math.PI) * 0.4 : 1
    inner.current.scale.setScalar(bounce)
  })

  return (
    <group
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        clickedAt.current = performance.now()
        onActivate?.()
      }}
    >
      <group ref={inner}>
        <VoxelSprite {...voxelProps} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Pac-Man — chomps double-speed for a moment when clicked            */
/* ------------------------------------------------------------------ */

export function PacMan({
  onActivate,
  ...props
}: { onActivate?: () => void } & React.ComponentProps<'group'>) {
  const jawTop = useRef<Group>(null)
  const jawBot = useRef<Group>(null)
  const clickedAt = useRef(0)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const cursor = useCharacterCursor()

  useFrame(() => {
    if (reduced) return
    const t = performance.now() / 1000
    const boosted = performance.now() - clickedAt.current < 900
    const speed = boosted ? 16 : 7
    const bite = (Math.sin(t * speed) * 0.5 + 0.5) * 0.42 + 0.06
    if (jawTop.current) jawTop.current.rotation.z = bite
    if (jawBot.current) jawBot.current.rotation.z = -bite
  })

  return (
    <group
      {...props}
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        clickedAt.current = performance.now()
        onActivate?.()
      }}
    >
      <group ref={jawTop}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.28} roughness={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 32]} />
          <meshStandardMaterial color="#b57e08" roughness={0.55} side={DoubleSide} />
        </mesh>
        <mesh position={[0.1, 0.2, 0.22]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#0a0d1a" roughness={0.4} />
        </mesh>
      </group>
      <group ref={jawBot}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.28} roughness={0.35} />
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
/*  Ghost — flips to "scared" blue for a moment when clicked           */
/* ------------------------------------------------------------------ */

export function Ghost({
  color = '#ff3e9a',
  onActivate,
  ...props
}: { color?: string; onActivate?: () => void } & React.ComponentProps<'group'>) {
  const [scared, setScared] = useState(false)
  const cursor = useCharacterCursor()
  const c = scared ? '#3b6cff' : color

  useEffect(() => {
    if (!scared) return
    const id = setTimeout(() => setScared(false), 1400)
    return () => clearTimeout(id)
  }, [scared])

  return (
    <group
      {...props}
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        setScared(true)
        onActivate?.()
      }}
    >
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.14} roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.3, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.14} roughness={0.45} />
      </mesh>
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={[x, -0.22, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.14} roughness={0.45} />
        </mesh>
      ))}
      {[-0.11, 0.11].map((x) => (
        <group key={x} position={[x, 0.16, 0.24]}>
          <mesh>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshStandardMaterial color="#f4efe6" emissive="#f4efe6" emissiveIntensity={0.22} roughness={0.25} />
          </mesh>
          <mesh position={[0.028, -0.005, 0.052]}>
            <sphereGeometry args={[0.034, 10, 10]} />
            <meshStandardMaterial color={scared ? '#f4efe6' : '#1d2f8f'} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Tetris piece — 90° rotate animation on click                       */
/* ------------------------------------------------------------------ */

export function TetrisPiece({
  rows,
  color,
  voxel = 0.07,
  onActivate,
  ...props
}: {
  rows: string[]
  color: string
  voxel?: number
  onActivate?: () => void
} & React.ComponentProps<'group'>) {
  const inner = useRef<Group>(null)
  const target = useRef(0)
  const cursor = useCharacterCursor()

  useFrame(() => {
    if (!inner.current) return
    inner.current.rotation.z += (target.current - inner.current.rotation.z) * 0.15
  })

  return (
    <group
      {...props}
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        target.current += Math.PI / 2
        onActivate?.()
      }}
    >
      <group ref={inner}>
        <VoxelSprite rows={rows} palette={{ X: color }} voxel={voxel} emissive={0.35} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  UFO saucer — beams down a light column on click                    */
/* ------------------------------------------------------------------ */

export function UfoSaucer({
  onActivate,
  ...props
}: { onActivate?: () => void } & React.ComponentProps<'group'>) {
  const [beaming, setBeaming] = useState(false)
  const body = useRef<Group>(null)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const cursor = useCharacterCursor()

  useEffect(() => {
    if (!beaming) return
    const id = setTimeout(() => setBeaming(false), 900)
    return () => clearTimeout(id)
  }, [beaming])

  useFrame(() => {
    if (reduced || !body.current) return
    body.current.rotation.y += 0.01
  })

  return (
    <group
      {...props}
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        setBeaming(true)
        onActivate?.()
      }}
    >
      <group ref={body}>
        <mesh>
          <sphereGeometry args={[0.22, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#8fd8ff" emissive="#8fd8ff" emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh scale={[1.5, 0.4, 1.5]}>
          <sphereGeometry args={[0.22, 24, 12]} />
          <meshStandardMaterial color="#3a4a7a" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
      <pointLight position={[0, -0.05, 0]} intensity={beaming ? 3 : 0.8} distance={2} color="#8fd8ff" />
      {beaming && (
        <mesh position={[0, -1.1, 0]}>
          <coneGeometry args={[0.45, 2, 16, 1, true]} />
          <meshBasicMaterial color="#8fd8ff" transparent opacity={0.16} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Donkey Kong barrel — spins fast for a moment on click              */
/* ------------------------------------------------------------------ */

export function Barrel({
  onActivate,
  ...props
}: { onActivate?: () => void } & React.ComponentProps<'group'>) {
  const spinUntil = useRef(0)
  const ref = useRef<Group>(null)
  const cursor = useCharacterCursor()

  useFrame(() => {
    if (!ref.current) return
    const boosted = performance.now() < spinUntil.current
    ref.current.rotation.z -= boosted ? 0.28 : 0.01
  })

  return (
    <group
      {...props}
      {...cursor}
      onClick={(e) => {
        e.stopPropagation()
        spinUntil.current = performance.now() + 1200
        onActivate?.()
      }}
    >
      <group ref={ref}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.32, 20]} />
          <meshStandardMaterial color="#a5652b" roughness={0.6} />
        </mesh>
        {[-0.11, 0, 0.11].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.225, 0.225, 0.03, 20]} />
            <meshStandardMaterial color="#3d2412" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}