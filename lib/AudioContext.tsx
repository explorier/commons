'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import { Station, Channel } from './types'
import { stations } from './stations'

interface AudioContextType {
  currentStation: Station | null
  setCurrentStation: (station: Station | null) => void
  currentChannelId: string | null
  setCurrentChannelId: (channelId: string | null) => void
  currentChannel: Channel | null
  currentStreamUrl: string | null
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  playRandom: () => void
  playNext: () => void
  playPrevious: () => void
  allStations: Station[]
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStationState] = useState<Station | null>(null)
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [history, setHistory] = useState<Station[]>([])

  // When setting a station, auto-select first channel if it has channels
  const setCurrentStation = useCallback((station: Station | null) => {
    setCurrentStationState(station)
    if (station?.channels && station.channels.length > 0) {
      setCurrentChannelId(station.channels[0].id)
    } else {
      setCurrentChannelId(null)
    }
  }, [])

  // Get current channel object
  const currentChannel = useMemo(() => {
    if (!currentStation?.channels || !currentChannelId) return null
    return currentStation.channels.find(c => c.id === currentChannelId) || null
  }, [currentStation, currentChannelId])

  // Get the current stream URL (channel or station default)
  const currentStreamUrl = useMemo(() => {
    if (!currentStation) return null
    if (currentChannel) return currentChannel.streamUrl
    return currentStation.streamUrl
  }, [currentStation, currentChannel])

  const playRandom = useCallback(() => {
    const availableStations = stations.filter(s => s.id !== currentStation?.id)
    const randomStation = availableStations[Math.floor(Math.random() * availableStations.length)]
    if (currentStation) {
      setHistory(prev => [...prev, currentStation])
    }
    setCurrentStation(randomStation)
  }, [currentStation])

  const playNext = useCallback(() => {
    if (!currentStation) {
      setCurrentStation(stations[0])
      return
    }
    const currentIndex = stations.findIndex(s => s.id === currentStation.id)
    const nextIndex = (currentIndex + 1) % stations.length
    setHistory(prev => [...prev, currentStation])
    setCurrentStation(stations[nextIndex])
  }, [currentStation])

  const playPrevious = useCallback(() => {
    if (history.length > 0) {
      const previousStation = history[history.length - 1]
      setHistory(prev => prev.slice(0, -1))
      setCurrentStation(previousStation)
    } else if (currentStation) {
      const currentIndex = stations.findIndex(s => s.id === currentStation.id)
      const prevIndex = currentIndex === 0 ? stations.length - 1 : currentIndex - 1
      setCurrentStation(stations[prevIndex])
    }
  }, [currentStation, history])

  return (
    <AudioContext.Provider value={{
      currentStation,
      setCurrentStation,
      currentChannelId,
      setCurrentChannelId,
      currentChannel,
      currentStreamUrl,
      isPlaying,
      setIsPlaying,
      playRandom,
      playNext,
      playPrevious,
      allStations: stations,
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context
}
