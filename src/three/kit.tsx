import { Billboard, Text } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { ROOM_BY_ID, doorPlacement, type Door as DoorT, type Room } from '../data/rooms'
import { live, useTour } from '../store'
import { TEX, blobShadow, doorGlow, useImage, useTiled, useTiledPBR } from './tex'

export const FONT = '/fonts/instrument-serif.woff'

type V3 = [number, number, number]

export function Floor({
  w,
  d,
  url,
  tile = 3,
  roughness = 0.55,
  color = '#ffffff',
  metalness = 0,
}: {
  w: number
  d: number
  url: string
  tile?: number
  roughness?: number
  color?: string
  metalness?: number
}) {
  const { map, normalMap } = useTiledPBR(url, [w / tile, d / tile], 1.6)
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={map} normalMap={normalMap} normalScale={[0.45, 0.45]} roughness={roughness} metalness={metalness} color={color} envMapIntensity={0.35} />
    </mesh>
  )
}

export function Walls({
  w,
  d,
  h,
  url = TEX.plaster,
  color = '#f3ebdd',
  tile = 4,
  skirting = '#3a2a1e',
}: {
  w: number
  d: number
  h: number
  url?: string
  color?: string
  tile?: number
  skirting?: string
}) {
  const WD = useTiledPBR(url, [w / tile, h / tile], 3)
  const DD = useTiledPBR(url, [d / tile, h / tile], 3)
  const walls: { pos: V3; rot: number; len: number; t: typeof WD }[] = [
    { pos: [0, h / 2, -d / 2], rot: 0, len: w, t: WD },
    { pos: [0, h / 2, d / 2], rot: Math.PI, len: w, t: WD },
    { pos: [-w / 2, h / 2, 0], rot: Math.PI / 2, len: d, t: DD },
    { pos: [w / 2, h / 2, 0], rot: -Math.PI / 2, len: d, t: DD },
  ]
  return (
    <group>
      {walls.map((wl, i) => (
        <group key={i} position={wl.pos} rotation-y={wl.rot}>
          <mesh receiveShadow>
            <planeGeometry args={[wl.len, h]} />
            <meshStandardMaterial map={wl.t.map} normalMap={wl.t.normalMap} normalScale={[0.6, 0.6]} color={color} roughness={0.92} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.09, 0.02]}>
            <boxGeometry args={[wl.len, 0.18, 0.04]} />
            <meshStandardMaterial color={skirting} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Ceiling with a faint emissive term standing in for light bounced up from the floor. */
export function Ceiling({ w, d, h, color = '#e9e1d3', bounce = 0.32 }: { w: number; d: number; h: number; color?: string; bounce?: number }) {
  return (
    <mesh position={[0, h, 0]} rotation-x={Math.PI / 2}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} emissive={color} emissiveIntensity={bounce} />
    </mesh>
  )
}

/** A doorway on a wall with a lit opening and a label. Walking into it or clicking it moves rooms. */
export function Doorway({ room, door, outdoor }: { room: Room; door: DoorT; outdoor?: boolean }) {
  const p = doorPlacement(room, door)
  const goTo = useTour((s) => s.goTo)
  const target = ROOM_BY_ID[door.to]
  const label = door.label ?? target.name
  const [hover, setHover] = useState(false)
  const W = outdoor ? 3.2 : 2.6
  const H = outdoor ? 3.2 : 3.4
  const glow = doorGlow()
  const peekSrc = !outdoor && target.cover ? target.cover : null
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (live.dragged) return
    goTo(door.to)
  }
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rotY}>
      <group
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
      >
        {door.open ? (
          <mesh position={[0, H / 2, 0.3]}>
            <planeGeometry args={[W + 1.6, H + 1.4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ) : outdoor ? (
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[(s * W) / 2, H / 2, 0]} castShadow>
                <boxGeometry args={[0.22, H, 0.22]} />
                <meshStandardMaterial color="#5a3f2a" roughness={0.8} />
              </mesh>
            ))}
            <mesh position={[0, H, 0]} castShadow>
              <boxGeometry args={[W + 0.5, 0.26, 0.26]} />
              <meshStandardMaterial color="#5a3f2a" roughness={0.8} />
            </mesh>
            <mesh position={[0, H / 2, -0.05]}>
              <planeGeometry args={[W, H]} />
              <meshBasicMaterial color="#fff2da" transparent opacity={hover ? 0.22 : 0.08} depthWrite={false} />
            </mesh>
          </>
        ) : (
          <>
            {peekSrc ? (
              <Peek src={peekSrc} w={W} h={H} bright={hover ? 1 : 0.82} />
            ) : (
              <mesh position={[0, H / 2, 0.012]}>
                <planeGeometry args={[W, H]} />
                <meshBasicMaterial map={glow} toneMapped={false} color={hover ? '#ffffff' : '#f2e6d4'} />
              </mesh>
            )}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[(s * W) / 2, H / 2, 0.2]}>
                <boxGeometry args={[0.04, H, 0.4]} />
                <meshStandardMaterial color="#e9dfcd" roughness={0.9} />
              </mesh>
            ))}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[(s * (W + 0.2)) / 2, H / 2, 0.42]} castShadow>
                <boxGeometry args={[0.2, H + 0.2, 0.08]} />
                <meshStandardMaterial color="#4a3526" roughness={0.5} />
              </mesh>
            ))}
            <mesh position={[0, H + 0.1, 0.42]}>
              <boxGeometry args={[W + 0.4, 0.2, 0.08]} />
              <meshStandardMaterial color="#4a3526" roughness={0.5} />
            </mesh>
            <pointLight position={[0, H * 0.6, 0.9]} intensity={hover ? 2.2 : 1.2} distance={4} color="#ffdcae" />
          </>
        )}
      </group>
      {!door.open && (
      <group position={[0, H + (outdoor ? 0.62 : 0.55), 0.1]}>
        <Text font={FONT} fontSize={0.1} letterSpacing={0.3} color={outdoor ? '#fff6e8' : '#8a7560'} anchorY="bottom" position={[0, 0.2, 0]} outlineWidth={outdoor ? 0.004 : 0} outlineColor="#2a1f16">
          {`${target.numeral === '0' ? '' : target.numeral + '  ·  '}${target.level === 'upper' ? 'UPPER FLOOR' : target.level === 'ground' ? 'GALLERY' : 'GROUNDS'}`}
        </Text>
        <Text font={FONT} fontSize={outdoor ? 0.34 : 0.3} color={outdoor ? '#fff6e8' : '#2b211a'} anchorY="bottom" outlineWidth={outdoor ? 0.012 : 0} outlineColor="#2a1f16" maxWidth={6} textAlign="center">
          {label}
        </Text>
      </group>
      )}
    </group>
  )
}

