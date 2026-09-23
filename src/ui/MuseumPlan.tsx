import { ROOMS, type RoomId } from '../data/rooms'

export function MuseumPlan({
  current,
  onPick,
  hover,
  onHover,
  className = '',
}: {
  current?: RoomId
  onPick: (id: RoomId) => void
  hover?: RoomId | null
  onHover?: (id: RoomId | null) => void
  className?: string
}) {
  return (
    <svg viewBox="0 0 102 106" className={className} role="img" aria-label="Schematic plan of the Nairobi National Museum">
      <defs>
        <pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="2" stroke="#efe7da" strokeOpacity="0.28" strokeWidth="1" />
        </pattern>
      </defs>
      {[
        { y: 1.6, t: 'UPPER FLOOR' },
        { y: 18, t: 'GROUND FLOOR' },
        { y: 64, t: 'GROUNDS' },
      ].map((l) => (
        <text key={l.t} x="1" y={l.y + 1.4} fontSize="1.9" letterSpacing="0.5" fill="#9c9286">
          {l.t}
        </text>
      ))}
      <line x1="1" x2="101" y1="18.8" y2="18.8" stroke="#efe7da" strokeOpacity="0.08" strokeWidth="0.2" />
      <line x1="1" x2="101" y1="64.6" y2="64.6" stroke="#efe7da" strokeOpacity="0.08" strokeWidth="0.2" />
      {ROOMS.map((r) => {
        const { x, y, w, h } = r.plan
        const active = r.id === current
        const hov = r.id === hover
        return (
          <g
            key={r.id}
            className="cursor-pointer"
            onClick={() => onPick(r.id)}
            onMouseEnter={() => onHover?.(r.id)}
            onMouseLeave={() => onHover?.(null)}
            role="button"
            aria-label={`Go to ${r.name}`}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="0.8"
              fill={active ? '#c4622d' : hov ? '#5a4b3c' : r.outdoor ? '#3d4a34' : '#3a332b'}
              fillOpacity={1}
              stroke={active ? '#f0c2a4' : '#efe7da'}
              strokeOpacity={active || hov ? 1 : 0.72}
              strokeWidth="0.45"
              strokeDasharray={r.level === 'upper' ? '1 0.6' : undefined}
              style={{ transition: 'fill 300ms, stroke-opacity 300ms' }}
            />
            <text x={x + 1.2} y={y + 3.2} fontSize="2.4" fill={active ? '#fff6ea' : '#efe7da'} fontFamily="Instrument Serif, serif">
              {r.numeral}
            </text>
            <text x={x + 1.2} y={y + h - 1.4} fontSize={w < 14 ? 1.6 : 2} fill={active ? '#fff6ea' : '#d9ccb6'} fontFamily="Instrument Serif, serif">
              {w < 14 ? r.name.split(' ')[0] : r.name}
            </text>
          </g>
        )
      })}
      <text x="101" y="105" fontSize="1.6" fill="#9c9286" textAnchor="end">
        Schematic, not to scale
      </text>
    </svg>
  )
}
