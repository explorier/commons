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
    title: `${station.name} - Community Radio`,
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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-stone-500 hover:text-stone-900 text-sm">
            ← All stations
          </Link>
        </div>
      </header>

      {/* Station info */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            {/* Logo */}
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0">
              {station.callSign.slice(0, 4)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-stone-900">{station.name}</h1>
                {station.network && (
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                    {station.network}
                  </span>
                )}
              </div>
              <p className="text-stone-500 mb-2">
                {station.frequency} · {station.location}
              </p>
              <p className="text-stone-600">{station.description}</p>
            </div>
          </div>

          {/* Player */}
          <StationPlayer station={station} />

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <a
              href={station.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Visit {station.name} website →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
