export enum CampaignStatusEnum {
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed'
}


export type CampaignStatus = typeof CampaignStatusEnum[keyof typeof CampaignStatusEnum];
