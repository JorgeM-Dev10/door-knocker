

export interface SearchQuery {
    id: number;
    query: string;
    created_at: Date;
    updated_at: Date;
    campaign_id: number;
}
export interface CreateSearchQueryDto {
    query: string;
    campaign_id: number;
}

