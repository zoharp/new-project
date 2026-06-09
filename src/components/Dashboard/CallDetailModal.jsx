import { useState } from 'react'
import { useCall } from '../../hooks/useCall'

export function CallDetailModal({ call, onClose }) {
  const { updateCall, deleteCall } = useCall()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    outcome: call.outcome,
    outcome_notes: call.outcome_notes,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await updateCall(call.id, editData)
    setLoading(false)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this call record?')) return
    setLoading(true)
    await deleteCall(call.id)
    setLoading(false)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Call Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Prospect Name</label>
                <p className="font-semibold text-gray-900">
                  {call.prospect_name || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Company</label>
                <p className="font-semibold text-gray-900">
                  {call.company_name || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Path Taken</label>
                <p className="font-semibold text-gray-900">
                  {call.path_taken === 'A' ? 'Named System' : 'Manual/Paper'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Duration</label>
                <p className="font-semibold text-gray-900">
                  {call.call_duration_seconds
                    ? `${Math.round(call.call_duration_seconds / 60)}m ${call.call_duration_seconds % 60}s`
                    : '—'}
                </p>
              </div>
            </div>

            {/* System Named (if Path A) */}
            {call.path_taken === 'A' && (
              <div>
                <label className="text-sm text-gray-600">System Named</label>
                <p className="font-semibold text-gray-900">
                  {call.system_named || '—'}
                </p>
              </div>
            )}

            {/* Objections */}
            {call.objections_handled && call.objections_handled.length > 0 && (
              <div>
                <label className="text-sm text-gray-600">Objections Handled</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {call.objections_handled.map(obj => (
                    <span
                      key={obj}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {obj.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Outcome (Editable) */}
            <div>
              <label className="text-sm text-gray-600">Outcome</label>
              {isEditing ? (
                <select
                  value={editData.outcome}
                  onChange={(e) =>
                    setEditData({ ...editData, outcome: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="booked">Booked</option>
                  <option value="follow_up">Follow up</option>
                  <option value="not_interested">Not interested</option>
                  <option value="pending">Pending</option>
                </select>
              ) : (
                <p className="font-semibold text-gray-900">
                  {call.outcome?.replace(/_/g, ' ')}
                </p>
              )}
            </div>

            {/* Notes (Editable) */}
            <div>
              <label className="text-sm text-gray-600">Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.outcome_notes}
                  onChange={(e) =>
                    setEditData({ ...editData, outcome_notes: e.target.value })
                  }
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-700 mt-1">
                  {call.outcome_notes || '—'}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-600">Call Date</label>
              <p className="text-gray-900">
                {new Date(call.call_date).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
