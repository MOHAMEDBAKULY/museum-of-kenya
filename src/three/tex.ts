import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export const TEX = {
  parquet: '/textures/parquet.jpg',
  plaster: '/textures/plaster.jpg',
  stoneFloor: '/textures/stone-floor.jpg',
  brick: '/textures/brick-paving.jpg',
  grass: '/textures/grass.jpg',
  earth: '/textures/red-earth.jpg',
  ochre: '/textures/ochre-render.jpg',
  stoneWall: '/textures/stone-wall.jpg',
}

function prep(t: THREE.Texture, repeat: [number, number], color = true) {
  const c = t.clone()
  c.wrapS = c.wrapT = THREE.RepeatWrapping
  c.repeat.set(repeat[0], repeat[1])
  c.anisotropy = 8
  if (color) c.colorSpace = THREE.SRGBColorSpace
  c.needsUpdate = true
  return c
}

/** Tiled colour texture; clones the cached image so each surface can have its own repeat. */
export function useTiled(url: string, repeat: [number, number]) {
  const base = useTexture(url)
  return useMemo(() => prep(base, repeat), [base, repeat[0], repeat[1]]) // eslint-disable-line react-hooks/exhaustive-deps
}

const normalCache = new Map<string, THREE.Texture>()

/** Derives a tangent-space normal map from a colour texture's luminance (Sobel), cached per image. */
function normalFrom(img: CanvasImageSource & { width: number; height: number }, key: string, strength: number) {
  const hit = normalCache.get(key)
  if (hit) return hit
  const N = 512
  const c = document.createElement('canvas')
  c.width = c.height = N
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, N, N)
  const src = g.getImageData(0, 0, N, N).data
  const lum = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) lum[i] = (src[i * 4] * 0.299 + src[i * 4 + 1] * 0.587 + src[i * 4 + 2] * 0.114) / 255
  const out = g.createImageData(N, N)
  const at = (x: number, y: number) => lum[((y + N) % N) * N + ((x + N) % N)]
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)) * strength
      const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)) * strength
      const l = Math.hypot(dx, dy, 1)
      const o = (y * N + x) * 4
      out.data[o] = ((-dx / l) * 0.5 + 0.5) * 255
      out.data[o + 1] = ((dy / l) * 0.5 + 0.5) * 255
      out.data[o + 2] = (1 / l) * 0.5 * 255 + 127
      out.data[o + 3] = 255
    }
  }
  g.putImageData(out, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  normalCache.set(key, t)
  return t
}

/** Colour map plus a derived normal map, both tiled the same way. */
export function useTiledPBR(url: string, repeat: [number, number], strength = 2.2) {
  const base = useTexture(url)
  return useMemo(() => {
    const map = prep(base, repeat)
    const n = normalFrom(base.image as HTMLImageElement, `${url}:${strength}`, strength).clone()
    n.wrapS = n.wrapT = THREE.RepeatWrapping
    n.repeat.set(repeat[0], repeat[1])
    n.needsUpdate = true
    return { map, normalMap: n }
  }, [base, url, strength, repeat[0], repeat[1]]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Single image (photo / cutout) with correct colour space. */
export function useImage(url: string) {
  const t = useTexture(url)
  useMemo(() => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
  }, [t])
  return t
}

let blob: THREE.Texture | null = null
/** Soft radial texture used for contact shadows under objects. */
export function blobShadow() {
  if (blob) return blob
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64)
  grd.addColorStop(0, 'rgba(0,0,0,0.75)')
  grd.addColorStop(0.5, 'rgba(0,0,0,0.35)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  blob = new THREE.CanvasTexture(c)
  return blob
}

let glow: THREE.Texture | null = null
/** Vertical light gradient for doorways (bright at the floor, fading up). */
export function doorGlow() {
  if (glow) return glow
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createLinearGradient(0, 0, 0, 128)
  grd.addColorStop(0, '#b89a74')
  grd.addColorStop(0.5, '#e6cfa8')
  grd.addColorStop(1, '#f7e7c9')
  g.fillStyle = grd
  g.fillRect(0, 0, 4, 128)
  glow = new THREE.CanvasTexture(c)
  glow.colorSpace = THREE.SRGBColorSpace
  return glow
}
