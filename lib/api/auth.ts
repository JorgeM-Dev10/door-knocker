import { BaseAPI } from "./base";
import { authStorage } from "../storage";

const baseUrl = 'https://doorknocker-api.ranon-rat.work';

/**
 * Response interface for GET /can-access
 */
export interface CanAccessResponse {
    can_access: boolean;
    message?: string;
}

/**
 * GET /can-access
 * Verifica si el API key tiene acceso al sistema
 * 
 * @param apiKey - API key opcional. Si no se proporciona, usa el almacenado en authStorage
 * @returns Objeto con información sobre si el usuario tiene acceso
 * 
 * @example
 * ```typescript
 * // Usar API key almacenado
 * const access = await canAccess();
 * 
 * // Usar API key específico
 * const access = await canAccess('mi-api-key');
 * 
 * if (access.can_access) {
 *   console.log('Acceso permitido');
 * } else {
 *   console.log('Acceso denegado:', access.message);
 * }
 * ```
 */
export async function canAccess(apiKey?: string): Promise<CanAccessResponse> {
    const key = apiKey || authStorage.Get() || "";
    
    const response = await fetch(`${baseUrl}/can-access`, {
        method: 'GET',
        headers: {
            'Authorization': key, // El backend espera 'Authorization' no 'API_KEY'
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return {
            can_access: false,
            message: `Error: ${response.status} ${response.statusText}`,
        };
    }

    return response.json() as Promise<CanAccessResponse>;
}

