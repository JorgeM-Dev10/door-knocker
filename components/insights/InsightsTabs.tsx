'use client';

import { useState } from 'react';
import StatsPanel from './StatsPanel';
import LeadList from './LeadList';
import AIChat from '@/components/chat/AIChat';
import MissionsHistory from './MissionsHistory';
import type { Lead } from '@/lib/generateLeads';
import type { Mission } from '@/lib/types';

interface InsightsTabsProps {
  leads: Lead[];
  missions: Mission[];
  selectedLeadIds: string[];
  onLeadHover: (lead: Lead | null) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

type TabType = 'overview' | 'leads' | 'ai' | 'missions';

export default function InsightsTabs({
  leads,
  missions,
  selectedLeadIds,
  onLeadHover,
  onEdit,
  onDelete,
}: InsightsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '🎯' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'missions', label: 'Missions', icon: '📋' },
  ];

  return (
    <div className="bg-gradient-to-br from-sleek-black via-bg-card to-sleek-black-light rounded-lg border border-border-dark/50 shadow-lg h-full flex flex-col">
      {/* Tabs Navigation */}
      <div className="flex border-b border-border-dark/50 bg-gradient-to-r from-sleek-black to-sleek-black-light">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 relative group ${
              activeTab === tab.id
                ? 'text-accent-red border-b-2 border-accent-red bg-gradient-to-b from-sleek-black-light to-transparent'
                : 'text-text-secondary/70 hover:text-text-secondary hover:bg-sleek-black-light/50'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-red to-transparent opacity-50"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-b from-sleek-black/50 to-transparent">
        {activeTab === 'overview' && <StatsPanel leads={leads} />}
        {activeTab === 'leads' && (
          <LeadList
            leads={leads}
            onLeadHover={onLeadHover}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        {activeTab === 'ai' && (
          <div className="h-full">
            <AIChat leads={leads} selectedLeadIds={selectedLeadIds} />
          </div>
        )}
        {activeTab === 'missions' && <MissionsHistory missions={missions} />}
      </div>
    </div>
  );
}

