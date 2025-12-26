import { Station } from './types'

export const stations: Station[] = [
  // Bay Area
  {
    id: 'kpfa',
    name: 'KPFA',
    slug: 'kpfa',
    callSign: 'KPFA',
    frequency: '94.1 FM',
    location: 'Berkeley, CA',
    description: 'Free speech radio since 1949. News, public affairs, and arts.',
    streamUrl: 'https://streams.kpfa.org:8443/kpfa',
    website: 'https://kpfa.org',
    network: 'Pacifica',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.8716, lng: -122.2727 },
  },
  {
    id: 'kqed',
    name: 'KQED',
    slug: 'kqed',
    callSign: 'KQED',
    frequency: '88.5 FM',
    location: 'San Francisco, CA',
    description: 'NPR news and information for the Bay Area.',
    streamUrl: 'https://streams.kqed.org/kqedradio',
    website: 'https://kqed.org',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },

  // Los Angeles
  {
    id: 'kcrw',
    name: 'KCRW',
    slug: 'kcrw',
    callSign: 'KCRW',
    frequency: '89.9 FM',
    location: 'Santa Monica, CA',
    description: 'Eclectic music, NPR news, and culture from LA.',
    streamUrl: 'https://streams.kcrw.com/e24_aac/playlist.m3u8',
    website: 'https://kcrw.com',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 34.0195, lng: -118.4912 },
  },

  // Pacific Northwest
  {
    id: 'kexp',
    name: 'KEXP',
    slug: 'kexp',
    callSign: 'KEXP',
    frequency: '90.3 FM',
    location: 'Seattle, WA',
    description: 'Where the music matters. Indie and eclectic.',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.aac',
    website: 'https://kexp.org',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 47.6062, lng: -122.3321 },
  },

  // New Orleans
  {
    id: 'wwoz',
    name: 'WWOZ',
    slug: 'wwoz',
    callSign: 'WWOZ',
    frequency: '90.7 FM',
    location: 'New Orleans, LA',
    description: "New Orleans' jazz and heritage station.",
    streamUrl: 'http://wwoz-sc.streamguys1.com/wwoz-hi.mp3',
    website: 'https://wwoz.org',
    timezone: 'America/Chicago',
    coordinates: { lat: 29.9511, lng: -90.0715 },
  },

  // Northeast
  {
    id: 'wfmu',
    name: 'WFMU',
    slug: 'wfmu',
    callSign: 'WFMU',
    frequency: '91.1 FM',
    location: 'Jersey City, NJ',
    description: 'Freeform radio. The longest running freeform station in the US.',
    streamUrl: 'http://stream0.wfmu.org/freeform-128k',
    website: 'https://wfmu.org',
    timezone: 'America/New_York',
    coordinates: { lat: 40.7282, lng: -74.0776 },
  },
  {
    id: 'wnyc',
    name: 'WNYC',
    slug: 'wnyc',
    callSign: 'WNYC',
    frequency: '93.9 FM',
    location: 'New York, NY',
    description: "New York's flagship public radio station.",
    streamUrl: 'https://stream.wnyc.org/wnycfm',
    website: 'https://wnyc.org',
    timezone: 'America/New_York',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 'wqxr',
    name: 'WQXR',
    slug: 'wqxr',
    callSign: 'WQXR',
    frequency: '105.9 FM',
    location: 'New York, NY',
    description: "New York's classical music station.",
    streamUrl: 'https://stream.wqxr.org/wqxr',
    website: 'https://wqxr.org',
    timezone: 'America/New_York',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },

  // Philadelphia
  {
    id: 'wxpn',
    name: 'WXPN',
    slug: 'wxpn',
    callSign: 'WXPN',
    frequency: '88.5 FM',
    location: 'Philadelphia, PA',
    description: 'Adult album alternative from UPenn.',
    streamUrl: 'https://wxpnhi.xpn.org/xpnhi',
    website: 'https://xpn.org',
    timezone: 'America/New_York',
    coordinates: { lat: 39.9526, lng: -75.1652 },
  },

  // Internet-only
  {
    id: 'somafm',
    name: 'SomaFM',
    slug: 'somafm',
    callSign: 'SOMA',
    frequency: 'Internet',
    location: 'San Francisco, CA',
    description: 'Listener-supported internet radio. Groove Salad channel.',
    streamUrl: 'http://ice1.somafm.com/groovesalad-128-mp3',
    website: 'https://somafm.com',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: 'nts',
    name: 'NTS Radio',
    slug: 'nts',
    callSign: 'NTS',
    frequency: 'Internet',
    location: 'London, UK',
    description: 'Underground music from London and beyond.',
    streamUrl: 'https://stream-relay-geo.ntslive.net/stream',
    website: 'https://nts.live',
    timezone: 'Europe/London',
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
]

export function getStation(slug: string): Station | undefined {
  return stations.find(s => s.slug === slug)
}

export function getStationsByLocation(state: string): Station[] {
  return stations.filter(s => s.location.includes(state))
}
