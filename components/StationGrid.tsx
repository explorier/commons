'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Station } from '@/lib/types'
import { useAudio } from '@/lib/AudioContext'
import { useUserPreferences } from '@/lib/UserPreferencesContext'
import StationCard from './StationCard'

const StationMap = dynamic(() => import('./StationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 rounded-2xl bg-zinc-100 animate-pulse" />
  ),
})

interface StationGridProps {
  stations: Station[]
}

type SortOption = 'shuffle' | 'name' | 'state' | 'frequency'

// Seeded random for consistent shuffle during session
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let m = result.length
  while (m) {
    const i = Math.floor(seededRandom(seed + m) * m--)
    ;[result[m], result[i]] = [result[i], result[m]]
  }
  return result
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function StationGrid({ stations }: StationGridProps) {
  const { currentStation, setCurrentStation, playRandom } = useAudio()
  const { favorites } = useUserPreferences()
  const [sortBy, setSortBy] = useState<SortOption>('shuffle')
  const [shuffleSeed] = useState(() => Math.random() * 10000)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMap, setShowMap] = useState(true)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpinTheDial = useCallback(() => {
    setIsSpinning(true)
    setTimeout(() => {
      playRandom()
      setTimeout(() => setIsSpinning(false), 300)
    }, 350)
  }, [playRandom])

  const filteredAndSorted = useMemo(() => {
    let result = [...stations]

    // Filter to favorites only
    if (showFavoritesOnly) {
      result = result.filter(s => favorites.includes(s.id))
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.callSign.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'shuffle') {
      result = seededShuffle(result, shuffleSeed)
    } else {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'state':
            const stateA = a.location.split(', ').pop() || ''
            const stateB = b.location.split(', ').pop() || ''
            return stateA.localeCompare(stateB) || a.name.localeCompare(b.name)
          case 'frequency':
            const freqA = parseFloat(a.frequency) || 999
            const freqB = parseFloat(b.frequency) || 999
            return freqA - freqB
          default:
            return 0
        }
      })
    }

    return result
  }, [stations, sortBy, searchQuery, showFavoritesOnly, favorites, shuffleSeed])

  const handlePlay = (station: Station) => {
    if (currentStation?.id === station.id) {
      setCurrentStation(null)
    } else {
      setCurrentStation(station)
    }
  }

  return (
    <>
      {/* Map */}
      {showMap && (
        <div className="mb-8 animate-map-slide overflow-hidden">
          <StationMap
            stations={filteredAndSorted}
            currentStation={currentStation}
            onStationSelect={handlePlay}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative hidden sm:flex">
          <select
            value={sortBy === 'shuffle' ? '' : sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-white border border-zinc-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm cursor-pointer transition-all hover:border-zinc-300"
          >
            <option value="" disabled hidden>Sort by</option>
            <option value="state">Location</option>
            <option value="name">Name</option>
            <option value="frequency">Frequency</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex sm:contents gap-3">
          {/* Favorites filter */}
          {favorites.length > 0 && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-5 py-3 text-sm rounded-xl border transition-all font-medium shadow-sm cursor-pointer flex-1 ${
                showFavoritesOnly
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-500 hover:from-teal-600 hover:to-teal-700'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved
              </span>
            </button>
          )}

          {/* Map toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-5 py-3 text-sm rounded-xl border transition-all font-medium shadow-sm cursor-pointer flex-1 ${
              showMap
                ? 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="hidden sm:inline">{showMap ? 'Hide Map' : 'Show Map'}</span>
              <span className="sm:hidden">Map</span>
            </span>
          </button>

          {/* Spin the Dial */}
          <button
            onClick={handleSpinTheDial}
            disabled={isSpinning}
            className="px-5 py-3 text-sm rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-medium shadow-sm cursor-pointer transition-all hover:from-amber-100 hover:to-orange-100 disabled:opacity-70 group flex-1"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className={`w-4 h-4 transition-transform duration-500 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <line x1="12" y1="12" x2="12" y2="5" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">{isSpinning ? 'Spinning...' : 'Spin the Dial'}</span>
              <span className="sm:hidden">Spin</span>
            </span>
          </button>
        </div>
      </div>

      {/* Station count */}
      <p className="text-sm text-zinc-500 mb-5">
        {filteredAndSorted.length} station{filteredAndSorted.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSorted.map((station, index) => (
          <div
            key={station.id}
            className="animate-scale-in"
            style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
          >
            <StationCard
              station={station}
              isPlaying={currentStation?.id === station.id}
              onPlay={handlePlay}
            />
          </div>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <p className="text-center text-zinc-400 py-12">No stations found</p>
      )}

      {/* Spacer for fixed player */}
      {currentStation && <div className="h-24" />}
    </>
  )
}
