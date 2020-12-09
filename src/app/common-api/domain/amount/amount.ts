import currency from 'currency.js'
export type Amount = number

export const SQL_DEFAULT_SCALE = 6
export const SQL_DEFAULT_PRECISION = 14
export const DEFAULT_PRECISION = 2

export function toAmount (value: string | number): Amount {
  return currency(value, { precision: DEFAULT_PRECISION }).value
}
