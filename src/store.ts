import { create } from 'zustand'
import { ROOM_BY_ID, doorPlacement, type RoomId } from './data/rooms'

export type Phase = 'intro' | 'map' | 'tour'
export type ControlMode = 'walk' | 'orbit'

type Spawn = { x: number; z: number; yaw: number; pitch?: number }

type TourState = {
  phase: Phase
  room: RoomId
  from: RoomId | null
  spawn: Spawn
  spawnKey: number
  selected: string | null
  focusKey: number
  mode: ControlMode
  fading: boolean
  titleCard: boolean
  menuOpen: boolean
  helpOpen: boolean
  quality: 'high' | 'low'
  setQuality: (q: 'high' | 'low') => void
  setPhase: (p: Phase) => void
  goTo: (id: RoomId) => void
  select: (id: string | null) => void
  setMode: (m: ControlMode) => void
  setMenu: (open: boolean) => void
  setHelp: (open: boolean) => void
}

export const FADE_MS = 650

function spawnFor(to: RoomId, from: RoomId | null): Spawn {
  const room = ROOM_BY_ID[to]
  const door = from ? room.doors.find((d) => d.to === from) : undefined
  if (door) {
    const p = doorPlacement(room, door)
    return { x: p.spawn[0], z: p.spawn[1], yaw: p.face }
  }
  const [, d] = room.size
  return { x: 0, z: d / 2 - 3, yaw: 0 }
}

let fadeTimer: number | undefined
let cardTimer: number | undefined

/** Deep links: ?room=mammals&at=x,z,yaw opens straight into a room at a given spot. */
function fromUrl(): { room: RoomId; spawn: Spawn } | null {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  const id = q.get('room') as RoomId | null
  if (!id || !(id in ROOM_BY_ID)) return null
  const at = q.get('at')?.split(',').map(Number)
  const spawn = at && at.length >= 2 && at.every(Number.isFinite) ? { x: at[0], z: at[1], yaw: at[2] ?? 0, pitch: at[3] } : spawnFor(id, null)
  return { room: id, spawn }
}

const initial = fromUrl()

export const useTour = create<TourState>((set, get) => ({
  phase: initial ? 'tour' : 'intro',
  room: initial?.room ?? 'forecourt',
  from: null,
  spawn: initial?.spawn ?? { x: 0, z: 12, yaw: 0 },
  spawnKey: 0,
  selected: null,
  focusKey: 0,
  mode: 'walk',
  fading: false,
  titleCard: false,
  menuOpen: false,
  helpOpen: false,
  quality: typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches && !location.search.includes('hq') ? 'low' : 'high',
  setQuality: (quality) => set({ quality }),
  setPhase: (phase) => set({ phase }),
  goTo: (id) => {
    const s = get()
    if (s.fading) return
    if (id === s.room && s.phase === 'tour') {
      set({ menuOpen: false })
      return
    }
    window.clearTimeout(fadeTimer)
    window.clearTimeout(cardTimer)
    set({ fading: true, menuOpen: false, selected: null })
    fadeTimer = window.setTimeout(() => {
      const from = get().phase === 'tour' ? get().room : null
      set((st) => ({
        phase: 'tour',
        room: id,
        from,
        spawn: spawnFor(id, from),
        spawnKey: st.spawnKey + 1,
        titleCard: true,
      }))
      window.setTimeout(() => set({ fading: false }), 120)
      cardTimer = window.setTimeout(() => set({ titleCard: false }), 2600)
    }, FADE_MS)
  },
  select: (selected) => set((st) => ({ selected, focusKey: selected ? st.focusKey + 1 : st.focusKey })),
  setMode: (mode) => set({ mode }),
  setMenu: (menuOpen) => set({ menuOpen }),
  setHelp: (helpOpen) => set({ helpOpen }),
}))

/** Shared mutable state read every frame (kept out of React to avoid re-renders). */
export const live = {
  x: 0,
  z: 12,
  yaw: 0,
  joystick: { x: 0, y: 0 },
  lookDelta: { x: 0, y: 0 },
  dragged: false,
  fps: 60,
}
