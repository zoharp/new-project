export function Drawer({ tab, script, handlers, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {tab === 'help' ? 'Help Tips' : 'Resistance Handlers'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'help' ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Step Tip:</h3>
              <p className="text-sm text-blue-800">{script?.delivery_tip}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Common objections and how to respond:
              </p>
              {handlers?.map(handler => (
                <div key={handler.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {handler.title}
                  </h4>
                  <p className="text-sm text-gray-700">{handler.response_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
