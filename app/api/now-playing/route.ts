import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'Commons Radio/1.0',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const icyMetaint = response.headers.get('icy-metaint')

    if (!icyMetaint) {
      return NextResponse.json({ title: null, supported: false })
    }

    const metaint = parseInt(icyMetaint, 10)

    // Read enough bytes to get the first metadata block
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json({ title: null, supported: false })
    }

    let bytesRead = 0
    const chunks: Uint8Array[] = []

    // Read until we have enough data (metaint + some metadata)
    while (bytesRead < metaint + 4096) {
      const { done, value } = await reader.read()
      if (done || !value) break
      chunks.push(value)
      bytesRead += value.length
    }

    // Cancel the stream - we only needed the first chunk
    reader.cancel()

    // Combine chunks
    const data = new Uint8Array(bytesRead)
    let offset = 0
    for (const chunk of chunks) {
      data.set(chunk, offset)
      offset += chunk.length
    }

    // Metadata starts at metaint, first byte is length * 16
    if (data.length <= metaint) {
      return NextResponse.json({ title: null, supported: true })
    }

    const metaLength = data[metaint] * 16

    if (metaLength === 0) {
      return NextResponse.json({ title: null, supported: true })
    }

    // Extract metadata string
    const metaBytes = data.slice(metaint + 1, metaint + 1 + metaLength)
    const metaString = new TextDecoder().decode(metaBytes).replace(/\0+$/, '')

    // Parse StreamTitle from metadata
    const match = metaString.match(/StreamTitle='([^']*)'/)
    const title = match ? match[1].trim() : null

    return NextResponse.json({
      title: title || null,
      supported: true,
    })
  } catch (error) {
    console.error('Now playing fetch error:', error)
    return NextResponse.json({ title: null, supported: false, error: 'Fetch failed' })
  }
}
