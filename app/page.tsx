import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">Community Radio</h1>
          <p className="text-zinc-400 mt-1">
            Listen to independent and community radio stations
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <StationGrid stations={stations} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-zinc-500">
            Community Radio Aggregator • Open Source •{' '}
            <a
              href="https://github.com/yourusername/community-radio"
              className="text-zinc-400 hover:text-white"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
