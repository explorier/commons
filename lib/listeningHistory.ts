export interface ListenEntry {
  id: string
  stationId: string
  stationName: string
  stationSlug: string
  track: string
  timestamp: number
}

const STORAGE_KEY = 'commons-listening-history'
const MAX_ENTRIES = 10000

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getListeningHistory(): ListenEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addListen(entry: Omit<ListenEntry, 'id' | 'timestamp'>): ListenEntry | null {
  if (typeof window === 'undefined') return null

  const history = getListeningHistory()

  // Don't add duplicate if same track on same station within last 5 minutes
  const lastEntry = history[0]
  if (
    lastEntry &&
    lastEntry.stationId === entry.stationId &&
    lastEntry.track === entry.track &&
    Date.now() - lastEntry.timestamp < 5 * 60 * 1000
  ) {
    return null
  }

  const newEntry: ListenEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  }

  // Add to front, trim to max
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('listen-history-update', { detail: newEntry }))
  } catch {
    // localStorage full or unavailable
    return null
  }

  return newEntry
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function removeEntry(id: string): void {
  if (typeof window === 'undefined') return

  const history = getListeningHistory()
  const updated = history.filter(entry => entry.id !== id)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}
