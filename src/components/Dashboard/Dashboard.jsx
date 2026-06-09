import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCall } from '../../hooks/useCall'
import { MetricsCard } from './MetricsCard'
import { CallHistory } from './CallHistory'

export function Dashboard() {
  const { user } = useAuth()
  const { fetchUserCalls, fetchTodaysCalls } = useCall()
  const [allCalls, setAllCalls] = useState([])
  const [todaysCalls, setTodaysCalls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCalls = async () => {
      if (!user) return
      setLoading(true)

      const { data: all } = await fetchUserCalls(user.id)
      const { data: today } = await fetchTodaysCalls(user.id)

      setAllCalls(all || [])
      setTodaysCalls(today || [])
      setLoading(false)
    }

    loadCalls()
  }, [user])

  const calculateMetrics = () => {
    const todaysCount = todaysCalls.length
    const bookedCount = todaysCalls.filter(c => c.outcome === 'booked').length
    const conversionRate = todaysCount > 0
      ? Math.round((bookedCount / todaysCount) * 100)
      : 0

    const avgDuration = todaysCalls.length > 0
      ? Math.round(
          todaysCalls.reduce((sum, c) => sum + (c.call_duration_seconds || 0), 0) /
          todaysCalls.length
        )
      : 0

    return { todaysCount, bookedCount, conversionRate, avgDuration }
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Your call metrics and history</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MetricsCard
          title="Calls Today"
          value={metrics.todaysCount}
          icon="📞"
          color="blue"
        />
        <MetricsCard
          title="Booked"
          value={metrics.bookedCount}
          icon="✅"
          color="green"
        />
        <MetricsCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon="📈"
          color="purple"
        />
        <MetricsCard
          title="Avg Duration"
          value={
            metrics.avgDuration > 0
              ? `${Math.round(metrics.avgDuration / 60)}m`
              : '—'
          }
          icon="⏱️"
          color="orange"
        />
      </div>

      {/* Call History */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Call History</h2>
        <CallHistory calls={allCalls} />
      </div>
    </div>
  )
}
