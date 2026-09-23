import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useContext, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ROOM_BY_ID } from '../../data/rooms'
import { useTour } from '../../store'
import { Blob, ColumnRow, Cutout, FONT, Frame, Panel, RoundPlinth, ShrubField, SpotAt, Vitrine, WallCase } from '../kit'
import { TEX, useImage } from '../tex'
import { RoomActiveContext } from '../roomActive'
import { IndoorShell } from './shell'

const TRACK_BODY = new THREE.CylinderGeometry(0.05, 0.06, 0.18, 6)
const TRACK_LENS = new THREE.CircleGeometry(0.045, 8)

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

function gourdGeometry() {
  const pts: THREE.Vector2[] = []
  const prof = [
    [0, 0],
    [0.34, 0.04],
    [0.48, 0.2],
    [0.5, 0.38],
    [0.4, 0.56],
    [0.22, 0.68],
    [0.2, 0.78],
    [0.28, 0.92],
    [0.26, 1.06],
    [0.14, 1.16],
    [0.06, 1.24],
    [0.05, 1.34],
    [0, 1.36],
  ]
  for (const [x, y] of prof) pts.push(new THREE.Vector2(x, y))
  const g = new THREE.LatheGeometry(pts, 8)
  g.translate(0, -0.68, 0)
  return g
}

/** The Hall of Kenya calabash installation: a heaped dish and strings rising to a giant ladle. */
function Calabashes() {
  const heap = useRef<THREE.InstancedMesh>(null)
  const strings = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(gourdGeometry, [])
  const lod = useTour((s) => s.lod)
  const HEAP = lod === 'low' ? 80 : 160
  const ROPES = 14
  const PER = 6
  const ladleY = 5.35
  const ropes = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: ROPES }).map((_, i) => {
      const a = (i / ROPES) * Math.PI * 2 + (r() - 0.5) * 0.35
      const rad = 2.3 + r() * 0.5
      const bottom = new THREE.Vector3(Math.cos(a) * rad, 1.25, Math.sin(a) * rad)
      const top = new THREE.Vector3(Math.cos(a) * 1.05 + 0.3, ladleY - 0.2, Math.sin(a) * 0.8)
      const ts = Array.from({ length: PER }).map((__, j) => Math.min(0.97, (j + 0.3 + r() * 0.6) / PER))
      return { a, bottom, top, ts }
    })
  }, [])
  useLayoutEffect(() => {
    const r = rng(11)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const c = new THREE.Color()
    const tones = ['#8a4a22', '#a3552a', '#c9844a', '#f0ddc0', '#e7c48a', '#7a3c1a', '#d7a15a', '#f6ead4', '#6e3618', '#b27a44', '#9c5a2c']
    if (heap.current) {
      for (let i = 0; i < HEAP; i++) {
        const a = r() * Math.PI * 2
        const d = Math.sqrt(r()) * 2.85
        const mound = Math.cos((Math.min(d, 2.85) / 2.85) * (Math.PI / 2))
        const y = 0.78 + mound * 1.35 * (0.55 + r() * 0.5)
        const s = 0.24 + r() * 0.34
        e.set((r() - 0.5) * 2.6, r() * 6, (r() - 0.5) * 2.6)
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(Math.cos(a) * d, y, Math.sin(a) * d), q, new THREE.Vector3(s, s * (0.75 + r() * 0.7), s))
        heap.current.setMatrixAt(i, m)
        heap.current.setColorAt(i, c.set(tones[Math.floor(r() * tones.length)]))
      }
      heap.current.instanceMatrix.needsUpdate = true
      if (heap.current.instanceColor) heap.current.instanceColor.needsUpdate = true
    }
    if (strings.current) {
      let k = 0
      for (const rope of ropes) {
        for (const t of rope.ts) {
          const p = rope.bottom.clone().lerp(rope.top, t)
          const s = 0.14 + r() * 0.12
          e.set(Math.PI + (r() - 0.5) * 0.25, r() * 6, (r() - 0.5) * 0.25)
          q.setFromEuler(e)
          m.compose(p, q, new THREE.Vector3(s, s * (1.3 + r() * 1.1), s))
          strings.current.setMatrixAt(k, m)
          strings.current.setColorAt(k, c.set(tones[Math.floor(r() * tones.length)]))
          k++
        }
      }
      strings.current.instanceMatrix.needsUpdate = true
      if (strings.current.instanceColor) strings.current.instanceColor.needsUpdate = true
    }
  }, [ropes, HEAP])
  const ropeGeos = useMemo(() => ropes.map((rp) => new THREE.TubeGeometry(new THREE.LineCurve3(rp.bottom, rp.top), 1, 0.012, 5, false)), [ropes])
  const ropeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6a5139', roughness: 0.9 }), [])
  const ladle = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ladle.current) ladle.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.04
  })
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.6, 48]} />
        <meshStandardMaterial color="#3a2012" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.45, 2.15, 0.28, 32]} />
        <meshStandardMaterial color="#f7f1e6" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <torusGeometry args={[3.35, 0.09, 8, 32]} />
        <meshStandardMaterial color="#f3eee4" roughness={0.4} />
      </mesh>
      <instancedMesh ref={heap} args={[geo, undefined, HEAP]} receiveShadow>
        <meshStandardMaterial roughness={0.58} />
      </instancedMesh>
      <instancedMesh ref={strings} args={[geo, undefined, ROPES * PER]}>
        <meshStandardMaterial roughness={0.58} />
      </instancedMesh>
      {ropeGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={ropeMat} />
      ))}
      <group ref={ladle} position={[0.3, ladleY, 0]}>
        <mesh scale={[1.3, 0.45, 1.0]} rotation-z={0.12} castShadow>
          <sphereGeometry args={[1, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#8f5e32" roughness={0.5} clearcoat={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[2.1, 0.75, 0]} rotation-z={-1.05} castShadow>
          <cylinderGeometry args={[0.07, 0.18, 2.2, 12]} />
          <meshPhysicalMaterial color="#8f5e32" roughness={0.5} clearcoat={0.5} />
        </mesh>
      </group>
      <SpotAt pos={[-5, 10.5, 7]} at={[0, 2.2, 0]} intensity={240} angle={0.3} />
      {lod === 'high' && <SpotAt pos={[5, 10.5, 6]} at={[0, 3.6, 0]} intensity={170} angle={0.3} />}
      <Blob pos={[0, 0, 0]} size={[7.5, 7.5]} />
    </group>
  )
}

