

export interface Contact {
    id: number;
    name: string;
    initial_message: string;
    context: string;
    campaign_id: number;
    email: string;
    phone: string;
    website: string;
    url_origin: string;
    notes: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    latitude: number;
    longitude: number;
    created_at: Date;
    updated_at: Date;
}
export interface ContactSearchResult {
    id: number;
    name: string;
    initial_message: string;
    context: string;
    campaign_id: number;
    email: string;
    phone: string;
    website: string;
    address: string;
    url_origin: string;

}
export interface CreateContactDto {
    name: string;
    initial_message: string;
    context: string;
    email: string;
    phone: string;
    website: string;
    notes: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    latitude: number;
    longitude: number;
    url_origin: string;

}

export interface UpdateContactDto {
    id: number;
    name: string;
    context: string;
    email: string;
    phone: string;
    website: string;
    notes: string;
}

