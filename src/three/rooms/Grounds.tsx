import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useContext, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ROOM_BY_ID } from '../../data/rooms'
import { useTour } from '../../store'
import { Bench, Blob, Cutout, FONT, Frame, Panel, Shrub, ShrubField, Sway, Tree, WallCase } from '../kit'
import { TEX, useTiled } from '../tex'
import { RoomActiveContext } from '../roomActive'
import { OutdoorShell } from './shell'

function mosaicTexture(seed: number) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const cols = ['#c49a3a', '#9a3a26', '#3f5f8a', '#3f6e52', '#d8d0bc', '#b8683a', '#5a4a6a']
  let s = seed
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  g.fillStyle = '#1d1a17'
  g.fillRect(0, 0, 256, 256)
  for (let ring = 0; ring < 9; ring++) {
    const rad = 124 - ring * 13
    const n = Math.max(6, Math.floor(rad / 5))
    const col = cols[Math.floor(r() * cols.length)]
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2
      const a1 = ((i + 0.86) / n) * Math.PI * 2
      g.beginPath()
      g.arc(128, 128, rad, a0, a1)
      g.arc(128, 128, rad - 10, a1, a0, true)
      g.closePath()
      g.fillStyle = r() > 0.25 ? col : cols[Math.floor(r() * cols.length)]
      g.fill()
    }
  }
  g.fillStyle = '#1a1714'
  g.beginPath()
  g.arc(128, 128, 22, 0, Math.PI * 2)
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function tube(points: [number, number, number][], r: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, 24, r, 8, false)
}

