import { Environment, Lightformer } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { ReactNode } from 'react'
import type { Room } from '../../data/rooms'
import { Ceiling, Doorway, Floor, Shrub, Tree, Walls } from '../kit'
import { TEX } from '../tex'

export function IndoorShell({
  room,
  floor = TEX.stoneFloor,
  floorTile = 2.4,
  floorRough = 0.35,
  floorColor = '#ffffff',
  wall = '#efe4d2',
  wallTile = 4,
  ceiling = '#e6dccb',
  bounce = 0.32,
  envI = 0.45,
  ambient = 0.28,
  hemi = 0.55,
  warmth = '#ffe0b5',
  keyLight = 1.2,
  children,
  noCeiling = false,
}: {
  room: Room
  floor?: string
  floorTile?: number
  floorRough?: number
  floorColor?: string
  wall?: string
  wallTile?: number
  ceiling?: string
  bounce?: number
  envI?: number
  ambient?: number
  hemi?: number
  warmth?: string
  keyLight?: number
  children?: ReactNode
  noCeiling?: boolean
}) {
  const [w, d, h] = room.size
  return (
    <group>
      <Floor w={w} d={d} url={floor} tile={floorTile} roughness={floorRough} color={floorColor} />
      <Walls w={w} d={d} h={h} color={wall} tile={wallTile} />
      {!noCeiling && <Ceiling w={w} d={d} h={h} color={ceiling} bounce={bounce} />}
      {room.doors.map((door) => (
        <Doorway key={door.to + door.wall} room={room} door={door} />
      ))}
      <ambientLight intensity={ambient} color="#fff4e6" />
      <hemisphereLight args={['#fff1dc', '#5a3520', hemi]} />
      <directionalLight
        position={[w * 0.18, h * 2.2, d * 0.3]}
        intensity={keyLight}
        color={warmth}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-w / 2}
        shadow-camera-right={w / 2}
        shadow-camera-top={d / 2}
        shadow-camera-bottom={-d / 2}
        shadow-camera-near={0.5}
        shadow-camera-far={h * 4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <Environment resolution={64} frames={1} environmentIntensity={envI}>
        <Lightformer form="rect" intensity={2.2} color={warmth} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[w, d, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#fff6ea" position={[0, 2, -12]} scale={[20, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#d9b58a" position={[12, 2, 0]} rotation-y={-Math.PI / 2} scale={[20, 4, 1]} />
      </Environment>
      {children}
    </group>
  )
}

export function OutdoorShell({
  room,
  ground = TEX.brick,
  groundTile = 3,
  groundColor = '#ffffff',
  children,
  hedge = true,
  sun = [18, 30, 14],
}: {
  room: Room
  ground?: string
  groundTile?: number
  groundColor?: string
  children?: ReactNode
  hedge?: boolean
  sun?: [number, number, number]
}) {
  const [w, d] = room.size
  const edge: { x: number; z: number }[] = []
  if (hedge) {
    for (let x = -w / 2; x <= w / 2; x += 5.2) {
      edge.push({ x, z: -d / 2 - 1.2 }, { x, z: d / 2 + 1.2 })
    }
    for (let z = -d / 2; z <= d / 2; z += 5.2) {
      edge.push({ x: -w / 2 - 1.2, z }, { x: w / 2 + 1.2, z })
    }
  }
  const nearDoor = (x: number, z: number) =>
    room.doors.some((dr) => {
      const px = dr.wall === 'w' ? -w / 2 : dr.wall === 'e' ? w / 2 : dr.offset
      const pz = dr.wall === 'n' ? -d / 2 : dr.wall === 's' ? d / 2 : dr.offset
      return Math.hypot(px - x, pz - z) < 3.4
    })
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#5b7a36" roughness={1} />
      </mesh>
      <Floor w={w + 3} d={d + 3} url={ground} tile={groundTile} roughness={0.92} color={groundColor} />
      <SkyDome sun={sun} />
      <ambientLight intensity={0.34} color="#fff3e4" />
      <hemisphereLight args={['#c5dcff', '#c4a07a', 0.85]} />
      <directionalLight
        position={sun}
        intensity={2.4}
        color="#fff6e4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-w / 2 - 6}
        shadow-camera-right={w / 2 + 6}
        shadow-camera-top={d / 2 + 6}
        shadow-camera-bottom={-d / 2 - 6}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <Environment resolution={64} frames={1} environmentIntensity={0.3}>
        <Lightformer form="rect" intensity={1.6} color="#cfe0ff" position={[0, 20, 0]} rotation-x={Math.PI / 2} scale={[60, 60, 1]} />
        <Lightformer form="circle" intensity={6} color="#fff0d6" position={sun} scale={6} />
        <Lightformer form="rect" intensity={0.6} color="#8a6f4a" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[60, 60, 1]} />
      </Environment>
      {room.doors.map((door) => (
        <Doorway key={door.to + door.wall} room={room} door={door} outdoor />
      ))}
      {edge
        .filter((p) => !nearDoor(p.x, p.z))
        .map((p, i) => (
          <Shrub key={i} pos={[p.x, 0, p.z]} scale={1.3 + ((i * 37) % 10) / 20} seed={i + 7} color={i % 3 ? '#4f7a31' : '#5f8a3b'} />
        ))}
      {hedge &&
        [
          [-w / 2 - 5, -d / 2 - 4],
          [w / 2 + 6, -d / 2 - 3],
          [-w / 2 - 6, d / 2 + 5],
          [w / 2 + 5, d / 2 + 6],
          [0, -d / 2 - 9],
          [-w / 2 - 9, 0],
          [w / 2 + 9, 2],
          [0, d / 2 + 10],
        ].map(([x, z], i) => <Tree key={i} pos={[x, 0, z]} scale={1.5 + (i % 3) * 0.25} kind={i % 2 ? 'broad' : 'acacia'} seed={i + 3} />)}
      {children}
    </group>
  )
}

/** High-altitude Nairobi sky: deep blue overhead fading to a pale horizon, with a soft sun glow. */
export function SkyDome({ sun }: { sun: [number, number, number] }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color('#1c5bbd') },
          mid: { value: new THREE.Color('#4f8fdc') },
          horizon: { value: new THREE.Color('#bcd6ef') },
          sunDir: { value: new THREE.Vector3(...sun).normalize() },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 sunDir; varying vec3 vDir;
          void main(){
            float h = clamp(vDir.y, 0.0, 1.0);
            vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
            c = mix(c, top, smoothstep(0.18, 0.7, h));
            float s = max(dot(normalize(vDir), sunDir), 0.0);
            c += vec3(1.0, 0.93, 0.8) * (pow(s, 600.0) * 3.0 + pow(s, 12.0) * 0.12);
            if (vDir.y < 0.0) c = horizon * 0.9;
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [sun],
  )
  return (
    <mesh material={mat} scale={300}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}
