export interface Channel {
  id: string
  name: string
  streamUrl: string
  description?: string
}

/**
 * Raw station input - what we store in stations.ts
 * Most fields are optional and will be derived from callSign if not provided
 */
export interface StationInput {
  callSign: string           // Required - e.g. "KPFA"
  frequency: string          // Required - e.g. "94.1 FM" or "Internet"
  location: string           // Required - e.g. "Berkeley, CA"
  streamUrl: string          // Required
  website: string            // Required
  coordinates: { lat: number; lng: number }  // Required

  // Optional - defaults to callSign if not provided
  name?: string
  // Optional - defaults to callSign.toLowerCase() if not provided
  slug?: string
  // Optional
  description?: string
  donateUrl?: string
  network?: string
  timezone?: string          // Defaults to "America/New_York"
  channels?: Channel[]
}

/**
 * Resolved station - all fields populated
 * This is what the app uses
 */
export interface Station {
  id: string
  name: string
  slug: string
  callSign: string
  frequency: string
  location: string
  description: string
  streamUrl: string
  website: string
  donateUrl: string
  network?: string
  timezone: string
  coordinates: {
    lat: number
    lng: number
  }
  channels?: Channel[]
}

/**
 * Resolve a StationInput to a full Station with all defaults applied
 */
export function resolveStation(input: StationInput): Station {
  const slug = input.slug ?? input.callSign.toLowerCase().replace(/[^a-z0-9]/g, '')
  return {
    id: slug,
    name: input.name ?? input.callSign,
    slug,
    callSign: input.callSign,
    frequency: input.frequency,
    location: input.location,
    description: input.description ?? '',
    streamUrl: input.streamUrl,
    website: input.website,
    donateUrl: input.donateUrl ?? input.website,
    network: input.network,
    timezone: input.timezone ?? 'America/New_York',
    coordinates: input.coordinates,
    channels: input.channels,
  }
}

export interface NowPlaying {
  stationId: string
  title?: string
  artist?: string
  showName?: string
  host?: string
  startTime?: string
  endTime?: string
}