function TreeSculpture() {
  const stone = useTiled(TEX.stoneWall, [5, 0.7])
  const discs = useMemo(() => [mosaicTexture(3), mosaicTexture(11), mosaicTexture(29)], [])
  const parts = useMemo(
    () => [
      tube([[0, 0.8, 0], [0.1, 2, 0.05], [-0.1, 3.2, 0], [0.05, 4.2, 0]], 0.2),
      tube([[0, 3.0, 0], [-0.8, 3.6, 0.1], [-1.6, 4.4, 0.2], [-2.0, 5.1, 0.1]], 0.09),
      tube([[0, 3.6, 0], [0.8, 4.2, -0.1], [1.4, 5.0, -0.2], [1.5, 5.8, -0.1]], 0.08),
      tube([[0.05, 4.1, 0], [0.2, 4.9, 0.1], [0.1, 5.7, 0.2]], 0.07),
      tube([[0, 2.4, 0], [-0.6, 2.5, 0.3], [-1.3, 2.9, 0.4]], 0.06),
      tube([[-1.6, 4.4, 0.2], [-2.3, 4.6, 0.4], [-2.7, 5.0, 0.3]], 0.04),
    ],
    [],
  )
  const bronze = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7a4b2a', metalness: 0.7, roughness: 0.48 }), [])
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.06
  })
  return (
    <group position={[-9, 0, -9]} rotation-y={0.5}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.6, 0.8, 48]} />
        <meshStandardMaterial map={stone} color="#d9ccb8" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.81, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2.35, 48]} />
        <meshStandardMaterial color="#5e4b38" roughness={1} />
      </mesh>
      {parts.map((g, i) => (
        <mesh key={i} geometry={g} material={bronze} castShadow />
      ))}
      <group ref={ref}>
        {[
          { p: [-1.3, 2.3, 0.6], s: 1.35, r: 0.25, t: 0, ring: 0.45 },
          { p: [-2.1, 3.9, 0.5], s: 0.8, r: -0.3, t: 1, ring: 0.3 },
          { p: [0.9, 3.2, 0.3], s: 0.7, r: 0.4, t: 2, ring: 0 },
        ].map((d, i) => (
          <group key={i} position={d.p as [number, number, number]} rotation={[0, d.r, 0]}>
            <mesh castShadow>
              <ringGeometry args={[d.s * d.ring, d.s, 64]} />
              <meshStandardMaterial map={discs[d.t]} side={THREE.DoubleSide} roughness={0.3} metalness={0.15} emissive="#ffffff" emissiveMap={discs[d.t]} emissiveIntensity={0.12} />
            </mesh>
            <mesh material={bronze}>
              <torusGeometry args={[d.s, 0.045, 8, 64]} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.9, 1.6, 0.9]} rotation={[0.3, 0.4, 0.2]} scale={[1, 0.5, 0.35]} material={bronze} castShadow>
          <sphereGeometry args={[0.7, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
        <group position={[1.5, 5.9, -0.1]} rotation-y={-0.3}>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0]} rotation-z={a - Math.PI / 2} castShadow>
                <coneGeometry args={[0.13, 0.75, 4]} />
                <meshStandardMaterial color="#c9c9c4" metalness={0.95} roughness={0.2} />
              </mesh>
            )
          })}
          <mesh>
            <circleGeometry args={[0.55, 40]} />
            <meshStandardMaterial color="#b9b9b4" metalness={0.95} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <circleGeometry args={[0.24, 32]} />
            <meshStandardMaterial color="#f2c230" emissive="#d99a10" emissiveIntensity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Facade() {
  const room = ROOM_BY_ID.forecourt
  const hd = room.size[1] / 2
  const render = useTiled(TEX.ochre, [6, 3])
  const renderSide = useTiled(TEX.ochre, [3, 3])
  const terracotta = useTiled(TEX.ochre, [1, 4])
  const stone = useTiled(TEX.stoneWall, [3, 2])
  const paving = useTiled(TEX.brick, [4, 6])
  const z0 = -hd
  const D = 6.4
  const PW = 5.4
  const PH = 5.4
  const W = 30
  const H = 8.6
  const side = (W - PW) / 2
  const col = <meshStandardMaterial map={terracotta} color="#c4623c" roughness={0.84} metalness={0} />
  return (
    <group>
      {/* facade block with an open central passage */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (PW / 2 + side / 2), H / 2, z0 - D / 2]} castShadow receiveShadow>
          <boxGeometry args={[side, H, D]} />
          <meshStandardMaterial map={render} roughness={0.92} color="#f2d4a2" />
        </mesh>
      ))}
      <mesh position={[0, PH + (H - PH) / 2, z0 - D / 2]} castShadow receiveShadow>
        <boxGeometry args={[PW, H - PH, D]} />
        <meshStandardMaterial map={render} roughness={0.92} color="#f2d4a2" />
      </mesh>
      <mesh position={[0, 0.02, z0 - D / 2 - 6]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[PW + 8, D + 12]} />
        <meshStandardMaterial map={paving} color="#e7c4ad" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.9, 2.6, z0 - D - 3]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 5.2, 24]} />
          {col}
        </mesh>
      ))}
      <Tree pos={[-3, 0, z0 - D - 9]} kind="broad" scale={1.4} seed={61} />
      <Tree pos={[4, 0, z0 - D - 11]} kind="broad" scale={1.6} seed={62} />
      <Tree pos={[0, 0, z0 - D - 16]} kind="acacia" scale={1.5} seed={63} />
      {/* stone trim and lettering */}
      <mesh position={[0, PH + 0.18, z0 + 0.06]}>
        <boxGeometry args={[PW + 0.8, 0.36, 0.12]} />
        <meshStandardMaterial map={stone} color="#cbbfae" roughness={0.9} />
      </mesh>
      {['NAIROBI', 'NATIONAL', 'MUSEUM'].map((t, i) => (
        <Text key={t} font={FONT} position={[0, 7.55 - i * 0.72, z0 + 0.08]} fontSize={0.68} letterSpacing={0.06} color="#161616" anchorY="middle">
          {t}
        </Text>
      ))}
      {/* cream wall either side of the open entrance, matching the NMK facade photograph */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 8.6, 3.1, z0 + 0.04]} receiveShadow>
          <boxGeometry args={[5.2, 5.4, 0.08]} />
          <meshStandardMaterial map={render} color="#f3d7ae" roughness={0.92} />
        </mesh>
      ))}
      <Frame pos={[-8.6, 2.7, z0 + 0.16]} w={2.7} src="/photos/museum-facade.jpg" caption="The sculpture and the entrance colonnade" />
      <Frame pos={[8.6, 2.7, z0 + 0.16]} w={2.7} src="/photos/museum-entrance.jpg" caption="The main entrance on Museum Hill" />
      {/* dark clerestory band under the eaves */}
      <mesh position={[0, H + 0.45, z0 - 0.6]}>
        <boxGeometry args={[W, 0.9, 0.1]} />
        <meshStandardMaterial color="#1f2428" roughness={0.15} metalness={0.6} />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[-W / 2 + (i + 0.5) * (W / 16), H + 0.45, z0 - 0.54]}>
          <boxGeometry args={[0.08, 0.9, 0.06]} />
          <meshStandardMaterial color="#6d6a64" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* roof overhang with grey fascia */}
      <mesh position={[0, H + 1.1, z0 - 1.4]} castShadow receiveShadow>
        <boxGeometry args={[33, 0.45, 9.6]} />
        <meshStandardMaterial color="#efe3cc" roughness={0.8} />
      </mesh>
      <mesh position={[0, H + 1.2, z0 + 3.35]} castShadow>
        <boxGeometry args={[33.2, 0.7, 0.24]} />
        <meshStandardMaterial color="#8f918f" roughness={0.55} metalness={0.35} />
      </mesh>
      {/* terracotta columns with grey steel collars */}
      {[-4.2, -3.0, 3.0, 4.2].map((x) => (
        <group key={x} position={[x, 0, z0 + 1.9]}>
          <mesh position={[0, (H + 0.7) / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.48, 0.5, H + 0.5, 32]} />
            {col}
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.64, 0.18, 32]} />
            <meshStandardMaterial color="#cfc6ba" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* four low steps */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, 0.06 + i * 0.12, z0 + 2.7 - i * 0.55]} receiveShadow castShadow>
          <boxGeometry args={[12.4, 0.12, 0.58]} />
          <meshStandardMaterial color="#e6d5bf" roughness={0.94} />
        </mesh>
      ))}
      {/* the older ivy-clad stone wing on the left */}
      <mesh position={[-20.5, 3.6, z0 + 1.5]} castShadow receiveShadow>
        <boxGeometry args={[11, 7.2, 6]} />
        <meshStandardMaterial map={stone} roughness={0.95} color="#ffe6bf" />
      </mesh>
      <mesh position={[-20.5, 7.4, z0 + 2.2]} castShadow>
        <boxGeometry args={[12, 0.4, 7.8]} />
        <meshStandardMaterial color="#8a8680" roughness={0.7} />
      </mesh>
      <ShrubField
        points={Array.from({ length: 16 }, (_, i) => ({
          pos: [-15.2, 0.15 + (i % 5) * 1.35, z0 - 1.2 + Math.floor(i / 5) * 1.5] as [number, number, number],
          scale: 0.85,
          color: i % 3 ? '#5d8a3c' : '#6f9a48',
        }))}
      />
      {/* the cream right wing with windows */}
      <mesh position={[21, 4.3, z0 - 0.5]} castShadow receiveShadow>
        <boxGeometry args={[12, 8.6, 8]} />
        <meshStandardMaterial map={renderSide} color="#f5e6cb" roughness={0.9} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[16.4 + (i % 4) * 2.6, i < 4 ? 6 : 3.2, z0 + 3.52]}>
          <planeGeometry args={[1.3, 1.2]} />
          <meshStandardMaterial color="#1f262c" roughness={0.1} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function RightPlanter() {
  const stone = useTiled(TEX.stoneWall, [3, 0.5])
  return (
    <group position={[14, 0, -15]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 3.4]} />
        <meshStandardMaterial map={stone} color="#f0d2a6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.01, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[5.7, 3.1]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </mesh>
      <Tree pos={[-1.6, 1, 0.2]} kind="palm" scale={0.95} />
      <Tree pos={[1.4, 1, -0.6]} kind="palm" scale={0.75} />
      <Tree pos={[1.2, 0, -3.4]} kind="broad" scale={1.1} seed={77} />
      <ShrubField
        points={[-2.2, -0.6, 0.4, 1.9, 2.4, -1.2].map((x, i) => ({
          pos: [x, 1, i % 2 ? 0.7 : -0.5] as [number, number, number],
          scale: 0.55 + (i % 3) * 0.15,
          color: i % 2 ? '#3f6f2c' : '#577f35',
        }))}
      />
    </group>
  )
}

