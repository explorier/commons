'use client'

import { useState, useEffect, useCallback } from 'react'

interface NowPlayingData {
  title: string | null
  supported: boolean
}

export function useNowPlaying(streamUrl: string | null, isPlaying: boolean) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNowPlaying = useCallback(async () => {
    if (!streamUrl || !isPlaying) {
      setNowPlaying(null)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/now-playing?url=${encodeURIComponent(streamUrl)}`)
      const data = await response.json()
      setNowPlaying(data)
    } catch (error) {
      console.error('Failed to fetch now playing:', error)
      setNowPlaying(null)
    } finally {
      setIsLoading(false)
    }
  }, [streamUrl, isPlaying])

  useEffect(() => {
    if (!streamUrl || !isPlaying) {
      setNowPlaying(null)
      return
    }

    // Fetch immediately
    fetchNowPlaying()

    // Then poll every 20 seconds
    const interval = setInterval(fetchNowPlaying, 20000)

    return () => clearInterval(interval)
  }, [streamUrl, isPlaying, fetchNowPlaying])

  return { nowPlaying, isLoading, refetch: fetchNowPlaying }
}
