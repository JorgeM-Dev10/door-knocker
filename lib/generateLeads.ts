export interface Lead {
  id: string;
  nombre: string;
  industria: string;
  direccion: string;
  lat: number;
  lng: number;
  score: number;
  estado: 'Nuevo' | 'Pendiente' | 'Calificado';
}

interface CenterPoint {
  lat: number;
  lng: number;
}

/**
 * Genera un punto aleatorio dentro de un radio dado desde un centro
 */
function generateRandomPoint(center: CenterPoint, radiusKm: number): { lat: number; lng: number } {
  // Conversión aproximada: 1 grado de latitud ≈ 111 km
  const radiusInDegrees = radiusKm / 111;
  
  // Generar ángulo aleatorio
  const angle = Math.random() * 2 * Math.PI;
  
  // Generar distancia aleatoria (distribución uniforme dentro del círculo)
  const distance = Math.random() * radiusInDegrees;
  
  // Ajustar por cos(lat) para longitud
  const latOffset = distance * Math.cos(angle);
  const lngOffset = (distance * Math.sin(angle)) / Math.cos(center.lat * Math.PI / 180);
  
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
  };
}

/**
 * Genera nombres fake para leads basados en la industria
 */
function generateLeadName(industria: string, index: number): string {
  const prefixes = ['Aurora', 'Nexus', 'Prime', 'Elite', 'Pro', 'Max', 'Ultra', 'Core', 'Apex', 'Vertex'];
  const suffixes = ['Center', 'Hub', 'Studio', 'Works', 'Lab', 'Group', 'Solutions', 'Services'];
  
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];
  const number = Math.floor(Math.random() * 50) + 1;
  
  return `${prefix} ${industria.charAt(0).toUpperCase() + industria.slice(1)} ${suffix} #${number}`;
}

/**
 * Genera direcciones fake
 */
function generateAddress(lat: number, lng: number): string {
  const streets = ['Av. Principal', 'Calle Reforma', 'Blvd. Industrial', 'Av. Tecnológica', 'Calle Comercial'];
  const numbers = Math.floor(Math.random() * 5000) + 100;
  const street = streets[Math.floor(Math.random() * streets.length)];
  
  return `${street} ${numbers}, Col. Centro`;
}

/**
 * Genera un array de leads mock dentro de un radio desde un centro
 */
export function generateLeads(
  center: CenterPoint,
  radiusKm: number,
  count: number,
  industria: string
): Lead[] {
  const leads: Lead[] = [];
  const estados: Lead['estado'][] = ['Nuevo', 'Pendiente', 'Calificado'];
  
  for (let i = 0; i < count; i++) {
    const point = generateRandomPoint(center, radiusKm);
    const score = Math.floor(Math.random() * 100);
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    leads.push({
      id: `lead-${Date.now()}-${i}`,
      nombre: generateLeadName(industria, i),
      industria,
      direccion: generateAddress(point.lat, point.lng),
      lat: point.lat,
      lng: point.lng,
      score,
      estado,
    });
  }
  
  // Ordenar por score descendente
  return leads.sort((a, b) => b.score - a.score);
}

/**
 * Geocodifica una ubicación (mock por ahora)
 * En producción, esto usaría la API de Mapbox
 */
export function geocodeLocation(location: string): CenterPoint | null {
  // Coordenadas mock para algunas ciudades comunes
  const mockLocations: Record<string, CenterPoint> = {
    'monterrey': { lat: 25.6866, lng: -100.3161 },
    'monterrey, nuevo león': { lat: 25.6866, lng: -100.3161 },
    'santa catarina': { lat: 25.6736, lng: -100.4583 },
    'san pedro garza garcía': { lat: 25.6667, lng: -100.4000 },
    'guadalajara': { lat: 20.6597, lng: -103.3496 },
    'ciudad de méxico': { lat: 19.4326, lng: -99.1332 },
    'méxico df': { lat: 19.4326, lng: -99.1332 },
  };
  
  const normalized = location.toLowerCase().trim();
  
  // Buscar coincidencia exacta o parcial
  for (const [key, coords] of Object.entries(mockLocations)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  
  // Si no hay coincidencia, usar coordenadas por defecto (Monterrey)
  return { lat: 25.6866, lng: -100.3161 };
}

