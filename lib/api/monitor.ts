import { authStorage } from "../storage";
import type { DoorKnockerEvent } from "../types/monitor";
import { DoorKnockerEventsEnum } from "../types/monitor";
import type { Campaign } from "../types/campaigns";
import type { CreateContactDto } from "../types/contacts";

const baseUrl = 'https://visually-nearby-kitten.ngrok-free.app';

/**
 * Parámetros para la conexión SSE del monitor
 * Nota: Los query params son opcionales e informativos; el backend no filtra.
 * El filtrado se hace en el cliente.
 */
export interface MonitorParams {
    campaign_id?: number; // Opcional - solo informativo, el filtrado se hace en cliente
    event?: DoorKnockerEventsEnum; // Opcional - solo informativo, el filtrado se hace en cliente
}

/**
 * Opciones de filtrado en el cliente
 */
export interface ClientFilterOptions {
    campaign_id?: number; // Filtrar eventos por campaign_id
    event?: DoorKnockerEventsEnum; // Filtrar eventos por tipo
}

/**
 * Tipos específicos de datos según el tipo de evento
 */
export interface StartCampaignEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.START_CAMPAIGN;
    data: Campaign;
}

export interface QueriesGeneratedEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.QUERIES_GENERATED;
    data: string[];
}

export interface NewContactEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.NEW_CONTACT;
    data: CreateContactDto;
}

export interface PausedCampaignEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.PAUSED_CAMPAIGN;
    data: null;
}

export interface ResumedCampaignEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.RESUMED_CAMPAIGN;
    data: null;
}

export interface CompletedCampaignEvent extends DoorKnockerEvent {
    event: DoorKnockerEventsEnum.COMPLETED_CAMPAIGN;
    data: null;
}

/**
 * Callback para manejar eventos recibidos
 */
export type EventCallback = (event: DoorKnockerEvent) => void;

/**
 * Callback para manejar errores
 */
export type ErrorCallback = (error: Error) => void;

/**
 * Interfaz para controlar la conexión SSE
 */
export interface MonitorConnection {
    /**
     * Cierra la conexión SSE
     */
    close: () => void;
    
    /**
     * Verifica si la conexión está activa
     */
    isActive: () => boolean;
}

/**
 * GET /monitor - Server-Sent Events (SSE)
 * Escucha eventos del sistema DoorKnocker
 * 
 * Nota: El backend actualmente no filtra por campaign_id ni event.
 * Recibirás todos los eventos y el filtrado se hace en el cliente.
 * 
 * @param params - Parámetros opcionales (solo informativos, no afectan el stream)
 * @param onEvent - Callback que se ejecuta cuando se recibe un evento
 * @param onError - Callback opcional para manejar errores
 * @param filterOptions - Opciones de filtrado en el cliente (opcional)
 * @returns Objeto con métodos para controlar la conexión
 * 
 * @example
 * ```typescript
 * // Escuchar todos los eventos
 * const connection = monitorEvents(
 *   {},
 *   (event) => {
 *     console.log('Evento recibido:', event);
 *   }
 * );
 * 
 * // Escuchar solo eventos de una campaña específica
 * const connection2 = monitorEvents(
 *   {},
 *   (event) => {
 *     console.log('Evento de campaña 123:', event);
 *   },
 *   undefined,
 *   { campaign_id: 123 }
 * );
 * 
 * // Escuchar solo eventos de tipo NEW_CONTACT
 * const connection3 = monitorEvents(
 *   {},
 *   (event) => {
 *     console.log('Nuevo contacto:', event.data);
 *   },
 *   undefined,
 *   { event: DoorKnockerEventsEnum.NEW_CONTACT }
 * );
 * 
 * // Cerrar conexión cuando sea necesario
 * connection.close();
 * ```
 */
