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
      <header className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm">
            ← All stations
          </Link>
        </div>
      </header>

      {/* Station info */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Logo */}
          <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center text-xl font-bold text-zinc-600 shrink-0">
            {station.callSign.slice(0, 4)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{station.name}</h1>
              {station.network && (
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                  {station.network}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-2">
              {station.frequency} · {station.location}
            </p>
            <p className="text-sm text-zinc-500">{station.description}</p>
          </div>
        </div>

        {/* Player */}
        <StationPlayer station={station} />

        {/* Links */}
        <div className="mt-6 flex gap-4">
          <a
            href={station.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-white"
          >
            Website →
          </a>
        </div>

        {/* Debug info */}
        <details className="mt-8">
          <summary className="text-xs text-zinc-600 cursor-pointer">Stream URL</summary>
          <code className="text-xs text-zinc-700 mt-2 block break-all">{station.streamUrl}</code>
        </details>
      </main>
    </div>
  )
}
