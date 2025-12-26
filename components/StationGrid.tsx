'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Station } from '@/lib/types'
import StationCard from './StationCard'
import AudioPlayer from './AudioPlayer'

// Dynamic import to avoid SSR issues with Leaflet
const StationMap = dynamic(() => import('./StationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 rounded-xl bg-stone-100 animate-pulse" />
  ),
})

interface StationGridProps {
  stations: Station[]
}

type SortOption = 'name' | 'state' | 'frequency'

export default function StationGrid({ stations }: StationGridProps) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('state')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMap, setShowMap] = useState(true)

  const filteredAndSorted = useMemo(() => {
    let result = [...stations]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.callSign.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    }

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

    return result
  }, [stations, sortBy, searchQuery])

  const handlePlay = (station: Station) => {
    if (currentStation?.id === station.id) {
      setCurrentStation(null)
    } else {
      setCurrentStation(station)
    }
  }

  const handleClose = () => {
    setCurrentStation(null)
  }

  return (
    <>
      {/* Map */}
      {showMap && (
        <div className="mb-6">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
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
            className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="state">Sort by Location</option>
          <option value="name">Sort by Name</option>
          <option value="frequency">Sort by Frequency</option>
        </select>

        {/* Map toggle */}
        <button
          onClick={() => setShowMap(!showMap)}
          className={`px-4 py-2.5 text-sm rounded-lg border transition-colors ${
            showMap
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {/* Station count */}
      <p className="text-sm text-stone-500 mb-4">
        {filteredAndSorted.length} station{filteredAndSorted.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAndSorted.map(station => (
          <StationCard
            key={station.id}
            station={station}
            isPlaying={currentStation?.id === station.id}
            onPlay={handlePlay}
          />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <p className="text-center text-stone-400 py-12">No stations found</p>
      )}

      {/* Audio Player */}
      <AudioPlayer station={currentStation} onClose={handleClose} />

      {/* Spacer for fixed player */}
      {currentStation && <div className="h-20" />}
    </>
  )
}
