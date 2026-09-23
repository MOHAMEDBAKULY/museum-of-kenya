import type { ComponentType } from 'react'
import type { RoomId } from '../data/rooms'

/** One loader per room. Vite splits Grounds, GroundFloor, and UpperFloor into separate chunks. */
export const roomLoaders: Record<RoomId, () => Promise<ComponentType>> = {
  forecourt: () => import('./rooms/Grounds').then((m) => m.Forecourt),
  courtyard: () => import('./rooms/Grounds').then((m) => m.Courtyard),
  'snake-park': () => import('./rooms/Grounds').then((m) => m.SnakePark),
  gardens: () => import('./rooms/Grounds').then((m) => m.Gardens),
  'hall-of-kenya': () => import('./rooms/GroundFloor').then((m) => m.HallOfKenya),
  birds: () => import('./rooms/GroundFloor').then((m) => m.Birds),
  mammals: () => import('./rooms/GroundFloor').then((m) => m.Mammals),
  cradle: () => import('./rooms/GroundFloor').then((m) => m.Cradle),
  'asian-african': () => import('./rooms/GroundFloor').then((m) => m.AsianAfrican),
  numismatic: () => import('./rooms/GroundFloor').then((m) => m.Numismatic),
  creativity: () => import('./rooms/GroundFloor').then((m) => m.Creativity),
  historia: () => import('./rooms/UpperFloor').then((m) => m.Historia),
  cycles: () => import('./rooms/UpperFloor').then((m) => m.Cycles),
  'joy-adamson': () => import('./rooms/UpperFloor').then((m) => m.JoyAdamson),
}
