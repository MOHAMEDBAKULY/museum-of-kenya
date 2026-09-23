import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitImpl } from 'three-stdlib'
import { ROOM_BY_ID, doorPlacement } from '../data/rooms'
import { live, useTour } from '../store'

const EYE = 1.65
const WALK = 3.1
const RUN = 6
const LOOK = 0.0032

type Glide = { x: number; z: number; yaw: number; pitch: number; rate: number }

function angleLerp(a: number, b: number, t: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

function lookAngles(fromX: number, fromY: number, fromZ: number, to: [number, number, number]) {
  const dx = to[0] - fromX
  const dy = to[1] - fromY
  const dz = to[2] - fromZ
  const yaw = Math.atan2(-dx, -dz)
  const pitch = Math.atan2(dy, Math.hypot(dx, dz))
  return { yaw, pitch: THREE.MathUtils.clamp(pitch, -0.6, 0.6) }
}

export function Player() {
  const { camera, gl } = useThree()
  const roomId = useTour((s) => s.room)
  const spawn = useTour((s) => s.spawn)
  const spawnKey = useTour((s) => s.spawnKey)
  const selected = useTour((s) => s.selected)
  const focusKey = useTour((s) => s.focusKey)
  const mode = useTour((s) => s.mode)
  const room = ROOM_BY_ID[roomId]

  const pos = useRef(new THREE.Vector2(spawn.x, spawn.z))
  const vel = useRef(new THREE.Vector2())
  const yaw = useRef(spawn.yaw)
  const pitch = useRef(-0.03)
  const glide = useRef<Glide | null>(null)
  const keys = useRef(new Set<string>())
  const bob = useRef(0)
  const armed = useRef(false)

  // Arrival: start a few steps back through the doorway and glide in.
  useEffect(() => {
    const back = 2.4
    const fx = -Math.sin(spawn.yaw)
    const fz = -Math.cos(spawn.yaw)
    pos.current.set(spawn.x - fx * back, spawn.z - fz * back)
    yaw.current = spawn.yaw
    pitch.current = 0.04
    vel.current.set(0, 0)
    glide.current = { x: spawn.x, z: spawn.z, yaw: spawn.yaw, pitch: spawn.pitch ?? 0.02, rate: 1.6 }
    armed.current = false
  }, [spawnKey, spawn])

  // Selecting an exhibit glides the visitor to its viewpoint.
  useEffect(() => {
    if (!selected) return
    const ex = room.exhibits.find((e) => e.id === selected)
    if (!ex) return
    const [vx, vz] = ex.view
    const a = lookAngles(vx, EYE, vz, ex.pos)
    glide.current = { x: vx, z: vz, yaw: a.yaw, pitch: a.pitch, rate: 1.9 }
  }, [focusKey, selected, room])

  // Leaving orbit mode: continue walking from where the orbit camera was.
  useEffect(() => {
    if (mode !== 'walk') return
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const [w, d] = room.size
    pos.current.set(THREE.MathUtils.clamp(camera.position.x, -w / 2 + 1, w / 2 - 1), THREE.MathUtils.clamp(camera.position.z, -d / 2 + 1, d / 2 - 1))
    yaw.current = Math.atan2(-dir.x, -dir.z)
    pitch.current = -0.05
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input,textarea')) return
      keys.current.add(e.code)
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let sx = 0
    let sy = 0
    let lx = 0
    let ly = 0
    let id = -1
    const onDown = (e: PointerEvent) => {
      if (id !== -1) return
      id = e.pointerId
      dragging = true
      live.dragged = false
      sx = lx = e.clientX
      sy = ly = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== id) return
      const dx = e.clientX - lx
      const dy = e.clientY - ly
      lx = e.clientX
      ly = e.clientY
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) live.dragged = true
      if (useTour.getState().mode !== 'walk' || !live.dragged) return
      const k = e.pointerType === 'touch' ? LOOK * 1.4 : LOOK
      yaw.current += dx * k
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * k, -1.1, 1.1)
      glide.current = null
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      dragging = false
      id = -1
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    live.fps = live.fps * 0.95 + (1 / Math.max(rawDt, 1e-3)) * 0.05
    const st = useTour.getState()
    if (st.mode === 'orbit') {
      live.x = camera.position.x
      live.z = camera.position.z
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      live.yaw = Math.atan2(-dir.x, -dir.z)
      return
    }

    const k = keys.current
    let f = 0
    let s = 0
    let turn = 0
    if (k.has('KeyW') || k.has('ArrowUp')) f += 1
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1
    if (k.has('KeyD')) s += 1
    if (k.has('KeyA')) s -= 1
    if (k.has('ArrowLeft') || k.has('KeyQ')) turn += 1
    if (k.has('ArrowRight') || k.has('KeyE')) turn -= 1
    f += -live.joystick.y
    s += live.joystick.x
    const inputLen = Math.hypot(f, s)
    if (inputLen > 1) {
      f /= inputLen
      s /= inputLen
    }
    const panelOpen = !!st.selected
    const blocked = st.fading || st.phase !== 'tour'
    if (blocked) {
      f = s = turn = 0
    }
    if (inputLen > 0.05 || turn !== 0) glide.current = null
    if (inputLen > 0.05 && panelOpen) st.select(null)

    yaw.current += turn * 1.8 * dt
    const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? RUN : WALK
    const fx = -Math.sin(yaw.current)
    const fz = -Math.cos(yaw.current)
    const rx = Math.cos(yaw.current)
    const rz = -Math.sin(yaw.current)
    const tx = (fx * f + rx * s) * speed
    const tz = (fz * f + rz * s) * speed
    const a = 1 - Math.exp(-9 * dt)
    vel.current.x += (tx - vel.current.x) * a
    vel.current.y += (tz - vel.current.y) * a

    const p = pos.current
    const g = glide.current
    if (g) {
      const t = 1 - Math.exp(-g.rate * dt)
      p.x += (g.x - p.x) * t
      p.y += (g.z - p.y) * t
      yaw.current = angleLerp(yaw.current, g.yaw, t)
      pitch.current += (g.pitch - pitch.current) * t
      if (Math.hypot(g.x - p.x, g.z - p.y) < 0.02 && Math.abs(g.pitch - pitch.current) < 0.01) glide.current = null
    } else {
      p.x += vel.current.x * dt
      p.y += vel.current.y * dt
    }

    const [w, d] = room.size
    const m = 0.6
    p.x = THREE.MathUtils.clamp(p.x, -w / 2 + m, w / 2 - m)
    p.y = THREE.MathUtils.clamp(p.y, -d / 2 + m, d / 2 - m)
    if (!st.mobile) {
      for (const [ox, oz, r] of room.obstacles) {
        const dx = p.x - ox
        const dz = p.y - oz
        const dist = Math.hypot(dx, dz)
        const min = r + 0.35
        if (dist < min && dist > 1e-4) {
          p.x = ox + (dx / dist) * min
          p.y = oz + (dz / dist) * min
        }
      }
    }

    const moving = vel.current.length()
    if (!armed.current && !g) armed.current = true
    if (armed.current && !blocked && moving > 0.4) {
      for (const door of room.doors) {
        const dp = doorPlacement(room, door)
        const inX = dp.spawn[0] - dp.x
        const inZ = dp.spawn[1] - dp.z
        const len = Math.hypot(inX, inZ)
        const trigX = dp.x + (inX / len) * 0.7
        const trigZ = dp.z + (inZ / len) * 0.7
        if (Math.hypot(p.x - trigX, p.y - trigZ) < 1.05) {
          st.goTo(door.to)
          break
        }
      }
    }

    bob.current += moving * dt * 2.2
    const bobY = Math.sin(bob.current * 2) * 0.025 * Math.min(1, moving / WALK)
    camera.position.set(p.x, EYE + bobY, p.y)
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')
    live.x = p.x
    live.z = p.y
    live.yaw = yaw.current
  })

  return null
}

