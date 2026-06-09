import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCall } from '../../hooks/useCall'

export function BranchingScreen() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const { updateCall } = useCall()
  const [systemName, setSystemName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectPath = async (path) => {
    setLoading(true)
    await updateCall(callId, {
      path_taken: path,
      system_named: path === 'A' ? (systemName.trim() || null) : null,
    })
    setLoading(false)

    // Navigate to Step 4
    navigate(`/call/${callId}?step=4`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What system are they using?
          </h1>
          <p className="text-gray-600">
            This determines which script path to follow
          </p>
        </div>

        {/* Path A: Named System */}
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Path A: Named System</h2>
            <p className="text-blue-700 mb-4">
              They mentioned a specific tool (TrackWise, Arena, MasterControl, Greenlight, etc.)
            </p>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                System Name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter system name (e.g., TrackWise, Arena)"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
            </div>
            <button
              onClick={() => handleSelectPath('A')}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Loading...' : 'They named a system →'}
            </button>
          </div>
        </div>

        {/* Path B: Manual/Paper */}
        <div className="space-y-4">
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Path B: Manual/Paper</h2>
            <p className="text-gray-700 mb-4">
              They use spreadsheets, manual tracking, or paper
            </p>
            <button
              onClick={() => handleSelectPath('B')}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Loading...' : 'Paper / Excel / Manual →'}
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Based on their answer, the script will adjust to Path A or Path B content</p>
        </div>
      </div>
    </div>
  )
}
