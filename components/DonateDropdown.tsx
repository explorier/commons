'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Station } from '@/lib/types'

interface DonateDropdownProps {
  stations: Station[]
}

export default function DonateDropdown({ stations }: DonateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    const sorted = [...stations].sort((a, b) => a.name.localeCompare(b.name))
    if (!search) return sorted
    const q = search.toLowerCase()
    return sorted.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.callSign.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    )
  }, [stations, search])

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
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-drop-in">
          {/* Search input */}
          <div className="p-3 border-b border-zinc-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search stations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Station list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredStations.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">No stations found</p>
            ) : (
              filteredStations.map(station => (
                <a
                  key={station.id}
                  href={station.donateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors cursor-pointer border-b border-zinc-100 last:border-b-0 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:from-amber-100 group-hover:to-orange-100 group-hover:text-amber-600 transition-all shrink-0">
                    {station.frequency.replace(' FM', '').replace('Internet', 'WEB')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-amber-700 transition-colors">
                      {station.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{station.location}</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-300 group-hover:text-amber-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-teal-50 border-t border-teal-100">
            <p className="text-xs text-teal-700 leading-relaxed">
              Community radio depends on listener support.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
