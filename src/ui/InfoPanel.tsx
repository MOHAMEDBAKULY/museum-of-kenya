import { useEffect } from 'react'
import { ROOM_BY_ID } from '../data/rooms'
import { ILLUSTRATIVE_CREDIT, PHOTO_CREDIT } from '../data/sources'
import { useTour } from '../store'

export function InfoPanel() {
  const roomId = useTour((s) => s.room)
  const selected = useTour((s) => s.selected)
  const select = useTour((s) => s.select)
  const room = ROOM_BY_ID[roomId]
  const idx = room.exhibits.findIndex((e) => e.id === selected)
  const ex = idx >= 0 ? room.exhibits[idx] : null

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!useTour.getState().selected) return
      if (e.key === 'Escape') select(null)
      const n = room.exhibits.length
      const i = room.exhibits.findIndex((x) => x.id === useTour.getState().selected)
      if (e.key === ']' || e.key === 'PageDown') select(room.exhibits[(i + 1) % n].id)
      if (e.key === '[' || e.key === 'PageUp') select(room.exhibits[(i - 1 + n) % n].id)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [room, select])

  const n = room.exhibits.length
  return (
    <aside
      className={`glass fixed z-20 flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]
        inset-x-2 bottom-2 max-h-[62vh] rounded-3xl
        sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-24 sm:max-h-none sm:w-[400px]
        ${ex ? 'translate-y-0 opacity-100 sm:translate-x-0' : 'pointer-events-none translate-y-8 opacity-0 sm:translate-x-8 sm:translate-y-0'}`}
      aria-hidden={!ex}
      aria-live="polite"
    >
      {ex && (
        <>
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div>
              <div className="eyebrow text-rust">
                {room.numeral === '0' ? room.name : `${room.numeral} · ${room.name}`} · {idx + 1}/{n}
              </div>
              <h3 className="mt-1 font-serif text-3xl leading-[1.02] text-bone">{ex.title}</h3>
              <div className="mt-1 text-[12px] text-bone-2/80">{ex.kicker}</div>
            </div>
            <button onClick={() => select(null)} className="rounded-full border border-bone/20 px-3 py-1 text-xs text-bone/80 hover:bg-white/10" aria-label="Close exhibit">
              Close
            </button>
          </div>
          <div className="scrollbar-thin mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            {ex.photo && (
              <figure className="mb-4 overflow-hidden rounded-2xl bg-ink-2">
                <img src={ex.photo.src} alt={ex.photo.caption} className="aspect-[4/3] w-full object-cover" />
                <figcaption className="px-3 py-2 text-[11px] leading-snug text-bone/60">
                  {ex.photo.caption}
                  <br />
                  <span className={ex.photo.illustrative ? 'text-rust' : ''}>{ex.photo.illustrative ? ILLUSTRATIVE_CREDIT : PHOTO_CREDIT}</span>
                </figcaption>
              </figure>
            )}
            <div className="space-y-3 text-[14.5px] leading-relaxed text-bone/85">
              {ex.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <a href={ex.source.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-[12px] text-bone-2 underline decoration-bone/30 underline-offset-4 hover:text-bone">
              Source: {ex.source.label}
            </a>
          </div>
          <div className="flex items-center justify-between border-t border-bone/10 px-5 py-3">
            <button onClick={() => select(room.exhibits[(idx - 1 + n) % n].id)} className="text-xs text-bone/80 hover:text-bone">
              ← Previous
            </button>
            <div className="flex gap-1.5">
              {room.exhibits.map((e) => (
                <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.id === ex.id ? 'bg-rust' : 'bg-bone/25'}`} />
              ))}
            </div>
            <button onClick={() => select(room.exhibits[(idx + 1) % n].id)} className="text-xs text-bone/80 hover:text-bone">
              Next →
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
