'use client'

import { useState, useMemo } from 'react'
import { Station } from '@/lib/types'
import StationCard from './StationCard'
import AudioPlayer from './AudioPlayer'

interface StationGridProps {
  stations: Station[]
}

type SortOption = 'name' | 'state' | 'frequency'

export default function StationGrid({ stations }: StationGridProps) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('state')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAndSorted = useMemo(() => {
    let result = [...stations]

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.callSign.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'state':
          // Extract state from location (e.g., "Berkeley, CA" -> "CA")
          const stateA = a.location.split(', ').pop() || ''
          const stateB = b.location.split(', ').pop() || ''
          return stateA.localeCompare(stateB) || a.name.localeCompare(b.name)
        case 'frequency':
          const freqA = parseFloat(a.frequency)
          const freqB = parseFloat(b.frequency)
          return freqA - freqB
        default:
          return 0
      }
    })

    return result
  }, [stations, sortBy, searchQuery])

  const handlePlay = (station: Station) => {
    if (currentStation?.id === station.id) {
      setCurrentStation(null) // Toggle off
    } else {
      setCurrentStation(station)
    }
  }

  const handleClose = () => {
    setCurrentStation(null)
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600"
        >
          <option value="state">Sort by State</option>
          <option value="name">Sort by Name</option>
          <option value="frequency">Sort by Frequency</option>
        </select>
      </div>

      {/* Station count */}
      <p className="text-xs text-zinc-500 mb-4">
        {filteredAndSorted.length} station{filteredAndSorted.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
        <p className="text-center text-zinc-500 py-12">No stations found</p>
      )}

      {/* Audio Player */}
      <AudioPlayer station={currentStation} onClose={handleClose} />

      {/* Spacer for fixed player */}
      {currentStation && <div className="h-20" />}
    </>
  )
}
