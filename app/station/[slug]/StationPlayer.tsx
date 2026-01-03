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
    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-4">
        {/* Play button */}
        <button
          onClick={handlePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer ${
            isThisPlaying
              ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
              : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 hover:text-white hover:shadow-lg hover:shadow-teal-500/25 border border-zinc-200 dark:border-zinc-600'
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
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {isThisPlaying ? 'Now Playing' : 'Listen Live'}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {station.frequency} · {station.location}
          </p>
        </div>

        {/* Donate */}
        <a
          href={station.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-all border border-amber-200/50 dark:border-amber-700/50 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Support
        </a>
      </div>
    </div>
  )
}
