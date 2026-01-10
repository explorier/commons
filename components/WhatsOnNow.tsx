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

  // Close on Escape key (stop propagation so player doesn't also close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.stopImmediatePropagation()
        setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

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

  // Initial fetch - keep fetching until we have 10 stations with data
  const fetchInitial = useCallback(async () => {
    if (shuffledStations.length === 0) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      const allResults = new Map<string, NowPlayingResult>()
      let fetchedCount = 0
      const targetWithData = INITIAL_BATCH_SIZE

      // Keep fetching until we have enough stations with titles
      while (fetchedCount < shuffledStations.length) {
        const batch = shuffledStations.slice(fetchedCount, fetchedCount + INITIAL_BATCH_SIZE)
        const batchResults = await fetchStations(batch, abortControllerRef.current.signal)

        for (const result of batchResults) {
          allResults.set(result.stationId, result)
        }

        fetchedCount += batch.length

        // Check if we have enough with actual titles
        const withTitles = Array.from(allResults.values()).filter(r => r.title).length
        if (withTitles >= targetWithData) break
      }

      setResults(allResults)
      setHasFetchedInitial(true)
      setLoadedCount(fetchedCount)
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

  // Position above the player on mobile/tablet. On desktop (lg+) the player is centered
  // so the widget in the left corner doesn't overlap - no offset needed.
  const bottomOffset = currentStation ? 'bottom-28 lg:bottom-4' : 'bottom-4'

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed left-4 ${bottomOffset} z-[60] transition-all duration-300 ${
          isExpanded ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-full shadow-md border border-zinc-200/80 dark:border-zinc-700/80 hover:shadow-lg hover:border-teal-400/50 dark:hover:border-teal-500/50 transition-all cursor-pointer group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            What's On
          </span>
        </div>
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[55] transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded panel */}
      <div
        className={`fixed left-4 ${bottomOffset} z-[60] w-[calc(100vw-2rem)] sm:w-80 max-h-[55vh] transition-all duration-300 ${
          isExpanded
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-zinc-200/80 dark:border-zinc-700/80 overflow-hidden flex flex-col max-h-[55vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100/80 dark:border-zinc-800/80 flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                What's On Now
              </h2>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 -mr-1 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {isLoading && stationsWithData.length === 0 ? (
              <div className="p-2 space-y-1 min-h-[280px]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-lg" />
                ))}
                <p className="text-[10px] text-zinc-400 text-center pt-3">Loading stations...</p>
              </div>
            ) : stationsWithData.length === 0 && hasFetchedInitial ? (
              <div className="p-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No live data available right now</p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {stationsWithData.map((item) => {
                  const station = getStation(item.stationId)
                  if (!station) return null
                  const isPlaying = currentStation?.id === station.id

                  return (
                    <button
                      key={item.stationId}
                      onClick={() => handlePlay(item.stationId)}
                      className={`w-full px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer group ${
                        isPlaying
                          ? 'bg-teal-50 dark:bg-teal-900/20'
                          : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isPlaying
                            ? 'bg-teal-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                        }`}>
                          {isPlaying ? (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                            {station.name} · {station.location.split(',')[0]}
                          </p>
                          <div className="overflow-hidden">
                            <p className={`text-[13px] font-medium truncate leading-snug ${
                              isPlaying ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-700 dark:text-zinc-200'
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
                  <div className="p-2">
                    <button
                      onClick={fetchNextBatch}
                      disabled={isLoadingMore}
                      className="w-full py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isLoadingMore ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </>
                      ) : (
                        `Load more`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
