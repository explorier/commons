'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface UserPreferencesContextType {
  favorites: string[]
  toggleFavorite: (stationId: string) => void
  isFavorite: (stationId: string) => boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null)

const STORAGE_KEY = 'commons-favorites'

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to load favorites from localStorage:', e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites, isLoaded])

  const toggleFavorite = useCallback((stationId: string) => {
    setFavorites(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    )
  }, [])

  const isFavorite = useCallback((stationId: string) => {
    return favorites.includes(stationId)
  }, [favorites])

  return (
    <UserPreferencesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return context
}