function TrackLights({ x, from, to, y, step = 2 }: { x: number; from: number; to: number; y: number; step?: number }) {
  const zs = useMemo(() => {
    const out: number[] = []
    for (let z = from; z <= to + 1e-4; z += step) out.push(z)
    return out
  }, [from, to, step])
  const body = useRef<THREE.InstancedMesh>(null)
  const lens = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const b = body.current
    const l = lens.current
    if (!b || !l) return
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0))
    const qLens = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    const parent = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    zs.forEach((z, i) => {
      parent.compose(new THREE.Vector3(x, y - 0.1, z), q, new THREE.Vector3(1, 1, 1))
      b.setMatrixAt(i, parent)
      local.compose(new THREE.Vector3(0, -0.091, 0), qLens, new THREE.Vector3(1, 1, 1))
      l.setMatrixAt(i, parent.clone().multiply(local))
    })
    b.instanceMatrix.needsUpdate = true
    l.instanceMatrix.needsUpdate = true
  }, [zs, x, y])
  return (
    <group>
      <mesh position={[x, y + 0.03, (from + to) / 2]}>
        <boxGeometry args={[0.05, 0.03, Math.abs(to - from) + 0.6]} />
        <meshLambertMaterial color="#1b1814" />
      </mesh>
      <instancedMesh ref={body} args={[TRACK_BODY, undefined, Math.max(1, zs.length)]}>
        <meshLambertMaterial color="#1b1814" />
      </instancedMesh>
      <instancedMesh ref={lens} args={[TRACK_LENS, undefined, Math.max(1, zs.length)]}>
        <meshBasicMaterial color="#fff1cf" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function Figure({ pos, h = 0.9, color = '#3a2414' }: { pos: [number, number, number]; h?: number; color?: string }) {
  const g = useMemo(() => {
    const pts = [
      [0, 0],
      [0.12, 0],
      [0.1, 0.08],
      [0.07, 0.2],
      [0.09, 0.45],
      [0.07, 0.62],
      [0.04, 0.7],
      [0.06, 0.78],
      [0.055, 0.9],
      [0, 0.96],
    ].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 16)
  }, [])
  return (
    <mesh position={pos} scale={[h, h, h]} geometry={g} castShadow>
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  )
}

function Balustrade({ x, len, y, facing }: { x: number; len: number; y: number; facing: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const n = Math.floor(len / 0.28)
  const geo = useMemo(() => {
    const pts = [
      [0, 0],
      [0.06, 0],
      [0.06, 0.06],
      [0.035, 0.12],
      [0.07, 0.38],
      [0.035, 0.66],
      [0.05, 0.72],
      [0.05, 0.78],
      [0, 0.78],
    ].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 10)
  }, [])
  useLayoutEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      m.makeTranslation(0, 0, -len / 2 + (i + 0.5) * (len / n))
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [n, len])
  return (
    <group position={[x, y, 0]} rotation-y={facing}>
      <instancedMesh ref={ref} args={[geo, undefined, n]} castShadow>
        <meshStandardMaterial color="#f4efe6" roughness={0.5} />
      </instancedMesh>
      <mesh position={[0, 0.84, 0]} castShadow>
        <boxGeometry args={[0.2, 0.1, len]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.2, 0.06, len]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.5} />
      </mesh>
    </group>
  )
}

function ArchWindow({ pos, rot, w = 1.4, h = 1.8, color = '#fff4de', intensity = 1.2, frame = '#f4efe6' }: { pos: [number, number, number]; rot: number; w?: number; h?: number; color?: string; intensity?: number; frame?: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0)
    s.lineTo(-w / 2, h - w / 2)
    s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true)
    s.lineTo(w / 2, 0)
    s.lineTo(-w / 2, 0)
    return s
  }, [w, h])
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, 0, 0.02]}>
        <shapeGeometry args={[shape, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={Math.min(1, intensity)} />
      </mesh>
      <mesh position={[0, -0.08, 0.05]}>
        <boxGeometry args={[w + 0.3, 0.14, 0.12]} />
        <meshStandardMaterial color={frame} />
      </mesh>
      <mesh position={[0, h / 2 - w / 4, 0.03]}>
        <boxGeometry args={[0.05, h - w / 2, 0.03]} />
        <meshStandardMaterial color={frame} />
      </mesh>
    </group>
  )
}

