'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useAudio } from '@/lib/AudioContext'
import { useUserPreferences } from '@/lib/UserPreferencesContext'

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

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const crossfadeAudioRef = useRef<HTMLAudioElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevStreamUrlRef = useRef<string | null>(null)
  const {
    currentStation,
    setCurrentStation,
    currentChannel,
    currentChannelId,
    setCurrentChannelId,
    currentStreamUrl,
    isPlaying,
    setIsPlaying,
    playRandom,
    playNext,
    playPrevious
  } = useAudio()

  const [volume, setVolume] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isCrossfading, setIsCrossfading] = useState(false)
  const maxRetries = 3
  const crossfadeDuration = 1000 // 1 second crossfade

  const { isFavorite, toggleFavorite } = useUserPreferences()
  const isFavorited = currentStation ? isFavorite(currentStation.id) : false
  const handleToggleFavorite = () => {
    if (currentStation) toggleFavorite(currentStation.id)
  }

  const handleShare = async () => {
    if (!currentStation) return
    const url = `${window.location.origin}/?play=${currentStation.id}`
    const shareData = {
      title: `${currentStation.name} - Commons`,
      text: `Listen to ${currentStation.name} (${currentStation.frequency}) from ${currentStation.location}`,
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

  const handleSpinTheDial = () => {
    setIsSpinning(true)
    setTimeout(() => {
      playRandom()
      setTimeout(() => setIsSpinning(false), 300)
    }, 350)
  }

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

  const attemptPlay = useCallback(async (audio: HTMLAudioElement, url: string, attempt: number = 0) => {
    try {
      audio.pause()
      audio.currentTime = 0
      audio.src = url
      audio.load()
      await audio.play()
      setIsPlaying(true)
      setIsLoading(false)
      setIsRetrying(false)
      setRetryCount(0)
      setError(null)
    } catch (err) {
      console.error(`Playback error (attempt ${attempt + 1}):`, err)

      if (attempt < maxRetries - 1) {
        setIsRetrying(true)
        setRetryCount(attempt + 1)
        // Keep showing loading state during retry (no error message)
        setIsLoading(true)
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000
        setTimeout(() => attemptPlay(audio, url, attempt + 1), delay)
      } else {
        setError('Stream unavailable')
        setIsLoading(false)
        setIsRetrying(false)
        setIsPlaying(false)
      }
    }
  }, [setIsPlaying, maxRetries])

  const handleRetry = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentStreamUrl) return
    setIsLoading(true)
    setError(null)
    setRetryCount(0)
    attemptPlay(audio, currentStreamUrl, 0)
  }, [currentStreamUrl, attemptPlay])

  // Crossfade function
  const performCrossfade = useCallback((fromAudio: HTMLAudioElement, toAudio: HTMLAudioElement) => {
    setIsCrossfading(true)
    const steps = 20
    const stepDuration = crossfadeDuration / steps
    let step = 0

    // Start new audio at 0, will fade up
    toAudio.volume = 0

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    fadeIntervalRef.current = setInterval(() => {
      step++
      const progress = step / steps
      // Ease out for fade out, ease in for fade in
      fromAudio.volume = Math.max(0, volume * (1 - progress))
      toAudio.volume = Math.min(volume, volume * progress)

      if (step >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
        fromAudio.pause()
        fromAudio.src = ''
        setIsCrossfading(false)
      }
    }, stepDuration)
  }, [volume, crossfadeDuration])

  useEffect(() => {
    const audio = audioRef.current
    const crossfadeAudio = crossfadeAudioRef.current
    if (!audio || !crossfadeAudio) return

    const handleError = () => {
      // Only handle if not already retrying
      if (!isRetrying && retryCount < maxRetries - 1) {
        setIsRetrying(true)
        setRetryCount(prev => prev + 1)
        setIsLoading(true) // Show loading dots during retry
        const delay = Math.pow(2, retryCount) * 1000
        if (currentStreamUrl) {
          setTimeout(() => attemptPlay(audio, currentStreamUrl, retryCount + 1), delay)
        }
      } else if (retryCount >= maxRetries - 1) {
        setError('Stream unavailable')
        setIsLoading(false)
        setIsRetrying(false)
        setIsPlaying(false)
      }
    }

    const handlePlaying = () => {
      setError(null)
      setIsLoading(false)
      setIsRetrying(false)
      setRetryCount(0)
    }

    audio.addEventListener('error', handleError)
    audio.addEventListener('playing', handlePlaying)

    // Only load stream if URL actually changed
    if (currentStreamUrl && currentStreamUrl !== prevStreamUrlRef.current) {
      const wasPlaying = prevStreamUrlRef.current && isPlaying && !isCrossfading

      setIsLoading(true)
      setError(null)
      setRetryCount(0)
      setIsRetrying(false)

      if (wasPlaying) {
        // Crossfade: load new stream on crossfade audio, then fade
        crossfadeAudio.src = currentStreamUrl
        crossfadeAudio.load()
        crossfadeAudio.play()
          .then(() => {
            performCrossfade(audio, crossfadeAudio)
            // Swap refs after fade - actually we just need to update main audio
            setTimeout(() => {
              audio.src = currentStreamUrl
              audio.load()
              audio.volume = volume
              audio.play().catch(() => {})
              crossfadeAudio.pause()
              crossfadeAudio.src = ''
            }, crossfadeDuration + 50)
            setIsPlaying(true)
            setIsLoading(false)
          })
          .catch(() => {
            // Fallback to direct play if crossfade fails
            attemptPlay(audio, currentStreamUrl, 0)
          })
      } else {
        // First play or not currently playing - direct load
        attemptPlay(audio, currentStreamUrl, 0)
      }

      prevStreamUrlRef.current = currentStreamUrl
    }

    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('playing', handlePlaying)
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [currentStreamUrl, setIsPlaying, attemptPlay, isPlaying, isCrossfading, performCrossfade, volume, crossfadeDuration])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // MediaSession API for lock screen controls and media keys
  useEffect(() => {
    if (!currentStation || !('mediaSession' in navigator)) return

    const displayName = currentChannel
      ? `${currentStation.name} - ${currentChannel.name}`
      : currentStation.name

    navigator.mediaSession.metadata = new MediaMetadata({
      title: displayName,
      artist: currentStation.location,
      album: currentStation.frequency,
      artwork: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Stream unavailable'))
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      setIsPlaying(false)
    })

    navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
    navigator.mediaSession.setActionHandler('nexttrack', playNext)

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
    }
  }, [currentStation, currentChannel, playNext, playPrevious, setIsPlaying])

  // Update MediaSession playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

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
        <audio ref={crossfadeAudioRef} />

        {/* Expand handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
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
            </div>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
                <h3 className="font-semibold text-zinc-900 text-sm truncate">
                  {currentStation.name}
                  {currentChannel && <span className="text-zinc-400 font-normal"> · {currentChannel.name}</span>}
                </h3>
                {isPlaying && !isLoading && <Waveform isPlaying={true} />}
              </div>
              <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                <span>{!currentChannel && currentStation.name !== currentStation.callSign && `${currentStation.callSign} · `}{currentStation.location}</span>
                {error && (
                  <>
                    <span className="text-amber-600">· {error}</span>
                    {error === 'Stream unavailable' && (
                      <button
                        onClick={handleRetry}
                        className="text-teal-600 hover:text-teal-700 underline cursor-pointer ml-1"
                      >
                        Try again
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Donate button - visible on larger screens */}
            <a
              href={currentStation.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium rounded-full hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Support
            </a>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
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
              {/* Channel selector */}
              {currentStation.channels && currentStation.channels.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {currentStation.channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setCurrentChannelId(channel.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
                        currentChannelId === channel.id
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {channel.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Station/channel description */}
              <p className="text-sm text-zinc-600 mb-4">
                {currentChannel?.description || currentStation.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Navigation controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={playPrevious}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all cursor-pointer"
                    aria-label="Previous station"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                    </svg>
                  </button>
                  <button
                    onClick={playNext}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all cursor-pointer"
                    aria-label="Next station"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSpinTheDial}
                    disabled={isSpinning}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-all cursor-pointer disabled:opacity-70"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                      <line x1="12" y1="12" x2="12" y2="5" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                    <span className="hidden sm:inline">{isSpinning ? 'Spinning...' : 'Spin'}</span>
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all cursor-pointer"
                  >
                    {showCopied ? (
                      <>
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all cursor-pointer ${
                      isFavorited
                        ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                        : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isFavorited ? 'Saved' : 'Save'}
                  </button>
                  <a
                    href={currentStation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                  <a
                    href={currentStation.donateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full font-medium transition-colors cursor-pointer"
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
