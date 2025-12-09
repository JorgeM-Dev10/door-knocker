'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Layout/Header';
import MissionForm from '@/components/control/MissionForm';
import ConsoleLog from '@/components/control/ConsoleLog';
import MapPanel from '@/components/map/MapPanel';
import EditLeadModal from '@/components/insights/EditLeadModal';
import InsightsTabs from '@/components/insights/InsightsTabs';
import { generateLeads, geocodeLocation } from '@/lib/generateLeads';
import { authStorage } from '@/lib/storage';
import { canAccess } from '@/lib/api/auth';
import type { Lead } from '@/lib/generateLeads';
import type { Mission } from '@/lib/types';

export default function Home() {
  const router = useRouter();
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const apiKey = authStorage.Get();
      
      if (!apiKey) {
        router.push('/login');
        return;
      }

      try {
        const access = await canAccess(apiKey);
        if (!access.can_access) {
          authStorage.Remove();
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error verificando acceso:', error);
        authStorage.Remove();
        router.push('/login');
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  // Cargar leads desde la base de datos al iniciar (solo si está autenticado)
  useEffect(() => {
    if (!isCheckingAuth) {
      loadLeads();
      loadMissions();
    }
  }, [isCheckingAuth]);

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

  // Mostrar loading mientras se verifica autenticación
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sleek-black via-bg-primary to-sleek-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Agent Label */}
      <div className="px-4 sm:px-6 py-2 border-b border-border-dark/50 bg-gradient-to-r from-sleek-black/50 to-transparent">
        <span className="text-xs uppercase tracking-wider text-text-secondary font-display">
          AGENT: PROSPECTION INTELLIGENCE MODULE
        </span>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6 h-[calc(100vh-180px)]">
          {/* Left Column - Control Panel */}
          <div className="xl:col-span-3 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto">
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
          <div className="xl:col-span-5 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
            <MapPanel
              center={mapCenter}
              radius={radius}
              leads={leads}
              isScanning={isScanning}
              location={location}
            />
          </div>

          {/* Right Column - Insights */}
          <div className="xl:col-span-4 h-full">
            <InsightsTabs
              leads={leads}
              missions={missions}
              selectedLeadIds={selectedLeadIds}
              onLeadHover={setHoveredLead}
              onEdit={setEditingLead}
              onDelete={handleDeleteLead}
            />
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

