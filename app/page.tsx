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

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-xs text-stone-500 text-center leading-relaxed">
            This site is not affiliated with any of the stations listed.
            Community radio depends on listener support — please consider donating directly to your favorite stations.
            <br />
            Made with love for community radio.
          </p>
        </div>
      </footer>
    </div>
  )
}
