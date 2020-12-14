import currency from 'currency.js'
const currentLibrary = currency

export type Amount = number

export namespace Amount {
  const DEFAULT_PRECISION = 2

  export function toAmount (value: string | number): Amount {
    return currentLibrary(value, { precision: DEFAULT_PRECISION }).value
  }

  export function multiply (firstNumber: number, secondNumber: number): Amount {
    return currentLibrary(firstNumber).multiply(secondNumber).value
  }

  export function divide (numerator: number, denominator: number): Amount {
    return currentLibrary(numerator).divide(denominator).value
  }
}
