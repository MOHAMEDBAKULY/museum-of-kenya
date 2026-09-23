import { Component, type ReactNode } from 'react'
import { ROOMS } from '../data/rooms'
import { SOURCES } from '../data/sources'

type State = { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error('Tour crashed', error)
  }
  render() {
    if (!this.state.error) return this.props.children
    return <Fallback reason="The 3D tour stopped unexpectedly." detail={this.state.error.message} />
  }
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Shown when WebGL is missing or the scene fails: still lets people browse the rooms. */
export function Fallback({ reason, detail }: { reason: string; detail?: string }) {
  return (
    <div className="scrollbar-thin fixed inset-0 overflow-y-auto bg-ink p-6 sm:p-12">
      <div className="eyebrow text-rust">Nairobi National Museum</div>
      <h1 className="mt-2 font-serif text-4xl text-bone sm:text-6xl">{reason}</h1>
      <p className="mt-3 max-w-xl text-bone/75">
        Your browser could not draw the 3D galleries. You can reload to try again, or browse the rooms and photographs below.
        {detail && <span className="mt-2 block text-[12px] text-muted">Details: {detail}</span>}
      </p>
      <div className="mt-5 flex gap-3">
        <button onClick={() => location.reload()} className="rounded-full bg-bone px-6 py-3 text-sm text-ink">
          Reload the tour
        </button>
        <a href={SOURCES.nnm.url} target="_blank" rel="noreferrer" className="glass rounded-full px-6 py-3 text-sm text-bone">
          Visit museums.or.ke
        </a>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-2xl border border-bone/10">
            {r.cover && <img src={r.cover} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
            <div className="p-4">
              <div className="eyebrow text-rust">{r.numeral}</div>
              <div className="font-serif text-2xl text-bone">{r.name}</div>
              <p className="mt-1 text-[13px] text-bone/70">{r.intro}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
