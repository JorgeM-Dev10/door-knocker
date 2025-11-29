'use client';

import { useEffect, useMemo, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Lead } from '@/lib/generateLeads';

interface MapPanelProps {
  center: { lat: number; lng: number } | null;
  radius: number;
  leads: Lead[];
  isScanning: boolean;
  location: string;
}

// Función para generar un círculo GeoJSON
function createCircleGeoJSON(center: { lat: number; lng: number }, radiusKm: number) {
  const points = 64;
  const radiusInDegrees = radiusKm / 111;
  const coordinates: [number, number][] = [];

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const lat = center.lat + radiusInDegrees * Math.cos((angle * Math.PI) / 180);
    const lng = center.lng + (radiusInDegrees * Math.sin((angle * Math.PI) / 180)) / Math.cos((center.lat * Math.PI) / 180);
    coordinates.push([lng, lat]);
  }
  coordinates.push(coordinates[0]); // Cerrar el círculo

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coordinates],
    },
  };
}

export default function MapPanel({ center, radius, leads, isScanning, location }: MapPanelProps) {
  const [viewState, setViewState] = useState({
    longitude: center?.lng || -100.3161,
    latitude: center?.lat || 25.6866,
    zoom: 12,
  });

  useEffect(() => {
    if (center) {
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: 12,
      });
    }
  }, [center]);

  // Generar GeoJSON para el círculo del radar
  const circleData = useMemo(() => {
    if (!center) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [createCircleGeoJSON(center, radius)],
    };
  }, [center, radius]);

  return (
    <div className="relative h-full bg-bg-card rounded-lg border border-border-dark overflow-hidden">
      {/* Map */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
      >
        {/* Radar Circle */}
        {circleData && (
          <Source id="radar-circle" type="geojson" data={circleData}>
            <Layer
              id="radar-fill"
              type="fill"
              paint={{
                'fill-color': 'rgba(255, 59, 59, 0.1)',
              }}
            />
            <Layer
              id="radar-stroke"
              type="line"
              paint={{
                'line-color': 'rgba(255, 59, 59, 0.5)',
                'line-width': 2,
              }}
            />
          </Source>
        )}

        {/* Lead Markers */}
        {leads.map((lead) => (
          <Marker
            key={lead.id}
            longitude={lead.lng}
            latitude={lead.lat}
            anchor="center"
          >
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full bg-accent-red glow-red cursor-pointer"
                style={{
                  boxShadow: '0 0 8px rgba(255, 59, 59, 0.8), 0 0 16px rgba(255, 59, 59, 0.4)',
                }}
              />
            </div>
          </Marker>
        ))}
      </Map>

      {/* Radar Animation Ring Overlay */}
      {isScanning && center && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 59, 59, 0.6)',
            animation: 'radar-sweep 2s ease-in-out infinite',
          }}
        />
      )}

      {/* HUD Overlay */}
      <div className="absolute bottom-4 left-4 bg-bg-card/90 backdrop-blur-sm border border-border-dark rounded-lg p-3 font-mono text-xs z-10">
        <div className="space-y-1">
          <div className="text-text-secondary">
            Targets detected: <span className="text-accent-red font-bold">{leads.length}</span>
          </div>
          <div className="text-text-secondary">
            Scan radius: <span className="text-white">{radius} km</span>
          </div>
          <div className="text-text-secondary">
            Location: <span className="text-white">{location || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