export function HallOfKenya() {
  const room = ROOM_BY_ID['hall-of-kenya']
  const dressing = useTour((s) => s.dressing)
  const lod = useTour((s) => s.lod)
  const active = useContext(RoomActiveContext)
  const [w, d, h] = room.size
  const M = 5
  const hw = w / 2
  const cols = [-10, -6, -2, 2, 6, 10]
  return (
    <IndoorShell room={room} floor={TEX.parquet} floorTile={2.2} floorColor="#f0c2a4" floorRough={0.28} wall="#f7f3ea" ceiling="#f7f3ea" bounce={0.62} ambient={0.16} hemi={0.28} keyLight={1.15} envI={0.55} warmth="#ffe4c2">
      <Suspense fallback={null}>{active && dressing && <Calabashes />}</Suspense>
      <ColumnRow positions={([-1, 1] as const).flatMap((s) => cols.map((z) => [s * 6.5, 0, z] as [number, number, number]))} h={M} r={0.3} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (6.5 + (hw - 6.5) / 2 - 0.35), M + 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[hw - 6.5 + 0.7, 0.5, d]} />
            <meshStandardMaterial color="#f1ebe0" roughness={0.7} emissive="#f1ebe0" emissiveIntensity={0.28} />
          </mesh>
          <mesh position={[s * 6.15, M + 0.12, 0]} castShadow>
            <boxGeometry args={[0.35, 0.8, d]} />
            <meshStandardMaterial color="#f7f2ea" roughness={0.6} />
          </mesh>
          <Balustrade x={s * 6.2} len={d - 0.4} y={M + 0.5} facing={0} />
          {[-11, -6.5, -2, 2.5, 7, 11.5].map((z) => (
            <ArchWindow key={z} pos={[s * (hw - 0.02), 7.2, z]} rot={-s * (Math.PI / 2)} w={1.6} h={2.6} color="#eef4ff" frame="#6b5a48" />
          ))}
          <mesh position={[s * (hw - 0.3), M + 1.8, 0]}>
            <boxGeometry args={[0.08, 0.02, d - 1]} />
            <meshStandardMaterial color="#20170f" />
          </mesh>
          {lod === 'high' && <pointLight position={[s * 8.8, M - 0.4, 0]} intensity={8} distance={16} color="#ffd6a0" />}
          <TrackLights x={s * 6.15} from={-13} to={13} y={M - 0.15} step={2.6} />
        </group>
      ))}
      {/* cornice and ceiling beams */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.2), h - 0.25, 0]}>
          <boxGeometry args={[0.4, 0.5, d]} />
          <meshStandardMaterial color="#efe8dc" />
        </mesh>
      ))}
      {[-9, -3, 3, 9].map((z) => (
        <mesh key={z} position={[0, h - 0.2, z]}>
          <boxGeometry args={[w, 0.4, 0.35]} />
          <meshStandardMaterial color="#ebe3d6" />
        </mesh>
      ))}
      {/* open wooden stair at the north end, treads only so it does not read as a solid pyramid */}
      <group position={[0, 0, -d / 2]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[0, 0.18 + i * 0.32, 4.4 - i * 0.32]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.07, 0.38]} />
            <meshStandardMaterial color="#6a3c24" roughness={0.48} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.72, 2.3, 2.4]} rotation-x={-0.78} castShadow>
            <boxGeometry args={[0.08, 0.16, 5.2]} />
            <meshStandardMaterial color="#f4efe6" roughness={0.45} />
          </mesh>
        ))}
        <Frame pos={[0, 7.4, 0.05]} w={1.3} src="/photos/hall-of-kenya-calabash-tower.jpg" frame="#1f1812" />
        {[-4.5, 4.5].map((x) => (
          <ArchWindow key={x} pos={[x, 6.6, 0.03]} rot={0} w={1.6} h={2.8} color="#eef4ff" frame="#6b5a48" />
        ))}
        <SpotAt pos={[0, 10, 8]} at={[0, 2, 2]} intensity={50} angle={0.35} />
      </group>
      {/* side vitrines */}
      {[-1, 1].flatMap((s) =>
        [-3, 9].map((z) => (
          <Vitrine key={`${s}${z}`} pos={[s * 9, 0, z]} size={[1.1, 1.6, 1.1]} base={0.55} rot={Math.PI / 2}>
            <Figure pos={[0, 0, 0]} h={1.1 + (z > 0 ? 0.25 : 0)} color={z > 0 ? '#4a2c18' : '#6b4226'} />
          </Vitrine>
        )),
      )}
      <Vitrine pos={[9, 0, 5]} size={[1.2, 2, 1.2]} base={0.5} rot={Math.PI / 2}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.5, 1.6, 20, 1, true]} />
          <meshStandardMaterial color="#4a4038" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#2b241e" roughness={1} />
        </mesh>
      </Vitrine>
      <Frame pos={[-4.6, 2.45, -3.2]} w={2.8} src="/photos/hall-of-kenya-calabashes.jpg" caption="The calabash installation beneath the mezzanine" />
      <Frame pos={[4.6, 2.45, -3.2]} w={2.8} src="/photos/hall-of-kenya.jpg" caption="The Hall of Kenya with its white columns and mezzanine" />
      <Frame pos={[-hw + 0.02, 2.8, -9]} rot={Math.PI / 2} w={2.1} src="/illustrative/butterfly-map.jpg" frame="#1f1812" mat="#1c1916" caption="Butterfly map of Kenya · illustrative" />
      <Frame pos={[-hw + 0.02, 2.5, 6]} rot={Math.PI / 2} w={2.4} src="/photos/hall-of-kenya.jpg" caption="The Hall of Kenya · NMK photograph" />
      <Panel pos={[hw - 0.03, 2.6, -9]} rot={-Math.PI / 2} w={2} h={1.3} kicker="Opened 1930" title="The Coryndon Museum" body="Named after Sir Robert Coryndon, renamed the National Museum of Kenya in 1963, modernised 2005–2008." />
      <Text font={FONT} position={[0, M + 0.05, d / 2 - 0.05]} rotation-y={Math.PI} fontSize={0.5} color="#3a2c20" anchorY="bottom">
        Hall of Kenya
      </Text>
    </IndoorShell>
  )
}

