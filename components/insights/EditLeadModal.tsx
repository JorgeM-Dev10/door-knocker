'use client';

import { useState, useEffect } from 'react';
import type { Lead } from '@/lib/generateLeads';

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export default function EditLeadModal({ lead, isOpen, onClose, onSave }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        nombre: lead.nombre,
        industria: lead.industria,
        direccion: lead.direccion,
        score: lead.score,
        estado: lead.estado,
        email: lead.email || '',
        telefono: lead.telefono || '',
        notas: lead.notas || '',
      });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...lead, ...formData } as Lead);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border-dark rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-4 font-display">
          Editar Lead
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Industria
            </label>
            <input
              type="text"
              value={formData.industria || ''}
              onChange={(e) => setFormData({ ...formData, industria: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion || ''}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
                Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score || 0}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
                Estado
              </label>
              <select
                value={formData.estado || 'Nuevo'}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as Lead['estado'] })}
                className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Calificado">Calificado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono || ''}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Notas
            </label>
            <textarea
              value={formData.notas || ''}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-bg-card-alt border border-border-dark text-text-secondary rounded hover:bg-bg-card transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-accent-red text-white font-bold uppercase tracking-wider rounded glow-red hover:glow-red-strong transition-all font-display"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

