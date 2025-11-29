'use client';

import { useState } from 'react';
import type { Lead } from '@/lib/generateLeads';

interface LeadListProps {
  leads: Lead[];
  onLeadHover?: (lead: Lead | null) => void;
}

export default function LeadList({ leads, onLeadHover }: LeadListProps) {
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  const getStatusColor = (estado: Lead['estado']) => {
    switch (estado) {
      case 'Nuevo':
        return 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50';
      case 'Pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Calificado':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-text-secondary/20 text-text-secondary border-text-secondary/50';
    }
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border-dark p-6">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-4 font-display">
        Lead List
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {leads.length === 0 ? (
          <div className="text-text-secondary/50 text-sm text-center py-8">
            No hay leads disponibles
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              onMouseEnter={() => {
                setHoveredLeadId(lead.id);
                onLeadHover?.(lead);
              }}
              onMouseLeave={() => {
                setHoveredLeadId(null);
                onLeadHover?.(null);
              }}
              className={`p-3 bg-bg-card-alt rounded border transition-all cursor-pointer ${
                hoveredLeadId === lead.id
                  ? 'border-accent-red/50 glow-red'
                  : 'border-border-dark'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate mb-1">
                    {lead.nombre}
                  </div>
                  <div className="text-xs text-text-secondary truncate">{lead.direccion}</div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${getStatusColor(
                    lead.estado
                  )}`}
                >
                  {lead.estado}
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Score</span>
                  <span className="text-xs font-bold text-white">{lead.score}</span>
                </div>
                <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-red to-accent-red-light transition-all duration-300"
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 text-xs text-text-secondary">
                {lead.industria}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