export function Birds() {
  const room = ROOM_BY_ID.birds
  const [w, , h] = room.size
  const hw = w / 2
  const large = useImage('/illustrative/bird-case-large.jpg')
  return (
    <IndoorShell room={room} floor={TEX.stoneFloor} floorTile={2.4} floorRough={0.3} wall="#efe3c9" ceiling="#f3efe7" ambient={0.4}>
      {[-8, -3, 2, 7].map((z, i) => (
        <WallCase key={z} pos={[-hw + 0.02, 0, z]} rot={Math.PI / 2} w={4.4} h={2.3} depth={0.6} lift={0.55} src={i % 2 ? '/illustrative/bird-case-small.jpg' : '/illustrative/bird-case-large.jpg'} emissive={0.45} />
      ))}
      {[-8, -3].map((z, i) => (
        <WallCase key={z} pos={[hw - 0.02, 0, z]} rot={-Math.PI / 2} w={4.4} h={2.3} depth={0.6} lift={0.55} src={i % 2 ? '/illustrative/bird-case-small.jpg' : '/illustrative/bird-case-large.jpg'} emissive={0.45} />
      ))}
      {/* free-standing double-sided case like the one in the museum photograph */}
      <group position={[0, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.6, 1.8]} />
          <meshStandardMaterial color="#141110" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 1.8, s * 0.2]} rotation-y={s < 0 ? Math.PI : 0}>
            <planeGeometry args={[4.4, 2.4]} />
            <meshStandardMaterial map={large} emissive="#ffffff" emissiveMap={large} emissiveIntensity={0.45} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[4.6, 2.4, 1.8]} />
          <meshPhysicalMaterial color="#dfe9e6" transparent opacity={0.12} roughness={0.05} depthWrite={false} envMapIntensity={1.5} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[4.7, 0.22, 1.9]} />
          <meshStandardMaterial color="#141110" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 2.3, 1.8, 0]}>
            <boxGeometry args={[0.1, 2.4, 1.8]} />
            <meshStandardMaterial color="#141110" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[2.1, 3.3, 0.92]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial color="#f6f2ea" />
        </mesh>
      </group>
      <Frame pos={[hw - 0.02, 2.2, 3]} rot={-Math.PI / 2} w={2.8} src="/photos/birds-of-east-africa.jpg" caption="The bird gallery · NMK photograph" />
      <Panel pos={[hw - 0.03, 2, -0.2]} rot={-Math.PI / 2} w={1.4} h={1} kicker="Family groups" title="Birds of East Africa" body="Birds of prey, water birds, sunbirds and more, each adapted to its habitat and food." />
      {[-7, -1, 5].map((z) => (
        <ArchWindow key={z} pos={[hw - 0.02, h - 1.4, z]} rot={-Math.PI / 2} w={1.9} h={0.9} color="#e8f0e0" />
      ))}
      {[-6, 0, 6].map((z) => (
        <SpotAt key={z} pos={[0, h - 0.2, z]} at={[-hw, 1.6, z]} intensity={18} angle={0.6} />
      ))}
      <SpotAt pos={[0, h - 0.2, 2]} at={[0, 1.5, -2.6]} intensity={22} angle={0.5} />
    </IndoorShell>
  )
}

function OpenArch({ pos, rot, w = 2.6, h = 3.6, photo }: { pos: [number, number, number]; rot: number; w?: number; h?: number; photo?: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0)
    s.lineTo(-w / 2, h - w / 2)
    s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true)
    s.lineTo(w / 2, 0)
    s.lineTo(-w / 2, 0)
    return s
  }, [w, h])
  const trim = useMemo(() => {
    const t = 0.16
    const s = new THREE.Shape()
    s.moveTo(-w / 2 - t, 0)
    s.lineTo(-w / 2 - t, h - w / 2)
    s.absarc(0, h - w / 2, w / 2 + t, Math.PI, 0, true)
    s.lineTo(w / 2 + t, 0)
    s.lineTo(w / 2, 0)
    s.lineTo(w / 2, h - w / 2)
    s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false)
    s.lineTo(-w / 2, 0)
    return s
  }, [w, h])
  return (
    <group position={pos} rotation-y={rot}>
      {photo ? (
        <ArchPhoto shape={shape} src={photo} w={w} h={h} />
      ) : (
        <>
          <mesh position={[0, 0, 0.015]}>
            <shapeGeometry args={[shape, 24]} />
            <meshBasicMaterial color="#e2b27a" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.001, 0.025]} scale={[0.7, 0.8, 1]}>
            <shapeGeometry args={[shape, 24]} />
            <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
          </mesh>
        </>
      )}
      <mesh position={[0, 0, 0.04]}>
        <shapeGeometry args={[trim, 24]} />
        <meshStandardMaterial color="#4a2e1c" roughness={0.6} />
      </mesh>
    </group>
  )
}

function ArchPhoto({ shape, src, w, h }: { shape: THREE.Shape; src: string; w: number; h: number }) {
  const tex = useImage(src)
  const geo = useMemo(() => {
    const g = new THREE.ShapeGeometry(shape, 24)
    const img = tex.image as { width: number; height: number }
    const ia = img.width / img.height
    const oa = w / h
    const sx = ia > oa ? oa / ia : 1
    const sy = ia > oa ? 1 : ia / oa
    const uv = g.attributes.uv as THREE.BufferAttribute
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const u = (p.getX(i) + w / 2) / w
      const v = p.getY(i) / h
      uv.setXY(i, (1 - sx) / 2 + u * sx, (1 - sy) / 2 + v * sy)
    }
    return g
  }, [shape, tex, w, h])
  return (
    <mesh position={[0, 0, 0.015]} geometry={geo}>
      <meshBasicMaterial map={tex} color="#e6d6c0" toneMapped={false} />
    </mesh>
  )
}

