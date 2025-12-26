import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-semibold text-stone-900">Community Radio</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <StationGrid stations={stations} />
      </main>
    </div>
  )
}
