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
        group relative bg-zinc-900 rounded-lg p-4
        transition-all hover:bg-zinc-800
        ${isPlaying ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {/* Network badge */}
      {station.network && (
        <span className="absolute top-2 right-2 text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
          {station.network}
        </span>
      )}

      <Link href={`/station/${station.slug}`} className="block">
        {/* Station logo placeholder */}
        <div className="w-16 h-16 bg-zinc-700 rounded-lg mb-3 flex items-center justify-center text-2xl font-bold text-zinc-400">
          {station.callSign.slice(0, 2)}
        </div>

        {/* Station info */}
        <h3 className="font-semibold text-white mb-1">{station.name}</h3>
        <p className="text-sm text-zinc-400 mb-2">
          {station.frequency} • {station.location}
        </p>
        <p className="text-sm text-zinc-500 line-clamp-2">{station.description}</p>
      </Link>

      {/* Play indicator */}
      {isPlaying && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1">
          <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse animation-delay-100" />
          <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200" />
        </div>
      )}

      {/* Hover play button */}
      {!isPlaying && (
        <button
          onClick={() => onPlay(station)}
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors">
            <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
}
