import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCall } from '../../hooks/useCall'
import { useScripts } from '../../hooks/useScripts'
import { ScriptDisplay } from './ScriptDisplay'
import { Drawer } from './Drawer'

export function CallScreen() {
  const { callId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { call, fetchCall, updateCall } = useCall()
  const { scripts, handlers, getScriptByStep } = useScripts()
  const initialStep = parseInt(searchParams.get('step')) || 1
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [showDrawer, showDrawerTab] = useState(null)
  const [callStartedAt] = useState(new Date())

  useEffect(() => {
    if (callId && user) {
      fetchCall(callId)
    }
  }, [callId, user])

  const script = getScriptByStep(currentStep)
  const prevScript = currentStep > 1 ? getScriptByStep(currentStep - 1) : null
  const nextScript = currentStep < 7 ? getScriptByStep(currentStep + 1) : null

  const handleNext = () => {
    if (currentStep === 3) {
      // Step 3 → Show branching screen
      navigate(`/call/${callId}/branch`)
    } else if (currentStep === 7) {
      // Step 7 → Show post-call capture
      navigate(`/call/${callId}/capture`)
    } else if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleEndCall = () => {
    navigate(`/call/${callId}/capture`)
  }

  if (!script) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading script...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Step {currentStep} of 7
              </h1>
              <p className="text-sm text-gray-600 mt-1">{script.step_title}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p className="font-medium">{script.timer_seconds_min}–{script.timer_seconds_max}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout with Side Context */}
      <div className="flex gap-6 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Left Sidebar - Previous & Next Steps */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-6">
          {/* Previous Step */}
          <div className={`${prevScript ? 'opacity-100' : 'opacity-40'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">← Previous</p>
            {prevScript ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <p className="font-bold text-sm text-gray-900 mb-2">Step {currentStep - 1}</p>
                <p className="text-xs font-semibold text-gray-700 mb-3">{prevScript.step_title}</p>
                <p className="text-xs text-gray-700 leading-relaxed">{prevScript.script_text}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 italic">Start of call</p>
              </div>
            )}
          </div>

          {/* Next Step */}
          <div className={`${nextScript ? 'opacity-100' : 'opacity-40'}`}>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Next Step →</p>
            {nextScript ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
                <p className="font-bold text-sm text-gray-900 mb-2">Step {currentStep + 1}</p>
                <p className="text-xs font-semibold text-gray-700 mb-3">{nextScript.step_title}</p>
                <p className="text-xs text-gray-700 leading-relaxed">{nextScript.script_text}</p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 italic">Post-call capture form</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ScriptDisplay script={script} stepNumber={currentStep} />

          {/* Footer Controls */}
          <div className="mt-12 space-y-6">
          {/* Icon Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => showDrawerTab(showDrawerTab === 'help' ? null : 'help')}
              className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Help / SOS"
            >
              <span className="text-xl">❓</span>
            </button>
            <button
              onClick={() => showDrawerTab(showDrawerTab === 'handlers' ? null : 'handlers')}
              className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Resistance Handlers"
            >
              <span className="text-xl">🛡️</span>
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Back
            </button>

            {currentStep === 7 ? (
              <button
                onClick={handleEndCall}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                End Call
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Drawer Sidebar */}
      {showDrawer && (
        <Drawer
          tab={showDrawerTab}
          script={script}
          handlers={handlers}
          onClose={() => showDrawerTab(null)}
        />
      )}
    </div>
  )
}
