import { Quote } from '../../quotes/domain/quote'
import { OperationCode } from '../../pricing/domain/operation-code'

export interface Partner {
    code: string,
    translationKey: string
    callbackUrl: string
    questions: Array<Partner.Question>
    offer?: Partner.Offer
}

export namespace Partner {

    export type Question = Question.RoomCountQuestion

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
        code: QuestionCode.RoomCount,
        options: ListOptions<RoomCount>,
        required: boolean,
    }

    export enum QuestionCode {
        RoomCount = 'RoomCount'
    }

    export interface ListOptions<T> {
        list: Array<T>,
    }

}
