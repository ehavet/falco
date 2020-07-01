export interface GetQuoteQuery {
    partnerCode: string,
    risk: {
        property: {
            roomCount: number
        }
    }
}
