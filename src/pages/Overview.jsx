import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../lib/useReveal.js'
import { IconMap, IconChart, IconTruck, IconShield } from '../components/icons.jsx'

const FEATURES = [
  { Icon: IconMap, title: 'Predict', body: 'A single 48-hour-ahead risk view ranks every grid and water asset, with confidence and the factors behind each score.' },
  { Icon: IconChart, title: 'Forecast', body: 'Time-series projection of customers affected and restoration effort — so leadership sees impact before it lands.' },
  { Icon: IconTruck, title: 'Deploy', body: 'Optimised crew staging that minimises restoration time, with a graceful fallback to zone staging when routing data is thin.' },
  { Icon: IconShield, title: 'Explain', body: 'Every recommendation is auditable: model version, inputs and the operator decision are logged end-to-end.' },
]

export function Overview() {
  const ref = useRef(null)
  useReveal(ref)

  return (
    <div className="aecom" ref={ref}>
      {/* nav */}
      <header className="aecom-nav aecom-nav--dark">
        <div className="aecom-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span className="aecom-wordmark" style={{ fontSize: '1.35rem' }}>AECOM</span>
          <nav>
            <a href="#capabilities">Capabilities</a>
            <a href="#approach">Approach</a>
            <Link className="aecom-btn aecom-btn--primary" to="/dashboard">Open the EOC dashboard</Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="aecom-hero">
        <img className="aecom-hero__skyline" src="/img/skyline_hero_faint.png" alt="" />
        <div className="aecom-container aecom-hero__inner">
          <span className="aecom-eyebrow">SGW Operational Resilience · Decision Support</span>
          <h1>Know what will fail before the storm does.</h1>
          <p>
            One 48-hour-ahead view of the assets most likely to fail, the customers at risk, and
            where to stage crews — across grid and water, in one place. AI recommends; your team decides.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <Link className="aecom-btn aecom-btn--primary" to="/dashboard">Launch the live demo</Link>
            <Link className="aecom-btn aecom-btn--ghost" to="/forecasting">See the forecast</Link>
          </div>
        </div>
      </section>

      {/* problem framing */}
      <section className="aecom-section" id="approach">
        <div className="aecom-container">
          <span className="aecom-eyebrow" data-reveal>The problem</span>
          <h2 data-reveal style={{ maxWidth: '20ch' }}>The data exists. It just doesn't exist together.</h2>
          <p data-reveal style={{ fontSize: 'var(--aecom-step-1)' }}>
            Before a severe-weather event, no one at SGW can quickly answer which critical assets will
            fail, what the customer impact will be, and where to stage crews — because GIS, maintenance,
            weather and field-ops live in separate systems. This platform unifies them into one
            evidence-backed decision view, and keeps a defensible record of every call.
          </p>
        </div>
      </section>

      {/* features */}
      <section className="aecom-section aecom-section--panel" id="capabilities">
        <div className="aecom-container">
          <span className="aecom-eyebrow" data-reveal>Capabilities</span>
          <h2 data-reveal>Predict. Forecast. Deploy. Explain.</h2>
          <div className="aecom-grid" data-reveal-group="120" style={{ marginTop: '2rem' }}>
            {FEATURES.map(({ Icon, title, body }) => (
              <article className="aecom-card" data-reveal key={title}>
                <span className="aecom-card__icon"><Icon width={26} height={26} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* stat callout */}
      <section className="aecom-section aecom-section--dark">
        <div className="aecom-container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div data-reveal>
            <div className="aecom-stat__num">8M+</div>
            <div className="aecom-stat__label">residents served across coastal &amp; inland regions</div>
          </div>
          <div data-reveal data-reveal-delay="120">
            <div className="aecom-stat__num">48h</div>
            <div className="aecom-stat__label">forecast lead time per event</div>
          </div>
          <div data-reveal data-reveal-delay="240">
            <div className="aecom-stat__num">~30%</div>
            <div className="aecom-stat__label">faster crew staging (illustrative target)</div>
          </div>
          <div data-reveal data-reveal-delay="360">
            <div className="aecom-stat__num">100%</div>
            <div className="aecom-stat__label">of operator decisions logged &amp; auditable</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="aecom-section">
        <div className="aecom-container" style={{ textAlign: 'left' }}>
          <span className="aecom-eyebrow" data-reveal>Live demo</span>
          <h2 data-reveal>Step into the Emergency Operations Center.</h2>
          <p data-reveal>
            Press play on the hurricane scenario and watch risk scores climb, priorities re-order and
            the impact forecast evolve as landfall approaches.
          </p>
          <Link className="aecom-btn aecom-btn--primary" to="/dashboard" data-reveal>Open the EOC dashboard</Link>
        </div>
      </section>

      <img className="aecom-skyline-band" src="/img/skyline_footer_teal.png" alt="" />
      <footer className="aecom-footer">
        <div className="aecom-container" style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="aecom-wordmark">AECOM</span>
          <span style={{ fontSize: '.85rem' }}>Southeastern Grid &amp; Water — Operational Resilience MVP · Demo</span>
        </div>
      </footer>
    </div>
  )
}