function Arches({ w, d }: { w: number; d: number }) {
  const hw = w / 2
  const hd = d / 2
  const list: { p: [number, number, number]; r: number; photo?: string }[] = []
  const views = ['/photos/birds-of-east-africa.jpg', '/photos/human-origins.jpg', '/photos/hominid-diorama.jpg', '/photos/turkana-boy.jpg']
  for (const [i, z] of [-7.5, 0.5].entries()) {
    list.push({ p: [-hw + 0.02, 0, z], r: Math.PI / 2, photo: views[i] })
    list.push({ p: [hw - 0.02, 0, z], r: -Math.PI / 2, photo: views[i + 2] })
  }
  for (const x of [-7.5, 7.5]) list.push({ p: [x, 0, -hd + 0.02], r: 0, photo: x < 0 ? '/photos/human-origins.jpg' : '/photos/hominid-diorama.jpg' })
  const vents: { p: [number, number, number]; r: number }[] = []
  for (const z of [-3.5, 4.5]) {
    vents.push({ p: [-hw + 0.03, 4.6, z], r: Math.PI / 2 })
    vents.push({ p: [hw - 0.03, 4.6, z], r: -Math.PI / 2 })
  }
  for (const x of [-3.5, 3.5]) vents.push({ p: [x, 4.6, -hd + 0.03], r: 0 })
  return (
    <>
      {list.map((a, i) => (
        <OpenArch key={i} pos={a.p} rot={a.r} photo={a.photo} />
      ))}
      {vents.map((v, i) => (
        <group key={i} position={v.p} rotation-y={v.r}>
          <mesh>
            <circleGeometry args={[0.34, 32]} />
            <meshStandardMaterial color="#3a2a1c" metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.18, 0.26, 32]} />
            <meshStandardMaterial color="#8a6a45" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Rocks({ r }: { r: number }) {
  const list = useMemo(() => {
    const rn = rng(19)
    return Array.from({ length: 16 }).map(() => {
      const a = rn() * Math.PI * 2
      const d = r * (0.35 + rn() * 0.6)
      return { p: [Math.cos(a) * d, 0.6, Math.sin(a) * d] as [number, number, number], s: 0.15 + rn() * 0.35, rot: rn() * 6 }
    })
  }, [r])
  return (
    <>
      {list.map((k, i) => (
        <mesh key={i} position={k.p} rotation={[k.rot, k.rot * 2, 0]} scale={[k.s * 1.4, k.s * 0.55, k.s]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={i % 2 ? '#6e6254' : '#8a7560'} roughness={0.96} />
        </mesh>
      ))}
      <ShrubField
        points={list.slice(0, 10).map((k) => ({
          pos: [k.p[0] * 0.8 + 0.4, 0.55, k.p[2] * 0.8 - 0.3],
          scale: 0.22,
          color: '#8a7a3e',
        }))}
      />
      {list.slice(0, 14).map((k, i) => (
        <mesh key={`grass${i}`} position={[k.p[0] * 0.65, 0.7, k.p[2] * 0.65]} rotation-z={(i % 5) * 0.2 - 0.4}>
          <coneGeometry args={[0.05, 0.42, 4]} />
          <meshStandardMaterial color={i % 2 ? '#a8944e' : '#7d6a38'} roughness={1} />
        </mesh>
      ))}
    </>
  )
}

export function Mammals() {
  const room = ROOM_BY_ID.mammals
  const dressing = useTour((s) => s.dressing)
  const active = useContext(RoomActiveContext)
  const [w, d, h] = room.size
  const hw = w / 2
  const hd = d / 2
  const G = 6
  const trusses = useMemo(() => {
    const out: { p: [number, number, number]; r: [number, number, number]; l: number }[] = []
    for (let i = -3; i <= 3; i++) {
      out.push({ p: [i * 3.6, h + 1.2, 0], r: [0, Math.PI / 4, 0], l: 12 })
      out.push({ p: [i * 3.6, h + 1.2, 0], r: [0, -Math.PI / 4, 0], l: 12 })
    }
    return out
  }, [h])
  return (
    <IndoorShell room={room} floor={TEX.stoneFloor} floorTile={1.8} floorColor="#e7d3b4" floorRough={0.55} wall="#e4c98a" ceiling="#efe4cc" bounce={0.35} ambient={0.18} hemi={0.28} keyLight={0.85} envI={0.4} noCeiling warmth="#ffd7a4">
      <Arches w={w} d={d} />
      {[
        [0, 5.2, -hd + 0.035, 0, w],
        [-hw + 0.035, 5.2, 0, Math.PI / 2, d],
        [hw - 0.035, 5.2, 0, -Math.PI / 2, d],
      ].map(([x, y, z, r, l], i) => (
        <mesh key={i} position={[x, y, z]} rotation-y={r}>
          <planeGeometry args={[l, 1.4]} />
          <meshStandardMaterial color="#c89a55" roughness={0.9} />
        </mesh>
      ))}
      <group>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[5.9, 6, 0.44, 28]} />
          <meshStandardMaterial color="#cdb98a" roughness={0.6} />
        </mesh>
        <group position={[0, 0.0, 0]}>
          <RoundPlinth r={5.4} h={0.55} rail={false} />
        </group>
        <Suspense fallback={null}>
          {active && dressing && (
            <>
              <Rocks r={5} />
              <Cutout src="/cutouts/giraffe.webp" pos={[1.6, 0.62, -2.7]} height={5.2} />
              <Cutout src="/cutouts/elephant.webp" pos={[-0.5, 0.62, -0.15]} height={3.8} flip />
              <Cutout src="/cutouts/zebra.webp" pos={[-2.7, 0.62, 1.15]} height={1.55} flip />
              <Cutout src="/cutouts/buffalo.webp" pos={[2.7, 0.62, 0.45]} height={2.05} />
              <Cutout src="/cutouts/impala.webp" pos={[-0.15, 0.62, 2.05]} height={1.25} />
              <Cutout src="/cutouts/warthog.webp" pos={[1.55, 0.62, 2.25]} height={0.88} />
            </>
          )}
        </Suspense>
        <group position={[0, 0, 6.5]}>
          <mesh position={[0, 0.5, 0]} rotation-x={-0.35} castShadow>
            <boxGeometry args={[1.6, 0.9, 0.5]} />
            <meshStandardMaterial color="#b8a070" roughness={0.7} />
          </mesh>
          <Text font={FONT} position={[0, 0.62, 0.3]} rotation-x={-0.35 - Math.PI / 2 + Math.PI / 2} fontSize={0.11} color="#2b211a" maxWidth={1.4} textAlign="center">
            Great Hall of Mammals
          </Text>
          <mesh position={[0, 0.005, 1.1]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[2.4, 1.2]} />
            <meshStandardMaterial color="#2a1f18" roughness={1} />
          </mesh>
        </group>
      </group>
      {/* upper gallery */}
      {[
        { p: [0, G, -hd + 0.7], r: 0, l: w },
        { p: [-hw + 0.7, G, 0], r: Math.PI / 2, l: d },
        { p: [hw - 0.7, G, 0], r: Math.PI / 2, l: d },
      ].map((g, i) => (
        <group key={i} position={g.p as [number, number, number]} rotation-y={g.r}>
          <mesh position={[0, 0, 0.3]} castShadow receiveShadow>
            <boxGeometry args={[g.l, 0.5, 2]} />
            <meshStandardMaterial color="#d9c29a" roughness={0.8} emissive="#d9c29a" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0.95, 1.28]}>
            <boxGeometry args={[g.l, 0.05, 0.05]} />
            <meshStandardMaterial color="#b88a4a" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.5, 1.28]}>
            <boxGeometry args={[g.l, 0.03, 0.03]} />
            <meshStandardMaterial color="#b88a4a" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.9, -0.68]}>
            <planeGeometry args={[g.l - 1, 0.8]} />
            <meshBasicMaterial color="#e9c48c" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, h, 0]} rotation-x={Math.PI / 2} scale={[1, 1, 0.28]}>
        <cylinderGeometry args={[hw, hw, d, 48, 1, true, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#efe5cf" roughness={0.9} side={THREE.BackSide} emissive="#efe5cf" emissiveIntensity={0.38} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[0, h, sd * (hd - 0.01)]} rotation-y={sd > 0 ? Math.PI : 0} scale={[1, 0.28, 1]}>
          <circleGeometry args={[hw, 48, 0, Math.PI]} />
          <meshStandardMaterial color="#e6d9bf" roughness={0.9} emissive="#e6d9bf" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* light vault with dark steel trusses */}
      {trusses.map((t, i) => (
        <mesh key={i} position={t.p} rotation={t.r}>
          <boxGeometry args={[0.1, 0.1, t.l]} />
          <meshStandardMaterial color="#3b3530" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {[-8, -3, 3, 8].map((x, i) => (
        <group key={x} position={[x, h + 0.4, i % 2 ? 3 : -3]}>
          {Array.from({ length: 8 }).map((_, k) => (
            <mesh key={k} rotation-z={(k / 8) * Math.PI}>
              <boxGeometry args={[0.9, 0.02, 0.02]} />
              <meshBasicMaterial color="#fff2d0" toneMapped={false} />
            </mesh>
          ))}
          {i % 2 === 0 && <pointLight intensity={7} distance={14} color="#ffe2b0" />}
        </group>
      ))}
      <SpotAt pos={[-6, h - 0.5, 7]} at={[-0.4, 2, 0.3]} intensity={320} angle={0.26} />
      <SpotAt pos={[6, h - 0.5, 5]} at={[2.6, 3.4, -2.8]} intensity={220} angle={0.24} />
      <Panel pos={[-hw + 0.03, 2.2, -3.5]} rot={Math.PI / 2} w={1.6} h={1.1} kicker="Theme" title="Evolution" body="How mammals radiated into the forms found across Kenya today." bg="#efe2c8" fg="#2b211a" accent="#9a4a24" />
      <Panel pos={[hw - 0.03, 2.2, -3.5]} rot={-Math.PI / 2} w={1.6} h={1.1} kicker="Theme" title="Locomotion" body="Running, climbing, swimming and flying." bg="#efe2c8" fg="#2b211a" accent="#9a4a24" />
      <Panel pos={[hw - 0.03, 2.2, 4.5]} rot={-Math.PI / 2} w={1.6} h={1.1} kicker="Theme three" title="Feeding & defence" body="Feeding adaptation and defence mechanism, the third theme named by the museum." bg="#efe2c8" fg="#2b211a" accent="#9a4a24" />
      <Frame pos={[-5.4, 2.55, -hd + 0.06]} w={3.2} src="/photos/great-hall-of-mammals.jpg" caption="The Great Hall of Mammals" />
      <Frame pos={[5.4, 2.55, -hd + 0.06]} w={3.2} src="/photos/great-hall-of-mammals.jpg" caption="NMK photograph" />
      <Frame pos={[-hw + 0.03, 2.3, 4.5]} rot={Math.PI / 2} w={2.4} src="/photos/great-hall-of-mammals.jpg" caption="NMK photograph" />
    </IndoorShell>
  )
}

function Skull({ pos, s = 1 }: { pos: [number, number, number]; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.12, 0]} scale={[0.1, 0.085, 0.12]} castShadow>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#8a6a45" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.07, 0.085]} scale={[0.075, 0.055, 0.05]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#6f5236" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.13, 0.09]} rotation-z={Math.PI / 2} scale={[0.02, 0.09, 0.02]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#5f4630" roughness={0.75} />
      </mesh>
    </group>
  )
}

