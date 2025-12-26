# Community Radio

Listen to independent and community radio stations from around the world.

## Features

- Browse community radio stations (Pacifica Network, KEXP, WFMU, and more)
- Stream live audio directly in the browser
- Station detail pages with info and embedded player
- Dark mode UI
- Mobile-friendly design

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (recommended)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse stations.

## Project Structure

```
app/
├── page.tsx                    # Home page with station grid
├── layout.tsx                  # Root layout
└── station/[slug]/
    ├── page.tsx                # Station detail page
    └── StationPlayer.tsx       # Client-side audio player

components/
├── AudioPlayer.tsx             # Fixed bottom audio player
├── StationCard.tsx             # Station card component
└── StationGrid.tsx             # Station grid with player state

lib/
├── types.ts                    # TypeScript interfaces
└── stations.ts                 # Station data and helpers
```

## Adding Stations

Edit `lib/stations.ts` to add new stations:

```typescript
{
  id: 'station-id',
  name: 'Station Name',
  slug: 'station-slug',
  callSign: 'WXYZ',
  frequency: '90.1 FM',
  location: 'City, State',
  description: 'Station description.',
  streamUrl: 'https://stream.example.com/stream',
  website: 'https://station.org',
  network: 'Optional Network',
  timezone: 'America/New_York',
}
```

## Stations Included

### Pacifica Network
- KPFA (94.1 FM, Berkeley, CA)
- KPFK (90.7 FM, Los Angeles, CA)
- KPFT (90.1 FM, Houston, TX)
- WBAI (99.5 FM, New York, NY)
- WPFW (89.3 FM, Washington, DC)

### Community Radio
- KEXP (90.3 FM, Seattle, WA)
- WFMU (91.1 FM, Jersey City, NJ)
- KCRW (89.9 FM, Santa Monica, CA)
- KUTX (98.9 FM, Austin, TX)
- WXPN (88.5 FM, Philadelphia, PA)

## Roadmap

- [ ] Now playing info (show name, host)
- [ ] Program schedules
- [ ] Search/filter stations
- [ ] Favorites (localStorage)
- [ ] More stations
- [ ] Station logos

## License

MIT
