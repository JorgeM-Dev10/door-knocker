import { BaseAPI } from "./base";
import type { Campaign, CreateCampaignDto } from "../types/campaigns";

/**
 * Response interface for GET /campaigns
 */
export interface GetCampaignsResponse {
    campaigns: Campaign[];
    page: number;
    total: number;
    limit: number;
}

/**
 * Response interface for POST /campaigns
 */
export interface CreateCampaignResponse {
    message: string;
}

/**
 * Response interface for pause/resume operations
 */
export interface CampaignActionResponse {
    message: string;
}

/**
 * Query parameters for GET /campaigns
 */
export interface GetCampaignsParams {
    search?: string;
    page?: number;
}

/**
 * GET /campaigns
 * Obtiene la lista de campañas con opciones de búsqueda y paginación
 * 
 * @param params - Parámetros opcionales de búsqueda y paginación
 * @returns Lista de campañas con información de paginación
 */
export async function getCampaigns(params?: GetCampaignsParams): Promise<GetCampaignsResponse> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    if (params?.page) {
        queryParams.append('page', params.page.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/campaigns${queryString ? `?${queryString}` : ''}`;
    
    return BaseAPI<GetCampaignsResponse>(endpoint, 'GET');
}

/**
 * POST /campaigns
 * Crea una nueva campaña
 * 
 * @param campaignData - Datos de la campaña a crear
 * @returns Mensaje de confirmación
 */
export async function createCampaign(campaignData: CreateCampaignDto): Promise<CreateCampaignResponse> {
    return BaseAPI<CreateCampaignResponse>('/campaigns', 'POST', campaignData);
}

/**
 * GET /campaigns/:campaign_id
 * Obtiene los detalles de una campaña específica
 * 
 * @param campaignId - ID de la campaña
 * @returns Objeto Campaign con todos los detalles
 */
export async function getCampaignById(campaignId: number): Promise<Campaign> {
    return BaseAPI<Campaign>(`/campaigns/${campaignId}`, 'GET');
}

/**
 * POST /campaigns/:campaign_id/pause
 * Pausa una campaña activa
 * 
 * @param campaignId - ID de la campaña a pausar
 * @returns Mensaje de confirmación
 */
export async function pauseCampaign(campaignId: number): Promise<CampaignActionResponse> {
    return BaseAPI<CampaignActionResponse>(`/campaigns/${campaignId}/pause`, 'POST');
}

/**
 * POST /campaigns/:campaign_id/resume
 * Reanuda una campaña pausada
 * 
 * @param campaignId - ID de la campaña a reanudar
 * @returns Mensaje de confirmación
 */
export async function resumeCampaign(campaignId: number): Promise<CampaignActionResponse> {
    return BaseAPI<CampaignActionResponse>(`/campaigns/${campaignId}/resume`, 'POST');
}



