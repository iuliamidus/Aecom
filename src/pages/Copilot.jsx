import { PageHead } from '../components/AppShell.jsx'
import { CopilotThread, useCopilot } from '../components/CopilotPanel.jsx'
import { SUGGESTED } from '../data/copilot.js'

export function Copilot() {
  const { messages, ask } = useCopilot()
  return (
    <>
      <PageHead title="EOC Copilot">
        Natural-language queries over the live risk, forecast and deployment state. Read-only —
        every answer cites the underlying assets and scores, and the copilot takes no actions.
      </PageHead>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'start' }}>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
          <CopilotThread messages={messages} onAsk={ask} />
        </div>

        <div className="stack">
          <div className="panel panel--pad">
            <div className="eyebrow-sm" style={{ marginBottom: '.6rem' }}>Try asking</div>
            <div className="chips" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => ask(s)} style={{ textAlign: 'left' }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="panel panel--pad muted" style={{ fontSize: '.82rem' }}>
            <b style={{ color: 'var(--aecom-teal)' }}>How it works.</b> The copilot is a read-only
            retrieval layer over the same risk engine, forecast and optimiser the dashboards use.
            It answers in seconds and grounds every response in cited assets — supporting auditability.
          </div>
        </div>
      </div>
    </>
  )
}
