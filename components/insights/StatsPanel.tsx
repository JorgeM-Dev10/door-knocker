'use client';

import type { Lead } from '@/lib/generateLeads';

interface StatsPanelProps {
  leads: Lead[];
}

export default function StatsPanel({ leads }: StatsPanelProps) {
  const totalLeads = leads.length;
  const highScoreLeads = leads.filter((lead) => lead.score > 80).length;
  const highScorePercentage = totalLeads > 0 ? Math.round((highScoreLeads / totalLeads) * 100) : 0;

  // Distribución de scores para el gráfico
  const scoreRanges = [
    { label: '90-100', count: leads.filter((l) => l.score >= 90).length },
    { label: '80-89', count: leads.filter((l) => l.score >= 80 && l.score < 90).length },
    { label: '70-79', count: leads.filter((l) => l.score >= 70 && l.score < 80).length },
    { label: '60-69', count: leads.filter((l) => l.score >= 60 && l.score < 70).length },
    { label: '0-59', count: leads.filter((l) => l.score < 60).length },
  ];

  const maxCount = Math.max(...scoreRanges.map((r) => r.count), 1);

  return (
    <div className="bg-bg-card rounded-lg border border-border-dark p-6">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-6 font-display">
        Scan Overview
      </h2>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card-alt rounded border border-border-dark p-4">
            <div className="text-xs uppercase tracking-wider text-text-secondary mb-1">
              Total Leads
            </div>
            <div className="text-2xl font-bold text-accent-red">{totalLeads}</div>
          </div>
          <div className="bg-bg-card-alt rounded border border-border-dark p-4">
            <div className="text-xs uppercase tracking-wider text-text-secondary mb-1">
              High Score
            </div>
            <div className="text-2xl font-bold text-text-secondary">{highScorePercentage}%</div>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div>
          <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
            Score Distribution
          </div>
          <div className="space-y-2">
            {scoreRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-xs text-text-secondary w-12">{range.label}</div>
                <div className="flex-1 h-4 bg-bg-card-alt rounded-full overflow-hidden border border-border-dark">
                  <div
                    className="h-full bg-gradient-to-r from-accent-red to-accent-red-light transition-all duration-500"
                    style={{ width: `${(range.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-white w-8 text-right">{range.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

