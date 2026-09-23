import { useEffect, useState } from 'react'
import { LEVEL_LABEL, ROOMS, type Level, type RoomId } from '../data/rooms'
import { MUSEUM, SOURCES } from '../data/sources'
import { useTour } from '../store'
import { MuseumPlan } from './MuseumPlan'

const ORDER: Level[] = ['grounds', 'ground', 'upper']

export function MapHub({ onClose }: { onClose?: () => void }) {
  const goTo = useTour((s) => s.goTo)
  const phase = useTour((s) => s.phase)
  const current = useTour((s) => s.room)
  const [hover, setHover] = useState<RoomId | null>(null)
  const [tab, setTab] = useState<'rooms' | 'visit'>('rooms')

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const hovered = ROOMS.find((r) => r.id === hover)

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-ink/80 backdrop-blur-md" role="dialog" aria-label="Museum map">
      <header className="flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-8">
        <div>
          <div className="eyebrow text-rust">The map</div>
          <h2 className="font-serif text-3xl text-bone sm:text-5xl">Choose where to stand</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass hidden rounded-full p-1 sm:flex">
            {(['rooms', 'visit'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs transition ${tab === t ? 'bg-bone text-ink' : 'text-bone/80 hover:text-bone'}`}>
                {t === 'rooms' ? 'Galleries' : 'Plan a visit'}
              </button>
            ))}
          </div>
          {onClose && (
            <button onClick={onClose} className="glass rounded-full px-4 py-2 text-xs text-bone hover:bg-white/10" aria-label="Close map">
              Close
            </button>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-6 px-5 pb-5 pt-5 sm:px-10 sm:pb-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="relative hidden min-h-[460px] rounded-3xl border border-bone/15 bg-ink-2/70 p-4 lg:block">
          <MuseumPlan current={phase === 'tour' ? current : undefined} hover={hover} onHover={setHover} onPick={goTo} className="h-full w-full" />
          <div className="pointer-events-none absolute bottom-2 left-0 max-w-sm">
            {hovered && (
              <div className="glass rounded-2xl p-4">
                <div className="eyebrow text-rust">
                  {hovered.numeral} · {LEVEL_LABEL[hovered.level]}
                </div>
                <div className="font-serif text-2xl text-bone">{hovered.name}</div>
                <p className="mt-1 text-[13px] leading-snug text-bone/75">{hovered.intro}</p>
              </div>
            )}
          </div>
        </div>

        <div className="scrollbar-thin min-h-0 overflow-y-auto pr-1">
          <div className="mb-4 flex rounded-full p-1 sm:hidden glass">
            {(['rooms', 'visit'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-4 py-1.5 text-xs transition ${tab === t ? 'bg-bone text-ink' : 'text-bone/80'}`}>
                {t === 'rooms' ? 'Galleries' : 'Plan a visit'}
              </button>
            ))}
          </div>
          {tab === 'rooms' ? (
            ORDER.map((lvl) => (
              <section key={lvl} className="mb-6">
                <h3 className="eyebrow mb-2 text-muted">{LEVEL_LABEL[lvl]}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {ROOMS.filter((r) => r.level === lvl).map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => goTo(r.id)}
                        onMouseEnter={() => setHover(r.id)}
                        onMouseLeave={() => setHover(null)}
                        className={`group flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition ${
                          phase === 'tour' && r.id === current ? 'border-rust/70 bg-rust/10' : 'border-bone/10 hover:border-bone/30 hover:bg-white/5'
                        }`}
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-2">
                          {r.cover ? (
                            <img src={r.cover} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" loading="lazy" />
                          ) : (
                            <div className="grid h-full w-full place-items-center font-serif text-2xl text-bone/30">{r.numeral}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="eyebrow text-[9px] text-rust">{r.numeral === '0' ? 'Start' : `Room ${r.numeral}`}</div>
                          <div className="truncate font-serif text-xl leading-tight text-bone">{r.name}</div>
                          <div className="truncate text-[12px] text-bone/60">{r.tagline}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <Visit />
          )}
        </div>
      </div>
    </div>
  )
}

function Visit() {
  return (
    <div className="space-y-6 text-[14px] text-bone/85">
      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="Hours">{MUSEUM.hours}</Info>
        <Info label="Night tours">{MUSEUM.nightTours}</Info>
        <Info label="Address">{MUSEUM.address}</Info>
        <Info label="Contact">
          {MUSEUM.phone} · {MUSEUM.email}
        </Info>
        <Info label="Rating">{MUSEUM.rating}</Info>
        <Info label="Payment">{MUSEUM.payment}</Info>
      </div>
      <div>
        <div className="eyebrow mb-2 text-muted">Admission from 7 May 2026</div>
        <div className="overflow-hidden rounded-2xl border border-bone/10">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/5 text-bone-2">
              <tr>
                <th className="px-3 py-2 font-normal">Ticket</th>
                <th className="px-3 py-2 font-normal">Kenya & EA citizens</th>
                <th className="px-3 py-2 font-normal">Residents & Africa</th>
                <th className="px-3 py-2 font-normal">Outside Africa</th>
              </tr>
            </thead>
            <tbody>
              {MUSEUM.tickets.map((t) => (
                <tr key={t.label} className="border-t border-bone/5">
                  <td className="px-3 py-2 text-bone">{t.label}</td>
                  <td className="px-3 py-2">{t.citizen}</td>
                  <td className="px-3 py-2">{t.resident}</td>
                  <td className="px-3 py-2">{t.foreign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a href={SOURCES.rates.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-bone-2 underline decoration-bone/30 underline-offset-4 hover:text-bone">
          Source: {SOURCES.rates.label}
        </a>
      </div>
      <p className="text-[12px] text-muted">Allow about three hours. Weekdays are quieter, and a combined ticket includes the Snake Park.</p>
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-bone/10 p-3">
      <div className="eyebrow mb-1 text-muted">{label}</div>
      <div>{children}</div>
    </div>
  )
}
