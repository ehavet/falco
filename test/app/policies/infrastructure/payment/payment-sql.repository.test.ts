import { dbTestUtils, expect } from '../../../../test-utils'
import { PaymentRepository } from '../../../../../src/app/policies/domain/payment/payment.repository'
import { PaymentSqlRepository } from '../../../../../src/app/policies/infrastructure/payment/payment-sql.repository'
import { Payment } from '../../../../../src/app/policies/domain/payment/payment'
import { PaymentSqlModel } from '../../../../../src/app/policies/infrastructure/payment/payment-sql.model'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { before } from 'mocha'
import { createPaymentFixture } from '../../fixtures/payment/payment.fixture'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { PaymentPolicySqlModel } from '../../../../../src/app/policies/infrastructure/payment/payment-policy-sql.model'

async function resetDb () {
  await PaymentSqlModel.destroy({ truncate: true, cascade: true })
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

describe('Payments - Infra - Payment SQL Repository', async () => {
  const paymentRepository: PaymentRepository = new PaymentSqlRepository()
  const policyRepository: PolicyRepository = new PolicySqlRepository()

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  afterEach(async () => {
    await resetDb()
  })

  describe('#save', async () => {
    let paymentToSave : Payment
    let savedPayment: Payment
    let savedPolicy: Policy

    before(async () => {
      // Given
      const policy = createPolicyFixture()
      savedPolicy = await policyRepository.save(policy)

      paymentToSave = createPaymentFixture({ policyId: policy.id })

      // When
      savedPayment = await paymentRepository.save(paymentToSave)
    })

    it('should save the payment into the db', async () => {
      // Then
      const paymentsInDb: PaymentSqlModel[] = await PaymentSqlModel.findAll()
      expect(paymentsInDb).to.have.lengthOf(1)
      const paymentFromDb = paymentsInDb[0]
      expect(paymentFromDb.id).to.exist
      expect(paymentFromDb.amount).to.equal(paymentToSave.amount)
      expect(paymentFromDb.currency).to.equal(paymentToSave.currency)
      expect(paymentFromDb.processor).to.equal(paymentToSave.processor)
      expect(paymentFromDb.instrument).to.equal(paymentToSave.instrument)
      expect(paymentFromDb.externalId).to.equal(paymentToSave.externalId)
      expect(paymentFromDb.pspFee).to.equal(paymentToSave.pspFee)
      expect(paymentFromDb.status).to.equal(paymentToSave.status)
      expect(paymentFromDb.payedAt).to.deep.equal(paymentToSave.payedAt)
      expect(paymentFromDb.cancelledAt).to.deep.equal(paymentToSave.cancelledAt)

      const paymentsPolicyInDb: PaymentPolicySqlModel[] = await PaymentPolicySqlModel.findAll()
      expect(paymentsPolicyInDb).to.have.lengthOf(1)
      const paymentPolicyInDb = paymentsPolicyInDb[0]
      expect(paymentPolicyInDb.id).to.exist
      expect(paymentPolicyInDb.policyId).to.equal(savedPolicy.id)
      expect(paymentPolicyInDb.paymentId).to.equal(paymentFromDb.id)
    })

    it('should return the saved payment', async () => {
      // Then
      expect(savedPayment.id).to.exist
      expect(savedPayment.amount).to.equal(paymentToSave.amount)
      expect(savedPayment.currency).to.equal(paymentToSave.currency)
      expect(savedPayment.processor).to.equal(paymentToSave.processor)
      expect(savedPayment.instrument).to.equal(paymentToSave.instrument)
      expect(savedPayment.externalId).to.equal(paymentToSave.externalId)
      expect(savedPayment.pspFee).to.equal(paymentToSave.pspFee)
      expect(savedPayment.status).to.equal(paymentToSave.status)
      expect(savedPayment.payedAt).to.deep.equal(paymentToSave.payedAt)
      expect(savedPayment.policyId).to.equal(paymentToSave.policyId)
    })
  })
})
