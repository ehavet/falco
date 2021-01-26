import { Cover } from '../cover'
import { AmountWithFiveDecimal } from '../../../common-api/domain/amount/amount'

export interface CoverMonthlyPrice {
    price: AmountWithFiveDecimal
    cover: Cover
}
