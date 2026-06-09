import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCall() {
  const [call, setCall] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createCall = useCallback(async (userId, callData = {}) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('calls')
        .insert({
          user_id: userId,
          prospect_name: callData.prospect_name || null,
          company_name: callData.company_name || null,
          outcome: 'pending',
          call_started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (err) throw err
      setCall(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCall = useCallback(async (callId) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single()

      if (err) throw err
      setCall(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCall = useCallback(async (callId, updates) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('calls')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .select()
        .single()

      if (err) throw err
      setCall(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserCalls = useCallback(async (userId) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', userId)
        .order('call_date', { ascending: false })
        .limit(50)

      if (err) throw err
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTodaysCalls = useCallback(async (userId) => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0]

      const { data, error: err } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', userId)
        .gte('call_date', `${today}T00:00:00`)
        .lte('call_date', `${today}T23:59:59`)

      if (err) throw err
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCall = useCallback(async (callId) => {
    try {
      setLoading(true)
      setError(null)

      const { error: err } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId)

      if (err) throw err
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    call,
    setCall,
    loading,
    error,
    createCall,
    fetchCall,
    updateCall,
    fetchUserCalls,
    fetchTodaysCalls,
    deleteCall,
  }
}
