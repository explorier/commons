'use client'

import { useState, useEffect, useCallback } from 'react'
import { stations } from '@/lib/stations'
import { Station } from '@/lib/types'
import { useAudio } from '@/lib/AudioContext'

interface NowPlayingResult {
  stationId: string
  title: string | null
  supported: boolean
}

interface ApiResponse {
  stations: NowPlayingResult[]
  fetchedAt: string
}

export default function WhatsOnNow() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { currentStation, setCurrentStation } = useAudio()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/now-playing/all')
      const json = await response.json()
      setData(json)
      setLastUpdated(new Date())
      setHasFetched(true)
    } catch (error) {
      console.error('Failed to fetch now playing data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Only fetch when expanded, and set up polling
  useEffect(() => {
    if (!isExpanded) return

    // Fetch immediately if we haven't yet, or if data is stale (>60s)
    if (!hasFetched || (lastUpdated && Date.now() - lastUpdated.getTime() > 60000)) {
      fetchData()
    }

    // Poll while expanded
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [isExpanded, hasFetched, lastUpdated, fetchData])

  const getStation = (stationId: string): Station | undefined => {
    return stations.find(s => s.id === stationId)
  }

  const handlePlay = (stationId: string) => {
    const station = getStation(stationId)
    if (!station) return

    if (currentStation?.id === stationId) {
      setCurrentStation(null)
    } else {
      setCurrentStation(station)
    }
  }

  const stationsWithData = data?.stations.filter(s => s.title) || []
  const liveCount = stationsWithData.length

  // Position above the player when it's visible
  const bottomOffset = currentStation ? 'bottom-24 sm:bottom-28' : 'bottom-6'

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed right-4 ${bottomOffset} z-40 transition-all duration-300 ${
          isExpanded ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            What's On
          </span>
        </div>
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded panel */}
      <div
        className={`fixed right-4 ${bottomOffset} z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[60vh] transition-all duration-300 ${
          isExpanded
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[60vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                What's On Now
              </h2>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {liveCount} stations
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stationsWithData.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No live data available right now</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {stationsWithData.map((item) => {
                  const station = getStation(item.stationId)
                  if (!station) return null
                  const isPlaying = currentStation?.id === station.id

                  return (
                    <button
                      key={item.stationId}
                      onClick={() => handlePlay(item.stationId)}
                      className={`w-full p-3 rounded-xl transition-all text-left cursor-pointer ${
                        isPlaying
                          ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isPlaying
                            ? 'bg-teal-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                        }`}>
                          {isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {station.name} · {station.location.split(',')[0]}
                          </p>
                          <p className={`text-sm font-medium truncate ${
                            isPlaying ? 'text-teal-700 dark:text-teal-300' : 'text-zinc-900 dark:text-zinc-100'
                          }`}>
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {lastUpdated && (
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                Updates every 60s · {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
