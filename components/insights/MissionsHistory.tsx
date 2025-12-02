'use client';

import type { Mission } from '@/lib/types';

interface MissionsHistoryProps {
  missions: Mission[];
}

export default function MissionsHistory({ missions }: MissionsHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const recentMissions = missions.slice(-3).reverse();

  return (
    <div className="h-full">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-4 font-display">
        Last Missions
      </h2>

      {recentMissions.length === 0 ? (
        <div className="text-text-secondary/50 text-sm text-center py-4">
          No hay misiones anteriores
        </div>
      ) : (
        <div className="space-y-3">
          {recentMissions.map((mission) => (
            <div
              key={mission.id}
              className="p-3 bg-gradient-to-r from-sleek-black-light to-sleek-black rounded border border-border-dark/50"
            >
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-text-secondary">Industria:</span>
                  <div className="text-white font-semibold">{mission.industria}</div>
                </div>
                <div>
                  <span className="text-text-secondary">Leads:</span>
                  <div className="text-accent-red font-bold">{mission.leadsCount}</div>
                </div>
              </div>
              <div className="text-xs mb-1">
                <span className="text-text-secondary">Ubicación:</span>
                <div className="text-white">{mission.ubicacion}</div>
              </div>
              <div className="text-xs text-text-secondary">
                {formatDate(mission.fecha)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


