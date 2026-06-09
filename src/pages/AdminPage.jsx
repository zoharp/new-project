import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function AdminPage() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState([])
  const [handlers, setHandlers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingScript, setEditingScript] = useState(null)
  const [editingHandler, setEditingHandler] = useState(null)
  const [activeTab, setActiveTab] = useState('scripts')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [scriptsRes, handlersRes] = await Promise.all([
        supabase.from('call_scripts').select('*').order('step_number'),
        supabase.from('resistance_handlers').select('*').order('id'),
      ])

      if (scriptsRes.data) setScripts(scriptsRes.data)
      if (handlersRes.data) setHandlers(handlersRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateScript = async (script) => {
    try {
      const { error } = await supabase
        .from('call_scripts')
        .update({
          step_title: script.step_title,
          goal: script.goal,
          script_text: script.script_text,
          delivery_tip: script.delivery_tip,
          timer_seconds_min: script.timer_seconds_min,
          timer_seconds_max: script.timer_seconds_max,
          path_a_content: script.path_a_content,
          path_b_content: script.path_b_content,
        })
        .eq('id', script.id)

      if (error) throw error

      setScripts(scripts.map(s => s.id === script.id ? script : s))
      setEditingScript(null)
      alert('Script updated!')
    } catch (err) {
      console.error('Error updating script:', err)
      alert('Error updating script')
    }
  }

  const updateHandler = async (handler) => {
    try {
      const { error } = await supabase
        .from('resistance_handlers')
        .update({
          title: handler.title,
          response_text: handler.response_text,
        })
        .eq('id', handler.id)

      if (error) throw error

      setHandlers(handlers.map(h => h.id === handler.id ? handler : h))
      setEditingHandler(null)
      alert('Handler updated!')
    } catch (err) {
      console.error('Error updating handler:', err)
      alert('Error updating handler')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Edit call scripts, tips, and resistance handlers</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'scripts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Call Scripts (7)
          </button>
          <button
            onClick={() => setActiveTab('handlers')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'handlers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Resistance Handlers (3)
          </button>
        </div>

        {/* Scripts Tab */}
        {activeTab === 'scripts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              scripts.map(script => (
                <div
                  key={script.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {script.step_number}: {script.step_title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{script.goal}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Timer: {script.timer_seconds_min}–{script.timer_seconds_max}s
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingScript(script)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Handlers Tab */}
        {activeTab === 'handlers' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              handlers.map(handler => (
                <div
                  key={handler.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {handler.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {handler.response_text}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingHandler(handler)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Script Modal */}
      {editingScript && (
        <EditScriptModal
          script={editingScript}
          onSave={updateScript}
          onClose={() => setEditingScript(null)}
        />
      )}

      {/* Edit Handler Modal */}
      {editingHandler && (
        <EditHandlerModal
          handler={editingHandler}
          onSave={updateHandler}
          onClose={() => setEditingHandler(null)}
        />
      )}
    </div>
  )
}

function EditScriptModal({ script, onSave, onClose }) {
  const [formData, setFormData] = useState(script)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Step {script.step_number}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Title
            </label>
            <input
              type="text"
              value={formData.step_title}
              onChange={(e) =>
                setFormData({ ...formData, step_title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal
            </label>
            <input
              type="text"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Text
            </label>
            <textarea
              value={formData.script_text}
              onChange={(e) =>
                setFormData({ ...formData, script_text: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Tip
            </label>
            <input
              type="text"
              value={formData.delivery_tip || ''}
              onChange={(e) =>
                setFormData({ ...formData, delivery_tip: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timer Min (sec)
              </label>
              <input
                type="number"
                value={formData.timer_seconds_min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timer_seconds_min: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timer Max (sec)
              </label>
              <input
                type="number"
                value={formData.timer_seconds_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timer_seconds_max: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {script.step_number === 4 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path A Content
                </label>
                <textarea
                  value={formData.path_a_content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, path_a_content: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path B Content
                </label>
                <textarea
                  value={formData.path_b_content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, path_b_content: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditHandlerModal({ handler, onSave, onClose }) {
  const [formData, setFormData] = useState(handler)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Resistance Handler</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Text
            </label>
            <textarea
              value={formData.response_text}
              onChange={(e) =>
                setFormData({ ...formData, response_text: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
