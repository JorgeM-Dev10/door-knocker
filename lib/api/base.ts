/**
 * https://doorknocker-api.ranon-rat.work/
 */

import { authStorage } from "../storage";

const baseUrl = 'https://doorknocker-api.ranon-rat.work';

function getBaseURL(): string {
    return baseUrl;
}

enum StatusCodes {
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
}


/**
 * Base API function that automatically uses the API key stored in localStorage
 * The API key can be set manually in localStorage using authStorage.Set()
 * 
 * @param endpoint - API endpoint (e.g., '/campaigns', '/contacts')
 * @param method - HTTP method ('GET', 'POST', 'PUT', 'DELETE')
 * @param body - Optional request body (will be JSON stringified)
 * @returns Promise with the response data
 */
export async function BaseAPI<T>(endpoint: string, method: string, body?: any): Promise<T> {
    // Obtener API key del localStorage si está disponible
    const token = authStorage.Get() || "";
    
    // Preparar headers - el backend espera 'Authorization' no 'API_KEY'
    const headers = new Headers();
    if (token) {
        headers.append('Authorization', token);
    }
    headers.append('Content-Type', 'application/json');
    
    // Debug: verificar que el header se está configurando
    console.log('🔑 Authorization desde localStorage:', token ? `${token.substring(0, 4)}...` : 'VACÍO');
    console.log('📍 Endpoint:', getBaseURL() + endpoint);
    console.log('📤 Método:', method);
    console.log('📋 Headers configurados:', {
        'Authorization': token ? `${token.substring(0, 4)}...` : 'VACÍO',
        'Content-Type': 'application/json'
    });
    
    const response = await fetch(getBaseURL() + endpoint, {
        headers: headers,
        method,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        if (response.status === StatusCodes.UNAUTHORIZED) {
            console.error("💥 Unauthorized - API key inválido o faltante");
        }
        if (response.status === StatusCodes.FORBIDDEN) {
            console.log("💥 Forbidden", response.json());
        }
        if (response.status === StatusCodes.NOT_FOUND) {
            console.log("💥 Not Found", response.json());
        }
    }

    return response.json() as Promise<T>;
}