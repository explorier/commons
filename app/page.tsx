import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'
import DonateDropdown from '@/components/DonateDropdown'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4.5 16.5a10.5 10.5 0 0 1 0-9" />
                  <path d="M7.5 14.5a6.5 6.5 0 0 1 0-5" />
                  <circle cx="11" cy="12" r="1.5" fill="currentColor" />
                  <path d="M14.5 9.5a6.5 6.5 0 0 1 0 5" />
                  <path d="M17.5 7.5a10.5 10.5 0 0 1 0 9" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Commons</h1>
                <p className="text-xs text-zinc-500">Community radio for all</p>
              </div>
            </div>
            <DonateDropdown stations={stations} />
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