/** A glimpse of the next gallery: its NMK photograph, cover-cropped into the opening. */
export function Peek({ src, w, h, bright = 0.85, y }: { src: string; w: number; h: number; bright?: number; y?: number }) {
  const base = useImage(src)
  const map = useMemo(() => {
    const t = base.clone()
    const img = base.image as { width: number; height: number }
    const ia = img.width / img.height
    const oa = w / h
    if (ia > oa) {
      t.repeat.set(oa / ia, 1)
      t.offset.set((1 - oa / ia) / 2, 0)
    } else {
      t.repeat.set(1, ia / oa)
      t.offset.set(0, (1 - ia / oa) / 2)
    }
    t.needsUpdate = true
    return t
  }, [base, w, h])
  const c = new THREE.Color().setScalar(bright)
  return (
    <mesh position={[0, y ?? h / 2, 0.012]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} color={c} toneMapped={false} />
    </mesh>
  )
}

export function Column({ pos, h, r = 0.34, color = '#f4efe6' }: { pos: V3; h: number; r?: number; color?: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[r * 2.7, 0.24, r * 2.7]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[r * 1.18, r * 1.25, 0.14, 32]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.9, r, h - 0.7, 32]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, h - 0.3, 0]} castShadow>
        <cylinderGeometry args={[r * 1.25, r * 0.92, 0.2, 32]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, h - 0.1, 0]} castShadow>
        <boxGeometry args={[r * 2.8, 0.2, r * 2.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#dfe9e6',
  roughness: 0.04,
  metalness: 0,
  transparent: true,
  opacity: 0.14,
  envMapIntensity: 1.6,
  depthWrite: false,
  side: THREE.DoubleSide,
})

