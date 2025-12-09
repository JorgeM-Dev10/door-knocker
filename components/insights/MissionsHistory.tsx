'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCampaigns } from '@/lib/api/campaigns';
import type { Campaign } from '@/lib/types/campaigns';
import { CampaignStatusEnum } from '@/lib/types/campaign_status';

export default function MissionsHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CampaignStatusEnum.ACTIVE:
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case CampaignStatusEnum.PAUSED:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case CampaignStatusEnum.COMPLETED:
        return 'bg-sleek-black/20 text-text-secondary border-sleek-black/50';
      default:
        return 'bg-text-secondary/20 text-text-secondary border-text-secondary/50';
    }
  };

  const loadCampaigns = useCallback(async (page: number, append: boolean = false) => {
    if (isLoading || (!hasMore && append)) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCampaigns({ page });
      
      if (response.campaigns.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Verificar si hay más páginas
      const totalPages = Math.ceil(response.total / response.limit);
      setHasMore(page < totalPages);

      if (append) {
        setCampaigns(prev => [...prev, ...response.campaigns]);
      } else {
        setCampaigns(response.campaigns);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Error al cargar las campañas');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Cargar campañas iniciales
  useEffect(() => {
    loadCampaigns(1, false);
  }, []);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadCampaigns(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, currentPage, loadCampaigns]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-4 font-display">
        Campaigns History
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {campaigns.length === 0 && !isLoading ? (
          <div className="text-text-secondary/50 text-sm text-center py-8">
            No hay campañas disponibles
          </div>
        ) : (
          <>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-3 bg-gradient-to-r from-sleek-black-light to-sleek-black rounded border border-border-dark/50 hover:border-accent-red/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-1">
                      {campaign.name}
                    </div>
                    <div className="text-xs text-text-secondary mb-2">
                      {campaign.description}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-text-secondary">Industria:</span>
                    <div className="text-white font-semibold">{campaign.industry_target}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Max Contacts:</span>
                    <div className="text-accent-red font-bold">{campaign.max_contacts}</div>
                  </div>
                </div>

                <div className="text-xs mb-1">
                  <span className="text-text-secondary">Ubicación:</span>
                  <div className="text-white">{campaign.address_target}</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-text-secondary">
                    {formatDate(campaign.created_at)}
                  </div>
                  <div className="text-text-secondary">
                    Queries: {campaign.max_queries}
                  </div>
                </div>
              </div>
            ))}

            {/* Observer target para scroll infinito */}
            <div ref={observerTarget} className="h-4 flex items-center justify-center">
              {isLoading && (
                <div className="flex items-center gap-2 text-text-secondary text-xs">
                  <div className="w-4 h-4 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando más campañas...</span>
                </div>
              )}
              {!hasMore && campaigns.length > 0 && (
                <div className="text-text-secondary/50 text-xs text-center py-2">
                  No hay más campañas
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


