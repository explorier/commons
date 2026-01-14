'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { getListeningHistory, clearHistory, removeEntry, ListenEntry } from '@/lib/listeningHistory'
import { useAudio } from '@/lib/AudioContext'
import { stations } from '@/lib/stations'
import ThemeToggle from '@/components/ThemeToggle'

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDate(entries: ListenEntry[]): Map<string, ListenEntry[]> {
  const groups = new Map<string, ListenEntry[]>()

  entries.forEach(entry => {
    const dateKey = new Date(entry.timestamp).toDateString()
    const existing = groups.get(dateKey) || []
    groups.set(dateKey, [...existing, entry])
  })

  return groups
}

export default function HistoryPage() {
  const { setCurrentStation, setIsPlaying } = useAudio()
  const [history, setHistory] = useState<ListenEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stationFilter, setStationFilter] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set())
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  useEffect(() => {
    setMounted(true)
    setHistory(getListeningHistory())
  }, [])

  // Listen for real-time updates
  useEffect(() => {
    const handleNewEntry = (e: CustomEvent<ListenEntry>) => {
      const entry = e.detail
      setHistory(prev => [entry, ...prev])
      setNewEntryIds(prev => new Set(prev).add(entry.id))
      // Remove animation class after animation completes
      setTimeout(() => {
        setNewEntryIds(prev => {
          const next = new Set(prev)
          next.delete(entry.id)
          return next
        })
      }, 500)
    }

    window.addEventListener('listen-history-update', handleNewEntry as EventListener)
    return () => window.removeEventListener('listen-history-update', handleNewEntry as EventListener)
  }, [])

  // Get unique stations from history (max 10, ordered by most recent)
  const recentStations = useMemo(() => {
    const seen = new Set<string>()
    const result: { id: string; name: string }[] = []
    for (const entry of history) {
      if (!seen.has(entry.stationId) && result.length < 10) {
        seen.add(entry.stationId)
        result.push({ id: entry.stationId, name: entry.stationName })
      }
    }
    return result
  }, [history])

  const filteredHistory = useMemo(() => {
    let filtered = history

    // Apply station filter
    if (stationFilter) {
      filtered = filtered.filter(entry => entry.stationId === stationFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        entry =>
          entry.track.toLowerCase().includes(query) ||
          entry.stationName.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [history, searchQuery, stationFilter])

  const groupedHistory = useMemo(() => groupByDate(filteredHistory), [filteredHistory])

  const handleClearAll = () => {
    if (confirm('Clear all listening history? This cannot be undone.')) {
      clearHistory()
      setHistory([])
    }
  }

  const handleRemove = (id: string) => {
    removeEntry(id)
    setHistory(prev => prev.filter(e => e.id !== id))
  }

  const handlePlayStation = (stationId: string) => {
    const station = stations.find(s => s.id === stationId)
    if (station) {
      setCurrentStation(station)
      setIsPlaying(true)
    }
  }

  const handleStartListening = () => {
    // Pick a random station with ICY data enabled
    const icyStations = stations.filter(s => !s.disableNowPlaying)
    const randomStation = icyStations[Math.floor(Math.random() * icyStations.length)]
    if (randomStation) {
      setCurrentStation(randomStation)
      setIsPlaying(true)
    }
    // Open What's On Now panel
    window.dispatchEvent(new CustomEvent('open-whats-on'))
  }

  const handleCopy = async (track: string) => {
    try {
      await navigator.clipboard.writeText(track)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = track
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setShowCopiedToast(true)
    setTimeout(() => setShowCopiedToast(false), 2000)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Listening History</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {history.length} {history.length === 1 ? 'track' : 'tracks'} saved locally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No listening history yet</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Start listening to stations with now playing data to build your history.
            </p>
            <button
              onClick={handleStartListening}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start listening
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Station filter pills - sidebar on desktop, horizontal scroll on mobile */}
            <div className="md:w-48 shrink-0">
              <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Stations
              </h3>
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                <button
                  onClick={() => setStationFilter(null)}
                  className={`pill-hover px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer ${
                    stationFilter === null
                      ? 'pill-active bg-teal-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  All stations
                </button>
                {recentStations.map(station => (
                  <button
                    key={station.id}
                    onClick={() => setStationFilter(station.id)}
                    className={`pill-hover px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer ${
                      stationFilter === station.id
                        ? 'pill-active bg-teal-600 text-white'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {station.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search tracks or stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Results */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {searchQuery ? `No matches for "${searchQuery}"` : 'No tracks from this station yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(groupedHistory.entries()).map(([dateKey, entries]) => (
                    <div key={dateKey}>
                      <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                        {formatDate(entries[0].timestamp)}
                      </h3>
                      <div className="space-y-1">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`track-hover group flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-teal-200 dark:hover:border-teal-800 ${
                              newEntryIds.has(entry.id) ? 'animate-slide-in' : ''
                            }`}
                          >
                            <button
                              onClick={() => handlePlayStation(entry.stationId)}
                              className="flex-1 min-w-0 text-left cursor-pointer"
                            >
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                {entry.track}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                {entry.stationName} &middot; {formatTime(entry.timestamp)}
                              </p>
                            </button>
                            <button
                              onClick={() => handleCopy(entry.track)}
                              className="p-1.5 text-zinc-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Copy track name"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRemove(entry.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Copied toast */}
      {showCopiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-lg animate-fade-in">
          Copied to clipboard
        </div>
      )}
    </div>
  )
}
