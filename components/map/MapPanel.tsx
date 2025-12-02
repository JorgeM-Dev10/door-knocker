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

// Función para generar líneas de grid táctico local
function createGridLines(center: { lat: number; lng: number }, radiusKm: number) {
  const radiusInDegrees = radiusKm / 111;
  const lines: Array<{ type: 'Feature'; geometry: { type: 'LineString'; coordinates: [number, number][] } }> = [];
  
  // Líneas horizontales (latitud)
  for (let i = -3; i <= 3; i++) {
    const lat = center.lat + (i * radiusInDegrees) / 3;
    lines.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [center.lng - radiusInDegrees, lat],
          [center.lng + radiusInDegrees, lat],
        ],
      },
    });
  }
  
  // Líneas verticales (longitud)
  for (let i = -3; i <= 3; i++) {
    const lng = center.lng + (i * radiusInDegrees) / 3;
    lines.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, center.lat - radiusInDegrees],
          [lng, center.lat + radiusInDegrees],
        ],
      },
    });
  }
  
  return {
    type: 'FeatureCollection' as const,
    features: lines,
  };
}

// Función para generar líneas de latitud/longitud globales (tácticas)
function createGlobalGridLines() {
  const lines: Array<{ type: 'Feature'; geometry: { type: 'LineString'; coordinates: [number, number][] }; properties?: { major?: boolean } }> = [];
  
  // Líneas de latitud principales (cada 15 grados para más detalle)
  for (let lat = -90; lat <= 90; lat += 15) {
    const isMajor = lat % 30 === 0 || lat === 0; // Líneas principales cada 30° y el ecuador
    lines.push({
      type: 'Feature',
      properties: { major: isMajor },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-180, lat],
          [180, lat],
        ],
      },
    });
  }
  
  // Líneas de longitud principales (cada 15 grados)
  for (let lng = -180; lng <= 180; lng += 15) {
    const isMajor = lng % 30 === 0 || lng === 0; // Líneas principales cada 30° y el meridiano de Greenwich
    lines.push({
      type: 'Feature',
      properties: { major: isMajor },
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, -90],
          [lng, 90],
        ],
      },
    });
  }
  
  return {
    type: 'FeatureCollection' as const,
    features: lines,
  };
}

