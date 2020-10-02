import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { HttpServerForTesting, newProdLikeServer } from '../../../../utils/server.test-utils'
import { getStripePaymentIntentSucceededEvent } from '../../fixtures/payment/stripeEvent.fixture'
import { config, dateFaker, expect, sinon } from '../../../../test-utils'
import { container } from '../../../../../src/app/policies/policies.container'
import { ContractFsRepository } from '../../../../../src/app/policies/infrastructure/contract/contract-fs.repository'
import { SpecificTerms } from '../../../../../src/app/policies/domain/specific-terms/specific-terms'
import { ContractGenerator } from '../../../../../src/app/policies/domain/contract/contract.generator'
import { ContractPdfGenerator } from '../../../../../src/app/policies/infrastructure/contract/contract-pdf.generator'
import { SpecificTermsGenerator } from '../../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTermsPdfGenerator } from '../../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { PaymentSqlModel } from '../../../../../src/app/policies/infrastructure/payment/payment-sql.model'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'

async function resetDb () {
  await PaymentSqlModel.destroy({ truncate: true })
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

const now = new Date('2034-06-05T00:00:00Z')

describe('PaymentProcessor - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    dateFaker.setCurrentDate(now)
    httpServer = await newProdLikeServer()
  })

  after(async () => {
    await resetDb()
  })

  describe('POST /internal/v0/payment-processor/event-handler/', async () => {
    let policyRepository: PolicyRepository
    let policyId: string

    before(async function () {
      // Given
      this.timeout(10000)
      policyRepository = new PolicySqlRepository()
      const contractGenerator: ContractGenerator = new ContractPdfGenerator()
      const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator()
      const contractRepository = new ContractFsRepository(config)

      policyId = 'APP463109486'
      const policy: Policy = createPolicyFixture(
        {
          id: policyId,
          partnerCode: 'demo-student',
          subscriptionDate: undefined,
          paymentDate: undefined,
          status: Policy.Status.Initiated
        }
      )
      await policyRepository.save(policy)

      const specificTerms: SpecificTerms = await specificTermsGenerator.generate(policy)
      const contract = await contractGenerator.generate(policy.id, policy.insurance.productCode, specificTerms)
      await contractRepository.saveSignedContract(contract)

      const stripeHeaderSignature = 'srt1p3s1gN4tUR3'
      const event = getStripePaymentIntentSucceededEvent({
        object: 'event',
        data: {
          object: {
            metadata: { policy_id: policyId }
          }
        }
      })
      sinon.stub(container.PaymentEventAuthenticator, 'parse')
        .withArgs(JSON.stringify(event), stripeHeaderSignature).resolves(event)

      const paymentsInDb: PaymentSqlModel[] = await PaymentSqlModel.findAll()
      expect(paymentsInDb).to.have.lengthOf(0)

      // When
      await httpServer.api()
        .post('/internal/v0/payment-processor/event-handler/')
        .set('stripe-signature', stripeHeaderSignature)
        .send(event)
    })

    it('should update policy', async () => {
      // Then
      const retrievedPolicy: Policy = await policyRepository.get(policyId)
      expect(retrievedPolicy.paymentDate).to.deep.equal(now)
      expect(retrievedPolicy.subscriptionDate).to.deep.equal(now)
      expect(retrievedPolicy.status).to.be.equal(Policy.Status.Applicable)
    })

    it('should save the payment', async () => {
      // Then
      const paymentsInDb: PaymentSqlModel[] = await PaymentSqlModel.findAll()
      expect(paymentsInDb).to.have.lengthOf(1)
    })
  })
})
