import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Exhibit, Room } from '../data/rooms'
import { live, useTour } from '../store'

function Marker({ ex, index }: { ex: Exhibit; index: number }) {
  const select = useTour((s) => s.select)
  const selected = useTour((s) => s.selected === ex.id)
  const [near, setNear] = useState(false)
  const nearRef = useRef(false)
  useFrame(() => {
    const n = Math.hypot(live.x - ex.pos[0], live.z - ex.pos[2]) < 7.5
    if (n !== nearRef.current) {
      nearRef.current = n
      setNear(n)
    }
  })
  const show = near || selected
  return (
    <Html position={ex.pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          select(selected ? null : ex.id)
        }}
        className="group pointer-events-auto relative flex items-center gap-2.5 outline-none"
        aria-label={`Exhibit ${index + 1}: ${ex.title}`}
      >
        <span className="relative grid h-7 w-7 place-items-center">
          <span className="hotspot-ring absolute inset-0 rounded-full border border-bone/70" />
          <span
            className={`relative grid h-6 w-6 place-items-center rounded-full font-serif text-[13px] transition-colors ${
              selected ? 'bg-rust text-bone' : 'bg-bone/90 text-ink group-hover:bg-rust group-hover:text-bone'
            }`}
          >
            {index + 1}
          </span>
        </span>
        <span
          className={`glass whitespace-nowrap rounded-full px-3 py-1 text-left transition-all duration-500 ${
            show ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
          }`}
        >
          <span className="block font-serif text-[15px] leading-tight text-bone">{ex.title}</span>
          <span className="eyebrow block text-[9px] text-bone-2/70">{ex.kicker}</span>
        </span>
      </button>
    </Html>
  )
}

export function Hotspots({ room }: { room: Room }) {
  return (
    <>
      {room.exhibits.map((ex, i) => (
        <Marker key={ex.id} ex={ex} index={i} />
      ))}
    </>
  )
}
