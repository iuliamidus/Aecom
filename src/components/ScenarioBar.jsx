import { useScenario } from '../lib/ScenarioContext.jsx'
import { SCENARIO, stormWind, MILESTONES } from '../data/scenario.js'
import { tMinusLabel } from '../lib/util.js'
import { IconPlay, IconPause, IconReset } from './icons.jsx'

const SPEEDS = [1, 2, 4]

export function ScenarioBar() {
  const { clock, setClock, playing, togglePlay, reset, speed, setSpeed } = useScenario()
  const wind = stormWind(clock)
  const milestone = [...MILESTONES].reverse().find((m) => clock >= m.clock)

  return (
    <div className="scenario-bar">
      <div className="scenario-bar__title">
        {SCENARIO.name} · Cat-{SCENARIO.category}
        <small>{SCENARIO.region}</small>
      </div>

      <div className="scenario-bar__clock">
        <span className="dot" />
        {tMinusLabel(clock)}
      </div>

      <button className="iconbtn iconbtn--play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>
      <button className="iconbtn" onClick={reset} aria-label="Reset scenario">
        <IconReset />
      </button>

      <div className="speed-toggle" role="group" aria-label="Playback speed">
        {SPEEDS.map((s) => (
          <button key={s} className={s === speed ? 'active' : ''} onClick={() => setSpeed(s)}>
            {s}×
          </button>
        ))}
      </div>

      <div className="scenario-bar__scrub">
        <input
          type="range"
          min="0"
          max="48"
          step="0.5"
          value={clock}
          onChange={(e) => setClock(Number(e.target.value))}
          aria-label="Scenario timeline"
        />
      </div>

      <div className="scenario-bar__wind" title={milestone?.note}>
        {wind} mph · {milestone?.label || 'Monitoring'}
      </div>
    </div>
  )
}
