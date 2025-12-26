'use client'

import { useState } from 'react'
import { Station } from '@/lib/types'
import StationCard from './StationCard'
import AudioPlayer from './AudioPlayer'

interface StationGridProps {
  stations: Station[]
}

export default function StationGrid({ stations }: StationGridProps) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null)

  const handlePlay = (station: Station) => {
    if (currentStation?.id === station.id) {
      // Clicking same station - could toggle, but for now just keep playing
      return
    }
    setCurrentStation(station)
  }

  const handleClose = () => {
    setCurrentStation(null)
  }

  // Group stations by network
  const pacificaStations = stations.filter(s => s.network === 'Pacifica')
  const otherStations = stations.filter(s => !s.network)

  return (
    <>
      {/* Pacifica Network */}
      {pacificaStations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Pacifica Network</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pacificaStations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                isPlaying={currentStation?.id === station.id}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Stations */}
      {otherStations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Community Radio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherStations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                isPlaying={currentStation?.id === station.id}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </section>
      )}

      {/* Audio Player */}
      <AudioPlayer station={currentStation} onClose={handleClose} />

      {/* Spacer for fixed player */}
      {currentStation && <div className="h-24" />}
    </>
  )
}
