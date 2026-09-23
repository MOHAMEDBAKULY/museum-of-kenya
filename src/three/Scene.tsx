import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, type ComponentType } from 'react'
import * as THREE from 'three'
import { ROOM_BY_ID, type RoomId } from '../data/rooms'
import { live, useTour } from '../store'
import { Hotspots } from './Hotspots'
import { OrbitRig, Player } from './Player'
import { AsianAfrican, Birds, Cradle, Creativity, HallOfKenya, Mammals, Numismatic } from './rooms/GroundFloor'
import { Courtyard, Forecourt, Gardens, SnakePark } from './rooms/Grounds'
import { Cycles, Historia, JoyAdamson } from './rooms/UpperFloor'

const SCENES: Record<RoomId, ComponentType> = {
  forecourt: Forecourt,
  'hall-of-kenya': HallOfKenya,
  birds: Birds,
  mammals: Mammals,
  cradle: Cradle,
  'asian-african': AsianAfrican,
  numismatic: Numismatic,
  creativity: Creativity,
  historia: Historia,
  cycles: Cycles,
  'joy-adamson': JoyAdamson,
  courtyard: Courtyard,
  'snake-park': SnakePark,
  gardens: Gardens,
}

export const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** Slow cinematic drift across the forecourt behind the intro and map screens. */
function Drift() {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.05
    camera.position.set(Math.sin(t) * 7, 2.2 + Math.sin(t * 1.7) * 0.25, 9 + Math.cos(t) * 2)
    camera.lookAt(Math.sin(t) * 1.5, 4.2, -16)
    live.x = camera.position.x
    live.z = camera.position.z
  })
  return null
}

/** Widen the lens in portrait so rooms don't feel cramped on phones. */
function FovAdapter() {
  const { camera, size } = useThree()
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera
    const want = size.width < size.height ? 70 : 55
    if (Math.abs(cam.fov - want) > 0.01) {
      cam.fov = want
      cam.updateProjectionMatrix()
    }
  })
  return null
}

function Effects({ high }: { high: boolean }) {
  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      {high ? <N8AO halfRes aoRadius={0.8} intensity={1.05} distanceFalloff={0.6} quality="performance" /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.25} intensity={0.28} />
      <Vignette offset={0.32} darkness={0.28} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

function World() {
  const phase = useTour((s) => s.phase)
  const roomId = useTour((s) => s.room)
  const mode = useTour((s) => s.mode)
  const shownId: RoomId = phase === 'tour' ? roomId : 'forecourt'
  const Room = SCENES[shownId]
  const room = ROOM_BY_ID[shownId]
  return (
    <>
      <color attach="background" args={[room.outdoor ? '#9fc3ea' : '#0b0a09']} />
      {!room.outdoor && <fog attach="fog" args={['#1a140f', 18, 60]} />}
      <Suspense fallback={null}>
        <group key={shownId}>
          <Room />
          {phase === 'tour' && !CLEAN && <Hotspots room={room} />}
        </group>
        <Preload all />
      </Suspense>
      {phase !== 'tour' ? <Drift /> : mode === 'walk' ? <Player /> : <OrbitRig />}
    </>
  )
}

const Q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
const CLEAN = Q.has('clean')
const FORCE_HQ = Q.has('hq')
const NO_FX = Q.has('nofx')

export function Scene() {
  const high = useTour((s) => s.quality) === 'high'
  const setQuality = useTour((s) => s.setQuality)
  return (
    <Canvas
      shadows={high}
      dpr={[1, high ? 1.75 : 1.5]}
      camera={{ fov: 55, near: 0.1, far: 400, position: [0, 1.65, 12] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      onCreated={(st) => {
        if (import.meta.env.DEV) Object.assign(window, { __three: st, __live: live })
      }}
    >
      {!FORCE_HQ && <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2} />}
      {!FORCE_HQ && <AdaptiveDpr pixelated={false} />}
      <World />
      <FovAdapter />
      {!NO_FX && <Effects high={high} />}
    </Canvas>
  )
}