export function monitorEvents(
    params: MonitorParams = {},
    onEvent: EventCallback,
    onError?: ErrorCallback,
    filterOptions?: ClientFilterOptions
): MonitorConnection {
    // Construir query string (solo informativo, el backend no filtra)
    const queryParams = new URLSearchParams();
    if (params.campaign_id !== undefined) {
        queryParams.append('campaign_id', params.campaign_id.toString());
    }
    if (params.event) {
        queryParams.append('event', params.event);
    }
    
    const queryString = queryParams.toString();
    const url = `${baseUrl}/monitor${queryString ? `?${queryString}` : ''}`;
    
    const token = authStorage.Get() || "";
    let isActive = true;
    let abortController: AbortController | null = null;
    
    // Usar fetch con streaming para poder enviar headers custom
    // (EventSource nativo no permite headers custom)
    const startStream = async () => {
        try {
            abortController = new AbortController();
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                    'Authorization': token, // El backend espera 'Authorization' no 'API_KEY'
                },
                signal: abortController.signal,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            if (!response.body) {
                throw new Error('Response body is null');
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (isActive) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // Decodificar el chunk y agregar al buffer
                buffer += decoder.decode(value, { stream: true });
                
                // Procesar líneas completas (SSE termina con \n\n)
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Mantener la línea incompleta en el buffer
                
                let currentEvent: Partial<DoorKnockerEvent> = {};
                let eventData = '';
                
                for (const line of lines) {
                    if (line.trim() === '') {
                        // Línea vacía indica fin de evento
                        if (eventData) {
                            try {
                                // El payload completo es: { campaign_id, event, data }
                                const parsedData = JSON.parse(eventData);
                                
                                // Verificar que tenga la estructura esperada
                                if (parsedData && typeof parsedData === 'object' && 'campaign_id' in parsedData && 'event' in parsedData) {
                                    const event: DoorKnockerEvent = {
                                        campaign_id: parsedData.campaign_id,
                                        event: parsedData.event,
                                        data: parsedData.data,
                                    };
                                    
                                    // Aplicar filtros del cliente si están definidos
                                    let shouldEmit = true;
                                    
                                    if (filterOptions) {
                                        if (filterOptions.campaign_id !== undefined && 
                                            event.campaign_id !== filterOptions.campaign_id) {
                                            shouldEmit = false;
                                        }
                                        
                                        if (filterOptions.event !== undefined && 
                                            event.event !== filterOptions.event) {
                                            shouldEmit = false;
                                        }
                                    }
                                    
                                    if (shouldEmit) {
                                        onEvent(event);
                                    }
                                } else {
                                    // Formato alternativo: solo data, usar valores por defecto
                                    const event: DoorKnockerEvent = {
                                        campaign_id: currentEvent.campaign_id || filterOptions?.campaign_id || 0,
                                        event: currentEvent.event || filterOptions?.event || '' as DoorKnockerEventsEnum,
                                        data: parsedData,
                                    };
                                    
                                    let shouldEmit = true;
                                    if (filterOptions) {
                                        if (filterOptions.campaign_id !== undefined && 
                                            event.campaign_id !== filterOptions.campaign_id) {
                                            shouldEmit = false;
                                        }
                                        if (filterOptions.event !== undefined && 
                                            event.event !== filterOptions.event) {
                                            shouldEmit = false;
                                        }
                                    }
                                    
                                    if (shouldEmit) {
                                        onEvent(event);
                                    }
                                }
                            } catch (parseError) {
                                console.error('Error parsing event data:', parseError, 'Raw data:', eventData);
                            }
                        }
                        currentEvent = {};
                        eventData = '';
                        continue;
                    }
                    
                    // Parsear formato SSE: "field: value"
                    const colonIndex = line.indexOf(':');
                    if (colonIndex === -1) continue;
                    
                    const field = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    
                    if (field === 'event') {
                        currentEvent.event = value as DoorKnockerEventsEnum;
                    } else if (field === 'data') {
                        // Acumular data (puede venir en múltiples líneas)
                        eventData += (eventData ? '\n' : '') + value;
                    } else if (field === 'id') {
                        // Opcional: manejar event ID si es necesario
                    } else if (field === 'retry') {
                        // Opcional: manejar retry si es necesario
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Conexión cerrada intencionalmente, no es un error
                return;
            }
            
            const errorMessage = error instanceof Error ? error : new Error('Unknown error');
            if (onError) {
                onError(errorMessage);
            } else {
                console.error('Monitor stream error:', errorMessage);
            }
        } finally {
            isActive = false;
        }
    };
    
    // Iniciar el stream
    startStream();
    
    // Retornar objeto de control
    return {
        close: () => {
            isActive = false;
            if (abortController) {
                abortController.abort();
            }
        },
        isActive: () => isActive,
    };
}

/**
 * Versión simplificada que retorna una Promise que se resuelve con la conexión
 * Útil para usar con async/await
 */
export function createMonitorConnection(
    params: MonitorParams = {},
    onEvent: EventCallback,
    onError?: ErrorCallback,
    filterOptions?: ClientFilterOptions
): Promise<MonitorConnection> {
    return new Promise((resolve) => {
        const connection = monitorEvents(params, onEvent, onError, filterOptions);
        resolve(connection);
    });
}

/**
 * Helper para verificar el tipo de evento y hacer type narrowing
 */
export function isStartCampaignEvent(event: DoorKnockerEvent): event is StartCampaignEvent {
    return event.event === DoorKnockerEventsEnum.START_CAMPAIGN;
}

export function isQueriesGeneratedEvent(event: DoorKnockerEvent): event is QueriesGeneratedEvent {
    return event.event === DoorKnockerEventsEnum.QUERIES_GENERATED;
}

export function isNewContactEvent(event: DoorKnockerEvent): event is NewContactEvent {
    return event.event === DoorKnockerEventsEnum.NEW_CONTACT;
}

export function isPausedCampaignEvent(event: DoorKnockerEvent): event is PausedCampaignEvent {
    return event.event === DoorKnockerEventsEnum.PAUSED_CAMPAIGN;
}

export function isResumedCampaignEvent(event: DoorKnockerEvent): event is ResumedCampaignEvent {
    return event.event === DoorKnockerEventsEnum.RESUMED_CAMPAIGN;
}

export function isCompletedCampaignEvent(event: DoorKnockerEvent): event is CompletedCampaignEvent {
    return event.event === DoorKnockerEventsEnum.COMPLETED_CAMPAIGN;
}