/** Free-standing glass case on a timber base. Children are placed relative to the top of the base. */
export function Vitrine({
  pos,
  size = [1.6, 1.2, 0.9],
  base = 0.9,
  rot = 0,
  baseColor = '#3a2618',
  light = true,
  children,
}: {
  pos: V3
  size?: V3
  base?: number
  rot?: number
  baseColor?: string
  light?: boolean
  children?: ReactNode
}) {
  const [w, h, d] = size
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, base / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.08, base, d + 0.08]} />
        <meshStandardMaterial color={baseColor} roughness={0.45} />
      </mesh>
      <mesh position={[0, base + 0.01, 0]} receiveShadow>
        <boxGeometry args={[w, 0.02, d]} />
        <meshStandardMaterial color="#efe6d6" roughness={0.9} />
      </mesh>
      <mesh position={[0, base + h / 2, 0]} material={glassMat}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, base + h + 0.02, 0]}>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color="#1f1812" roughness={0.4} metalness={0.3} />
      </mesh>
      {light && <pointLight position={[0, base + h - 0.1, 0]} intensity={1.2} distance={2.2} color="#ffe2b8" decay={2} />}
      <group position={[0, base + 0.02, 0]}>{children}</group>
    </group>
  )
}

/** A deep case set against a wall, with an image backboard (birds, aquaria, dioramas). */
export function WallCase({
  pos,
  rot = 0,
  w = 3,
  h = 2.2,
  depth = 0.7,
  lift = 0.5,
  src,
  frame = '#141110',
  emissive = 0.35,
}: {
  pos: V3
  rot?: number
  w?: number
  h?: number
  depth?: number
  lift?: number
  src: string
  frame?: string
  emissive?: number
}) {
  const map = useImage(src)
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, lift / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.16, lift, depth]} />
        <meshStandardMaterial color={frame} roughness={0.5} />
      </mesh>
      <mesh position={[0, lift + h / 2, 0.02]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={map} roughness={0.8} emissive="#ffffff" emissiveMap={map} emissiveIntensity={emissive} />
      </mesh>
      <mesh position={[0, lift + h / 2, depth]} material={glassMat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (w + 0.08)) / 2, lift + h / 2, depth / 2]} castShadow>
          <boxGeometry args={[0.08, h, depth]} />
          <meshStandardMaterial color={frame} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, lift + h + 0.1, depth / 2]} castShadow>
        <boxGeometry args={[w + 0.16, 0.2, depth]} />
        <meshStandardMaterial color={frame} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Frame({
  pos,
  rot = 0,
  w,
  src,
  frame = '#2a2019',
  mat = '#f1ebe0',
  matPad = 0.08,
  aspect,
  caption,
}: {
  pos: V3
  rot?: number
  w: number
  src: string
  frame?: string
  mat?: string
  matPad?: number
  aspect?: number
  caption?: string
}) {
  const map = useImage(src)
  const img = map.image as { width: number; height: number } | undefined
  const a = aspect ?? (img ? img.height / img.width : 0.66)
  const h = w * a
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[w + matPad * 2 + 0.08, h + matPad * 2 + 0.08, 0.05]} />
        <meshStandardMaterial color={frame} roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.047]}>
        <planeGeometry args={[w + matPad * 2, h + matPad * 2]} />
        <meshStandardMaterial color={mat} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={map} roughness={0.7} />
      </mesh>
      {caption && (
        <Text font={FONT} position={[0, -h / 2 - matPad - 0.16, 0.05]} fontSize={0.08} color="#4a3d31" anchorY="top" maxWidth={w + 0.3}>
          {caption}
        </Text>
      )}
    </group>
  )
}

/** Interpretive wall panel with a title and short text, as used in the galleries. */
export function Panel({
  pos,
  rot = 0,
  w = 1.6,
  h = 1.1,
  kicker,
  title,
  body,
  bg = '#2b2119',
  fg = '#f3eadb',
  accent = '#d48a55',
}: {
  pos: V3
  rot?: number
  w?: number
  h?: number
  kicker?: string
  title: string
  body?: string
  bg?: string
  fg?: string
  accent?: string
}) {
  return (
    <group position={pos} rotation-y={rot}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.04]} />
        <meshStandardMaterial color={bg} roughness={0.7} />
      </mesh>
      <group position={[-w / 2 + 0.12, h / 2 - 0.12, 0.025]}>
        {kicker && (
          <Text font={FONT} fontSize={0.055} letterSpacing={0.25} color={accent} anchorX="left" anchorY="top">
            {kicker.toUpperCase()}
          </Text>
        )}
        <Text font={FONT} position={[0, kicker ? -0.1 : 0, 0]} fontSize={0.15} color={fg} anchorX="left" anchorY="top" maxWidth={w - 0.24} lineHeight={1}>
          {title}
        </Text>
        {body && (
          <Text font={FONT} position={[0, kicker ? -0.34 : -0.24, 0]} fontSize={0.062} color={fg} fillOpacity={0.82} anchorX="left" anchorY="top" maxWidth={w - 0.24} lineHeight={1.35}>
            {body}
          </Text>
        )}
      </group>
    </group>
  )
}

