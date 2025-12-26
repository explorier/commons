'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Station } from '@/lib/types'

// Fix for default marker icons in Next.js
const DefaultIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #dc2626;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const ActiveIcon = L.divIcon({
  className: 'custom-marker-active',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #16a34a;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(22,163,74,0.5);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface StationMapProps {
  stations: Station[]
  currentStation: Station | null
  onStationSelect: (station: Station) => void
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function StationMap({ stations, currentStation, onStationSelect }: StationMapProps) {
  // Center on US by default, or on current station
  const center: [number, number] = currentStation
    ? [currentStation.coordinates.lat, currentStation.coordinates.lng]
    : [39.8283, -98.5795]

  const zoom = currentStation ? 8 : 4

  return (
    <div className="h-64 md:h-80 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={center} />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.coordinates.lat, station.coordinates.lng]}
            icon={currentStation?.id === station.id ? ActiveIcon : DefaultIcon}
            eventHandlers={{
              click: () => onStationSelect(station),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{station.name}</p>
                <p className="text-stone-500">{station.frequency}</p>
                <p className="text-stone-500">{station.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
