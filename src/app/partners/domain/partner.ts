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
        | Question.PropertyTypeQuestion

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

    export type NextStepType = QuestionCode | NextStepAction

    export type Option<T> = {
        value: T,
        nextStep?: NextStepType
    }

    export enum PropertyType {
        FLAT = 'FLAT',
        HOUSE = 'HOUSE'
    }

    export interface RoomCountQuestion {
        code: QuestionCode.RoomCount,
        options: Array<Option<number>>,
        toAsk: boolean,
        defaultValue: number,
        defaultNextStep: NextStepType
    }

    export interface RoommateQuestion {
        code: QuestionCode.Roommate,
        applicable: boolean,
        maximumNumbers?: Array<MaximumNumberOfRoommates>
    }

    export interface AddressQuestion {
        code: QuestionCode.Address,
        toAsk: boolean,
        defaultNextStep: NextStepType
    }

    export interface PropertyTypeQuestion {
        code: QuestionCode.PropertyType,
        toAsk: boolean,
        options: Array<Option<PropertyType>>,
        defaultValue: PropertyType,
        defaultNextStep: NextStepType
    }

    export interface MaximumNumberOfRoommates {
        roomCount: number
        value: number
    }

    export enum QuestionCode {
        Address = 'address',
        RoomCount = 'room_count',
        Roommate = 'roommate',
        PropertyType = 'property_type'
    }

    export enum NextStepAction {
        SUBMIT='SUBMIT',
        REJECT='REJECT'
    }
}