function Signboards() {
  return (
    <group position={[6.2, 0.6, -13.8]}>
      {[0, 1.15].map((x, i) => (
        <group key={x} position={[x, 0, 0]} rotation-y={-0.15}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.95, 1.4, 0.04]} />
            <meshStandardMaterial color={i ? '#f2ede4' : '#1b1b1a'} roughness={0.8} />
          </mesh>
          <Text font={FONT} position={[0, 0.72, 0.03]} fontSize={0.13} color={i ? '#2b211a' : '#f3e7d2'} anchorY="middle" maxWidth={0.82} textAlign="center">
            {i ? 'Open daily\n8:30 – 5:30' : 'Tickets\neCitizen only'}
          </Text>
        </group>
      ))}
    </group>
  )
}

export function Forecourt() {
  const room = ROOM_BY_ID.forecourt
  const dressing = useTour((s) => s.dressing)
  const active = useContext(RoomActiveContext)
  return (
    <OutdoorShell room={room} sun={[-16, 20, 30]} groundTile={1.3} groundColor="#d9bba6">
      <Facade />
      <Suspense fallback={null}>{active && dressing && <TreeSculpture />}</Suspense>
      <Signboards />
      <RightPlanter />
      <group position={[-14, 0, -15]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.9, 3]} />
          <meshStandardMaterial color="#b89d80" roughness={0.9} />
        </mesh>
        <Shrub pos={[0, 0.9, 0]} scale={1.2} seed={75} color="#3f6f2c" />
      </group>
      <Tree pos={[-17, 0, 6]} kind="acacia" scale={1.3} seed={5} />
      <Tree pos={[17, 0, 9]} kind="broad" scale={1.4} seed={8} />
      <Bench pos={[-6, 0, 8]} rot={0.2} />
      <Bench pos={[6, 0, 8]} rot={-0.2} />
    </OutdoorShell>
  )
}

