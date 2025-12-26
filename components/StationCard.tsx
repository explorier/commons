'use client'

import Link from 'next/link'
import { Station } from '@/lib/types'

interface StationCardProps {
  station: Station
  isPlaying: boolean
  onPlay: (station: Station) => void
}

export default function StationCard({ station, isPlaying, onPlay }: StationCardProps) {
  return (
    <div
      className={`
        group relative bg-white rounded-xl p-4 border transition-all
        ${isPlaying
          ? 'border-red-500 shadow-md shadow-red-100'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
          ${isPlaying ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500'}
        `}>
          {station.callSign.slice(0, 4)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/station/${station.slug}`} className="block">
            <h3 className="font-medium text-stone-900 text-sm truncate hover:text-red-600 transition-colors">
              {station.name}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 truncate">
            {station.frequency} · {station.location}
          </p>
          <p className="text-xs text-stone-400 mt-1 line-clamp-1">
            {station.description}
          </p>
        </div>

        {/* Play button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onPlay(station)
          }}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
            ${isPlaying
              ? 'bg-red-500 text-white'
              : 'bg-stone-100 text-stone-500 hover:bg-red-500 hover:text-white'
            }
          `}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
