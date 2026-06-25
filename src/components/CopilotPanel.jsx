import { useState } from 'react'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { askCopilot, SUGGESTED } from '../data/copilot.js'
import { RiskBadge } from './RiskBadge.jsx'
import { IconBot, IconClose, IconArrowRight } from './icons.jsx'

// Shared conversation renderer (used by the floating panel and the full page).
export function CopilotThread({ messages, onAsk }) {
  const [draft, setDraft] = useState('')
  const submit = (q) => {
    const text = (q ?? draft).trim()
    if (!text) return
    onAsk(text)
    setDraft('')
  }
  return (
    <>
      <div className="copilot-body">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="copilot-msg user">{m.text}</div>
          ) : (
            <div key={i} className="copilot-msg bot">
              <div>{m.text}</div>
              {m.cites?.map((c, j) => (
                <div key={j} className="copilot-cite">
                  <span><b>{c.name}</b><br /><small className="muted">{c.detail} · {c.id}</small></span>
                  <span style={{ textAlign: 'right' }}>
                    <RiskBadge band={c.band}>{c.score}</RiskBadge>
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <div className="copilot-foot">
        <div className="chips">
          {SUGGESTED.slice(0, 3).map((s) => (
            <button key={s} onClick={() => submit(s)}>{s}</button>
          ))}
        </div>
        <div className="copilot-input">
          <input
            value={draft}
            placeholder="Ask about risk, impact or staging…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="iconbtn iconbtn--play" onClick={() => submit()} aria-label="Send">
            <IconArrowRight />
          </button>
        </div>
        <div className="copilot-readonly">Read-only copilot — cites sources, takes no actions.</div>
      </div>
    </>
  )
}

export function useCopilot() {
  const { clock } = useScenario()
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'EOC Copilot ready. I answer over the live risk, forecast and deployment state — every answer cites its sources.', cites: [] },
  ])
  const ask = (q) => {
    const res = askCopilot(q, clock)
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'bot', ...res }])
  }
  return { messages, ask }
}

export function CopilotLauncher() {
  const [open, setOpen] = useState(false)
  const { messages, ask } = useCopilot()
  return (
    <>
      {!open && (
        <button className="copilot-launch" onClick={() => setOpen(true)}>
          <IconBot /> Ask Copilot
        </button>
      )}
      <div className={`copilot-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="copilot-head">
          <h3><IconBot /> EOC Copilot</h3>
          <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Close copilot">
            <IconClose />
          </button>
        </div>
        <CopilotThread messages={messages} onAsk={ask} />
      </div>
    </>
  )
}
