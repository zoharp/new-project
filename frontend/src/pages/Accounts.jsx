import { useState, useEffect } from 'react'

const API = ''

function extractAccountName(url) {
  try {
    const path = new URL(url).pathname
    const parts = path.split('/').filter(Boolean)
    return parts[0] || ''
  } catch {
    return ''
  }
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [url, setUrl] = useState('')
  const [password, setPassword] = useState('')
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadAccounts() }, [])

  useEffect(() => {
    setPreview(extractAccountName(url))
  }, [url])

  async function loadAccounts() {
    try {
      const res = await fetch(`${API}/api/accounts/`)
      setAccounts(await res.json())
    } catch {}
  }

  async function addAccount(e) {
    e.preventDefault()
    const name = extractAccountName(url)
    if (!name) return setMessage({ type: 'error', text: 'Could not extract account name from URL. Use format: https://app.orcanos.com/ACCOUNT/web/' })
    if (!password) return setMessage({ type: 'error', text: 'Password is required.' })

    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API}/api/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, password, enabled: true }),
      })
      if (!res.ok) {
        const err = await res.json()
        setMessage({ type: 'error', text: err.detail || 'Failed to add account.' })
      } else {
        setMessage({ type: 'success', text: `Account "${name}" added.` })
        setUrl('')
        setPassword('')
        setPreview('')
        loadAccounts()
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot reach backend.' })
    }
    setLoading(false)
  }

  async function toggleAccount(id, enabled) {
    const acct = accounts.find(a => a.id === id)
    if (!acct) return
    await fetch(`${API}/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: acct.name, url: acct.url, password: '', enabled: !enabled }),
    })
    loadAccounts()
  }

  async function deleteAccount(id, name) {
    if (!confirm(`Delete account "${name}"?`)) return
    await fetch(`${API}/api/accounts/${id}`, { method: 'DELETE' })
    loadAccounts()
  }

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Accounts</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Add the Orcanos accounts to test. All accounts use the shared user <code>orcanos.tech</code>.
      </p>

      {/* Add account form */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add Account</h2>
        <form onSubmit={addAccount}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 2, minWidth: 240 }}>
              <label style={labelStyle}>Account URL</label>
              <input
                style={inputStyle}
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://app.orcanos.com/acme/web/"
                required
              />
              {preview && (
                <div style={{ marginTop: 5, fontSize: 12, color: '#2563eb' }}>
                  Account name: <strong>{preview}</strong>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Account password"
                required
              />
            </div>
          </div>

          {message && (
            <div style={{
              padding: '9px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13,
              background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
              border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? '#93c5fd' : '#2563eb', color: '#fff',
            border: 'none', borderRadius: 6, padding: '9px 20px',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
          }}>
            {loading ? 'Adding...' : '+ Add Account'}
          </button>
        </form>
      </div>

      {/* Accounts list */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Accounts ({accounts.length})
        </h2>
        {accounts.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No accounts added yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', textAlign: 'left' }}>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}><strong>{a.name}</strong></td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>{a.url}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: a.enabled ? '#dcfce7' : '#f3f4f6',
                      color: a.enabled ? '#16a34a' : '#9ca3af',
                    }}>
                      {a.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => toggleAccount(a.id, a.enabled)}
                      style={{ ...smallBtn, background: '#f3f4f6', color: '#374151' }}
                    >
                      {a.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteAccount(a.id, a.name)}
                      style={{ ...smallBtn, background: '#fef2f2', color: '#dc2626' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
const smallBtn = { border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const thStyle = { padding: '8px 12px', fontWeight: 500, fontSize: 13 }
const tdStyle = { padding: '10px 12px', verticalAlign: 'middle' }
