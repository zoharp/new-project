import { useState } from 'react'
import { CallDetailModal } from './CallDetailModal'

const OUTCOME_COLORS = {
  booked: 'bg-green-100 text-green-800',
  follow_up: 'bg-blue-100 text-blue-800',
  not_interested: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800',
}

export function CallHistory({ calls }) {
  const [selectedCall, setSelectedCall] = useState(null)

  if (!calls || calls.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No calls yet. Start by clicking "Ready to call?"</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Prospect / Company
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {calls.map(call => (
              <tr
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {call.prospect_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {call.company_name || '—'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      OUTCOME_COLORS[call.outcome] || OUTCOME_COLORS.pending
                    }`}
                  >
                    {call.outcome?.replace(/_/g, ' ') || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {call.call_duration_seconds
                    ? `${Math.round(call.call_duration_seconds / 60)}m`
                    : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(call.call_date).toLocaleDateString()} at{' '}
                  {new Date(call.call_date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </>
  )
}