export function Courtyard() {
  const room = ROOM_BY_ID.courtyard
  const [w, d] = room.size
  const stone = useTiled(TEX.stoneWall, [w / 3, 2])
  const H = 6
  return (
    <OutdoorShell room={room} ground={TEX.stoneFloor} groundTile={2.4} groundColor="#bfae94" hedge={false} sun={[10, 26, 20]}>
      {[
        { p: [0, H / 2, -d / 2 - 0.3], r: 0, l: w + 1 },
        { p: [0, H / 2, d / 2 + 0.3], r: 0, l: w + 1 },
        { p: [-w / 2 - 0.3, H / 2, 0], r: Math.PI / 2, l: d + 1 },
        { p: [w / 2 + 0.3, H / 2, 0], r: Math.PI / 2, l: d + 1 },
      ].map((wl, i) => (
        <mesh key={i} position={wl.p as [number, number, number]} rotation-y={wl.r} receiveShadow castShadow>
          <boxGeometry args={[wl.l, H, 0.6]} />
          <meshStandardMaterial map={stone} color="#ffeedd" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.4, 4.6, 0.6, 64]} />
        <meshStandardMaterial color="#8e8272" roughness={0.9} />
      </mesh>
      <Cutout src="/cutouts/ahmed.webp" pos={[0, 0.6, 0]} height={3.3} />
      <Panel pos={[0, 1.1, 4.9]} rot={0} w={1.8} h={0.9} kicker="Inner courtyard" title="Ahmed of Marsabit" body="Life-size fibreglass replica of the elephant placed under 24-hour protection by presidential decree." />
      {[
        [-9, -9],
        [9, -9],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.6, 0.8, 32]} />
            <meshStandardMaterial map={stone} roughness={0.95} />
          </mesh>
          <Tree pos={[0, 0.8, 0]} kind="broad" scale={0.9} seed={20 + i} />
        </group>
      ))}
      <group position={[-w / 2 + 0.05, 0, 5]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 1.5, 0]}>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#3a2e24" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.5, 0.02]}>
          <planeGeometry args={[3.6, 2.6]} />
          <meshBasicMaterial color="#f0d7a8" toneMapped={false} />
        </mesh>
        <Text font={FONT} position={[0, 3.4, 0.05]} fontSize={0.34} color="#2b211a">
          Museum Shop
        </Text>
      </group>
      <Bench pos={[5, 0, 7]} rot={-0.6} />
      <Bench pos={[-5, 0, 7]} rot={0.6} />
    </OutdoorShell>
  )
}

