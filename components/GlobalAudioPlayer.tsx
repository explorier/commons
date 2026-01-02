'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/lib/AudioContext'
import { useUserPreferences } from '@/lib/UserPreferencesContext'

function Waveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [
    { delay: 0, heights: [3, 12, 3] },
    { delay: 0.15, heights: [3, 8, 3] },
    { delay: 0.3, heights: [3, 14, 3] },
    { delay: 0.1, heights: [3, 6, 3] },
  ]

  return (
    <div className="flex items-center gap-[2px] h-4 overflow-hidden">
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-teal-400"
          animate={isPlaying ? {
            height: bar.heights.map(h => `${h}px`),
          } : { height: '3px' }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: bar.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-white rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)
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
  const maxRetries = 3

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
        setIsLoading(true)
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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleError = () => {
      if (!isRetrying && retryCount < maxRetries - 1) {
        setIsRetrying(true)
        setRetryCount(prev => prev + 1)
        setIsLoading(true)
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

    if (currentStreamUrl && currentStreamUrl !== prevStreamUrlRef.current) {
      setIsLoading(true)
      setError(null)
      setRetryCount(0)
      setIsRetrying(false)
      attemptPlay(audio, currentStreamUrl, 0)
      prevStreamUrlRef.current = currentStreamUrl
    }

    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [currentStreamUrl, setIsPlaying, attemptPlay, isRetrying, retryCount])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // MediaSession API for lock screen controls
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
  }, [currentStation, currentChannel, playNext, playPrevious, setIsPlaying, isPlaying])

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

  return (
    <AnimatePresence>
      {currentStation && (
        <motion.div
          key="player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4 pb-2 sm:pb-4"
        >
          <audio ref={audioRef} />

        <motion.div
          layout
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-300 overflow-hidden"
        >
          {/* Collapsed Player */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPrevious}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Previous station"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
              </motion.button>

              {/* Play/Pause button with frequency */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/25 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <LoadingDots />
                ) : isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {/* Frequency label */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-white text-teal-600 px-1.5 py-0.5 rounded-full whitespace-nowrap border border-zinc-200 shadow-sm">
                  {currentStation.frequency.replace(' FM', '').replace('Internet', 'WEB')}
                </span>
              </motion.button>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Next station"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </motion.button>

              {/* Station info */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 min-w-0 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 text-sm truncate group-hover:text-teal-600 transition-colors">
                    {currentStation.name}
                    {currentChannel && <span className="text-zinc-400 font-normal"> · {currentChannel.name}</span>}
                  </h3>
                  {isPlaying && !isLoading && <Waveform isPlaying={true} />}
                </div>
                <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                  <span>{currentStation.location}</span>
                  {error && (
                    <>
                      <span className="text-amber-600">· {error}</span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                        className="text-teal-600 hover:text-teal-700 underline cursor-pointer ml-1"
                      >
                        Retry
                      </span>
                    </>
                  )}
                </p>
              </button>

              {/* Expand/Collapse chevron */}
              <motion.button
                animate={{ rotate: isExpanded ? 180 : 0 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </motion.button>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Close player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-5 pt-2 border-t border-zinc-100">
                  {/* Channel selector */}
                  {currentStation.channels && currentStation.channels.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {currentStation.channels.map((channel) => (
                        <motion.button
                          key={channel.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentChannelId(channel.id)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                            currentChannelId === channel.id
                              ? 'bg-teal-500 text-white shadow-md'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {channel.name}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-zinc-600 mb-5 leading-relaxed">
                    {currentChannel?.description || currentStation.description}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSpinTheDial}
                      disabled={isSpinning}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-xl transition-all cursor-pointer disabled:opacity-70 whitespace-nowrap shrink-0"
                    >
                      <motion.svg
                        animate={isSpinning ? { rotate: 360 } : {}}
                        transition={{ duration: 0.5, ease: 'linear' }}
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                        <line x1="12" y1="12" x2="12" y2="5" strokeWidth={2} strokeLinecap="round" />
                      </motion.svg>
                      Spin
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {showCopied ? (
                        <>
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleToggleFavorite}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isFavorited
                          ? 'text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/50'
                          : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {isFavorited ? 'Saved' : 'Save'}
                    </motion.button>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={currentStation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Website
                    </motion.a>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={currentStation.donateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Support
                    </motion.a>
                  </div>

                  {/* Volume control - separate row, hidden on iOS and mobile */}
                  {!isIOS && (
                    <div className="hidden sm:flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100">
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
                        className="w-32 cursor-pointer accent-teal-500"
                        style={{ '--volume-percent': `${volume * 100}%` } as React.CSSProperties}
                      />
                      <span className="text-xs text-zinc-400">{Math.round(volume * 100)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
