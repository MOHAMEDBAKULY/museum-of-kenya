import { useEffect } from 'react'
import { LEVEL_LABEL, ROOM_BY_ID, TOUR_ORDER } from '../data/rooms'
import { useTour } from '../store'
import { isCoarse } from '../three/Scene'
import { Joystick } from './Joystick'
import { Minimap } from './Minimap'

export function HUD() {
  const roomId = useTour((s) => s.room)
  const mode = useTour((s) => s.mode)
  const setMode = useTour((s) => s.setMode)
  const setMenu = useTour((s) => s.setMenu)
  const helpOpen = useTour((s) => s.helpOpen)
  const setHelp = useTour((s) => s.setHelp)
  const select = useTour((s) => s.select)
  const selected = useTour((s) => s.selected)
  const goTo = useTour((s) => s.goTo)
  const effectsWanted = useTour((s) => s.effectsWanted)
  const setEffectsWanted = useTour((s) => s.setEffectsWanted)
  const mobile = useTour((s) => s.mobile)
  const room = ROOM_BY_ID[roomId]
  const i = TOUR_ORDER.indexOf(roomId)
  const next = TOUR_ORDER[(i + 1) % TOUR_ORDER.length]
  const prev = TOUR_ORDER[(i - 1 + TOUR_ORDER.length) % TOUR_ORDER.length]

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') setMenu(!useTour.getState().menuOpen)
      if (e.key === 'o' || e.key === 'O') setMode(useTour.getState().mode === 'walk' ? 'orbit' : 'walk')
      if (e.key === 'h' || e.key === 'H' || e.key === '?') setHelp(!useTour.getState().helpOpen)
      if (/^[1-9]$/.test(e.key)) {
        const ex = room.exhibits[Number(e.key) - 1]
        if (ex) select(ex.id)
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [room, select, setMenu, setMode, setHelp])

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-ink/60 to-transparent p-4 sm:p-6">
        <div className="pointer-events-auto min-w-0">
          <div className="eyebrow text-rust">
            {room.numeral === '0' ? 'Start' : `Room ${room.numeral}`} · {LEVEL_LABEL[room.level]}
          </div>
          <h1 className="truncate font-serif text-3xl leading-none text-bone sm:text-4xl">{room.name}</h1>
          <p className="mt-1 hidden text-[12px] text-bone-2/80 sm:block">{room.tagline}</p>
        </div>
        <nav className="pointer-events-auto flex shrink-0 items-center gap-1.5">
          <div className="glass hidden rounded-full p-1 sm:flex" role="group" aria-label="Camera mode">
            {(['walk', 'orbit'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3.5 py-1.5 text-xs capitalize transition ${mode === m ? 'bg-bone text-ink' : 'text-bone/80 hover:text-bone'}`} aria-pressed={mode === m}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={() => setMode(mode === 'walk' ? 'orbit' : 'walk')} className="glass rounded-full px-3.5 py-2 text-xs text-bone sm:hidden" aria-label="Toggle walk or orbit">
            {mode === 'walk' ? 'Orbit' : 'Walk'}
          </button>
          {!mobile && (
            <button
              onClick={() => setEffectsWanted(!effectsWanted)}
              className={`glass hidden rounded-full px-3.5 py-2 text-xs sm:block ${effectsWanted ? 'text-bone' : 'text-bone/70'}`}
              aria-pressed={effectsWanted}
              aria-label="Bloom and ambient occlusion"
            >
              Effects
            </button>
          )}
          <button onClick={() => setHelp(!helpOpen)} className="glass hidden h-9 w-9 rounded-full text-sm text-bone sm:block" aria-label="Controls help">
            ?
          </button>
          <button onClick={() => setMenu(true)} className="rounded-full bg-bone px-4 py-2 text-xs font-medium text-ink hover:bg-white">
            Map
          </button>
        </nav>
      </header>

      <div className={`fixed z-10 transition-opacity duration-500 ${selected && isCoarse ? 'opacity-0' : 'opacity-100'} ${isCoarse ? 'right-3 top-24' : 'bottom-6 left-6'}`}>
        <Minimap />
      </div>

      <div className={`pointer-events-none fixed inset-x-0 z-10 flex justify-center px-3 transition-all duration-500 ${isCoarse ? 'bottom-36' : 'bottom-6'} ${selected ? 'translate-y-4 opacity-0' : 'opacity-100'}`}>
        <div className="glass pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1 scrollbar-thin">
          <button onClick={() => goTo(prev)} className="shrink-0 rounded-full px-3 py-1.5 text-xs text-bone/70 hover:text-bone" aria-label={`Previous room: ${ROOM_BY_ID[prev].name}`}>
            ←
          </button>
          {room.exhibits.map((ex, n) => (
            <button key={ex.id} onClick={() => select(ex.id)} className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-bone/85 transition hover:bg-white/10 hover:text-bone">
              <span className="mr-1.5 font-serif text-rust">{n + 1}</span>
              {ex.title}
            </button>
          ))}
          <button onClick={() => goTo(next)} className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs text-bone hover:bg-white/20" aria-label={`Next room: ${ROOM_BY_ID[next].name}`}>
            {ROOM_BY_ID[next].name} →
          </button>
        </div>
      </div>

      {isCoarse && mode === 'walk' && (
        <div className="fixed bottom-6 left-5 z-10">
          <Joystick />
        </div>
      )}

      {!isCoarse && !selected && (
        <div className="pointer-events-none fixed bottom-7 right-6 z-10 hidden text-right text-[11px] leading-5 text-bone/55 xl:block">
          {mode === 'walk' ? (
            <>
              <div>W A S D or arrows to walk · Shift to hurry</div>
              <div>Drag to look · click a number or a doorway</div>
            </>
          ) : (
            <>
              <div>Drag to orbit · scroll to zoom · right-drag to pan</div>
              <div>Press O to walk again</div>
            </>
          )}
        </div>
      )}

      {helpOpen && <Help onClose={() => setHelp(false)} />}
    </>
  )
}

function Help({ onClose }: { onClose: () => void }) {
  const rows = [
    ['W A S D / arrows', 'Walk; Q and E or ← → turn'],
    ['Drag', 'Look around (walk) or orbit the room (orbit)'],
    ['1 – 9', 'Jump to an exhibit in this room'],
    ['[ and ]', 'Previous and next exhibit'],
    ['O', 'Switch between walk and orbit'],
    ['M', 'Open the museum map'],
    ['Doorways', 'Walk through, or click, to change room'],
    ['Esc', 'Close panels'],
  ]
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow text-rust">How to move</div>
        <h2 className="font-serif text-3xl text-bone">Controls</h2>
        <dl className="mt-4 divide-y divide-bone/10 text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-bone">{k}</dt>
              <dd className="text-right text-bone/70">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12px] text-muted">On a phone, use the thumbstick to walk and drag anywhere to look.</p>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-bone py-2.5 text-sm text-ink">
          Got it
        </button>
      </div>
    </div>
  )
}

export function Transition() {
  const fading = useTour((s) => s.fading)
  const titleCard = useTour((s) => s.titleCard)
  const roomId = useTour((s) => s.room)
  const room = ROOM_BY_ID[roomId]
  return (
    <>
      <div className={`pointer-events-none fixed inset-0 z-40 bg-ink transition-opacity duration-[650ms] ease-in-out ${fading ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center text-center transition-all duration-1000 ${titleCard && !fading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-[92vw] rounded-[40px] bg-ink/35 px-6 py-7 backdrop-blur-[2px] sm:px-10 sm:py-8">
          <div className="font-serif text-5xl text-rust sm:text-7xl">{room.numeral === '0' ? '·' : room.numeral}</div>
          <div className="eyebrow mt-2 text-bone-2">{LEVEL_LABEL[room.level]}</div>
          <div className="mt-2 text-balance font-serif text-4xl leading-[0.95] text-bone sm:text-6xl">{room.name}</div>
          <div className="mt-2 text-balance font-serif text-lg italic text-bone/80 sm:text-2xl">{room.tagline}</div>
          <div className="eyebrow mt-4 max-w-[80vw] text-balance text-[9.5px] text-bone/60">{room.tags.join('  ·  ')}</div>
        </div>
      </div>
    </>
  )
}
