import { useState, useEffect, useRef } from 'react'

const API = ''

export default function Scenarios() {
  const [recording, setRecording] = useState(false)
  const [steps, setSteps] = useState([])
  const [scenarioName, setScenarioName] = useState('login_flow')
  const [startUrl, setStartUrl] = useState('https://app.orcanos.com/orcanos/web/')
  const [savedScenarios, setSavedScenarios] = useState([])
  const [message, setMessage] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const pollRef = useRef(null)
  const stepsEndRef = useRef(null)

  useEffect(() => {
    loadScenarios()
  }, [])

  useEffect(() => {
    if (stepsEndRef.current) stepsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  useEffect(() => {
    if (recording) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API}/api/scenarios/record/status`)
          const data = await res.json()
          setSteps(data.steps || [])
          if (!data.active) {
            setRecording(false)
            clearInterval(pollRef.current)
            loadScenarios()
          }
        } catch {}
      }, 1000)
    }
    return () => clearInterval(pollRef.current)
  }, [recording])

  async function loadScenarios() {
    try {
      const res = await fetch(`${API}/api/scenarios`)
      setSavedScenarios(await res.json())
    } catch {}
  }

  async function startRecording() {
    if (!scenarioName.trim()) return setMessage({ type: 'error', text: 'Enter a scenario name.' })
    try {
      const res = await fetch(`${API}/api/scenarios/record/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: scenarioName.trim(), url: startUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        return setMessage({ type: 'error', text: err.detail || 'Failed to start recording.' })
      }
      setSteps([])
      setRecording(true)
      setMessage({ type: 'info', text: 'Browser opened. Perform your steps, then click Stop Recording.' })
    } catch (e) {
      setMessage({ type: 'error', text: 'Cannot reach backend.' })
    }
  }

  async function stopRecording() {
    try {
      const res = await fetch(`${API}/api/scenarios/record/stop`, { method: 'POST' })
      const data = await res.json()
      setRecording(false)
      clearInterval(pollRef.current)
      setSteps(data.steps || [])
      setMessage({ type: 'success', text: `Saved! ${data.step_count} steps recorded as "${scenarioName}".` })
      loadScenarios()
    } catch {
      setMessage({ type: 'error', text: 'Failed to stop recording.' })
    }
  }

  async function viewScenario(name) {
    const res = await fetch(`${API}/api/scenarios/${name}`)
    setSelectedScenario(await res.json())
  }

  async function deleteScenario(name) {
    if (!confirm(`Delete scenario "${name}"?`)) return
    await fetch(`${API}/api/scenarios/${name}`, { method: 'DELETE' })
    setSelectedScenario(null)
    loadScenarios()
  }

  const actionColor = { click: '#3b82f6', fill: '#8b5cf6', navigate: '#10b981' }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Scenarios</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Record a test scenario once — it will be replayed on all accounts automatically.
      </p>

      {/* Record section */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {recording ? '🔴 Recording in progress...' : 'Record New Scenario'}
        </h2>

        {!recording && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>Scenario Name</label>
              <input
                style={inputStyle}
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                placeholder="login_flow"
              />
            </div>
            <div style={{ flex: 2, minWidth: 260 }}>
              <label style={labelStyle}>Start URL</label>
              <input
                style={inputStyle}
                value={startUrl}
                onChange={e => setStartUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, marginBottom: 14,
            background: message.type === 'error' ? '#fef2f2' : message.type === 'success' ? '#f0fdf4' : '#eff6ff',
            color: message.type === 'error' ? '#dc2626' : message.type === 'success' ? '#16a34a' : '#1d4ed8',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : message.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
            fontSize: 14,
          }}>
            {message.text}
          </div>
        )}

        {recording ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>{steps.length} steps captured</span>
              <button onClick={stopRecording} style={{ ...btnStyle, background: '#dc2626' }}>
                ⏹ Stop Recording
              </button>
            </div>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, maxHeight: 260, overflowY: 'auto', padding: 12 }}>
              {steps.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Waiting for actions...</p>
              ) : (
                steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
                    <span style={{ color: '#9ca3af', minWidth: 22 }}>{i + 1}.</span>
                    <span style={{
                      background: actionColor[s.action] || '#6b7280',
                      color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 600
                    }}>{s.action}</span>
                    <span style={{ color: '#374151' }}>{s.name}</span>
                    {s.value && <span style={{ color: '#9ca3af' }}>= {s.value}</span>}
                  </div>
                ))
              )}
              <div ref={stepsEndRef} />
            </div>
          </div>
        ) : (
          <button onClick={startRecording} style={{ ...btnStyle, background: '#2563eb' }}>
            ▶ Start Recording
          </button>
        )}
      </div>

      {/* Saved scenarios */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Saved Scenarios</h2>
        {savedScenarios.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No scenarios recorded yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', textAlign: 'left' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Steps</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {savedScenarios.map(s => (
                <tr key={s.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}><strong>{s.name}</strong></td>
                  <td style={tdStyle}>{s.step_count} steps</td>
                  <td style={tdStyle}>{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</td>
                  <td style={{ ...tdStyle, display: 'flex', gap: 8 }}>
                    <button onClick={() => viewScenario(s.name)} style={{ ...smallBtn, background: '#f3f4f6', color: '#374151' }}>View</button>
                    <button onClick={() => deleteScenario(s.name)} style={{ ...smallBtn, background: '#fef2f2', color: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Scenario detail modal */}
      {selectedScenario && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedScenario.name}</h2>
              <button onClick={() => setSelectedScenario(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              {selectedScenario.step_count || selectedScenario.steps?.length} steps · {selectedScenario.base_url}
            </p>
            {(selectedScenario.steps || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                <span style={{ color: '#9ca3af', minWidth: 22 }}>{i + 1}.</span>
                <span style={{
                  background: actionColor[s.action] || '#6b7280',
                  color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 600, flexShrink: 0
                }}>{s.action}</span>
                <div>
                  <div style={{ color: '#374151', fontWeight: 500 }}>{s.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>{s.target}</div>
                  {s.value && <div style={{ color: '#6b7280' }}>value: {s.value}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
const btnStyle = { color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const smallBtn = { border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const thStyle = { padding: '8px 12px', fontWeight: 500, fontSize: 13 }
const tdStyle = { padding: '10px 12px', verticalAlign: 'middle' }
