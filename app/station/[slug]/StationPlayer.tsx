'use client'

import { useAudio } from '@/lib/AudioContext'
import { Station } from '@/lib/types'

interface StationPlayerProps {
  station: Station
}

export default function StationPlayer({ station }: StationPlayerProps) {
  const { currentStation, setCurrentStation, isPlaying } = useAudio()
  const isThisPlaying = currentStation?.id === station.id && isPlaying

  const handlePlay = () => {
    if (currentStation?.id === station.id) {
      setCurrentStation(null)
    } else {
      setCurrentStation(station)
    }
  }

  return (
    <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 border border-stone-200">
      <div className="flex items-center gap-4">
        {/* Play button */}
        <button
          onClick={handlePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isThisPlaying
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : 'bg-white text-stone-600 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/25 border border-stone-200'
          }`}
        >
          {isThisPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <p className="font-semibold text-stone-900">
            {isThisPlaying ? 'Now Playing' : 'Listen Live'}
          </p>
          <p className="text-sm text-stone-500">
            {station.frequency} · {station.location}
          </p>
        </div>

        {/* Donate */}
        <a
          href={station.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 text-sm font-medium rounded-full hover:from-red-100 hover:to-rose-100 transition-all border border-red-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Donate
        </a>
      </div>
    </div>
  )
}