function SnakeHouse({ x, src, label }: { x: number; src: string; label: string }) {
  const stone = useTiled(TEX.stoneWall, [1.5, 1])
  return (
    <group position={[x, 0, -13]}>
      <mesh position={[0, 1.7, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 3.4, 1.6]} />
        <meshStandardMaterial map={stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.5, -0.2]} castShadow>
        <boxGeometry args={[4.8, 0.2, 2.6]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.8} />
      </mesh>
      <WallCase pos={[0, 0, 0.2]} w={3.2} h={1.9} depth={0.5} lift={0.7} src={src} frame="#2d2a24" emissive={0.2} />
      <Text font={FONT} position={[0, 0.45, 0.72]} fontSize={0.14} color="#f3e7d2" anchorY="middle">
        {label}
      </Text>
    </group>
  )
}

function Alligator() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -0.04 + Math.sin(clock.elapsedTime * 0.6) * 0.015
      ref.current.rotation.y = 0.5 + Math.sin(clock.elapsedTime * 0.07) * 0.15
    }
  })
  const skin = <meshStandardMaterial color="#39402c" roughness={0.75} />
  return (
    <group ref={ref} position={[5.4, 0, 1.4]}>
      <mesh position={[0, 0.18, 0]} scale={[1, 0.32, 0.42]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        {skin}
      </mesh>
      <mesh position={[1.25, 0.14, 0]} scale={[0.75, 0.16, 0.26]} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
        {skin}
      </mesh>
      <mesh position={[-1.4, 0.1, 0]} rotation-z={Math.PI / 2} scale={[0.22, 1.3, 0.2]} castShadow>
        <coneGeometry args={[1, 1.4, 12]} />
        {skin}
      </mesh>
      {[-0.28, 0.28].map((z) => (
        <mesh key={z} position={[1.0, 0.26, z * 0.5]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#c9b04a" emissive="#403810" />
        </mesh>
      ))}
    </group>
  )
}

export function SnakePark() {
  const room = ROOM_BY_ID['snake-park']
  const water = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (water.current) water.current.emissiveIntensity = 0.1 + Math.sin(clock.elapsedTime * 0.8) * 0.03
  })
  const stone = useTiled(TEX.stoneWall, [6, 0.4])
  return (
    <OutdoorShell room={room} ground={TEX.brick} groundTile={1.4} groundColor="#c9a58c" sun={[-14, 26, 22]}>
      <SnakeHouse x={-11} src="/photos/snake-park.jpg" label="Venomous snakes" />
      <SnakeHouse x={-5.5} src="/photos/snake-park-green-snake.jpg" label="Non-venomous snakes" />
      {/* aquarium house */}
      <group position={[9, 0, -12.6]}>
        <mesh position={[0, 2, -0.8]} castShadow receiveShadow>
          <boxGeometry args={[9, 4, 2.4]} />
          <meshStandardMaterial color="#e6d6bb" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.1, -0.4]} castShadow>
          <boxGeometry args={[9.6, 0.25, 3.4]} />
          <meshStandardMaterial color="#5b4a3a" roughness={0.8} />
        </mesh>
        <WallCase pos={[-2.2, 0, 0.45]} w={3.6} h={2} depth={0.3} lift={0.6} src="/illustrative/aquarium-fresh.jpg" emissive={0.8} />
        <WallCase pos={[2.2, 0, 0.45]} w={3.6} h={2} depth={0.3} lift={0.6} src="/illustrative/aquarium-marine.jpg" emissive={0.8} />
        <Text font={FONT} position={[0, 3.35, 0.46]} fontSize={0.36} color="#2b211a">
          Aquarium
        </Text>
      </group>
      {/* alligator pond */}
      <group position={[6, 0, 1]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.2, 4.3, 0.6, 48, 1, true]} />
          <meshStandardMaterial map={stone} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[3.9, 4.35, 48]} />
          <meshStandardMaterial color="#8d8274" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[3.95, 48]} />
          <meshStandardMaterial ref={water} color="#28402f" roughness={0.08} metalness={0.2} emissive="#1d3a2a" emissiveIntensity={0.1} envMapIntensity={1.5} />
        </mesh>
        <group position={[-6, 0.2, -1]}>
          <Alligator />
        </group>
        <mesh position={[-1.8, 0.35, 1.8]} castShadow>
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#6b6154" roughness={0.9} />
        </mesh>
        <Panel pos={[0, 1.1, 4.6]} w={1.6} h={0.8} kicker="Since 1967" title="American alligator" body="Donated by researchers; still the park's centre of attraction." />
      </group>
      {/* python encounter */}
      <group position={[-12.5, 0, 6]}>
        <Frame pos={[0, 2, -1.4]} rot={Math.PI / 2 - 0.4} w={2} src="/photos/snake-park-python.jpg" />
        <Bench pos={[0, 0, 2.5]} rot={Math.PI / 2} />
      </group>
      <Tree pos={[-14, 0, -2]} kind="broad" scale={1.1} seed={31} />
      <Tree pos={[14, 0, 9]} kind="acacia" scale={1.2} seed={33} />
      <Shrub pos={[-2, 0, -11]} seed={34} />
      <Shrub pos={[1, 0, -11.5]} seed={35} scale={0.8} />
      <Blob pos={[6, 0.01, 1]} size={[9.5, 9.5]} />
    </OutdoorShell>
  )
}

