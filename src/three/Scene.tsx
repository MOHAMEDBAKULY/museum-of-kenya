import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing'
import { lazy, Suspense, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react'
import * as THREE from 'three'
import { ROOM_BY_ID, type RoomId } from '../data/rooms'
import { live, useTour } from '../store'
import { Hotspots } from './Hotspots'
import { OrbitRig, Player } from './Player'
import { RoomActiveContext } from './roomActive'
import { roomLoaders } from './roomLoad'

const lazyCache = new Map<RoomId, LazyExoticComponent<ComponentType>>()

function lazyRoom(id: RoomId) {
  let cached = lazyCache.get(id)
  if (!cached) {
    cached = lazy(() => roomLoaders[id]().then((Comp) => ({ default: Comp })))
    lazyCache.set(id, cached)
  }
  return cached
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

/** Stop the render loop while the tab is in the background. */
function PauseWhenHidden() {
  const set = useThree((s) => s.set)
  useEffect(() => {
    const onVis = () => set({ frameloop: document.hidden ? 'never' : 'always' })
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [set])
  return null
}

function ShellFallback({ id }: { id: RoomId }) {
  const room = ROOM_BY_ID[id]
  const [w, d] = room.size
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial color={room.outdoor ? '#c4a882' : '#e6d3b4'} />
    </mesh>
  )
}

function later(cb: () => void, ms: number) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: ms + 500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(cb, ms)
  return () => window.clearTimeout(id)
}

/**
 * The current room paints immediately. Neighbor rooms are fetched after that
 * paint and mounted hidden so their meshes exist, then dropped when you leave
 * the neighborhood. The other galleries are not in the scene.
 */
function RoomStage() {
  const phase = useTour((s) => s.phase)
  const roomId = useTour((s) => s.room)
  const mode = useTour((s) => s.mode)
  const setDressing = useTour((s) => s.setDressing)
  const shown: RoomId = phase === 'tour' ? roomId : 'forecourt'
  const room = ROOM_BY_ID[shown]
  const neighbors = room.doors.map((d) => d.to)
  const [ready, setReady] = useState<RoomId[]>([])

  useEffect(() => {
    setDressing(false)
    setReady([])
    let cancel = false
    let cancelPump = () => {}
    const queue = [...neighbors]
    const pump = () => {
      const id = queue.shift()
      if (!id || cancel) return
      void roomLoaders[id]().then(() => {
        if (cancel) return
        setReady((have) => (have.includes(id) ? have : [...have, id]))
        cancelPump = later(pump, 450)
      })
    }
    const cancelDress = later(() => {
      if (cancel) return
      setDressing(true)
      cancelPump = later(pump, 400)
    }, 160)
    return () => {
      cancel = true
      cancelDress()
      cancelPump()
    }
    // neighbors is derived from shown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, setDressing])

  const mounted = [shown, ...ready.filter((id) => neighbors.includes(id))]
  return (
    <>
      <color attach="background" args={[room.outdoor ? '#9fc3ea' : '#0b0a09']} />
      {!room.outdoor && <fog attach="fog" args={['#1a140f', 18, 60]} />}
      {mounted.map((id) => {
        const Room = lazyRoom(id)
        const active = id === shown
        return (
          <group key={id} visible={active}>
            <RoomActiveContext.Provider value={active}>
              <Suspense fallback={active ? <ShellFallback id={id} /> : null}>
                <Room />
                {active && phase === 'tour' && !CLEAN && <Hotspots room={ROOM_BY_ID[id]} />}
              </Suspense>
            </RoomActiveContext.Provider>
          </group>
        )
      })}
      {phase !== 'tour' ? <Drift /> : mode === 'walk' ? <Player /> : <OrbitRig />}
    </>
  )
}

function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO halfRes aoRadius={0.55} intensity={0.7} distanceFalloff={0.5} quality="performance" />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.18} />
    </EffectComposer>
  )
}

const Q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
const CLEAN = Q.has('clean')

export function Scene() {
  const shadows = useTour((s) => s.shadows)
  const effects = useTour((s) => s.effects)
  const decline = useTour((s) => s.decline)
  const incline = useTour((s) => s.incline)
  return (
    <Canvas
      shadows={shadows ? 'percentage' : false}
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 0.1, far: 280, position: [0, 1.65, 12] }}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      onCreated={(st) => {
        if (import.meta.env.DEV) Object.assign(window, { __three: st, __live: live })
      }}
    >
      <PerformanceMonitor onDecline={decline} onIncline={incline} flipflops={3} />
      <AdaptiveDpr pixelated={false} />
      <PauseWhenHidden />
      <RoomStage />
      <FovAdapter />
      {effects && <Effects />}
    </Canvas>
  )
}
