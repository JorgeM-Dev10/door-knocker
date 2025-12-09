export enum DoorKnockerEventsEnum {
    START_CAMPAIGN= "start_campaign",
    QUERIES_GENERATED= "queries_generated",
    NEW_CONTACT= "new_contact",
    SENDING_MESSAGE= "sending_message",
    PAUSED_CAMPAIGN= "paused_campaign",
    RESUMED_CAMPAIGN= "resumed_campaign",
    COMPLETED_CAMPAIGN= "completed_campaign",

}
export interface DoorKnockerEvent {
    campaign_id: number;
    event: DoorKnockerEventsEnum;
    data: any;


}