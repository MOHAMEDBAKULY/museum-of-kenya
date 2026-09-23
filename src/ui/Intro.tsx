import { MUSEUM } from '../data/sources'
import { ROOMS } from '../data/rooms'
import { useTour } from '../store'

export function Intro() {
  const goTo = useTour((s) => s.goTo)
  const setPhase = useTour((s) => s.setPhase)
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-ink/90 via-ink/20 to-ink/50 p-5 sm:p-10">
      <header className="rise flex items-center justify-between">
        <div className="eyebrow text-bone-2">Nairobi · Museum Hill</div>
        <div className="eyebrow hidden text-bone-2 sm:block">{ROOMS.length} spaces · one walk</div>
      </header>

      <div className="max-w-3xl">
        <p className="eyebrow rise mb-4 text-rust" style={{ animationDelay: '120ms' }}>
          {MUSEUM.swahili}
        </p>
        <h1 className="rise font-serif text-[15vw] leading-[0.86] tracking-tight text-bone sm:text-[112px]" style={{ animationDelay: '200ms' }}>
          Nairobi National
          <br />
          <em className="text-bone-2">Museum</em>
        </h1>
        <p className="rise mt-6 max-w-xl text-[15px] leading-relaxed text-bone/80 sm:text-base" style={{ animationDelay: '320ms' }}>
          One continuous walk through Kenya&rsquo;s nature, culture and history. Cross the forecourt, stand beneath the calabashes in the Hall of Kenya, meet Turkana Boy, and end in the gardens by the Snake Park.
        </p>
        <div className="rise pointer-events-auto mt-8 flex flex-wrap gap-3" style={{ animationDelay: '440ms' }}>
          <button
            onClick={() => goTo('forecourt')}
            className="rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
          >
            Begin the walk
          </button>
          <button
            onClick={() => setPhase('map')}
            className="glass rounded-full px-7 py-3.5 text-sm text-bone transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
          >
            Open the museum map
          </button>
        </div>
      </div>

      <footer className="rise grid gap-3 border-t border-bone/10 pt-4 text-[12px] text-bone-2/80 sm:grid-cols-3" style={{ animationDelay: '560ms' }}>
        <div>
          <div className="eyebrow mb-1 text-muted">Hours</div>
          {MUSEUM.hours}
        </div>
        <div>
          <div className="eyebrow mb-1 text-muted">Where</div>
          {MUSEUM.address}
        </div>
        <div className="hidden sm:block">
          <div className="eyebrow mb-1 text-muted">Visitors say</div>
          {MUSEUM.rating}
        </div>
      </footer>
    </div>
  )
}
