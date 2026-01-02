'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Station } from '@/lib/types'
import { useUserPreferences } from '@/lib/UserPreferencesContext'

// Generate a consistent hue (0-360) from a string
function stringToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

interface StationCardProps {
  station: Station
  isPlaying: boolean
  onPlay: (station: Station) => void
}

export default function StationCard({ station, isPlaying, onPlay }: StationCardProps) {
  const hue = useMemo(() => stringToHue(station.id), [station.id])
  const { isFavorite, toggleFavorite } = useUserPreferences()
  const favorited = isFavorite(station.id)
  const [showCopied, setShowCopied] = useState(false)
  const [justFavorited, setJustFavorited] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!favorited) {
      setJustFavorited(true)
      setTimeout(() => setJustFavorited(false), 400)
    }
    toggleFavorite(station.id)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/?play=${station.id}`
    const shareData = {
      title: `${station.name} - Commons`,
      text: `Listen to ${station.name} (${station.frequency}) from ${station.location}`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    } else {
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }
  return (
    <div
      className={`
        group relative rounded-2xl p-4 border transition-all duration-300 ease-out cursor-pointer
        ${isPlaying
          ? 'border-teal-500 ring-1 ring-teal-500/20 scale-[1.01] card-playing'
          : 'border-zinc-200/80 hover:border-zinc-300 card-hover'
        }
      `}
      style={{
        background: isPlaying
          ? `linear-gradient(135deg, hsl(${hue} 70% 97%) 0%, hsl(${(hue + 30) % 360} 60% 98%) 100%)`
          : `linear-gradient(135deg, hsl(${hue} 30% 99%) 0%, hsl(${(hue + 30) % 360} 25% 99.5%) 100%)`
      }}
      onClick={() => onPlay(station)}
    >
      <div className="flex items-start gap-3">
        {/* Frequency badge */}
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all
            ${isPlaying
              ? 'text-white shadow-lg'
              : 'text-zinc-600 group-hover:text-zinc-700'
            }
          `}
          style={{
            background: isPlaying
              ? `linear-gradient(135deg, hsl(${hue} 65% 45%) 0%, hsl(${(hue + 20) % 360} 60% 40%) 100%)`
              : `linear-gradient(135deg, hsl(${hue} 25% 92%) 0%, hsl(${(hue + 20) % 360} 20% 88%) 100%)`,
            boxShadow: isPlaying ? `0 10px 15px -3px hsl(${hue} 60% 45% / 0.25)` : undefined
          }}
        >
          {station.frequency.replace(' FM', '').replace('Internet', 'WEB')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/station/${station.slug}`} className="block">
            <h3 className="font-semibold text-zinc-900 text-sm truncate hover:text-teal-600 transition-colors">
              {station.name}
            </h3>
          </Link>
          <p className="text-xs text-zinc-500 truncate mt-0.5">
            {station.name !== station.callSign && `${station.callSign} · `}{station.location}
          </p>
          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-1">
            {station.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 w-20 justify-end">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer text-zinc-300 hover:text-teal-400 opacity-0 group-hover:opacity-100 relative"
            aria-label="Share station"
          >
            {showCopied ? (
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer
              ${favorited
                ? 'text-teal-500 hover:text-teal-600'
                : 'text-zinc-300 hover:text-teal-400 opacity-0 group-hover:opacity-100'
              }
            `}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-4 h-4 ${justFavorited ? 'animate-favorite-pop' : ''}`}
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Play button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPlay(station)
          }}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer
            ${isPlaying ? 'text-white scale-110' : 'text-zinc-500 hover:text-white hover:scale-110'}
            active:scale-95
          `}
          style={{
            background: isPlaying
              ? `linear-gradient(135deg, hsl(${hue} 65% 45%) 0%, hsl(${(hue + 20) % 360} 60% 40%) 100%)`
              : `linear-gradient(135deg, hsl(${hue} 15% 94%) 0%, hsl(${(hue + 20) % 360} 12% 91%) 100%)`,
            boxShadow: isPlaying ? `0 10px 15px -3px hsl(${hue} 60% 45% / 0.25)` : undefined
          }}
          onMouseEnter={(e) => {
            if (!isPlaying) {
              e.currentTarget.style.background = `linear-gradient(135deg, hsl(${hue} 65% 45%) 0%, hsl(${(hue + 20) % 360} 60% 40%) 100%)`
              e.currentTarget.style.boxShadow = `0 10px 15px -3px hsl(${hue} 60% 45% / 0.25)`
            }
          }}
          onMouseLeave={(e) => {
            if (!isPlaying) {
              e.currentTarget.style.background = `linear-gradient(135deg, hsl(${hue} 15% 94%) 0%, hsl(${(hue + 20) % 360} 12% 91%) 100%)`
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
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
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{
            background: `hsl(${hue} 65% 50%)`,
            boxShadow: `0 4px 14px hsl(${hue} 60% 45% / 0.5)`
          }}
        />
      )}
    </div>
  )
}
