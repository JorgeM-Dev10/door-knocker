

import type { CampaignStatus } from "./campaign_status.ts";

export interface Campaign {
    id: number;
    name: string;
    language: string;
    // aqui solo pidele a la IA que genere una descripcion de lo que se desea lograr con la campa;a.
    // y asi
    description: string;
    // aqui un objetivo de la campa;a, se usa para generar las queries. Y el mensaje inicial.
    objective: string;
    // aqui un poco de contexto previo del negocio del cliente, y tambien de lo que se desea mejorar o 
    // cosas del caht
    company_context: string;
    // industria deseada en la que se desea buscar.
    industry_target: string;
    retargeting_enabled: boolean;
    // la ubicacion de busqueda que el cliente desea.
    address_target: string;
    max_contacts: number;
    max_queries: number;
    created_at: Date;
    updated_at: Date;
    status: CampaignStatus;
}
export interface CreateCampaignDto {
    name: string;
    // obviously i will get the description from the ai assistant
    description: string;
    // this will be provided to the user
    company_context: string;
    // aqui el objetivo de la campa;a, se usa para generar las queries. Y el mensaje inicial.
    objective: string;
    // aqui la ubicacion de busqueda que el cliente desea.
    address_target: string;
    // industria deseada en la que se desea buscar.
    industry_target: string;
    max_contacts: number;
    max_queries: number;
    retargeting_enabled: boolean;
    language: string;
}


