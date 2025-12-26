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
        group relative bg-white rounded-2xl p-4 border transition-all card-hover
        ${isPlaying
          ? 'border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/20'
          : 'border-stone-200 hover:border-stone-300'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        {station.logoUrl ? (
          <img
            src={station.logoUrl}
            alt={station.name}
            className={`w-12 h-12 rounded-xl object-cover shrink-0 ${
              isPlaying ? 'ring-2 ring-red-500 ring-offset-2' : ''
            }`}
          />
        ) : (
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all
            ${isPlaying
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500 group-hover:from-stone-200 group-hover:to-stone-300'
            }
          `}>
            {station.callSign.slice(0, 4)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/station/${station.slug}`} className="block">
            <h3 className="font-semibold text-stone-900 text-sm truncate hover:text-red-600 transition-colors">
              {station.name}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 truncate mt-0.5">
            {station.frequency} · {station.location}
          </p>
          <p className="text-xs text-stone-400 mt-1.5 line-clamp-1">
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
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : 'bg-stone-100 text-stone-500 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/25'
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

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
      )}
    </div>
  )
}
