import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCall } from '../../hooks/useCall'

const OBJECTION_OPTIONS = [
  { key: 'too_busy', label: 'Too busy / In a project' },
  { key: 'already_invested', label: 'Already invested in current system' },
  { key: 'no_budget', label: "Don't have budget right now" },
]

export function PostCallCapture() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const { call, fetchCall, updateCall } = useCall()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    prospect_name: '',
    company_name: '',
    system_named: '',
    objections_handled: [],
    outcome: 'pending',
    outcome_notes: '',
  })

  useEffect(() => {
    if (callId) {
      fetchCall(callId)
    }
  }, [callId])

  useEffect(() => {
    if (call) {
      setFormData({
        prospect_name: call.prospect_name || '',
        company_name: call.company_name || '',
        system_named: call.system_named || '',
        objections_handled: call.objections_handled || [],
        outcome: call.outcome || 'pending',
        outcome_notes: call.outcome_notes || '',
      })
    }
  }, [call])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleObjectionChange = (key) => {
    setFormData(prev => {
      const objections = prev.objections_handled.includes(key)
        ? prev.objections_handled.filter(o => o !== key)
        : [...prev.objections_handled, key]
      return { ...prev, objections_handled: objections }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.prospect_name.trim()) {
      setError('Prospect name is required')
      return
    }
    if (!formData.company_name.trim()) {
      setError('Company name is required')
      return
    }
    if (!formData.outcome || formData.outcome === 'pending') {
      setError('Outcome is required')
      return
    }

    setLoading(true)
    const endTime = new Date()
    const startTime = call?.call_started_at ? new Date(call.call_started_at) : endTime
    const durationSeconds = Math.round((endTime - startTime) / 1000)

    const { error: err } = await updateCall(callId, {
      ...formData,
      call_ended_at: endTime.toISOString(),
      call_duration_seconds: durationSeconds,
    })

    setLoading(false)

    if (!err) {
      navigate('/dashboard')
    } else {
      setError(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Call Summary</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prospect Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prospect_name"
                  value={formData.prospect_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Acme Corp"
                />
              </div>
            </div>

            {/* System (if Path A) */}
            {call?.path_taken === 'A' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Named
                </label>
                <input
                  type="text"
                  name="system_named"
                  value={formData.system_named}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TrackWise"
                />
              </div>
            )}

            {/* Objections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Objections Encountered
              </label>
              <div className="space-y-2">
                {OBJECTION_OPTIONS.map(option => (
                  <label key={option.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.objections_handled.includes(option.key)}
                      onChange={() => handleObjectionChange(option.key)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outcome <span className="text-red-500">*</span>
              </label>
              <select
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Select outcome...</option>
                <option value="booked">Booked a meeting</option>
                <option value="follow_up">Follow up later</option>
                <option value="not_interested">Not interested</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="outcome_notes"
                value={formData.outcome_notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the call..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Saving...' : 'Save Call'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
