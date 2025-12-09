'use client';

import { useState, useEffect } from 'react';
import { Folder, FolderPlus, GripVertical, X, Edit2, Trash2 } from 'lucide-react';
import type { Lead } from '@/lib/generateLeads';

interface Folder {
  id: string;
  nombre: string;
  color?: string;
  leads: Lead[];
}

interface LeadsManagerProps {
  leads: Lead[];
  onLeadHover?: (lead: Lead | null) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onLeadsUpdate?: () => void;
}

export default function LeadsManager({
  leads,
  onLeadHover,
  onEdit,
  onDelete,
  onLeadsUpdate,
}: LeadsManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, [leads]);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      if (response.ok) {
        // Organizar leads por carpeta
        const foldersWithLeads = data.map((folder: Folder) => ({
          ...folder,
          leads: leads.filter((lead: any) => lead.folderId === folder.id),
        }));
        // Agregar carpeta "Sin carpeta" para leads sin folder
        const unassignedLeads = leads.filter((lead: any) => !lead.folderId);
        setFolders([
          ...foldersWithLeads,
          { id: 'unassigned', nombre: 'Sin carpeta', leads: unassignedLeads },
        ]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newFolderName }),
      });

      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolder(false);
        await loadFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (folderId === 'unassigned') return;

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFolders();
        if (onLeadsUpdate) onLeadsUpdate();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const moveLeadsToFolder = async (leadIds: string[], folderId: string | null) => {
    try {
      await Promise.all(
        leadIds.map((leadId) =>
          fetch(`/api/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId }),
          })
        )
      );
      await loadFolders();
      setSelectedLeads([]);
      if (onLeadsUpdate) onLeadsUpdate();
    } catch (error) {
      console.error('Error moving leads:', error);
    }
  };

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (draggedLead) {
      const targetFolderId = folderId === 'unassigned' ? null : folderId;
      moveLeadsToFolder([draggedLead.id], targetFolderId);
      setDraggedLead(null);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const selectAllInFolder = (folderLeads: Lead[]) => {
    const allSelected = folderLeads.every((lead) => selectedLeads.includes(lead.id));
    if (allSelected) {
      setSelectedLeads((prev) => prev.filter((id) => !folderLeads.some((l) => l.id === id)));
    } else {
      setSelectedLeads((prev) => [...prev, ...folderLeads.map((l) => l.id)]);
    }
  };

  return (
    <div className="h-full space-y-4">
      {/* Header con botón crear carpeta */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-white font-display">
          Lead List
        </h2>
        <button
          onClick={() => setShowCreateFolder(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark/50 rounded text-text-secondary hover:text-white hover:border-accent-red/50 transition-all duration-300"
        >
          <FolderPlus size={16} />
          <span className="text-xs uppercase">Nueva Carpeta</span>
        </button>
      </div>

      {/* Modal crear carpeta */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-sleek-black via-bg-card to-sleek-black-light border border-border-dark/50 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white font-display">
                Nueva Carpeta
              </h3>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="text-text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta..."
              className="w-full px-4 py-2.5 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark/50 rounded text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createFolder}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-red to-accent-red-light text-white font-bold uppercase tracking-wider rounded hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark/50 text-text-secondary rounded hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads seleccionados - acciones */}
      {selectedLeads.length > 0 && (
        <div className="bg-gradient-to-r from-accent-red/10 to-transparent border border-accent-red/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} seleccionado{selectedLeads.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  const folderId = e.target.value === 'unassigned' ? null : e.target.value;
                  moveLeadsToFolder(selectedLeads, folderId);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark/50 rounded text-white text-xs focus:outline-none focus:border-accent-red/50"
              >
                <option value="">Mover a...</option>
                {folders
                  .filter((f) => f.id !== 'unassigned')
                  .map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.nombre}
                    </option>
                  ))}
                <option value="unassigned">Sin carpeta</option>
              </select>
              <button
                onClick={() => setSelectedLeads([])}
                className="px-3 py-1.5 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark/50 rounded text-text-secondary hover:text-white transition-all text-xs"
              >
                Deseleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de carpetas */}
      <div className="space-y-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="bg-gradient-to-br from-sleek-black-light to-sleek-black rounded-lg border border-border-dark/50 p-4"
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDrop={(e) => handleDrop(e, folder.id)}
          >
            {/* Header de carpeta */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-accent-red" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  {folder.nombre}
                </h3>
                <span className="text-xs text-text-secondary/70">
                  ({folder.leads.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {folder.id !== 'unassigned' && (
                  <>
                    <button
                      onClick={() => selectAllInFolder(folder.leads)}
                      className="text-xs text-text-secondary hover:text-white transition-colors"
                    >
                      {folder.leads.every((lead) => selectedLeads.includes(lead.id))
                        ? 'Deseleccionar'
                        : 'Seleccionar todos'}
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="text-text-secondary hover:text-accent-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Leads en la carpeta */}
            <div className="space-y-2">
              {folder.leads.length === 0 ? (
                <div className="text-text-secondary/50 text-xs text-center py-4">
                  No hay leads en esta carpeta
                </div>
              ) : (
                folder.leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                    className={`p-3 bg-gradient-to-r from-sleek-black to-sleek-black-light rounded border transition-all duration-300 cursor-move hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/10 hover:scale-[1.01] ${
                      selectedLeads.includes(lead.id)
                        ? 'border-accent-red/50 bg-accent-red/10'
                        : 'border-border-dark/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <GripVertical
                        size={16}
                        className="text-text-secondary/50 mt-1 cursor-grab active:cursor-grabbing"
                      />
                      <div className="flex-1 min-w-0" onClick={() => onLeadHover?.(lead)}>
                        <div className="text-sm font-semibold text-white truncate mb-1">
                          {lead.nombre}
                        </div>
                        <div className="text-xs text-text-secondary truncate mb-2">
                          {lead.direccion}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary">{lead.industria}</span>
                          <span className="text-xs text-accent-red font-semibold">
                            Score: {lead.score}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(lead)}
                            className="p-1.5 text-text-secondary hover:text-white transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(lead.id)}
                            className="p-1.5 text-text-secondary hover:text-accent-red transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



