'use client';

import { useState } from 'react';
import type { Lead } from '@/lib/generateLeads';

interface LeadListProps {
  leads: Lead[];
  onLeadHover?: (lead: Lead | null) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
}

export default function LeadList({ leads, onLeadHover, onEdit, onDelete }: LeadListProps) {
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  const getStatusColor = (estado: Lead['estado']) => {
    switch (estado) {
      case 'Nuevo':
        return 'bg-sleek-black/20 text-text-secondary border-sleek-black/50';
      case 'Pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Calificado':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-text-secondary/20 text-text-secondary border-text-secondary/50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-sleek-black via-bg-card to-sleek-black-light rounded-lg border border-border-dark/50 p-4 sm:p-6 shadow-lg">
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
              className={`p-3 bg-gradient-to-r from-sleek-black-light to-sleek-black rounded border border-border-dark/50 transition-all cursor-pointer ${
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
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${getStatusColor(
                      lead.estado
                    )}`}
                  >
                    {lead.estado}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(lead);
                    }}
                    className="p-1.5 text-text-secondary hover:text-white hover:bg-accent-red/20 rounded transition-all"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('¿Estás seguro de eliminar este lead?')) {
                        onDelete?.(lead.id);
                      }
                    }}
                    className="p-1.5 text-text-secondary hover:text-accent-red hover:bg-accent-red/20 rounded transition-all"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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

