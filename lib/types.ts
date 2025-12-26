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
