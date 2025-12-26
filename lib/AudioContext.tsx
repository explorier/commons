'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Station } from './types'
import { stations } from './stations'

interface AudioContextType {
  currentStation: Station | null
  setCurrentStation: (station: Station | null) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  playRandom: () => void
  playNext: () => void
  playPrevious: () => void
  allStations: Station[]
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [history, setHistory] = useState<Station[]>([])

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