export function Cradle() {
  const room = ROOM_BY_ID.cradle
  const [w, d, h] = room.size
  const hw = w / 2
  const boy = useImage('/cutouts/turkana-boy.webp')
  return (
    <IndoorShell room={room} floor={TEX.parquet} floorTile={3} floorRough={0.3} floorColor="#7a4a33" wall="#c9ab85" ceiling="#1b1a1f" ambient={0.18} keyLight={0.5} warmth="#ffcf96">
      {/* blue cove light, as in the gallery */}
      <mesh position={[0, h - 0.05, 0]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[4, 8.5, 64]} />
        <meshBasicMaterial color="#2b5fe0" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, h - 0.6, 0]} intensity={8} color="#4d7cff" distance={14} />
      <Vitrine pos={[0, 0, 1]} size={[1.6, 0.4, 2.8]} base={0.85}>
        <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.9, 2.5]} />
          <meshStandardMaterial map={boy} alphaTest={0.5} roughness={0.7} />
        </mesh>
      </Vitrine>
      <SpotAt pos={[0, h - 0.2, 2.5]} at={[0, 0.9, 1]} intensity={45} angle={0.28} />
      <Text font={FONT} position={[0, 0.5, 2.46]} fontSize={0.12} color="#f3e7d2">
        Turkana Boy · KNM-WT 15000
      </Text>
      {/* skull room along the west wall */}
      {[-6, -3.6, -1.2, 1.2].map((z, i) => (
        <Vitrine key={z} pos={[-hw + 1.2, 0, z]} size={[0.9, 0.7, 0.9]} base={1.1}>
          <Skull pos={[0, 0.02, 0]} s={1.2 + (i % 2) * 0.2} />
        </Vitrine>
      ))}
      <Panel pos={[-hw + 0.03, 2.8, -2.4]} rot={Math.PI / 2} w={2.4} h={0.8} kicker="Hominid Skull Room" title="Our ancestors, face to face" />
      <WallCase pos={[0, 0, -d / 2 + 0.02]} w={7} h={2.6} depth={1} lift={0.4} src="/photos/hominid-diorama.jpg" frame="#141110" emissive={0.3} />
      <SpotAt pos={[0, h - 0.2, -6]} at={[0, 1.6, -d / 2]} intensity={40} angle={0.5} />
      <Vitrine pos={[8, 0, 4]} size={[1.4, 0.5, 1.4]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[-0.45 + (i % 4) * 0.3, 0.04, -0.3 + Math.floor(i / 4) * 0.5]} rotation={[Math.PI / 2, 0, i]} scale={[0.1, 0.14, 0.04]} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? '#5a534a' : '#7b6f60'} roughness={0.8} flatShading />
          </mesh>
        ))}
      </Vitrine>
      <Frame pos={[hw - 0.03, 2.3, -3]} rot={-Math.PI / 2} w={3} src="/photos/human-origins.jpg" caption="Human origins gallery · NMK photograph" />
      <Frame pos={[hw - 0.03, 2.3, 4]} rot={-Math.PI / 2} w={2.2} src="/photos/turkana-boy.jpg" caption="Turkana Boy exhibit · NMK photograph" />
    </IndoorShell>
  )
}

