import { expect, sinon } from '../../../test-utils'
import { CreatePaymentIntentForPolicy } from '../../../../src/app/policies/domain/create-payment-intent-for-policy.usecase'
import { PaymentIntentQuery } from '../../../../src/app/policies/domain/payment-intent-query'
import { PaymentIntent } from '../../../../src/app/policies/domain/payment-intent'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { createPolicyFixture } from '../fixtures/policy.fixture'

describe('Usecase - Create payment intent for policy', async () => {
  it('should return a payment intent id when policy id is passed as arguments', async () => {
    // GIVEN
    const paymentIntentQuery: PaymentIntentQuery = {
      policyId: 'APP463109486'
    }
    const policy = createPolicyFixture({ id: 'APP463109486', premium: 24.50 })
    const paymentIntent = {
      id: 'pi_P4yM3nt1nT3nT1d',
      amount: 2450,
      currency: 'eur'
    }

    const policyRepository = { get: sinon.mock(), save: sinon.stub(), isIdAvailable: sinon.stub(), setEmailValidationDate: sinon.stub(), updateAfterPayment: sinon.mock() }
    const paymentProcessor = { createIntent: sinon.mock() }

    policyRepository.get.withArgs('APP463109486').resolves(policy)
    paymentProcessor.createIntent.withArgs('APP463109486', 2450, 'EUR').resolves(paymentIntent)

    const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
            CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)
    // WHEN
    const response: PaymentIntent = await createPaymentIntentForPolicy(paymentIntentQuery)
    // THEN
    expect(response).to.deep.equal({
      id: 'pi_P4yM3nt1nT3nT1d',
      amount: 24.50,
      currency: 'eur'
    })
  })

  it('should throw PolicyNotFoundError when policy id does not exist', async () => {
    // GIVEN
    const paymentIntentQuery: PaymentIntentQuery = {
      policyId: 'unexistingP0l1cy1d'
    }
    const paymentProcessor = { createIntent: sinon.stub }
    const policyRepository = { get: sinon.mock(), save: sinon.stub(), isIdAvailable: sinon.stub(), setEmailValidationDate: sinon.stub(), updateAfterPayment: sinon.mock() }
    policyRepository.get.withArgs('unexistingP0l1cy1d').throws(new PolicyNotFoundError(paymentIntentQuery.policyId))
    const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
        CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)
    // WHEN
    await expect(createPaymentIntentForPolicy(paymentIntentQuery))
    // THEN
      .to.be.rejectedWith(PolicyNotFoundError)
  })
})
