import Link from 'next/link'
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
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 hover:animate-pulse-logo transition-transform hover:scale-105 cursor-pointer">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                  <path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
                  <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Commons</h1>
                <p className="text-xs text-zinc-500">Community radio for all</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="text-sm text-zinc-500 hover:text-teal-600 transition-colors"
              >
                Submit a Station
              </Link>
              <DonateDropdown stations={stations} />
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
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/contact" className="text-xs text-zinc-400 hover:text-teal-600 transition-colors">
              Contact
            </Link>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Made with love for independent radio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
