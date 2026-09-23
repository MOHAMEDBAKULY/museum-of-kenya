import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

/** Full-screen loader on first visit, then a slim bar while later rooms stream in. */
export function Loader() {
  const { progress, active, item } = useProgress()
  const [first, setFirst] = useState(true)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!active && progress >= 100 && first) {
      const t = window.setTimeout(() => setFirst(false), 400)
      const t2 = window.setTimeout(() => setGone(true), 1400)
      return () => {
        window.clearTimeout(t)
        window.clearTimeout(t2)
      }
    }
  }, [active, progress, first])

  const pct = Math.round(progress)
  const what = item?.includes('/photos/') ? 'museum photographs' : item?.includes('/cutouts/') ? 'specimens' : item?.includes('/fonts/') ? 'type' : 'galleries'

  return (
    <>
      {!gone && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-1000 ${first ? 'opacity-100' : 'pointer-events-none opacity-0'}`} role="status" aria-live="polite">
          <div className="eyebrow text-rust">Makumbusho ya Kitaifa</div>
          <div className="mt-3 font-serif text-5xl text-bone sm:text-6xl">Opening the doors</div>
          <div className="mt-8 h-px w-56 overflow-hidden bg-bone/15">
            <div className="h-full bg-bone transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 text-[12px] tabular-nums text-bone/60">
            Preparing the {what} · {pct}%
          </div>
        </div>
      )}
      {!first && active && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent" role="progressbar" aria-valuenow={pct}>
          <div className="h-full bg-rust transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}
    </>
  )
}
