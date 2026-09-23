import { useEffect, useRef } from 'react'
import { ROOM_BY_ID, doorPlacement } from '../data/rooms'
import { live, useTour } from '../store'

/** Plan of the current room with the visitor, exhibits and exits. */
export function Minimap() {
  const roomId = useTour((s) => s.room)
  const select = useTour((s) => s.select)
  const goTo = useTour((s) => s.goTo)
  const selected = useTour((s) => s.selected)
  const room = ROOM_BY_ID[roomId]
  const [w, d] = room.size
  const me = useRef<SVGGElement>(null)
  const S = 100 / Math.max(w, d)
  const vw = w * S
  const vh = d * S

  useEffect(() => {
    let raf = 0
    const tick = () => {
      if (me.current) {
        const x = (live.x + w / 2) * S
        const y = (live.z + d / 2) * S
        me.current.setAttribute('transform', `translate(${x} ${y}) rotate(${(-live.yaw * 180) / Math.PI})`)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [w, d, S])

  return (
    <div className="glass rounded-2xl p-1.5 sm:p-2.5">
      <svg viewBox={`-6 -6 ${vw + 12} ${vh + 12}`} className="block h-auto w-[96px] sm:w-[168px]" aria-label={`Plan of ${room.name}`}>
        <rect x={0} y={0} width={vw} height={vh} rx={2} fill={room.outdoor ? '#1f2a18' : '#1c1916'} stroke="#efe7da" strokeOpacity={0.35} strokeWidth={0.8} />
        {room.obstacles.map(([x, z, r], i) => (
          <circle key={i} cx={(x + w / 2) * S} cy={(z + d / 2) * S} r={r * S} fill="#efe7da" fillOpacity={0.06} />
        ))}
        {room.doors.map((door) => {
          const p = doorPlacement(room, door)
          const x = (p.x + w / 2) * S
          const y = (p.z + d / 2) * S
          const horiz = door.wall === 'n' || door.wall === 's'
          return (
            <g key={door.to} className="cursor-pointer" onClick={() => goTo(door.to)}>
              <rect x={x - (horiz ? 6 : 1.8)} y={y - (horiz ? 1.8 : 6)} width={horiz ? 12 : 3.6} height={horiz ? 3.6 : 12} fill="#c4622d" rx={1} />
              <title>{ROOM_BY_ID[door.to].name}</title>
            </g>
          )
        })}
        {room.exhibits.map((ex, i) => (
          <g key={ex.id} className="cursor-pointer" onClick={() => select(ex.id)} transform={`translate(${(ex.pos[0] + w / 2) * S} ${(ex.pos[2] + d / 2) * S})`}>
            <circle r={4.2} fill={ex.id === selected ? '#c4622d' : '#efe7da'} />
            <text y={1.6} fontSize={5} textAnchor="middle" fill={ex.id === selected ? '#fff' : '#0b0a09'} fontFamily="Instrument Serif, serif">
              {i + 1}
            </text>
          </g>
        ))}
        <g ref={me}>
          <path d="M0 -7 L4.6 4 L0 2 L-4.6 4 Z" fill="#fff6ea" stroke="#0b0a09" strokeWidth={0.8} />
        </g>
      </svg>
    </div>
  )
}