export function OrbitRig() {
  const { camera } = useThree()
  const roomId = useTour((s) => s.room)
  const selected = useTour((s) => s.selected)
  const focusKey = useTour((s) => s.focusKey)
  const room = ROOM_BY_ID[roomId]
  const ref = useRef<OrbitImpl>(null)
  const goal = useRef<{ target: THREE.Vector3; cam: THREE.Vector3 } | null>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const target = new THREE.Vector3(camera.position.x + dir.x * 5, 1.4, camera.position.z + dir.z * 5)
    const [w, d] = room.size
    target.x = THREE.MathUtils.clamp(target.x, -w / 2 + 2, w / 2 - 2)
    target.z = THREE.MathUtils.clamp(target.z, -d / 2 + 2, d / 2 - 2)
    c.target.copy(target)
    goal.current = { target, cam: new THREE.Vector3(camera.position.x, Math.max(camera.position.y, 3.2), camera.position.z) }
    c.update()
  }, [roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected) return
    const ex = room.exhibits.find((e) => e.id === selected)
    if (!ex) return
    goal.current = { target: new THREE.Vector3(...ex.pos), cam: new THREE.Vector3(ex.view[0], Math.max(2.4, ex.pos[1] + 0.6), ex.view[1]) }
  }, [focusKey, selected, room])

  useFrame((_, dt) => {
    const c = ref.current
    if (!c) return
    const g = goal.current
    if (g) {
      const t = 1 - Math.exp(-2.4 * Math.min(dt, 0.05))
      c.target.lerp(g.target, t)
      camera.position.lerp(g.cam, t)
      if (camera.position.distanceTo(g.cam) < 0.03) goal.current = null
    }
    const [w, d, h] = room.size
    const m = 0.4
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -w / 2 + m, w / 2 - m)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -d / 2 + m, d / 2 - m)
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.6, room.outdoor ? 30 : h - 0.3)
    c.update()
  })

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.02}
      minDistance={1.5}
      maxDistance={room.outdoor ? 34 : Math.max(room.size[0], room.size[1]) * 0.8}
      onStart={() => (goal.current = null)}
    />
  )
}
