import { Quote } from '../../quotes/domain/quote'
import { OperationCode } from '../../common-api/domain/operation-code'
import { PropertyType } from '../../common-api/domain/type/property-type'
import { Occupancy } from '../../common-api/domain/type/occupancy'

export interface Partner {
    code: string,
    trigram: string
    translationKey: string
    callbackUrl: string
    customerSupportEmail: string
    firstQuestionToAsk: Partner.Question.QuestionCode
    questions: Array<Partner.Question>
    offer: Partner.Offer
}

export namespace Partner {

    export type Question = Question.RoomCountQuestion
        | Question.RoommateQuestion
        | Question.AddressQuestion
        | Question.OccupancyQuestion
        | Question.PropertyTypeQuestion

    export interface Offer {
        defaultDeductible: number | null
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

    export interface RoomCountQuestion {
        code: QuestionCode.ROOM_COUNT,
        options: Array<Option<number>>,
        toAsk: boolean,
        defaultValue: number,
        defaultNextStep: NextStepType
    }

    export interface OccupancyQuestion {
        code: QuestionCode.OCCUPANCY,
        options: Array<Option<Occupancy>>,
        toAsk: boolean,
        defaultValue: Occupancy,
        defaultNextStep: NextStepType
    }

    export interface RoommateQuestion {
        code: QuestionCode.ROOMMATE,
        applicable: boolean,
        maximumNumbers?: Array<MaximumNumberOfRoommates>
    }

    export interface AddressQuestion {
        code: QuestionCode.ADDRESS,
        toAsk: boolean,
        defaultNextStep: NextStepType
    }

    export interface PropertyTypeQuestion {
        code: QuestionCode.PROPERTY_TYPE,
        toAsk: boolean,
        options?: Array<Option<PropertyType>>,
        defaultValue: PropertyType,
        defaultNextStep: NextStepType
    }

    export interface MaximumNumberOfRoommates {
        roomCount: number
        value: number
    }

    export enum QuestionCode {
        ADDRESS = 'address',
        ROOM_COUNT = 'room_count',
        ROOMMATE = 'roommate',
        PROPERTY_TYPE = 'property_type',
        OCCUPANCY = 'occupancy'
    }

    export enum NextStepAction {
        SUBMIT='SUBMIT',
        REJECT='REJECT'
    }
}
