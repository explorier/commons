import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Community Radio</h1>
            <p className="text-xs text-zinc-500">Independent stations</p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-600 hover:text-zinc-400"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <StationGrid stations={stations} />
      </main>
    </div>
  )
}
