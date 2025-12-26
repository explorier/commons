'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Station } from './types'

interface AudioContextType {
  currentStation: Station | null
  setCurrentStation: (station: Station | null) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <AudioContext.Provider value={{ currentStation, setCurrentStation, isPlaying, setIsPlaying }}>
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
