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
import { Quote } from '../../../../src/app/quotes/domain/quote'

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
      expect(savedPolicy.id).to.equal('APP753210859')
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
      expect(savedPolicy.status).to.equal('INITIATED')

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

    it('should return the created policy', async () => {
      // Given
      const now: Date = new Date('2020-01-05T10:09:08Z')
      const policy: Policy = createPolicyFixture()

      // When
      const createdPolicy: Policy = await policyRepository.save(policy)

      // Then
      expect(createdPolicy.id).to.equal('APP753210859')
      expect(createdPolicy.partnerCode).to.equal('myPartner')
      expect(createdPolicy.premium).to.equal(69.84)
      expect(createdPolicy.nbMonthsDue).to.equal(12)
      expect(createdPolicy.startDate).to.deep.equals(new Date('2020-01-05'))
      expect(createdPolicy.termStartDate).to.deep.equals(new Date('2020-01-05'))
      expect(createdPolicy.termEndDate).to.deep.equals(new Date('2020-01-05'))
      expect(createdPolicy.signatureDate).to.deep.equals(now)
      expect(createdPolicy.paymentDate).to.deep.equals(now)
      expect(createdPolicy.subscriptionDate).to.deep.equals(now)
      expect(createdPolicy.status).to.equal(Policy.Status.Initiated)

      const risk: Policy.Risk = createdPolicy.risk
      expect(risk).not.to.be.undefined

      expect(risk.property.roomCount).to.equal(2)
      expect(risk.property.address).to.equal('13 rue du loup garou')
      expect(risk.property.postalCode).to.equal(91100)
      expect(risk.property.city).to.equal('Corbeil-Essones')

      expect(risk.people.policyHolder.firstname).to.equal('Jean')
      expect(risk.people.policyHolder.lastname).to.equal('Dupont')

      expect(risk.people.otherInsured).to.have.lengthOf(1)
      const otherInsured : Policy.Risk.People.OtherInsured = risk.people.otherInsured[0]
      expect(otherInsured.firstname).to.equal('John')
      expect(otherInsured.lastname).to.equal('Doe')

      const insurance: Quote.Insurance = createdPolicy.insurance
      expect(insurance).not.to.be.undefined
      expect(insurance.estimate.monthlyPrice).to.equal(5.82)
      expect(insurance.estimate.defaultDeductible).to.equal(150)
      expect(insurance.estimate.defaultCeiling).to.equal(7000)
      expect(insurance.currency).to.equal('EUR')
      expect(insurance.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(insurance.productCode).to.equal('MRH-Loc-Etud')
      expect(insurance.productVersion).to.equal('v2020-02-01')

      const contact: Policy.Contact = createdPolicy.contact
      expect(contact).not.to.be.undefined
      expect(contact.firstname).to.equal('Jean')
      expect(contact.lastname).to.equal('Dupont')
      expect(contact.address).to.equal('13 rue du loup garou')
      expect(contact.postalCode).to.equal(91100)
      expect(contact.city).to.equal('Corbeil-Essones')
      expect(contact.email).to.equal('jeandupont@email.com')
      expect(contact.phoneNumber).to.equal('+33684205510')
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
})
