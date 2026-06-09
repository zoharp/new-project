import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCall } from '../hooks/useCall'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createCall, loading } = useCall()
  const [prospectName, setProspectName] = useState('')
  const [companyName, setCompanyName] = useState('')

  const handleStartCall = async () => {
    if (!user) return

    const { data, error } = await createCall(user.id, {
      prospect_name: prospectName,
      company_name: companyName,
    })
    if (!error && data) {
      navigate(`/call/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ready to call?</h1>
            <p className="text-gray-600">Let's guide you through the founder cold call script</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prospect Name
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Medical Devices"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleStartCall}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Starting...' : 'Start Call'}
          </button>

          <div className="border-t pt-6">
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Follow the 7-step founder cold call script</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Handle objections with proven responses</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>Track outcomes and measure success</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
