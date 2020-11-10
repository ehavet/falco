import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PolicySqlRepository } from '../../../../src/app/policies/infrastructure/policy-sql.repository'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { dbTestUtils, expect } from '../../../test-utils'
import { PolicySqlModel } from '../../../../src/app/policies/infrastructure/policy-sql.model'
import { PolicyRiskSqlModel } from '../../../../src/app/quotes/infrastructure/policy-risk-sql.model'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { OperationCode } from '../../../../src/app/policies/domain/operation-code'
import dayjs = require('dayjs');

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

describe('Policies - Infra - Policy SQL Repository', async () => {
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
    it('should save the policy into the db', async () => {
      // Given
      const policy: Policy = createPolicyFixture({ id: 'APP463109486' })

      // When
      await policyRepository.save(policy)

      // Then
      const result = await PolicySqlModel.findAll({
        include: [{ all: true }, { model: PolicyRiskSqlModel, include: [{ all: true }] }]
      })
      expect(result).to.have.lengthOf(1)
      const savedPolicy: PolicySqlModel = result[0]
      expect(savedPolicy.id).to.equal('APP463109486')
    })

    it('should return the created policy', async () => {
      // Given
      const expectedPolicy: Policy = createPolicyFixture(
        {
          startDate: new Date('2020-01-05T00:00:00Z'),
          termStartDate: new Date('2020-01-05T00:00:00Z'),
          termEndDate: new Date('2021-01-05T00:00:00Z')
        }
      )

      // When
      const createdPolicy: Policy = await policyRepository.save(expectedPolicy)

      // Then
      expect(createdPolicy).to.deep.equal(expectedPolicy)
    })
  }).timeout(10000)

  describe('#isIdAvailable', async () => {
    it('should return true is there is no policy in database with the same id', async () => {
      // Given
      const availableId: string = 'APP487539219'
      const policyInDb: Policy = createPolicyFixture()
      await policyRepository.save(policyInDb)
      // When
      const isIdAvailable: boolean = await policyRepository.isIdAvailable(availableId)
      // Then
      expect(isIdAvailable).to.be.true
    })

    it('should return false is there is a policy in database with the same id', async () => {
      // Given
      const nonAvailableId: string = 'APP487539219'
      const policyInDb: Policy = createPolicyFixture({ id: nonAvailableId })
      await policyRepository.save(policyInDb)
      // When
      const isIdAvailable: boolean = await policyRepository.isIdAvailable(nonAvailableId)
      // Then
      expect(isIdAvailable).to.be.false
    })
  }).timeout(10000)

  describe('#get', async () => {
    it('should return a Policy for a given existing id', async () => {
      // Given
      const policyId: string = 'APP463109486'
      const expectedPolicy: Policy = createPolicyFixture({
        id: policyId,
        startDate: new Date('2020-01-05T00:00:00Z'),
        termStartDate: new Date('2020-01-05T00:00:00Z'),
        termEndDate: new Date('2021-01-05T00:00:00Z')
      })

      await policyRepository.save(expectedPolicy)
      // When
      const result: Policy = await policyRepository.get(policyId)
      // Then
      expect(result).to.deep.equal(expectedPolicy)
    })

    it('should return a PolicyNotFoundError when unexisting id', async () => {
      // Given
      const unexistingPolicyID: string = 'UN3X1ST1NG1D'
      // When
      await expect(policyRepository.get(unexistingPolicyID))
      // Then
        .to.be.rejectedWith(PolicyNotFoundError)
    })
  }).timeout(10000)

  describe('#setEmailValidatedAt', async () => {
    it('should update the policy email validation date', async () => {
      // Given
      const emailValidationDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture({ emailValidationDate: undefined })
      await policyRepository.save(policyInDb)

      // When
      await policyRepository.setEmailValidatedAt(policyInDb.id, emailValidationDate)

      // Then
      const updatedPolicy: Policy = await policyRepository.get(policyInDb.id)
      expect(updatedPolicy.emailValidationDate).to.deep.equal(emailValidationDate)
    })

    it('should throw an error if the policy is not found', async () => {
      // Given
      const emailValidationDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture({ emailValidationDate: undefined })
      await policyRepository.save(policyInDb)

      // When
      const promise = policyRepository.setEmailValidatedAt('UNKNOWN_ID', emailValidationDate)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
    })
  }).timeout(10000)

  describe('#updateAfterPayment', async () => {
    it('should update policy payment date subscription date and status', async () => {
      // Given
      const currentDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture({ paymentDate: undefined, subscriptionDate: undefined })
      await policyRepository.save(policyInDb)

      // When
      await policyRepository
        .updateAfterPayment(policyInDb.id, currentDate, currentDate, Policy.Status.Applicable)

      // Then
      const updatedPolicy: Policy = await policyRepository.get(policyInDb.id)
      expect(updatedPolicy.paymentDate).to.deep.equal(currentDate)
      expect(updatedPolicy.subscriptionDate).to.deep.equal(currentDate)
      expect(updatedPolicy.status).to.deep.equal(Policy.Status.Applicable)
    })

    it('should throw an error if the policy is not found', async () => {
      // Given
      const currentDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture()
      await policyRepository.save(policyInDb)

      // When
      const promise = policyRepository
        .updateAfterPayment('UNKNOWN_ID', currentDate, currentDate, Policy.Status.Applicable)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
    })
  }).timeout(10000)

  describe('#updateAfterSignature', async () => {
    it('should update policy signature date subscription date and status', async () => {
      // Given
      const currentDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture({ paymentDate: undefined, subscriptionDate: undefined })
      await policyRepository.save(policyInDb)

      // When
      await policyRepository
        .updateAfterSignature(policyInDb.id, currentDate, Policy.Status.Signed)

      // Then
      const updatedPolicy: Policy = await policyRepository.get(policyInDb.id)
      expect(updatedPolicy.signatureDate).to.deep.equal(currentDate)
      expect(updatedPolicy.status).to.deep.equal(Policy.Status.Signed)
    })

    it('should throw an error if the policy is not found', async () => {
      // Given
      const currentDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture()
      await policyRepository.save(policyInDb)

      // When
      const promise = policyRepository
        .updateAfterSignature('UNKNOWN_ID', currentDate, Policy.Status.Signed)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
    })
  }).timeout(10000)

  describe('#update', async () => {
    it('should update policy premium, nbMonthsDue, startDate, termStartDate/termEndDate, specialOperationsCode & specialOperationsCodeAppliedAt', async () => {
      // Given
      const startDate: Date = new Date('2020-05-15T00:00:00Z')
      const endDate: Date = dayjs(startDate).add(1, 'month').toDate()
      const policy = await policyRepository.save(createPolicyFixture())
      policy.premium = 44.44
      policy.nbMonthsDue = 1
      policy.startDate = startDate
      policy.termStartDate = startDate
      policy.termEndDate = endDate
      policy.specialOperationsCode = OperationCode.SEMESTER2
      policy.specialOperationsCodeAppliedAt = new Date('2020-10-26T00:00:00Z')

      // When
      await policyRepository
        .update(policy)

      // Then
      const updatedPolicy: Policy = await policyRepository.get(policy.id)
      expect(updatedPolicy.premium).to.equal(policy.premium)
      expect(updatedPolicy.nbMonthsDue).to.equal(policy.nbMonthsDue)
      expect(updatedPolicy.startDate).to.deep.equal(policy.startDate)
      expect(updatedPolicy.termStartDate).to.deep.equal(policy.termStartDate)
      expect(updatedPolicy.termEndDate).to.deep.equal(policy.termEndDate)
      expect(updatedPolicy.specialOperationsCode).to.deep.equal(policy.specialOperationsCode)
      expect(updatedPolicy.specialOperationsCodeAppliedAt).to.deep.equal(policy.specialOperationsCodeAppliedAt)
    })

    it('should throw an error if the policy is not found', async () => {
      // Given
      const policyNotInDb: Policy = createPolicyFixture()

      // When
      const promise = policyRepository.update(policyNotInDb)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
    })
  }).timeout(10000)
})
