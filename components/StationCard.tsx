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
        group relative bg-zinc-900/50 rounded-lg p-3 border border-zinc-800
        transition-all hover:bg-zinc-800/50 hover:border-zinc-700
        ${isPlaying ? 'border-green-500/50 bg-green-500/5' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Compact logo */}
        <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
          {station.callSign.slice(0, 4)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/station/${station.slug}`} className="block">
            <h3 className="font-medium text-white text-sm truncate hover:text-green-400 transition-colors">
              {station.name}
            </h3>
            <p className="text-xs text-zinc-500 truncate">
              {station.frequency} · {station.location}
            </p>
          </Link>
        </div>

        {/* Play button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onPlay(station)
          }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
            ${isPlaying
              ? 'bg-green-500 text-black'
              : 'bg-zinc-800 text-zinc-400 hover:bg-green-500 hover:text-black'
            }
          `}
        >
          {isPlaying ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Network badge */}
      {station.network && (
        <span className="absolute top-1.5 right-1.5 text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
          {station.network}
        </span>
      )}
    </div>
  )
}
