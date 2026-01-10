import { NextResponse } from 'next/server'
import { stations } from '@/lib/stations'

export const runtime = 'edge'

// Fetch now playing for a single station with timeout
async function fetchNowPlaying(streamUrl: string, stationId: string): Promise<{
  stationId: string
  title: string | null
  supported: boolean
}> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout per station

    const response = await fetch(streamUrl, {
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'Commons Radio/1.0',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const icyMetaint = response.headers.get('icy-metaint')

    if (!icyMetaint) {
      return { stationId, title: null, supported: false }
    }

    const metaint = parseInt(icyMetaint, 10)

    const reader = response.body?.getReader()
    if (!reader) {
      return { stationId, title: null, supported: false }
    }

    let bytesRead = 0
    const chunks: Uint8Array[] = []

    while (bytesRead < metaint + 4096) {
      const { done, value } = await reader.read()
      if (done || !value) break
      chunks.push(value)
      bytesRead += value.length
    }

    reader.cancel()

    const data = new Uint8Array(bytesRead)
    let offset = 0
    for (const chunk of chunks) {
      data.set(chunk, offset)
      offset += chunk.length
    }

    if (data.length <= metaint) {
      return { stationId, title: null, supported: true }
    }

    const metaLength = data[metaint] * 16

    if (metaLength === 0) {
      return { stationId, title: null, supported: true }
    }

    const metaBytes = data.slice(metaint + 1, metaint + 1 + metaLength)
    const metaString = new TextDecoder().decode(metaBytes).replace(/\0+$/, '')

    const match = metaString.match(/StreamTitle='([^']*)'/)
    const title = match ? match[1].trim() : null

    return { stationId, title: title || null, supported: true }
  } catch {
    return { stationId, title: null, supported: false }
  }
}

export async function GET() {
  // Filter out stations with disableNowPlaying
  const enabledStations = stations.filter(s => !s.disableNowPlaying)

  // Fetch all in parallel
  const results = await Promise.all(
    enabledStations.map(station =>
      fetchNowPlaying(station.streamUrl, station.id)
    )
  )

  // Sort: stations with titles first
  results.sort((a, b) => {
    if (a.title && !b.title) return -1
    if (!a.title && b.title) return 1
    return 0
  })

  return NextResponse.json({
    stations: results,
    fetchedAt: new Date().toISOString(),
  })
}
