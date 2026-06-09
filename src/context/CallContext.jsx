import { createContext, useContext, useState } from 'react'

const CallContext = createContext()

export function CallProvider({ children }) {
  const [currentCall, setCurrentCall] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [prospectAnswer, setProspectAnswer] = useState('')
  const [pathTaken, setPathTaken] = useState(null)
  const [scripts, setScripts] = useState([])
  const [handlers, setHandlers] = useState([])

  const startNewStep = (step) => {
    setCurrentStep(step)
  }

  const goToNextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectPath = (path) => {
    setPathTaken(path)
  }

  const setAnswer = (answer) => {
    setProspectAnswer(answer)
  }

  const value = {
    currentCall,
    setCurrentCall,
    currentStep,
    startNewStep,
    goToNextStep,
    goToPreviousStep,
    prospectAnswer,
    setAnswer,
    pathTaken,
    selectPath,
    scripts,
    setScripts,
    handlers,
    setHandlers,
  }

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  )
}

export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within CallProvider')
  }
  return context
}
