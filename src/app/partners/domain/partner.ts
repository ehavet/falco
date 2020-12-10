import { Quote } from '../../quotes/domain/quote'
import { OperationCode } from '../../common-api/domain/operation-code'

export interface Partner {
    code: string,
    trigram: string
    translationKey: string
    callbackUrl: string
    customerSupportEmail: string
    questions: Array<Partner.Question>
    offer: Partner.Offer
}

export namespace Partner {

    export type Question = Question.RoomCountQuestion | Question.RoommateQuestion

    export interface Offer {
        pricingMatrix: Map<RoomCount, Quote.Insurance.Estimate>
        simplifiedCovers: Array<Quote.Insurance.SimplifiedCover>
        productCode: string
        productVersion: string,
        contractualTerms: string,
        ipid: string,
        operationCodes: Array<OperationCode>
    }

    export type RoomCount = number
}

export namespace Partner.Question {
    export interface RoomCountQuestion {
        code: QuestionCode,
        options: ListOptions<RoomCount>,
        manageOtherCases: boolean
    }

    export interface RoommateQuestion {
        code: QuestionCode,
        applicable: boolean,
        maximumNumbers?: Array<MaximumNumberOfRoommates>
    }

    export interface MaximumNumberOfRoommates {
        roomCount: number,
        value: number
    }

    export enum QuestionCode {
        RoomCount = 'RoomCount',
        Roommate = 'Roommate',
        PropertyType = 'PropertyType',
        Occupancy = 'Occupancy'
    }

    export interface ListOptions<T> {
        list: Array<T>,
    }

}
