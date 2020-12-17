import { Amount } from '../../../../src/app/common-api/domain/amount/amount'
import { expect } from '../../../test-utils'

describe('Common-api - Domain - Amount', () => {
  describe('#convertCentsToEuro', () => {
    it('Should convert cents to euro', () => {
      const numberToConvert = 7200

      const convertedNumberInEuro = Amount.convertCentsToEuro(numberToConvert)

      expect(convertedNumberInEuro).to.be.equal(72)
    })

    it('Should convert cents with decimal number to euro', () => {
      const numberToConvert = 7234

      const convertedNumberInEuro = Amount.convertCentsToEuro(numberToConvert)

      expect(convertedNumberInEuro).to.be.equal(72.34)
    })
  })

  describe('#convertEuroToCents', () => {
    it('Should convert euro to cents', () => {
      const numberToConvert = 72

      const convertedNumberInCents = Amount.convertEuroToCents(numberToConvert)

      expect(convertedNumberInCents).to.be.equal(7200)
    })

    it('Should convert euro with decimal number to cents', () => {
      const numberToConvert = 72.34

      const convertedNumberInCents = Amount.convertEuroToCents(numberToConvert)

      expect(convertedNumberInCents).to.be.equal(7234)
    })
  })

  describe('#multiply', () => {
    it('Should multiply a non-decimal number', () => {
      const firstOperand = 6
      const secondOperand = 7

      const convertedResult = Amount.multiply(firstOperand, secondOperand)

      expect(convertedResult).to.be.equal(42)
    })

    it('Should multiply a decimal number', () => {
      const firstOperand = 0.1
      const secondOperand = 0.2

      const convertedResult = Amount.multiply(firstOperand, secondOperand)

      expect(convertedResult).to.be.equal(0.02)
    })
  })

  describe('#divide', () => {
    it('Should divide a non-decimal number', () => {
      const numerator = 100
      const denominator = 10

      const convertedResult = Amount.divide(numerator, denominator)

      expect(convertedResult).to.be.equal(10)
    })
  })
})