export function Blob({ pos, size }: { pos: V3; size: [number, number] }) {
  return (
    <mesh position={[pos[0], pos[1] + 0.012, pos[2]]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={blobShadow()} transparent depthWrite={false} opacity={0.9} />
    </mesh>
  )
}

/**
 * A photographic cut-out (specimen, animal) standing on the ground. It turns on its
 * vertical axis to keep facing the visitor, which reads as solid from normal viewpoints.
 */
export function Cutout({ src, pos, height, flip = false, shadow = true, tint = '#ffffff' }: { src: string; pos: V3; height: number; flip?: boolean; shadow?: boolean; tint?: string }) {
  const map = useImage(src)
  const img = map.image as { width: number; height: number }
  const width = (height * img.width) / img.height
  return (
    <group position={pos}>
      <Billboard lockX lockZ>
        <mesh position={[0, height / 2, 0]} scale={[flip ? -1 : 1, 1, 1]} castShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial map={map} alphaTest={0.35} side={THREE.DoubleSide} roughness={0.72} color={tint} emissive="#fff6ea" emissiveMap={map} emissiveIntensity={0.16} />
        </mesh>
      </Billboard>
      {shadow && <Blob pos={[0, 0, 0]} size={[width * 0.9, Math.min(width, height) * 0.45]} />}
    </group>
  )
}

/** Round raised plinth with an earth top and brass rail, as in the Great Hall of Mammals. */
export function RoundPlinth({ r, h = 0.6, rail = true }: { r: number; h?: number; rail?: boolean }) {
  const earth = useTiled(TEX.earth, [r / 1.5, r / 1.5])
  const posts = 18
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r + 0.05, h, 24]} />
        <meshStandardMaterial color="#d9c49b" roughness={0.55} />
      </mesh>
      <mesh position={[0, h + 0.01, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[r - 0.12, 24]} />
        <meshStandardMaterial map={earth} color="#c9a07a" roughness={1} />
      </mesh>
      {rail && (
        <group>
          <mesh position={[0, h + 0.85, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[r + 0.35, 0.03, 8, 96]} />
            <meshStandardMaterial color="#c9a54a" metalness={0.85} roughness={0.32} />
          </mesh>
          <mesh position={[0, h + 0.45, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[r + 0.35, 0.015, 6, 96]} />
            <meshStandardMaterial color="#b88a4a" metalness={0.9} roughness={0.3} />
          </mesh>
          {Array.from({ length: posts }).map((_, i) => {
            const a = (i / posts) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * (r + 0.35), (h + 0.85) / 2, Math.sin(a) * (r + 0.35)]}>
                <cylinderGeometry args={[0.025, 0.025, h + 0.85, 8]} />
                <meshStandardMaterial color="#b88a4a" metalness={0.9} roughness={0.3} />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}

export function Bench({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 0.5]} />
        <meshStandardMaterial color="#6b4a30" roughness={0.6} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.44]} />
          <meshStandardMaterial color="#231a13" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function jitter(geo: THREE.BufferGeometry, amt: number, seed: number) {
  const p = geo.attributes.position as THREE.BufferAttribute
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) - 0.5
  const map = new Map<string, number>()
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`
    let v = map.get(k)
    if (v === undefined) {
      v = 1 + rnd() * amt
      map.set(k, v)
    }
    p.setXYZ(i, p.getX(i) * v, p.getY(i) * (v * 0.9), p.getZ(i) * v)
  }
  geo.computeVertexNormals()
  return geo
}

/** Stylised indigenous tree: flat-topped acacia or a rounded broadleaf crown. */
export function Tree({ pos, scale = 1, kind = 'broad', seed = 1 }: { pos: V3; scale?: number; kind?: 'acacia' | 'broad' | 'palm'; seed?: number }) {
  const leaf = useTiled(TEX.grass, [1, 1])
  const clumps = useMemo(() => {
    const out: { p: V3; s: V3; g: THREE.BufferGeometry }[] = []
    let s = seed * 9301
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const n = kind === 'acacia' ? 7 : 9
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = kind === 'acacia' ? 0.6 + r() * 1.8 : r() * 1.3
      const y = kind === 'acacia' ? 4.6 + r() * 0.5 : 3.6 + r() * 1.8
      const sz = kind === 'acacia' ? 1.2 + r() * 0.6 : 1.1 + r() * 0.7
      out.push({
        p: [Math.cos(a) * d, y, Math.sin(a) * d],
        s: kind === 'acacia' ? [sz * 1.4, sz * 0.42, sz * 1.4] : [sz, sz * 0.85, sz],
        g: jitter(new THREE.IcosahedronGeometry(1, 1), 0.28, seed * 31 + i),
      })
    }
    return out
  }, [kind, seed])
  if (kind === 'palm') {
    return (
      <group position={pos} scale={scale}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.22, 3.2, 10]} />
          <meshStandardMaterial color="#6b5a45" roughness={0.9} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.9, 3.1, Math.sin(a) * 0.9]} rotation={[0, -a, 0.55]} castShadow>
              <boxGeometry args={[2, 0.03, 0.42]} />
              <meshStandardMaterial map={leaf} color="#5f8a3a" roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>
    )
  }
  return (
    <group position={pos} scale={scale}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.3, 4.4, 10]} />
        <meshStandardMaterial color={kind === 'acacia' ? '#9c8a5a' : '#5b4634'} roughness={0.95} />
      </mesh>
      {kind === 'acacia' &&
        [0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.6, 4, Math.sin(a) * 0.6]} rotation={[Math.sin(a) * 0.6, 0, Math.cos(a) * 0.6]} castShadow>
            <cylinderGeometry args={[0.06, 0.12, 1.8, 6]} />
            <meshStandardMaterial color="#9c8a5a" roughness={0.95} />
          </mesh>
        ))}
      {clumps.map((c, i) => (
        <mesh key={i} position={c.p} scale={c.s} geometry={c.g} receiveShadow>
          <meshStandardMaterial map={leaf} color={kind === 'acacia' ? '#6f8f3c' : '#4f7a34'} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function Shrub({ pos, scale = 1, seed = 3, color = '#557f36' }: { pos: V3; scale?: number; seed?: number; color?: string }) {
  const leaf = useTiled(TEX.grass, [1, 1])
  const g = useMemo(() => jitter(new THREE.IcosahedronGeometry(1, 1), 0.3, seed), [seed])
  return (
    <mesh position={[pos[0], pos[1] + 0.45 * scale, pos[2]]} scale={[scale * 1.2, scale * 0.8, scale * 1.1]} geometry={g} receiveShadow>
      <meshStandardMaterial map={leaf} color={color} roughness={0.9} flatShading />
    </mesh>
  )
}

/** Soft ambient motion for outdoor scenes: gently swaying group. */
export function Sway({ children, amount = 0.015, speed = 0.6 }: { children: ReactNode; amount?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null)
  const off = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * speed + off) * amount
  })
  return <group ref={ref}>{children}</group>
}

/** Spotlight with a real target object so the beam points where it should. */
export function SpotAt({
  pos,
  at,
  intensity = 40,
  angle = 0.4,
  penumbra = 0.7,
  color = '#ffd9a8',
  distance = 20,
}: {
  pos: V3
  at: V3
  intensity?: number
  angle?: number
  penumbra?: number
  color?: string
  distance?: number
}) {
  const target = useMemo(() => new THREE.Object3D(), [])
  target.position.set(...at)
  return (
    <>
      <primitive object={target} />
      <spotLight position={pos} target={target} intensity={intensity} angle={angle} penumbra={penumbra} color={color} distance={distance} decay={1.6} />
    </>
  )
}

export function Label3D({ pos, rot = 0, text, size = 0.22, color = '#2b211a' }: { pos: V3; rot?: number; text: string; size?: number; color?: string }) {
  return (
    <Text font={FONT} position={pos} rotation-y={rot} fontSize={size} color={color} anchorY="middle" maxWidth={8} textAlign="center">
      {text}
    </Text>
  )
}
