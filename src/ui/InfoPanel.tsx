import { useEffect, useState } from 'react'
import { ROOM_BY_ID } from '../data/rooms'
import { ILLUSTRATIVE_CREDIT, PHOTO_CREDIT } from '../data/sources'
import { useTour } from '../store'

const btnMotion =
  'transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone'

export function InfoPanel() {
  const roomId = useTour((s) => s.room)
  const selected = useTour((s) => s.selected)
  const select = useTour((s) => s.select)
  const room = ROOM_BY_ID[roomId]
  const idx = room.exhibits.findIndex((e) => e.id === selected)
  const ex = idx >= 0 ? room.exhibits[idx] : null
  const photoSrc = ex?.photo?.src
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imgFailed = !!photoSrc && failedSrc === photoSrc

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
      className={`glass fixed z-20 flex flex-col overflow-hidden
        transition-[transform,opacity] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)]
        motion-reduce:transition-opacity motion-reduce:duration-150
        inset-x-2 bottom-2 max-h-[62vh] rounded-3xl
        sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-24 sm:max-h-none sm:w-[400px]
        ${
          ex
            ? 'translate-y-0 opacity-100 sm:translate-x-0'
            : 'pointer-events-none translate-y-8 opacity-0 sm:translate-x-8 sm:translate-y-0 motion-reduce:translate-y-0 motion-reduce:sm:translate-x-0'
        }`}
      aria-hidden={!ex}
      aria-live="polite"
    >
      {ex && (
        <>
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div className="min-w-0 flex-1">
              <div className="eyebrow break-words text-balance text-rust">
                {room.numeral === '0' ? room.name : `${room.numeral} · ${room.name}`} · {idx + 1}/{n}
              </div>
              <h3 className="mt-1 break-words text-balance font-serif text-3xl leading-[1.02] text-bone">{ex.title}</h3>
              <div className="mt-1 break-words text-balance text-[12px] text-bone-2/80">{ex.kicker}</div>
            </div>
            <button
              onClick={() => select(null)}
              className={`shrink-0 rounded-full border border-bone/20 px-3 py-1 text-xs text-bone/80 hover:bg-white/10 ${btnMotion}`}
              aria-label="Close exhibit"
            >
              Close
            </button>
          </div>
          <div className="scrollbar-thin mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            {ex.photo && (
              <figure className="mb-4 overflow-hidden rounded-2xl bg-ink-2">
                <div className="aspect-[4/3] w-full bg-ink-2">
                  {!imgFailed && (
                    <img
                      src={ex.photo.src}
                      alt={ex.photo.caption}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={() => {
                        if (photoSrc) setFailedSrc(photoSrc)
                      }}
                    />
                  )}
                </div>
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
            <button onClick={() => select(room.exhibits[(idx - 1 + n) % n].id)} className={`text-xs text-bone/80 hover:text-bone ${btnMotion}`}>
              ← Previous
            </button>
            <div className="flex gap-1.5">
              {room.exhibits.map((e) => (
                <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.id === ex.id ? 'bg-rust' : 'bg-bone/25'}`} />
              ))}
            </div>
            <button onClick={() => select(room.exhibits[(idx + 1) % n].id)} className={`text-xs text-bone/80 hover:text-bone ${btnMotion}`}>
              Next →
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
