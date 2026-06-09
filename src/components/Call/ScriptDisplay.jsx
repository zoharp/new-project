export function ScriptDisplay({ script, stepNumber }) {
  if (!script) {
    return <div className="text-center py-8 text-gray-500">Loading script...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Step {stepNumber} of 7
        </h2>
        <div className="text-sm text-gray-600">
          {script.timer_seconds_min}–{script.timer_seconds_max}s
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {script.step_title}
        </h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-700">{script.goal}</p>
        </div>
      </div>

      {script.delivery_tip && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <p className="text-sm font-semibold text-amber-900 mb-2">💡 Delivery Tip:</p>
          <p className="text-sm text-amber-800">{script.delivery_tip}</p>
        </div>
      )}

      <div className="script-text py-8 px-6 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 font-medium leading-relaxed break-words">
        "{script.script_text}"
      </div>
    </div>
  )
}
