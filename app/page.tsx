'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import MissionForm from '@/components/control/MissionForm';
import ConsoleLog from '@/components/control/ConsoleLog';
import MapPanel from '@/components/map/MapPanel';
import StatsPanel from '@/components/insights/StatsPanel';
import LeadList from '@/components/insights/LeadList';
import MissionsHistory from '@/components/insights/MissionsHistory';
import EditLeadModal from '@/components/insights/EditLeadModal';
import AIChat from '@/components/chat/AIChat';
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
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Cargar leads desde la base de datos al iniciar
  useEffect(() => {
    loadLeads();
    loadMissions();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      if (response.ok) {
        setLeads(data);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      const data = await response.json();
      if (response.ok) {
        setMissions(data);
      }
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  };

  const saveLeadsToDB = async (leadsToSave: Lead[]) => {
    try {
      await Promise.all(
        leadsToSave.map((lead) =>
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
          })
        )
      );
      await loadLeads(); // Recargar desde DB
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  };

  const handleEditLead = async (lead: Lead) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (response.ok) {
        await loadLeads();
        setEditingLead(null);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

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
    setTimeout(async () => {
      const center = geocodeLocation(location);
      if (center) {
        setMapCenter(center);
        const generatedLeads = generateLeads(center, radius, resultsCount, industry);
        generatedLeadsCount = generatedLeads.length;
        setLeads(generatedLeads);
        addLog(`${generatedLeadsCount} posibles objetivos encontrados`);
        
        // Guardar leads en la base de datos
        await saveLeadsToDB(generatedLeads);
        addLog('Leads guardados en la base de datos');
      } else {
        addLog('Error: No se pudo geocodificar la ubicación');
      }
    }, 2000);

    // Paso 4: Finalización
    setTimeout(() => {
      addLog('Escaneo completado');
      setIsScanning(false);

      // Guardar misión en la base de datos
      setTimeout(async () => {
        try {
          const response = await fetch('/api/missions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industria: industry,
              ubicacion: location,
              leadsCount: generatedLeadsCount || resultsCount,
            }),
          });
          if (response.ok) {
            await loadMissions();
          }
        } catch (error) {
          console.error('Error saving mission:', error);
        }
      }, 100);
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
            <LeadList 
              leads={leads} 
              onLeadHover={setHoveredLead}
              onEdit={setEditingLead}
              onDelete={handleDeleteLead}
            />
            <AIChat leads={leads} selectedLeadIds={selectedLeadIds} />
            <MissionsHistory missions={missions} />
          </div>
        </div>
      </main>

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={editingLead}
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSave={handleEditLead}
      />
    </div>
  );
}