export function AsianAfrican() {
  const room = ROOM_BY_ID['asian-african']
  const [w, d] = room.size
  const hw = w / 2
  return (
    <IndoorShell room={room} floor={TEX.parquet} floorTile={3} floorRough={0.3} floorColor="#c08a64" wall="#ece0cc" ambient={0.4}>
      <Panel pos={[0, 2.2, -d / 2 + 0.03]} w={4} h={2} kicker="Permanent exhibition" title="Asian African Heritage" body="The people who crossed the Indian Ocean to work, trade and settle in East Africa, and their place in Kenyan public life." bg="#2d4a4a" accent="#e7b36a" />
      {['The railway', 'The duka', 'Public life'].map((t, i) => (
        <Panel key={t} pos={[-hw + 0.03, 2.1, -4 + i * 4]} rot={Math.PI / 2} w={2.4} h={1.4} kicker={`Chapter ${i + 1}`} title={t} bg="#3b2d22" />
      ))}
      <Vitrine pos={[0, 0, 1]} size={[1.6, 1, 1]}>
        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={x} position={[x, 0.15, 0]} castShadow>
            <boxGeometry args={[0.3, 0.3 + i * 0.1, 0.22]} />
            <meshStandardMaterial color={['#8a3b24', '#b98a55', '#2d4a4a'][i]} roughness={0.6} />
          </mesh>
        ))}
      </Vitrine>
      <SpotAt pos={[0, 4.6, 4]} at={[0, 2, -d / 2]} intensity={30} angle={0.6} />
      <SpotAt pos={[2, 4.6, 0]} at={[-hw, 2, 0]} intensity={24} angle={0.7} />
    </IndoorShell>
  )
}

function CoinTray() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const N = 40
  useLayoutEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const r = rng(5)
    for (let i = 0; i < N; i++) {
      const s = 0.04 + r() * 0.04
      m.makeScale(s, 0.008, s).setPosition(-0.65 + (i % 10) * 0.145, 0.01, -0.3 + Math.floor(i / 10) * 0.2)
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.set(['#c9a45a', '#b0b0ac', '#9a6a3a', '#d8c07a'][Math.floor(r() * 4)]))
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} castShadow>
      <cylinderGeometry args={[1, 1, 1, 24]} />
      <meshStandardMaterial metalness={0.9} roughness={0.3} />
    </instancedMesh>
  )
}

