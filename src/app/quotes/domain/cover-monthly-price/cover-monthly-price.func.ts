import { CoverMonthlyPrice } from './cover-monthly-price'
import { Amount } from '../../../common-api/domain/amount/amount'

export function sumCoversMonthlyPrice (coverMonthlyPrices: Array<CoverMonthlyPrice>): Amount {
  const monthlyPrice = coverMonthlyPrices.reduce((monthlyPrice, coverMonthlyPrice) => {
    return Amount.add(coverMonthlyPrice.price, monthlyPrice, { precision: 5 })
  }, 0)

  return Amount.toAmount(monthlyPrice)
}
