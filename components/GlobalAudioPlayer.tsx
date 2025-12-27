'use client'

import { useRef, useEffect, useState } from 'react'
import { useAudio } from '@/lib/AudioContext'

function Waveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-teal-500 transition-all ${
            isPlaying ? 'animate-waveform' : ''
          }`}
          style={{
            animationDelay: `${i * 0.12}s`,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-white rounded-full loading-dot" />
      <span className="w-2 h-2 bg-white rounded-full loading-dot" />
      <span className="w-2 h-2 bg-white rounded-full loading-dot" />
    </div>
  )
}

function ShuffleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} shuffle-icon`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  )
}

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)
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
  const [isIOS, setIsIOS] = useState(false)

  // Detect iOS (volume control doesn't work on iOS)
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(iOS)
  }, [])

  // Update volume slider fill
  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.style.setProperty('--volume-percent', `${volume * 100}%`)
    }
  }, [volume])

  useEffect(() => {
    if (currentStation && audioRef.current) {
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

  if (!currentStation) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className={`
        bg-white/98 backdrop-blur-xl border-t border-zinc-200/80 shadow-2xl
        transition-all duration-300 ease-out
        ${isExpanded ? 'rounded-t-3xl' : ''}
      `}>
        <audio ref={audioRef} />

        {/* Expand handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
          aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
        >
          <svg
            className={`w-3 h-3 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Main player content */}
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Frequency badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {currentStation.frequency.replace(' FM', '').replace('Internet', 'WEB')}
              </div>
              {isPlaying && !isLoading && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50" />
              )}
            </div>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingDots />
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

            {/* Station info + waveform */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 text-sm truncate">{currentStation.name}</h3>
                {isPlaying && !isLoading && <Waveform isPlaying={true} />}
              </div>
              <p className="text-xs text-zinc-500 truncate">
                {currentStation.frequency} · {currentStation.location}
                {error && <span className="text-amber-600 ml-2">· {error}</span>}
              </p>
            </div>

            {/* Donate button - visible on larger screens */}
            <a
              href={currentStation.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium rounded-full hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Support
            </a>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all"
              aria-label="Close player"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="border-t border-zinc-100 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 py-4">
              {/* Station description */}
              <p className="text-sm text-zinc-600 mb-4">{currentStation.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Navigation controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={playPrevious}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                    aria-label="Previous station"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                    </svg>
                  </button>
                  <button
                    onClick={playNext}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                    aria-label="Next station"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={playRandom}
                    className="shuffle-btn flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                  >
                    <ShuffleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Surprise me</span>
                  </button>
                </div>

                {/* Volume control - hidden on iOS where it doesn't work */}
                {!isIOS && (
                  <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                    <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3z" />
                    </svg>
                    <input
                      ref={volumeRef}
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 cursor-pointer"
                      style={{ '--volume-percent': `${volume * 100}%` } as React.CSSProperties}
                    />
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-3">
                  <a
                    href={currentStation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-600 transition-colors"
                  >
                    Website →
                  </a>
                  <a
                    href={currentStation.donateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