export function Numismatic() {
  const room = ROOM_BY_ID.numismatic
  const [w, d] = room.size
  const hw = w / 2
  const screen = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (screen.current) screen.current.color.setHSL(0.08, 0.5, 0.45 + Math.sin(clock.elapsedTime * 1.2) * 0.04)
  })
  return (
    <IndoorShell room={room} floor={TEX.stoneFloor} floorTile={2} floorRough={0.25} wall="#43424f" ceiling="#2a2930" ambient={0.35} keyLight={0.6}>
      {[-3, 3].map((x) => (
        <Vitrine key={x} pos={[x, 0, -2]} size={[1.7, 0.5, 0.9]}>
          <CoinTray />
        </Vitrine>
      ))}
      <group position={[7, 0, 4]} rotation-y={-Math.PI / 2}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 0.6]} />
          <meshStandardMaterial color="#1a1918" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.55, 0.1]} rotation-x={-0.25}>
          <planeGeometry args={[1.1, 0.7]} />
          <meshBasicMaterial ref={screen} toneMapped={false} />
        </mesh>
        <Text font={FONT} position={[0, 1.6, 0.13]} rotation-x={-0.25} fontSize={0.1} color="#1a120b">
          Save a shilling today
        </Text>
      </group>
      <Panel pos={[0, 2.2, -d / 2 + 0.03]} w={3.6} h={1.6} kicker="Numismatic exhibition" title="Trade, exchange and banking" body="From historic currencies to digital trade, and a savings game for young visitors." bg="#3a2e22" accent="#e0b25a" />
      <mesh position={[-hw + 0.03, 2.4, 3]} rotation-y={Math.PI / 2}>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial color="#b8924a" metalness={0.9} roughness={0.35} />
      </mesh>
      <Text font={FONT} position={[-hw + 0.05, 2.4, 3]} rotation-y={Math.PI / 2} fontSize={0.4} color="#5a4220">
        KSh
      </Text>
      <SpotAt pos={[0, 4.6, 2]} at={[-3, 1, -2]} intensity={30} angle={0.35} />
      <SpotAt pos={[0, 4.6, 2]} at={[3, 1, -2]} intensity={30} angle={0.35} />
      <SpotAt pos={[-3, 4.6, 3]} at={[-hw, 2.4, 3]} intensity={30} angle={0.35} />
    </IndoorShell>
  )
}

function HorseAndRider() {
  const bronze = <meshStandardMaterial color="#2c2a22" metalness={0.8} roughness={0.4} />
  return (
    <group position={[4, 0, 2]} rotation-y={-0.6}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.12, 24]} />
        {bronze}
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation-z={0.25} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 1.7, 8]} />
        {bronze}
      </mesh>
      <mesh position={[0.25, 1.75, 0]} rotation-z={-0.9} scale={[0.28, 0.75, 0.24]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        {bronze}
      </mesh>
      <mesh position={[0.9, 2.35, 0]} rotation-z={-0.4} scale={[0.14, 0.36, 0.12]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        {bronze}
      </mesh>
      <mesh position={[0.7, 1.9, 0.12]} rotation-z={1.2} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.9, 6]} />
        {bronze}
      </mesh>
      <mesh position={[0.1, 2.2, 0]} scale={[0.14, 0.4, 0.14]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        {bronze}
      </mesh>
      <mesh position={[0.12, 2.7, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 10]} />
        {bronze}
      </mesh>
      <mesh position={[-0.2, 2.5, 0]} rotation-z={0.8} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.8, 4]} />
        {bronze}
      </mesh>
      <mesh position={[-0.35, 1.55, 0]} rotation-z={1.1} castShadow>
        <cylinderGeometry args={[0.03, 0.06, 0.9, 6]} />
        {bronze}
      </mesh>
    </group>
  )
}

export function Creativity() {
  const room = ROOM_BY_ID.creativity
  const [w, d, h] = room.size
  const hw = w / 2
  const partitions: { p: [number, number, number]; r: number; art?: string }[] = [
    { p: [-5, 0, 1], r: Math.PI / 2, art: '/photos/art-figures.jpg' },
    { p: [-7.5, 0, -4], r: 0, art: '/photos/art-red-abstract.jpg' },
    { p: [-3.5, 0, -5], r: 0, art: '/photos/art-red-orange.jpg' },
    { p: [7.5, 0, -2], r: -Math.PI / 2, art: '/photos/art-yellow-strips.jpg' },
  ]
  return (
    <IndoorShell room={room} floor={TEX.stoneFloor} floorTile={1.6} floorRough={0.25} floorColor="#f2d6b8" wall="#f5efe4" ceiling="#f7f2ea" ambient={0.55} keyLight={1}>
      {partitions.map((pt, i) => (
        <group key={i} position={pt.p} rotation-y={pt.r}>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 2.8, 0.12]} />
            <meshStandardMaterial color="#f1ebdf" roughness={0.9} />
          </mesh>
          {pt.art && <Frame pos={[0, 1.6, 0.06]} w={1.8} src={pt.art} frame="#f1ebdf" matPad={0} />}
          {pt.art && <Frame pos={[0, 1.6, -0.06]} rot={Math.PI} w={1.6} src={pt.art} frame="#f1ebdf" matPad={0} />}
        </group>
      ))}
      <HorseAndRider />
      <Blob pos={[4, 0, 2]} size={[1.8, 1.4]} />
      <Frame pos={[0, 2.6, -d / 2 + 0.03]} w={4.6} src="/photos/creativity-gallery.jpg" caption="The Creativity Gallery · NMK photograph (paintings on the partitions are cropped from it)" />
      {/* clerestory windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.03), h - 0.8, 0]} rotation-y={-s * (Math.PI / 2)}>
          <planeGeometry args={[d - 2, 1]} />
          <meshBasicMaterial color="#fffaf0" toneMapped={false} />
        </mesh>
      ))}
      {[-6, -2, 2, 6].map((x) => (
        <SpotAt key={x} pos={[x, h - 0.2, 3]} at={[x, 1.5, -4]} intensity={16} angle={0.6} />
      ))}
    </IndoorShell>
  )
}
