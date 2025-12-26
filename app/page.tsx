import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Commons</h1>
              <p className="text-xs text-zinc-500">Community radio for all</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <StationGrid stations={stations} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs text-zinc-500 text-center leading-relaxed max-w-lg mx-auto">
            This site is not affiliated with any of the stations listed.
            Community radio depends on listener support — please donate directly to your favorite stations.
            <br />
            <span className="text-zinc-400 mt-2 block">Made with love for independent radio.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
