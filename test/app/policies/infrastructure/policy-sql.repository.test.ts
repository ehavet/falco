import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PolicySqlRepository } from '../../../../src/app/policies/infrastructure/policy-sql.repository'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { expect } from '../../../test-utils'
import { PolicySqlModel } from '../../../../src/app/policies/infrastructure/policy-sql.model'
import { InsuranceSqlModel } from '../../../../src/app/quotes/infrastructure/insurance-sql.model'
import { RiskSqlModel } from '../../../../src/app/quotes/infrastructure/risk-sql.model'
import { OtherInsuredSqlModel } from '../../../../src/app/quotes/infrastructure/other-insured-sql.model'
import { ContactSqlModel } from '../../../../src/app/policies/infrastructure/contact-sql.model'

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
      const now: Date = new Date('2020-01-05T10:09:08Z')
      const policy: Policy = createPolicyFixture()

      // When
      await policyRepository.save(policy)

      // Then
      const result = await PolicySqlModel.findAll({
        include: [{ all: true }, { model: RiskSqlModel, include: [{ all: true }] }]
      })

      expect(result).to.have.lengthOf(1)

      const savedPolicy: PolicySqlModel = result[0]
      expect(savedPolicy.id).to.equal('D9C61E')
      expect(savedPolicy.partnerCode).to.equal('myPartner')
      expect(savedPolicy.premium).to.equal(69.84)
      expect(savedPolicy.nbMonthsDue).to.equal(12)
      expect(savedPolicy.startDate).to.deep.equals('2020-01-05')
      expect(savedPolicy.termStartDate).to.deep.equals('2020-01-05')
      expect(savedPolicy.termEndDate).to.deep.equals('2020-01-05')
      expect(savedPolicy.signatureDate).to.deep.equals(now)
      expect(savedPolicy.paymentDate).to.deep.equals(now)
      expect(savedPolicy.subscriptionDate).to.deep.equals(now)
      expect(savedPolicy.createdAt).to.be.an.instanceof(Date)
      expect(savedPolicy.updatedAt).to.be.an.instanceof(Date)

      const savedRisk: RiskSqlModel = savedPolicy.risk
      expect(savedRisk).not.to.be.undefined
      expect(savedRisk.id).to.be.a('string')
      expect(savedRisk.createdAt).to.be.an.instanceof(Date)
      expect(savedRisk.updatedAt).to.be.an.instanceof(Date)

      expect(savedRisk.property.id).to.be.a('string')
      expect(savedRisk.property.roomCount).to.equal(2)
      expect(savedRisk.property.address).to.equal('13 rue du loup garou')
      expect(savedRisk.property.postalCode).to.equal(91100)
      expect(savedRisk.property.city).to.equal('Corbeil-Essones')
      expect(savedRisk.property.createdAt).to.be.an.instanceof(Date)
      expect(savedRisk.property.updatedAt).to.be.an.instanceof(Date)

      expect(savedRisk.policyHolder.id).to.be.a('string')
      expect(savedRisk.policyHolder.firstname).to.equal('Jean')
      expect(savedRisk.policyHolder.lastname).to.equal('Dupont')
      expect(savedRisk.policyHolder.createdAt).to.be.an.instanceof(Date)
      expect(savedRisk.policyHolder.updatedAt).to.be.an.instanceof(Date)

      expect(savedRisk.otherInsured).to.have.lengthOf(1)
      const otherInsured : OtherInsuredSqlModel = savedRisk.otherInsured[0]
      expect(otherInsured.id).to.be.a('string')
      expect(otherInsured.firstname).to.equal('John')
      expect(otherInsured.lastname).to.equal('Doe')
      expect(otherInsured.createdAt).to.be.an.instanceof(Date)
      expect(otherInsured.updatedAt).to.be.an.instanceof(Date)

      const savedInsurance: InsuranceSqlModel = savedPolicy.insurance
      expect(savedInsurance).not.to.be.undefined
      expect(savedInsurance.id).to.be.a('string')
      expect(savedInsurance.monthlyPrice).to.equal(5.82)
      expect(savedInsurance.defaultDeductible).to.equal(150)
      expect(savedInsurance.defaultCeiling).to.equal(7000)
      expect(savedInsurance.currency).to.equal('EUR')
      expect(savedInsurance.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(savedInsurance.productCode).to.equal('MRH-Loc-Etud')
      expect(savedInsurance.productVersion).to.equal('v2020-02-01')
      expect(savedInsurance.createdAt).to.be.an.instanceof(Date)
      expect(savedInsurance.updatedAt).to.be.an.instanceof(Date)

      const savedContact: ContactSqlModel = savedPolicy.contact
      expect(savedContact).not.to.be.undefined
      expect(savedContact.id).to.be.a('string')
      expect(savedContact.firstname).to.equal('Jean')
      expect(savedContact.lastname).to.equal('Dupont')
      expect(savedContact.address).to.equal('13 rue du loup garou')
      expect(savedContact.postalCode).to.equal(91100)
      expect(savedContact.city).to.equal('Corbeil-Essones')
      expect(savedContact.email).to.equal('jeandupont@email.com')
      expect(savedContact.phoneNumber).to.equal('+33684205510')
      expect(savedContact.createdAt).to.be.an.instanceof(Date)
      expect(savedContact.updatedAt).to.be.an.instanceof(Date)
    })
  })
})