export function Gardens() {
  const room = ROOM_BY_ID.gardens
  const gravel = useTiled(TEX.earth, [1, 12])
  const trees: [number, number, 'acacia' | 'broad' | 'palm', number][] = [
    [-10, -4, 'acacia', 1.4],
    [11, -8, 'broad', 1.5],
    [-12, 9, 'broad', 1.3],
    [12, 10, 'acacia', 1.5],
    [6, -14, 'broad', 1.2],
    [-14, -2, 'broad', 1.1],
    [-4, 14, 'acacia', 1.2],
    [15, 0, 'palm', 1.1],
    [-6, -14, 'palm', 1],
  ]
  return (
    <OutdoorShell room={room} ground={TEX.grass} groundTile={4} sun={[-20, 30, 10]}>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, r]} receiveShadow>
          <planeGeometry args={[2.4, 38]} />
          <meshStandardMaterial map={gravel} color="#cdb393" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.8, 4, 48]} />
        <meshStandardMaterial map={gravel} color="#cdb393" roughness={1} />
      </mesh>
      <group>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 1, 32]} />
          <meshStandardMaterial color="#8e8272" roughness={0.9} />
        </mesh>
        <Panel pos={[0, 1.5, 1.2]} w={1.6} h={0.9} kicker="Nature trail" title="Botanic Gardens" body="Indigenous trees and planted beds around the museum, open to all ticket holders." bg="#34402a" />
        <Panel pos={[0, 1.5, -1.2]} rot={Math.PI} w={1.6} h={0.9} kicker="Nature trail" title="Botanic Gardens" body="Follow the paths to the Snake Park and Ahmed's courtyard." bg="#34402a" />
      </group>
      {trees.map(([x, z, k, s], i) => (
        <Sway key={i} amount={0.006} speed={0.4}>
          <Tree pos={[x, 0, z]} kind={k} scale={s} seed={50 + i} />
        </Sway>
      ))}
      <ShrubField
        points={Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + 0.2
          const r = 7 + (i % 3) * 1.6
          return {
            pos: [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number],
            scale: 0.6 + (i % 4) * 0.12,
            color: i % 2 ? '#4b7a2f' : '#6a8f3a',
          }
        })}
      />
      <group position={[-10, 0, -10]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshStandardMaterial color="#5a3f2a" />
        </mesh>
        <Panel pos={[0, 1.6, 0.1]} rot={0.6} w={1.4} h={0.7} kicker="Research" title="Botany at NMK" bg="#34402a" />
      </group>
      <Bench pos={[4.5, 0, 4.5]} rot={-Math.PI / 4} />
      <Bench pos={[-4.5, 0, 4.5]} rot={Math.PI / 4} />
      <Bench pos={[4.5, 0, -4.5]} rot={Math.PI / 4} />
    </OutdoorShell>
  )
}
