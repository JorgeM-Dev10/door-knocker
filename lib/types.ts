export interface Mission {
  id: string;
  industria: string;
  ubicacion: string;
  leadsCount: number;
  fecha: Date;
  timestamp: number;
}

export interface ScanState {
  industry: string;
  location: string;
  radius: number;
  resultsCount: number;
  isScanning: boolean;
  logs: string[];
  leads: import('./generateLeads').Lead[];
  missions: Mission[];
  mapCenter: { lat: number; lng: number } | null;
}

