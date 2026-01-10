'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { stations } from '@/lib/stations'
import { Station } from '@/lib/types'
import { useAudio } from '@/lib/AudioContext'

interface NowPlayingResult {
  stationId: string
  title: string | null
  supported: boolean
}

const INITIAL_BATCH_SIZE = 10
const SCROLL_BATCH_SIZE = 15
const enabledStations = stations.filter(s => !s.disableNowPlaying)

// Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function WhatsOnNow() {
  const [results, setResults] = useState<Map<string, NowPlayingResult>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0) // How many stations we've fetched
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [shuffledStations, setShuffledStations] = useState<Station[]>([])
  const { currentStation, setCurrentStation, nowPlaying: contextNowPlaying } = useAudio()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Shuffle stations when panel opens for the first time
  useEffect(() => {
    if (isExpanded && shuffledStations.length === 0) {
      setShuffledStations(shuffleArray(enabledStations))
    }
  }, [isExpanded, shuffledStations.length])

  // Fetch a batch of stations
  const fetchStations = useCallback(async (stationsToFetch: Station[], signal?: AbortSignal) => {
    const batchResults = await Promise.all(
      stationsToFetch.map(async (station) => {
        try {
          const response = await fetch(
            `/api/now-playing?url=${encodeURIComponent(station.streamUrl)}`,
            { signal }
          )
          const data = await response.json()
          return {
            stationId: station.id,
            title: data.title,
            supported: data.supported,
          }
        } catch {
          return { stationId: station.id, title: null, supported: false }
        }
      })
    )
    return batchResults
  }, [])

  // Initial fetch - just first 10 stations (randomized)
  const fetchInitial = useCallback(async () => {
    if (shuffledStations.length === 0) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      const initialStations = shuffledStations.slice(0, INITIAL_BATCH_SIZE)
      const batchResults = await fetchStations(initialStations, abortControllerRef.current.signal)

      setResults(prev => {
        const next = new Map(prev)
        for (const result of batchResults) {
          next.set(result.stationId, result)
        }
        return next
      })

      setHasFetchedInitial(true)
      setLoadedCount(INITIAL_BATCH_SIZE)
      setLastUpdated(new Date())
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Failed to fetch initial now playing data:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [shuffledStations, fetchStations])

  // Load next batch of stations
  const fetchNextBatch = useCallback(async () => {
    if (isLoadingMore || shuffledStations.length === 0) return
    if (loadedCount >= shuffledStations.length) return // All loaded

    setIsLoadingMore(true)
    try {
      const nextBatch = shuffledStations.slice(loadedCount, loadedCount + SCROLL_BATCH_SIZE)
      // Don't pass abort signal - user initiated, let it complete
      const batchResults = await fetchStations(nextBatch)

      setResults(prev => {
        const next = new Map(prev)
        for (const result of batchResults) {
          next.set(result.stationId, result)
        }
        return next
      })

      setLoadedCount(prev => prev + nextBatch.length)
      setLastUpdated(new Date())
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Failed to fetch next batch:', error)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [shuffledStations, loadedCount, isLoadingMore, fetchStations])

  // Refresh only loaded stations
  const refreshLoaded = useCallback(async () => {
    if (results.size === 0) return

    try {
      // Get stations we've already loaded
      const loadedStationIds = Array.from(results.keys())
      const stationsToRefresh = loadedStationIds
        .map(id => stations.find(s => s.id === id))
        .filter((s): s is Station => s !== undefined)

      const batchResults = await fetchStations(stationsToRefresh)

      setResults(prev => {
        const next = new Map(prev)
        for (const result of batchResults) {
          next.set(result.stationId, result)
        }
        return next
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh now playing data:', error)
    }
  }, [results, fetchStations])



  // Fetch when expanded and auto-poll every 60s
  useEffect(() => {
    if (!isExpanded || shuffledStations.length === 0) return

    if (!hasFetchedInitial) {
      fetchInitial()
    } else if (lastUpdated && Date.now() - lastUpdated.getTime() > 60000) {
      // Refresh only what we've loaded if data is stale
      refreshLoaded()
    }

    // Auto-poll every 60s while expanded
    const interval = setInterval(refreshLoaded, 60000)

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isExpanded, shuffledStations.length, hasFetchedInitial, lastUpdated, fetchInitial, refreshLoaded])

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

  // Convert Map to sorted array, stations with titles first
  const stationsWithData = Array.from(results.values())
    .filter(s => s.title)
    .sort((a, b) => {
      // Keep consistent order by station ID
      return a.stationId.localeCompare(b.stationId)
    })
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
            {isLoading && stationsWithData.length === 0 ? (
              <div className="p-4 space-y-3 min-h-[320px]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl opacity-60" />
                ))}
                <p className="text-xs text-zinc-400 text-center pt-2">Loading stations...</p>
              </div>
            ) : stationsWithData.length === 0 && hasFetchedInitial ? (
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
                      className={`w-full p-3 rounded-xl transition-all text-left cursor-pointer group ${
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
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {station.name} · {station.location.split(',')[0]}
                          </p>
                          <div className="overflow-hidden">
                            <p className={`text-sm font-medium truncate ${
                              isPlaying ? 'text-teal-700 dark:text-teal-300' : 'text-zinc-900 dark:text-zinc-100'
                            }`}>
                              {isPlaying && contextNowPlaying ? contextNowPlaying : item.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {/* Load more button */}
                {loadedCount < shuffledStations.length && hasFetchedInitial && (
                  <div className="py-3 px-2">
                    <button
                      onClick={fetchNextBatch}
                      disabled={isLoadingMore}
                      className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 dark:text-zinc-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </>
                      ) : (
                        `Load more stations`
                      )}
                    </button>
                  </div>
                )}
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
