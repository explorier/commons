'use client'

import { useState, useRef, useEffect } from 'react'
import { Station } from '@/lib/types'

interface StationPlayerProps {
  station: Station
}

export default function StationPlayer({ station }: StationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      setError(null)
      try {
        audioRef.current.src = station.streamUrl
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        setError('Stream unavailable')
        console.error('Playback error:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <audio ref={audioRef} />

      <div className="flex items-center gap-4">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center hover:bg-green-400 transition-colors disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <p className="text-sm text-white">
            {isPlaying ? 'Now Playing' : 'Listen Live'}
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-green-500"
          />
        </div>
      </div>
    </div>
  )
}
