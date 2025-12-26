import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Community Radio</h1>
              <p className="text-xs text-stone-500">Independent stations, one place</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <StationGrid stations={stations} />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/50 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs text-stone-500 text-center leading-relaxed max-w-lg mx-auto">
            This site is not affiliated with any of the stations listed.
            Community radio depends on listener support — please consider donating directly to your favorite stations.
            <br />
            <span className="text-stone-400 mt-2 block">Made with love for community radio.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
