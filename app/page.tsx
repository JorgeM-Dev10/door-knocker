'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import MissionForm from '@/components/control/MissionForm';
import ConsoleLog from '@/components/control/ConsoleLog';
import MapPanel from '@/components/map/MapPanel';
import StatsPanel from '@/components/insights/StatsPanel';
import LeadList from '@/components/insights/LeadList';
import MissionsHistory from '@/components/insights/MissionsHistory';
import { generateLeads, geocodeLocation } from '@/lib/generateLeads';
import type { Lead } from '@/lib/generateLeads';
import type { Mission } from '@/lib/types';

export default function Home() {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [resultsCount, setResultsCount] = useState(50);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null);

  const addLog = (message: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [...prev, `[${time}] ${message}`]);
  };

  const launchScan = () => {
    if (!industry.trim() || !location.trim()) {
      return;
    }

    // Limpiar estado anterior
    setLogs([]);
    setLeads([]);
    setIsScanning(true);

    let generatedLeadsCount = 0;

    // Paso 1: Inicialización
    setTimeout(() => {
      addLog(`Inicializando escaneo en ${location}...`);
    }, 500);

    // Paso 2: Detección de industria
    setTimeout(() => {
      addLog(`Detectando patrones de: ${industry}`);
    }, 1000);

    // Paso 3: Geocodificación y generación de leads
    setTimeout(() => {
      const center = geocodeLocation(location);
      if (center) {
        setMapCenter(center);
        const generatedLeads = generateLeads(center, radius, resultsCount, industry);
        generatedLeadsCount = generatedLeads.length;
        setLeads(generatedLeads);
        addLog(`${generatedLeadsCount} posibles objetivos encontrados`);
      } else {
        addLog('Error: No se pudo geocodificar la ubicación');
      }
    }, 2000);

    // Paso 4: Finalización
    setTimeout(() => {
      addLog('Escaneo completado');
      setIsScanning(false);

      // Guardar misión
      const newMission: Mission = {
        id: `mission-${Date.now()}`,
        industria: industry,
        ubicacion: location,
        leadsCount: generatedLeadsCount || resultsCount,
        fecha: new Date(),
        timestamp: Date.now(),
      };
      setMissions((prev) => [...prev, newMission]);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Agent Label */}
      <div className="px-6 py-2 border-b border-border-dark">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-display">
          AGENT: PROSPECTION INTELLIGENCE MODULE
        </span>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Left Column - Control Panel */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            <MissionForm
              industry={industry}
              location={location}
              radius={radius}
              resultsCount={resultsCount}
              isScanning={isScanning}
              onIndustryChange={setIndustry}
              onLocationChange={setLocation}
              onRadiusChange={setRadius}
              onResultsCountChange={setResultsCount}
              onLaunchScan={launchScan}
            />
            <ConsoleLog logs={logs} />
          </div>

          {/* Center Column - Map */}
          <div className="lg:col-span-5 min-h-[500px]">
            <MapPanel
              center={mapCenter}
              radius={radius}
              leads={leads}
              isScanning={isScanning}
              location={location}
            />
          </div>

          {/* Right Column - Insights */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto">
            <StatsPanel leads={leads} />
            <LeadList leads={leads} onLeadHover={setHoveredLead} />
            <MissionsHistory missions={missions} />
          </div>
        </div>
      </main>
    </div>
  );
}

