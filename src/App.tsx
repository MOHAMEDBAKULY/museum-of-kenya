import { useMemo } from 'react'
import { useTour } from './store'
import { Scene } from './three/Scene'
import { ErrorBoundary, Fallback, hasWebGL } from './ui/ErrorBoundary'
import { HUD, Transition } from './ui/HUD'
import { InfoPanel } from './ui/InfoPanel'
import { Intro } from './ui/Intro'
import { Loader } from './ui/Loader'
import { MapHub } from './ui/MapHub'

export default function App() {
  const phase = useTour((s) => s.phase)
  const menuOpen = useTour((s) => s.menuOpen)
  const setMenu = useTour((s) => s.setMenu)
  const setPhase = useTour((s) => s.setPhase)
  const webgl = useMemo(hasWebGL, [])
  const clean = useMemo(() => new URLSearchParams(location.search).has('clean'), [])

  if (!webgl) return <Fallback reason="This browser can't show 3D." />

  return (
    <ErrorBoundary>
      <Scene />
      {phase === 'intro' && <Intro />}
      {phase === 'map' && <MapHub onClose={() => setPhase('intro')} />}
      {phase === 'tour' && !clean && (
        <>
          <HUD />
          <InfoPanel />
          {menuOpen && <MapHub onClose={() => setMenu(false)} />}
        </>
      )}
      {!clean && <Transition />}
      <Loader />
    </ErrorBoundary>
  )
}
