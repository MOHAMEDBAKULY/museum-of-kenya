import { useRef, useState } from 'react'
import { live } from '../store'

/** Virtual thumbstick for touch devices. Drag anywhere else on screen to look around. */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const id = useRef<number | null>(null)
  const R = 44

  const update = (e: React.PointerEvent) => {
    const b = base.current!.getBoundingClientRect()
    let x = e.clientX - (b.left + b.width / 2)
    let y = e.clientY - (b.top + b.height / 2)
    const len = Math.hypot(x, y)
    if (len > R) {
      x = (x / len) * R
      y = (y / len) * R
    }
    setKnob({ x, y })
    live.joystick.x = x / R
    live.joystick.y = y / R
  }
  const end = () => {
    id.current = null
    setKnob({ x: 0, y: 0 })
    live.joystick.x = 0
    live.joystick.y = 0
  }

  return (
    <div
      ref={base}
      className="glass relative h-[116px] w-[116px] touch-none select-none rounded-full"
      onPointerDown={(e) => {
        e.stopPropagation()
        id.current = e.pointerId
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        update(e)
      }}
      onPointerMove={(e) => id.current === e.pointerId && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Move"
      role="application"
    >
      <div className="eyebrow pointer-events-none absolute inset-x-0 top-2 text-center text-[8px] text-bone/50">Walk</div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-bone/85 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  )
}
