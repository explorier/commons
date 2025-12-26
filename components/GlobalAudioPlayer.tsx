'use client'

import { useRef, useEffect, useState } from 'react'
import { useAudio } from '@/lib/AudioContext'

function Waveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`w-1 bg-red-500 rounded-full ${
            isPlaying ? 'animate-waveform' : ''
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  )
}

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { currentStation, setCurrentStation, isPlaying, setIsPlaying } = useAudio()
  const [volume, setVolume] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentStation && audioRef.current) {
      setIsLoading(true)
      setError(null)
      audioRef.current.src = currentStation.streamUrl
      audioRef.current.load()
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((err) => {
          setError('Stream unavailable')
          setIsLoading(false)
          setIsPlaying(false)
          console.error('Playback error:', err)
        })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [currentStation, setIsPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Stream unavailable'))
    }
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentStation(null)
    setIsPlaying(false)
  }

  if (!currentStation) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3 px-4 shadow-2xl z-50">
      <audio ref={audioRef} />

      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-red-500/25"
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

        {/* Waveform */}
        <Waveform isPlaying={isPlaying && !isLoading} />

        {/* Station info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-sm truncate">{currentStation.name}</h3>
          <p className="text-xs text-stone-500 truncate">
            {currentStation.frequency} · {currentStation.location}
            {error && <span className="text-red-500 ml-2">· {error}</span>}
          </p>
        </div>

        {/* Donate button */}
        <a
          href={currentStation.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 text-sm font-medium rounded-full hover:from-red-100 hover:to-rose-100 transition-all border border-red-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Donate
        </a>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2">
          <svg className="w-4 h-4 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-red-500"
          />
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
