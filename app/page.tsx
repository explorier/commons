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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 text-sm font-medium rounded-full hover:from-teal-100 hover:to-emerald-100 transition-all border border-teal-200/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Submit a Station</span>
                <span className="sm:hidden">Submit</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-600 text-xs font-medium rounded-full hover:bg-teal-50 hover:text-teal-700 transition-all border border-zinc-200 hover:border-teal-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
            <span className="text-xs text-zinc-400">Made with love for independent radio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
