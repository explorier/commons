import Link from 'next/link'
import { stations } from '@/lib/stations'
import StationGrid from '@/components/StationGrid'
import DonateDropdown from '@/components/DonateDropdown'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                  <path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
                  <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Commons</h1>
                <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400">Community radio for all</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                href="/contact"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/50 dark:to-emerald-900/50 text-teal-700 dark:text-teal-300 text-sm font-medium rounded-full hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-900 dark:hover:to-emerald-900 transition-all border border-teal-200/50 dark:border-teal-700/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Submit a Station</span>
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
      <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed max-w-lg mx-auto">
            This site is not affiliated with any of the stations listed.
            Community radio depends on listener support — please donate directly to your favorite stations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/50 hover:text-teal-700 dark:hover:text-teal-300 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-teal-200 dark:hover:border-teal-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Made with love for independent radio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
