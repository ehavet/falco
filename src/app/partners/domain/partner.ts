export interface Partner {
    code: string,
    translationKey: string
    questions: Array<Question>
}

export type Question = RoomCountQuestion

export enum QuestionCode {
    RoomCount = 'RoomCount'
}

export interface RoomCountQuestion {
    code: QuestionCode.RoomCount,
    options: ListOptions<number>,
    required: boolean,
}

export interface ListOptions<T> {
    list: Array<T>,
}
