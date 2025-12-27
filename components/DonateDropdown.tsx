'use client'

import { useState, useRef, useEffect } from 'react'
import { Station } from '@/lib/types'

interface DonateDropdownProps {
  stations: Station[]
}

export default function DonateDropdown({ stations }: DonateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sort stations alphabetically
  const sortedStations = [...stations].sort((a, b) => a.name.localeCompare(b.name))

  const handleDonate = () => {
    if (selectedStation) {
      window.open(selectedStation.donateUrl, '_blank')
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium rounded-full hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="hidden sm:inline">Support a Station</span>
        <span className="sm:hidden">Donate</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-fade-in">
          <div className="p-3 border-b border-zinc-100">
            <p className="text-xs text-zinc-500 mb-2">Select a station to support</p>
            <select
              value={selectedStation?.id || ''}
              onChange={(e) => {
                const station = stations.find(s => s.id === e.target.value)
                setSelectedStation(station || null)
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="">Choose a station...</option>
              {sortedStations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} — {station.location}
                </option>
              ))}
            </select>
          </div>

          {selectedStation && (
            <div className="p-3 bg-zinc-50">
              <p className="text-xs text-zinc-600 mb-3">{selectedStation.description}</p>
              <button
                onClick={handleDonate}
                className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
              >
                Donate to {selectedStation.name}
              </button>
            </div>
          )}

          <div className="p-3 bg-teal-50 border-t border-teal-100">
            <p className="text-xs text-teal-700 leading-relaxed">
              Community radio depends on listener support. Your donation helps keep independent voices on the air.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
