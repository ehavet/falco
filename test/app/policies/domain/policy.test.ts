import { expect } from '../../../test-utils'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'

describe('Policies - Domain', () => {
  describe('#createPolicy', () => {
    describe('should generate an id', () => {
      const quote: Quote = createQuote()
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })

      it('which is a string with 12 characters', () => {
        // When
        const createdPolicy: Policy = Policy.createPolicy(createPolicyCommand, quote)

        // Then
        expect(createdPolicy.id).to.be.a.string
        expect(createdPolicy.id).to.have.lengthOf(12)
      })

      it('with three first characters are uppercase letters from partner code', () => {
        // When
        const createdPolicy: Policy = Policy.createPolicy(createPolicyCommand, quote)

        // Then
        const idPrefix: string = createdPolicy.id.substring(0, 3)
        expect(idPrefix).to.equal('MYP')
      })

      it('with 9 last characters are random numbers', () => {
        // When
        const createdPolicy: Policy = Policy.createPolicy(createPolicyCommand, quote)

        // Then
        const idSuffix: string = createdPolicy.id.substring(3, 12)
        expect(idSuffix).to.match(/^[1-9]{9}/)
      })
    })
  })
})
