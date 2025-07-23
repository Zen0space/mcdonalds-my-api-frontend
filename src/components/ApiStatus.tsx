'use client'

import { useEffect, useState } from 'react'
import { checkApiHealth, getApiBaseUrl } from '@/services/api'
import { testUtils } from '@/utils/apiMonitor'

interface ApiStatusData {
  status: 'checking' | 'online' | 'offline' | 'slow'
  latency?: number
  lastChecked?: Date
  error?: string
  details?: any
}

interface ApiStatusProps {
  className?: string
  showDetails?: boolean
  refreshInterval?: number // in seconds
  compact?: boolean
}

export function ApiStatus({
  className = '',
  showDetails = false,
  refreshInterval = 60,
  compact = false,
}: ApiStatusProps) {
  const [statusData, setStatusData] = useState<ApiStatusData>({
    status: 'checking',
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const checkStatus = async () => {
    setStatusData(prev => ({ ...prev, status: 'checking' }))

    const startTime = Date.now()

    try {
      const healthResult = await checkApiHealth()
      const latency = Date.now() - startTime

      if (healthResult.healthy) {
        setStatusData({
          status: latency > 5000 ? 'slow' : 'online',
          latency,
          lastChecked: new Date(),
          details: healthResult.data,
        })
      } else {
        setStatusData({
          status: 'offline',
          latency,
          lastChecked: new Date(),
          error: (healthResult.error as any)?.message || 'API is offline',
        })
      }
    } catch (error) {
      setStatusData({
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed',
      })
    }
  }

  useEffect(() => {
    // Initial check
    checkStatus()

    // Set up interval for periodic checks
    const interval = setInterval(checkStatus, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const getStatusColor = () => {
    switch (statusData.status) {
      case 'online':
        return 'bg-green-500'
      case 'slow':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      case 'checking':
      default:
        return 'bg-gray-400 animate-pulse'
    }
  }

  const getStatusText = () => {
    switch (statusData.status) {
      case 'online':
        return 'Online'
      case 'slow':
        return 'Slow'
      case 'offline':
        return 'Offline'
      case 'checking':
      default:
        return 'Checking...'
    }
  }

  const formatLatency = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatLastChecked = (date?: Date) => {
    if (!date) return 'Never'

    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 cursor-pointer ${className}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title={`API Status: ${getStatusText()}${statusData.latency ? ` (${formatLatency(statusData.latency)})` : ''}`}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          API: {getStatusText()}
        </span>
        {statusData.latency && statusData.status === 'online' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatLatency(statusData.latency)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              API Connection
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getStatusText()}
              {statusData.latency && ` • ${formatLatency(statusData.latency)}`}
              {statusData.lastChecked &&
                ` • ${formatLastChecked(statusData.lastChecked)}`}
            </p>
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={e => {
            e.stopPropagation()
            checkStatus()
          }}
          title="Refresh status"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {(isExpanded || showDetails) && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">API URL:</span>
              <p className="font-mono text-gray-700 dark:text-gray-300 truncate">
                {getApiBaseUrl()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Environment:
              </span>
              <p className="text-gray-700 dark:text-gray-300">
                {process.env.NODE_ENV}
              </p>
            </div>
          </div>

          {statusData.error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
              <p className="text-red-700 dark:text-red-400">
                Error: {statusData.error}
              </p>
            </div>
          )}

          {statusData.details && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Health Check Details:
              </h4>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto">
                {JSON.stringify(statusData.details, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={checkStatus}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Check Now
            </button>
            <button
              onClick={async () => {
                const result = await testUtils.measureLatency(getApiBaseUrl())
                alert(
                  `Latency Test Results:\n\nMin: ${result.min}ms\nMax: ${result.max}ms\nAverage: ${result.average}ms\n\nTests: ${result.tests.join(', ')}ms`
                )
              }}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Test Latency
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact status indicator for headers/footers
export function ApiStatusIndicator({ className = '' }: { className?: string }) {
  return <ApiStatus className={className} compact={true} />
}

// Detailed status panel for debugging
export function ApiStatusPanel({ className = '' }: { className?: string }) {
  return (
    <ApiStatus className={className} showDetails={true} refreshInterval={30} />
  )
}
