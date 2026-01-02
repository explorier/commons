'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Station } from '@/lib/types'

const REGION_FILTER_RADIUS_MILES = 200

// Fix for default marker icons in Next.js
const DefaultIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.4);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const ActiveIcon = L.divIcon({
  className: 'custom-marker-active',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(245, 158, 11, 0.5);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

interface StationMapProps {
  stations: Station[]
  currentStation: Station | null
  onStationSelect: (station: Station) => void
  regionFilter: { lat: number; lng: number } | null
  onRegionFilter: (coords: { lat: number; lng: number } | null) => void
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function StationMap({ stations, currentStation, onStationSelect, regionFilter, onRegionFilter }: StationMapProps) {
  // Center on filter region, current station, or US default
  const center: [number, number] = regionFilter
    ? [regionFilter.lat, regionFilter.lng]
    : currentStation
      ? [currentStation.coordinates.lat, currentStation.coordinates.lng]
      : [39.8283, -98.5795]

  const zoom = regionFilter ? 6 : currentStation ? 8 : 4

  const handleMapClick = (lat: number, lng: number) => {
    // If clicking same area, clear the filter
    if (regionFilter) {
      const distance = Math.sqrt(
        Math.pow(regionFilter.lat - lat, 2) + Math.pow(regionFilter.lng - lng, 2)
      )
      // If clicking within ~1 degree of existing filter, clear it
      if (distance < 1) {
        onRegionFilter(null)
        return
      }
    }
    onRegionFilter({ lat, lng })
  }

  // Convert miles to meters for the circle radius
  const radiusMeters = REGION_FILTER_RADIUS_MILES * 1609.34

  return (
    <div className="h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={center} />
        <MapClickHandler onMapClick={handleMapClick} />
        {regionFilter && (
          <Circle
            center={[regionFilter.lat, regionFilter.lng]}
            radius={radiusMeters}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        )}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.coordinates.lat, station.coordinates.lng]}
            icon={currentStation?.id === station.id ? ActiveIcon : DefaultIcon}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                onStationSelect(station)
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-zinc-900">{station.name}</p>
                <p className="text-zinc-500">{station.frequency}</p>
                <p className="text-zinc-400">{station.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
