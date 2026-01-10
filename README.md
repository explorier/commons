# Commons

Listen to independent and community radio stations.

## Features

- **100+ stations** - Community, college, and independent radio from across the US
- **Live now playing** - Real-time track info via ICY metadata
- **What's On Now** - See what's playing across all stations, pick something that sounds good
- **Map view** - Browse stations geographically
- **Favorites** - Save stations for quick access
- **Network resilience** - Auto-reconnect on network changes
- **Dark mode** - System-aware theme
- **Mobile-friendly** - Works great on phones, supports lock screen controls

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Mapbox GL
- **Hosting:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Adding Stations

Edit `lib/stations.ts`:

```typescript
{
  callSign: 'WXYZ',
  frequency: '90.1 FM',
  location: 'City, State',
  description: 'Station description.',
  streamUrl: 'https://stream.example.com/stream',
  website: 'https://station.org',
  donateUrl: 'https://station.org/donate',
  coordinates: { lat: 40.7128, lng: -74.0060 },
  // Optional:
  name: 'Custom Display Name',
  channels: [{ id: 'main', name: 'Main', streamUrl: '...' }],
  disableNowPlaying: true, // For stations with bad metadata
}
```

## Roadmap

### Near-term
- [ ] Dedicated "What's On" page (richer browsing experience)
- [ ] Region/state filtering
- [ ] Improved mobile map UX

### Ideas
- [ ] Genre classification for live tracks (via free-tier LLM + caching)
- [ ] Filter "What's On" by genre/mood
- [ ] Program schedules
- [ ] Station logos/artwork

## License

MIT
