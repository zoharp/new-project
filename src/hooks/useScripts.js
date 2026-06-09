import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useScripts() {
  const [scripts, setScripts] = useState([])
  const [handlers, setHandlers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const { data: scriptsData, error: scriptsError } = await supabase
          .from('call_scripts')
          .select('*')
          .order('step_number', { ascending: true })

        if (scriptsError) throw scriptsError

        const { data: handlersData, error: handlersError } = await supabase
          .from('resistance_handlers')
          .select('*')

        if (handlersError) throw handlersError

        setScripts(scriptsData || [])
        setHandlers(handlersData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getScriptByStep = (stepNumber) => {
    return scripts.find(s => s.step_number === stepNumber)
  }

  return {
    scripts,
    handlers,
    loading,
    error,
    getScriptByStep,
  }
}
