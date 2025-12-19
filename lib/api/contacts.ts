import { BaseAPI } from "./base";
import type { Contact, ContactSearchResult, UpdateContactDto } from "../types/contacts";

/**
 * Response interface for GET /contacts and GET /contacts/campaign/:campaign_id
 */
export interface GetContactsResponse {
    contacts: ContactSearchResult[];
    page: number;
    limit: number;
    has_more: boolean;
}

/**
 * Response interface for PUT /contacts
 */
export interface UpdateContactResponse {
    message: string;
}

/**
 * Query parameters for GET /contacts and GET /contacts/campaign/:campaign_id
 */
export interface GetContactsParams {
    search?: string;
    page?: number;
}

/**
 * GET /contacts
 * Obtiene la lista de contactos con opciones de búsqueda y paginación
 * 
 * @param params - Parámetros opcionales de búsqueda y paginación
 * @returns Lista de contactos con información de paginación
 */
export async function getContacts(params?: GetContactsParams): Promise<GetContactsResponse> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    if (params?.page) {
        queryParams.append('page', params.page.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;
    
    return BaseAPI<GetContactsResponse>(endpoint, 'GET');
}

/**
 * GET /contacts/campaign/:campaign_id
 * Obtiene los contactos asociados a una campaña específica
 * 
 * @param campaignId - ID de la campaña
 * @param params - Parámetros opcionales de búsqueda y paginación
 * @returns Lista de contactos de la campaña con información de paginación
 */
export async function getContactsByCampaign(
    campaignId: number,
    params?: GetContactsParams
): Promise<GetContactsResponse> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    if (params?.page) {
        queryParams.append('page', params.page.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/contacts/campaign/${campaignId}${queryString ? `?${queryString}` : ''}`;
    
    return BaseAPI<GetContactsResponse>(endpoint, 'GET');
}

/**
 * GET /contacts/:contact_id
 * Obtiene los detalles de un contacto específico
 * 
 * @param contactId - ID del contacto
 * @returns Objeto Contact con todos los detalles
 */
export async function getContactById(contactId: number): Promise<Contact> {
    return BaseAPI<Contact>(`/contacts/${contactId}`, 'GET');
}

/**
 * PUT /contacts
 * Actualiza un contacto existente
 * 
 * @param contactData - Datos del contacto a actualizar (debe incluir el id)
 * @returns Mensaje de confirmación
 */
export async function updateContact(contactData: UpdateContactDto): Promise<UpdateContactResponse> {
    return BaseAPI<UpdateContactResponse>('/contacts', 'PUT', contactData);
}



