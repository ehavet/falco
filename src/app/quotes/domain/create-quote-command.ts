export interface CreateQuoteCommand {
    partnerCode: string,
    risk: {
        property: {
            roomCount: number
        }
    }
}