export default function MapPanel({ center, radius, leads, isScanning, location }: MapPanelProps) {
  const [viewState, setViewState] = useState({
    longitude: center?.lng || 0, // Centro del mundo
    latitude: center?.lat || 20, // Latitud media para vista global
    zoom: center ? 6 : 1.2, // Zoom global inicial (1.2 muestra todo el mundo mejor), más cercano si hay centro
    pitch: 0,
    bearing: 0,
  });
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (center) {
      // Zoom más cercano pero manteniendo contexto global (zoom 6-8)
      setViewState((prev) => ({
        ...prev,
        longitude: center.lng,
        latitude: center.lat,
        zoom: Math.max(6, Math.min(8, prev.zoom || 6)),
      }));
    } else {
      // Vista mundial completa
      setViewState((prev) => ({
        ...prev,
        longitude: 0,
        latitude: 20,
        zoom: 1.2,
      }));
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

  // Generar grid táctico local
  const gridData = useMemo(() => {
    if (!center) return null;
    return createGridLines(center, radius);
  }, [center, radius]);

  // Generar grid global (siempre visible)
  const globalGridData = useMemo(() => {
    return createGlobalGridLines();
  }, []);

  // Calcular coordenadas para el HUD
  const coordinates = center
    ? `${center.lat >= 0 ? center.lat.toFixed(4) + '°N' : Math.abs(center.lat).toFixed(4) + '°S'}, ${center.lng >= 0 ? center.lng.toFixed(4) + '°E' : Math.abs(center.lng).toFixed(4) + '°W'}`
    : 'N/A';

  // Determinar hemisferio y región aproximada
  const getHemisphere = (lat: number, lng: number) => {
    const hemisphere = lat >= 0 ? 'Norte' : 'Sur';
    let region = 'Océano';
    
    // Regiones aproximadas
    if (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 40) region = 'Europa';
    else if (lat >= 25 && lat <= 50 && lng >= -125 && lng <= -65) region = 'Norteamérica';
    else if (lat >= -35 && lat <= 15 && lng >= -80 && lng <= -35) region = 'Sudamérica';
    else if (lat >= -35 && lat <= 35 && lng >= 100 && lng <= 150) region = 'Asia-Pacífico';
    else if (lat >= -35 && lat <= 35 && lng >= 20 && lng <= 50) region = 'Medio Oriente';
    else if (lat >= -35 && lat <= 35 && lng >= -20 && lng <= 55) region = 'África';
    
    return { hemisphere, region };
  };

  const worldInfo = center ? getHemisphere(center.lat, center.lng) : null;

  return (
    <div className="relative h-full w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-sleek-black via-bg-card to-sleek-black-light rounded-lg border border-border-dark/50 overflow-hidden shadow-lg">
      {/* Map */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={() => {
          setMapError(null);
        }}
        onError={(e) => {
          console.error('Map error:', e);
          setMapError('Error al cargar el mapa. Verifica el token de Mapbox.');
        }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FwaWVuc2xhYm9yYXRvcmllcyIsImEiOiJjbWlqa2FiYjcxNG12M2Zvc3BlNGhka2tnIn0.7JxGTxySZAl3kP9JS5h6vw'}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
        minZoom={1}
        maxZoom={15}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.2,
        }}
      >
        {/* Global Grid Lines (Lat/Lng) - Major Lines */}
        <Source id="global-grid-major" type="geojson" data={{
          type: 'FeatureCollection',
          features: globalGridData.features.filter(f => f.properties?.major),
        }}>
          <Layer
            id="global-grid-major-lines"
            type="line"
            paint={{
              'line-color': 'rgba(10, 10, 10, 0.4)',
              'line-width': 1,
            }}
          />
        </Source>

        {/* Global Grid Lines (Lat/Lng) - Minor Lines */}
        <Source id="global-grid-minor" type="geojson" data={{
          type: 'FeatureCollection',
          features: globalGridData.features.filter(f => !f.properties?.major),
        }}>
          <Layer
            id="global-grid-minor-lines"
            type="line"
            paint={{
              'line-color': 'rgba(10, 10, 10, 0.15)',
              'line-width': 0.5,
            }}
          />
        </Source>

        {/* Tactical Grid Overlay (Local) */}
        {gridData && (
          <Source id="tactical-grid" type="geojson" data={gridData}>
            <Layer
              id="grid-lines"
              type="line"
              paint={{
                'line-color': 'rgba(10, 10, 10, 0.3)',
                'line-width': 1,
                'line-dasharray': [2, 2],
              }}
            />
          </Source>
        )}

        {/* Radar Circle - Outer Ring */}
        {circleData && (
          <Source id="radar-circle" type="geojson" data={circleData}>
            <Layer
              id="radar-fill"
              type="fill"
              paint={{
                'fill-color': 'rgba(255, 59, 59, 0.08)',
              }}
            />
            <Layer
              id="radar-stroke-outer"
              type="line"
              paint={{
                'line-color': 'rgba(255, 59, 59, 0.6)',
                'line-width': 2,
              }}
            />
          </Source>
        )}

        {/* Radar Circle - Inner Ring (50% radius) */}
        {circleData && center && (
          <Source
            id="radar-inner"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [createCircleGeoJSON(center, radius / 2)],
            }}
          >
            <Layer
              id="radar-inner-stroke"
              type="line"
              paint={{
                'line-color': 'rgba(255, 59, 59, 0.3)',
                'line-width': 1,
                'line-dasharray': [4, 4],
              }}
            />
          </Source>
        )}

        {/* Center Point Marker */}
        {center && (
          <Marker longitude={center.lng} latitude={center.lat} anchor="center">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-accent-red border-2 border-white animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-accent-red animate-ping opacity-75" />
            </div>
          </Marker>
        )}

        {/* Lead Markers - Tactical Style */}
        {leads.map((lead) => (
          <Marker
            key={lead.id}
            longitude={lead.lng}
            latitude={lead.lat}
            anchor="center"
          >
            <div
              className="relative cursor-pointer group"
              onMouseEnter={() => setHoveredLead(lead)}
              onMouseLeave={() => setHoveredLead(null)}
            >
              {/* Outer Ring */}
              <div
                className={`absolute inset-0 w-6 h-6 rounded-full border-2 transition-all ${
                  hoveredLead?.id === lead.id
                    ? 'border-accent-red animate-pulse'
                    : 'border-sleek-black/50'
                }`}
                style={{
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                }}
              />
              {/* Inner Dot */}
              <div
                className={`w-3 h-3 rounded-full transition-all ${
                  lead.score > 80
                    ? 'bg-accent-red glow-red'
                    : lead.score > 60
                    ? 'bg-yellow-500'
                    : 'bg-sleek-black'
                }`}
                style={{
                  boxShadow:
                    hoveredLead?.id === lead.id
                      ? '0 0 12px rgba(255, 59, 59, 1), 0 0 24px rgba(255, 59, 59, 0.6)'
                      : '0 0 6px rgba(10, 10, 10, 0.6), 0 0 12px rgba(10, 10, 10, 0.3)',
                }}
              />
              {/* Score Label (appears on hover) */}
              {hoveredLead?.id === lead.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg-card/95 border border-accent-red rounded text-xs text-white whitespace-nowrap z-20">
                  <div className="font-bold">{lead.score}</div>
                  <div className="text-[10px] text-text-secondary">{lead.nombre}</div>
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Tactical Grid Overlay (CSS) - Enhanced */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(10, 10, 10, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 10, 10, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Additional overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none z-9"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 6, 10, 0.3) 100%)',
        }}
      />

      {/* Radar Sweep Animation */}
      {isScanning && center && (
        <>
          {/* Multiple expanding rings */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute pointer-events-none z-10 rounded-full border-2 border-accent-red"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                animation: `radar-sweep 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.6 - i * 0.2,
              }}
            />
          ))}
          {/* Scanning line */}
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: '50%',
              top: '50%',
              width: '2px',
              height: '200px',
              background: 'linear-gradient(to bottom, transparent, rgba(255, 59, 59, 0.8), transparent)',
              transformOrigin: 'center',
              animation: 'spin-slow 2s linear infinite',
            }}
          />
        </>
      )}

      {/* Top HUD - Coordinates & Info */}
      <div className="absolute top-4 left-4 bg-bg-card/95 backdrop-blur-sm border border-sleek-black/50 rounded-lg p-3 font-mono text-xs z-20">
        <div className="space-y-1">
          <div className="text-text-secondary uppercase tracking-wider text-[10px] mb-2">World Grid</div>
          <div className="text-text-secondary">
            Coords: <span className="text-white font-bold">{coordinates}</span>
          </div>
          {worldInfo && (
            <>
              <div className="text-text-secondary">
                Region: <span className="text-white">{worldInfo.region}</span>
              </div>
              <div className="text-text-secondary">
                Hemisphere: <span className="text-white">{worldInfo.hemisphere}</span>
              </div>
            </>
          )}
          <div className="text-text-secondary">
            Zoom: <span className="text-white">{viewState.zoom.toFixed(1)}x</span>
          </div>
          <div className="text-text-secondary">
            Bearing: <span className="text-white">{Math.round(viewState.bearing)}°</span>
          </div>
        </div>
      </div>

      {/* Bottom HUD - Mission Data */}
      <div className="absolute bottom-4 left-4 bg-bg-card/95 backdrop-blur-sm border border-accent-red/50 rounded-lg p-3 font-mono text-xs z-20">
        <div className="space-y-1">
          <div className="text-accent-red uppercase tracking-wider text-[10px] mb-2">Mission Status</div>
          <div className="text-text-secondary">
            Targets: <span className="text-accent-red font-bold">{leads.length}</span>
          </div>
          <div className="text-text-secondary">
            Radius: <span className="text-white">{radius} km</span>
          </div>
          <div className="text-text-secondary">
            Location: <span className="text-white">{location || 'N/A'}</span>
          </div>
          {isScanning && (
            <div className="mt-2 pt-2 border-t border-accent-red/30">
              <div className="text-accent-red animate-pulse">● SCANNING ACTIVE</div>
            </div>
          )}
        </div>
      </div>

      {/* Right HUD - Lead Stats */}
      {leads.length > 0 && (
        <div className="absolute top-4 right-4 bg-bg-card/95 backdrop-blur-sm border border-border-dark rounded-lg p-3 font-mono text-xs z-20">
          <div className="space-y-1">
            <div className="text-text-secondary uppercase tracking-wider text-[10px] mb-2">Target Analysis</div>
            <div className="text-text-secondary">
              High Value: <span className="text-accent-red font-bold">
                {leads.filter((l) => l.score > 80).length}
              </span>
            </div>
            <div className="text-text-secondary">
              Medium: <span className="text-yellow-400 font-bold">
                {leads.filter((l) => l.score > 60 && l.score <= 80).length}
              </span>
            </div>
            <div className="text-text-secondary">
              Low: <span className="text-text-secondary font-bold">
                {leads.filter((l) => l.score <= 60).length}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-border-dark">
              <div className="text-text-secondary text-[10px]">
                Avg Score: <span className="text-white font-bold">
                  {Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corner Indicators */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-sleek-black/50 z-20" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-sleek-black/50 z-20" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-sleek-black/50 z-20" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-sleek-black/50 z-20" />

      {/* Error Message */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-card/95 z-30">
          <div className="bg-bg-card-alt border border-accent-red rounded-lg p-4 max-w-md">
            <div className="text-accent-red font-bold mb-2">Error de Mapa</div>
            <div className="text-text-secondary text-sm">{mapError}</div>
            <div className="text-text-secondary text-xs mt-2">
              Configura NEXT_PUBLIC_MAPBOX_TOKEN en tu archivo .env.local
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

