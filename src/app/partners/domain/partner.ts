import { Quote } from '../../quotes/domain/quote'
import { OperationCode } from '../../common-api/domain/operation-code'

export interface Partner {
    code: string,
    trigram: string
    translationKey: string
    callbackUrl: string
    customerSupportEmail: string
    firstQuestion: Partner.Question.QuestionCode
    questions: Array<Partner.Question>
    offer: Partner.Offer
}

export namespace Partner {

    export type Question = Question.RoomCountQuestion | Question.RoommateQuestion | Question.AddressQuestion

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
    export type ValueType = string | number

    export type NextStepType = QuestionCode | NextStepAction

    export type Option = {
        value: ValueType,
        nextStep?: NextStepType
    }

    export interface RoomCountQuestion {
        code: QuestionCode,
        options: Array<Option>,
        toAsk: boolean,
        defaultValue: ValueType,
        defaultNextStep: NextStepType
    }

    export interface RoommateQuestion {
        code: QuestionCode,
        applicable: boolean,
        maximumNumbers?: Array<MaximumNumberOfRoommates>
    }

    export interface AddressQuestion {
        code: QuestionCode,
        toAsk: boolean,
        defaultNextStep: NextStepType
    }

    export interface MaximumNumberOfRoommates {
        roomCount: number
        value: number
    }

    export enum QuestionCode {
        Address = 'Address',
        RoomCount = 'RoomCount',
        Roommate = 'Roommate'
    }

    export enum NextStepAction {
        SUBMIT='SUBMIT',
        REJECT='REJECT'
    }
}
