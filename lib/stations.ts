import { Station, Region } from './types'

export const stations: Station[] = [
  // === WEST COAST ===
  {
    id: 'kpfa',
    name: 'KPFA',
    slug: 'kpfa',
    callSign: 'KPFA',
    frequency: '94.1 FM',
    location: 'Berkeley, CA',
    region: 'West Coast',
    description: 'Free speech radio since 1949. News, public affairs, music, and arts.',
    streamUrl: 'https://streams.kpfa.org:8443/kpfa',
    website: 'https://kpfa.org',
    network: 'Pacifica',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'kpfk',
    name: 'KPFK',
    slug: 'kpfk',
    callSign: 'KPFK',
    frequency: '90.7 FM',
    location: 'Los Angeles, CA',
    region: 'West Coast',
    description: 'Progressive talk radio serving Southern California.',
    streamUrl: 'http://streams.pacifica.org:9000/kpfk_128',
    website: 'https://kpfk.org',
    network: 'Pacifica',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'kcrw',
    name: 'KCRW',
    slug: 'kcrw',
    callSign: 'KCRW',
    frequency: '89.9 FM',
    location: 'Santa Monica, CA',
    region: 'West Coast',
    description: 'Music, news, and culture from Southern California.',
    streamUrl: 'https://kcrw.streamguys1.com/kcrw_192k_mp3_on_air',
    website: 'https://kcrw.com',
    timezone: 'America/Los_Angeles',
  },

  // === PACIFIC NORTHWEST ===
  {
    id: 'kexp',
    name: 'KEXP',
    slug: 'kexp',
    callSign: 'KEXP',
    frequency: '90.3 FM',
    location: 'Seattle, WA',
    region: 'Pacific Northwest',
    description: 'Where the music matters. Indie, alternative, and eclectic.',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.aac',
    website: 'https://kexp.org',
    timezone: 'America/Los_Angeles',
  },

  // === SOUTHWEST ===
  {
    id: 'kutx',
    name: 'KUTX',
    slug: 'kutx',
    callSign: 'KUTX',
    frequency: '98.9 FM',
    location: 'Austin, TX',
    region: 'Southwest',
    description: "Austin's music radio - local and independent.",
    streamUrl: 'https://kut.streamguys1.com/kutx-free',
    website: 'https://kutx.org',
    timezone: 'America/Chicago',
  },

  // === GULF COAST ===
  {
    id: 'kpft',
    name: 'KPFT',
    slug: 'kpft',
    callSign: 'KPFT',
    frequency: '90.1 FM',
    location: 'Houston, TX',
    region: 'Gulf Coast',
    description: 'Community radio for Houston and the Gulf Coast.',
    streamUrl: 'http://streams.pacifica.org:9000/kpft_128',
    website: 'https://kpft.org',
    network: 'Pacifica',
    timezone: 'America/Chicago',
  },
  {
    id: 'wwoz',
    name: 'WWOZ',
    slug: 'wwoz',
    callSign: 'WWOZ',
    frequency: '90.7 FM',
    location: 'New Orleans, LA',
    region: 'Gulf Coast',
    description: "New Orleans' jazz and heritage station. Louisiana music 24/7.",
    streamUrl: 'http://wwoz-sc.streamguys1.com/wwoz-hi.mp3',
    website: 'https://wwoz.org',
    timezone: 'America/Chicago',
  },
  {
    id: 'wtul',
    name: 'WTUL',
    slug: 'wtul',
    callSign: 'WTUL',
    frequency: '91.5 FM',
    location: 'New Orleans, LA',
    region: 'Gulf Coast',
    description: 'Tulane University freeform radio. Eclectic and student-run.',
    streamUrl: 'http://stream.wtul.fm:8000/wtul',
    website: 'https://wtulneworleans.com',
    timezone: 'America/Chicago',
  },

  // === NORTHEAST ===
  {
    id: 'wbai',
    name: 'WBAI',
    slug: 'wbai',
    callSign: 'WBAI',
    frequency: '99.5 FM',
    location: 'New York, NY',
    region: 'Northeast',
    description: 'Listener-sponsored free speech radio in NYC.',
    streamUrl: 'http://streams.pacifica.org:9000/wbai_128',
    website: 'https://wbai.org',
    network: 'Pacifica',
    timezone: 'America/New_York',
  },
  {
    id: 'wfmu',
    name: 'WFMU',
    slug: 'wfmu',
    callSign: 'WFMU',
    frequency: '91.1 FM',
    location: 'Jersey City, NJ',
    region: 'Northeast',
    description: 'Freeform radio - longest running freeform station in the US.',
    streamUrl: 'http://stream0.wfmu.org/freeform-128k',
    website: 'https://wfmu.org',
    timezone: 'America/New_York',
  },

  // === MID-ATLANTIC ===
  {
    id: 'wpfw',
    name: 'WPFW',
    slug: 'wpfw',
    callSign: 'WPFW',
    frequency: '89.3 FM',
    location: 'Washington, DC',
    region: 'Mid-Atlantic',
    description: 'Jazz and justice radio for the DC metro area.',
    streamUrl: 'http://streams.pacifica.org:9000/wpfw_128',
    website: 'https://wpfw.org',
    network: 'Pacifica',
    timezone: 'America/New_York',
  },
  {
    id: 'wxpn',
    name: 'WXPN',
    slug: 'wxpn',
    callSign: 'WXPN',
    frequency: '88.5 FM',
    location: 'Philadelphia, PA',
    region: 'Mid-Atlantic',
    description: 'Member-supported music discovery from UPenn.',
    streamUrl: 'https://wxpnhi.xpn.org/xpnhi',
    website: 'https://xpn.org',
    timezone: 'America/New_York',
  },
]

export const regions: Region[] = [
  'West Coast',
  'Pacific Northwest',
  'Southwest',
  'Gulf Coast',
  'Northeast',
  'Mid-Atlantic',
]

export function getStation(slug: string): Station | undefined {
  return stations.find(s => s.slug === slug)
}

export function getStationsByRegion(region: Region): Station[] {
  return stations.filter(s => s.region === region)
}

export function getStationsByNetwork(network: string): Station[] {
  return stations.filter(s => s.network === network)
}
