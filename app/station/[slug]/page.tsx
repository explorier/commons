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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to all stations
          </Link>
        </div>
      </header>

      {/* Station info */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Logo placeholder */}
          <div className="w-32 h-32 bg-zinc-800 rounded-xl flex items-center justify-center text-4xl font-bold text-zinc-500 shrink-0">
            {station.callSign.slice(0, 2)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{station.name}</h1>
              {station.network && (
                <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                  {station.network}
                </span>
              )}
            </div>
            <p className="text-lg text-zinc-400 mb-2">
              {station.frequency} • {station.location}
            </p>
            <p className="text-zinc-300 mb-4">{station.description}</p>
            <a
              href={station.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              {station.website.replace(/^https?:\/\//, '')} →
            </a>
          </div>
        </div>

        {/* Player */}
        <StationPlayer station={station} />

        {/* Additional info */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">Station Info</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm text-zinc-500 mb-1">Call Sign</dt>
              <dd className="text-white">{station.callSign}</dd>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm text-zinc-500 mb-1">Frequency</dt>
              <dd className="text-white">{station.frequency}</dd>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm text-zinc-500 mb-1">Location</dt>
              <dd className="text-white">{station.location}</dd>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <dt className="text-sm text-zinc-500 mb-1">Timezone</dt>
              <dd className="text-white">{station.timezone}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}
