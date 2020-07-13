import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PolicySqlRepository } from '../../../../src/app/policies/infrastructure/policy-sql.repository'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { expect } from '../../../test-utils'
import { PolicySqlModel } from '../../../../src/app/policies/infrastructure/policy-sql.model'
import { RiskSqlModel } from '../../../../src/app/quotes/infrastructure/risk-sql.model'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

describe('Policies - Infra - Policy SQL Repository', async () => {
  const policyRepository: PolicyRepository = new PolicySqlRepository()

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
        include: [{ all: true }, { model: RiskSqlModel, include: [{ all: true }] }]
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
  })

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
  })

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
  })

  describe('#setEmailValidationDate', async () => {
    it('should update the policy email validation date', async () => {
      // Given
      const emailValidationDate: Date = new Date('2020-01-05T10:38:19Z')
      const policyInDb: Policy = createPolicyFixture({ emailValidationDate: undefined })
      await policyRepository.save(policyInDb)

      // When
      await policyRepository.setEmailValidationDate(policyInDb.id, emailValidationDate)

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
      const promise = policyRepository.setEmailValidationDate('UNKNOWN_ID', emailValidationDate)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
    })
  })

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
  })
})
