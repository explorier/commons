import { notFound } from 'next/navigation'
import Link from 'next/link'
import { stations, getStation } from '@/lib/stations'
import StationPlayer from './StationPlayer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return stations.map((station) => ({
    slug: station.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const station = getStation(slug)

  if (!station) {
    return { title: 'Station Not Found' }
  }

  return {
    title: `${station.name} - Commons`,
    description: station.description,
  }
}

export default async function StationPage({ params }: PageProps) {
  const { slug } = await params
  const station = getStation(slug)

  if (!station) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All stations
          </Link>
        </div>
      </header>

      {/* Station info */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            {/* Frequency badge */}
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg shadow-teal-500/20">
              {station.frequency.replace(' FM', '').replace('Internet', 'WEB')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-zinc-900">{station.name}</h1>
                {station.network && (
                  <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium">
                    {station.network}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 mb-3">
                {station.frequency} · {station.location}
              </p>
              <p className="text-zinc-600 leading-relaxed">{station.description}</p>
            </div>
          </div>

          {/* Player */}
          <StationPlayer station={station} />

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center gap-4">
            <a
              href={station.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
            >
              Visit {station.name} website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Player spacer */}
        <div className="h-24" />
      </main>
    </div>
  )
}
