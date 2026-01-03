'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface LocationResult {
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    country?: string
  }
}

interface LocationAutocompleteProps {
  inputClass: string
}

export default function LocationAutocomplete({ inputClass }: LocationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState<{
    display: string
    city: string
    state: string
    country: string
    lat: string
    lon: string
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocation = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent': 'Commons Community Radio (contact form)'
          }
        }
      )
      const data = await response.json()
      setResults(data)
      setIsOpen(data.length > 0)
    } catch (error) {
      console.error('Location search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelected(null)

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      searchLocation(value)
    }, 300)
  }

  const handleSelect = (result: LocationResult) => {
    const city = result.address.city || result.address.town || result.address.village || result.address.municipality || ''
    const state = result.address.state || ''
    const country = result.address.country || ''

    // Build display string
    const parts = [city, state, country].filter(Boolean)
    const display = parts.join(', ')

    setSelected({
      display,
      city,
      state,
      country,
      lat: result.lat,
      lon: result.lon
    })
    setQuery(display)
    setIsOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder="Start typing a city..."
        className={inputClass}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors border-b border-zinc-100 dark:border-zinc-700 last:border-b-0"
              >
                <span className="text-zinc-900 dark:text-zinc-100">{result.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Hidden fields for form submission */}
      <input type="hidden" name="city" value={selected?.city || ''} />
      <input type="hidden" name="state" value={selected?.state || ''} />
      <input type="hidden" name="country" value={selected?.country || ''} />
      <input type="hidden" name="latitude" value={selected?.lat || ''} />
      <input type="hidden" name="longitude" value={selected?.lon || ''} />
      <input type="hidden" name="location" value={selected?.display || query} />
    </div>
  )
}
