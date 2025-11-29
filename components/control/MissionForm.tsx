'use client';

import { useState } from 'react';

interface MissionFormProps {
  industry: string;
  location: string;
  radius: number;
  resultsCount: number;
  isScanning: boolean;
  onIndustryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRadiusChange: (value: number) => void;
  onResultsCountChange: (value: number) => void;
  onLaunchScan: () => void;
}

export default function MissionForm({
  industry,
  location,
  radius,
  resultsCount,
  isScanning,
  onIndustryChange,
  onLocationChange,
  onRadiusChange,
  onResultsCountChange,
  onLaunchScan,
}: MissionFormProps) {
  return (
    <div className="bg-bg-card rounded-lg border border-border-dark p-6">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-6 font-display">
        Mission Parameters
      </h2>

      <div className="space-y-5">
        {/* Industry Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Industria
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
            placeholder="Ej: restaurantes, dentistas..."
            disabled={isScanning}
            className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all disabled:opacity-50"
          />
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Ej: Monterrey, Nuevo León"
            disabled={isScanning}
            className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all disabled:opacity-50"
          />
        </div>

        {/* Radius Slider */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Radio: {radius} km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            disabled={isScanning}
            className="w-full h-2 bg-bg-card-alt rounded-lg appearance-none cursor-pointer accent-accent-red disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #ff3b3b 0%, #ff3b3b ${(radius / 50) * 100}%, #1b1f2a ${(radius / 50) * 100}%, #1b1f2a 100%)`,
            }}
          />
        </div>

        {/* Results Count Select */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Nº de Prospectos
          </label>
          <select
            value={resultsCount}
            onChange={(e) => onResultsCountChange(Number(e.target.value))}
            disabled={isScanning}
            className="w-full px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all disabled:opacity-50"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
        </div>

        {/* Launch Button */}
        <button
          onClick={onLaunchScan}
          disabled={isScanning || !industry.trim() || !location.trim()}
          className="w-full py-3.5 bg-accent-red text-white font-bold uppercase tracking-wider rounded-lg glow-red hover:glow-red-strong transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] font-display"
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              SCANNING...
            </span>
          ) : (
            'LAUNCH SCAN'
          )}
        </button>
      </div>
    </div>
  );
}

