import { Cover } from '../cover'
import { AmountWithFiveDecimal } from '../../../common-api/domain/amount/amount'

export interface CoverMonthlyPriceTaxRepartition {
    priceExclTax: AmountWithFiveDecimal
    priceTax: AmountWithFiveDecimal
    cover: Cover
}
