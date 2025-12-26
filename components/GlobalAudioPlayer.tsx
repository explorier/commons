'use client'

import { useRef, useEffect, useState } from 'react'
import { useAudio } from '@/lib/AudioContext'

function Waveform({ isPlaying, color = 'teal' }: { isPlaying: boolean; color?: string }) {
  const colorClass = color === 'teal' ? 'bg-teal-500' : 'bg-amber-500'
  return (
    <div className="flex items-end gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-all ${colorClass} ${
            isPlaying ? 'animate-waveform' : ''
          }`}
          style={{
            animationDelay: `${i * 0.12}s`,
            height: isPlaying ? undefined : '6px',
          }}
        />
      ))}
    </div>
  )
}

function IconButton({
  onClick,
  disabled,
  children,
  label,
  variant = 'default',
  size = 'md'
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  label: string
  variant?: 'default' | 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }

  const variantClasses = {
    default: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
    primary: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700',
    ghost: 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        transition-all duration-200 disabled:opacity-40 shrink-0
        ${variantClasses[variant]}
        active:scale-95
      `}
    >
      {children}
    </button>
  )
}

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const {
    currentStation,
    setCurrentStation,
    isPlaying,
    setIsPlaying,
    playRandom,
    playNext,
    playPrevious
  } = useAudio()

  const [volume, setVolume] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  useEffect(() => {
    if (currentStation && audioRef.current) {
      // Stop any existing playback first
      audioRef.current.pause()
      audioRef.current.currentTime = 0

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
      audioRef.current.src = ''
    }
    setCurrentStation(null)
    setIsPlaying(false)
    setIsExpanded(false)
  }

  const handleShuffle = () => {
    playRandom()
  }

  if (!currentStation) return null

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 animate-slide-up
      ${isExpanded ? 'pb-safe' : ''}
    `}>
      <div className={`
        bg-white/98 backdrop-blur-xl border-t border-zinc-200/80 shadow-2xl
        transition-all duration-300 ease-out
        ${isExpanded ? 'rounded-t-3xl' : ''}
      `}>
        <audio ref={audioRef} />

        {/* Expand handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
          aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
        >
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Compact view */}
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Station logo/icon */}
            <div className="relative shrink-0">
              {currentStation.logoUrl ? (
                <img
                  src={currentStation.logoUrl}
                  alt={currentStation.name}
                  className="w-12 h-12 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {currentStation.callSign.slice(0, 4)}
                </div>
              )}
              {isPlaying && !isLoading && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50" />
              )}
            </div>

            {/* Play/Pause */}
            <IconButton
              onClick={togglePlay}
              disabled={isLoading}
              label={isPlaying ? 'Pause' : 'Play'}
              variant="primary"
              size="lg"
            >
              {isLoading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </IconButton>

            {/* Waveform */}
            <div className="hidden sm:block">
              <Waveform isPlaying={isPlaying && !isLoading} />
            </div>

            {/* Station info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-900 text-sm truncate">{currentStation.name}</h3>
              <p className="text-xs text-zinc-500 truncate">
                {currentStation.frequency} · {currentStation.location}
                {error && <span className="text-amber-600 ml-2">· {error}</span>}
              </p>
            </div>

            {/* Quick controls */}
            <div className="hidden md:flex items-center gap-1">
              {/* Shuffle */}
              <IconButton onClick={handleShuffle} label="Play random station" variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </IconButton>

              {/* Volume */}
              <div className="relative">
                <IconButton
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  label="Volume"
                  variant="ghost"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    {volume === 0 ? (
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    ) : volume < 0.5 ? (
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    ) : (
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    )}
                  </svg>
                </IconButton>

                {showVolumeSlider && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-zinc-200 p-3 animate-fade-in">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 rotate-0"
                      style={{ writingMode: 'horizontal-tb' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Donate button */}
            <a
              href={currentStation.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium rounded-full hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Support
            </a>

            {/* Close */}
            <IconButton onClick={handleClose} label="Close player" variant="ghost" size="sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="border-t border-zinc-100 animate-fade-in">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Station details */}
                <div className="flex items-center gap-4">
                  {currentStation.logoUrl ? (
                    <img
                      src={currentStation.logoUrl}
                      alt={currentStation.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {currentStation.callSign.slice(0, 4)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-zinc-900">{currentStation.name}</h4>
                    <p className="text-sm text-zinc-500">{currentStation.frequency}</p>
                    <p className="text-sm text-zinc-400">{currentStation.location}</p>
                  </div>
                </div>

                {/* Center: Playback controls */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-3">
                    <IconButton onClick={playPrevious} label="Previous station" variant="default" size="md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                      </svg>
                    </IconButton>

                    <IconButton
                      onClick={togglePlay}
                      disabled={isLoading}
                      label={isPlaying ? 'Pause' : 'Play'}
                      variant="primary"
                      size="lg"
                    >
                      {isLoading ? (
                        <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : isPlaying ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </IconButton>

                    <IconButton onClick={playNext} label="Next station" variant="default" size="md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </IconButton>
                  </div>

                  {/* Shuffle button */}
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Surprise me
                  </button>
                </div>

                {/* Right: Volume & links */}
                <div className="flex flex-col items-end justify-center gap-3">
                  {/* Volume slider */}
                  <div className="flex items-center gap-3 w-full max-w-[200px]">
                    <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3z" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-2">
                    <a
                      href={currentStation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-teal-600 transition-colors"
                    >
                      Visit website →
                    </a>
                    <span className="text-zinc-300">|</span>
                    <a
                      href={currentStation.donateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      Support this station
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
