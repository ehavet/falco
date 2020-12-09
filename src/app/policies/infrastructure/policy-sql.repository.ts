import { PolicyRepository } from '../domain/policy.repository'
import { Policy } from '../domain/policy'
import { PolicySqlModel } from './policy-sql.model'
import { sqlToDomain } from './policy-sql.mapper'
import { PolicyNotFoundError } from '../domain/policies.errors'
import { PolicyPersonSqlModel } from './policy-person-sql.model'
import { PolicyRiskSqlModel } from '../../quotes/infrastructure/policy-risk-sql.model'
import { toAmount } from '../../common-api/domain/amount/amount'

export class PolicySqlRepository implements PolicyRepository {
  async save (policy: Policy): Promise<Policy> {
    const persistedPerson = await PolicyPersonSqlModel.create({
      firstname: policy.contact.firstname,
      lastname: policy.contact.lastname,
      address: policy.contact.address,
      postalCode: policy.contact.postalCode,
      city: policy.contact.city,
      email: policy.contact.email,
      phoneNumber: policy.contact.phoneNumber
    })

    const persistedPolicy = await PolicySqlModel.create({
      id: policy.id,
      partnerCode: policy.partnerCode,
      premium: policy.premium,
      nbMonthsDue: policy.nbMonthsDue,
      startDate: policy.startDate,
      termStartDate: policy.termStartDate,
      termEndDate: policy.termEndDate,
      signatureDate: policy.signatureDate,
      paymentDate: policy.paymentDate,
      subscriptionDate: policy.subscriptionDate,
      emailValidationDate: policy.emailValidationDate,
      status: policy.status,
      risk: {
        property: policy.risk.property,
        policyPersonId: persistedPerson.id,
        otherPeople: policy.risk.people.otherPeople
      },
      insurance: {
        monthlyPrice: policy.insurance.estimate.monthlyPrice,
        currency: policy.insurance.currency,
        defaultDeductible: policy.insurance.estimate.defaultDeductible,
        defaultCeiling: policy.insurance.estimate.defaultCeiling,
        simplifiedCovers: policy.insurance.simplifiedCovers,
        productCode: policy.insurance.productCode,
        productVersion: policy.insurance.productVersion,
        contractualTerms: policy.insurance.contractualTerms,
        ipid: policy.insurance.ipid
      },
      policyHolderId: persistedPerson.id
    }, {
      include: [{ all: true }, { model: PolicyRiskSqlModel, include: [{ all: true }] }]
    })

    persistedPolicy.policyHolder = persistedPerson
    persistedPolicy.risk.person = persistedPerson

    return sqlToDomain(persistedPolicy)
  }

  async get (policyId: string): Promise<Policy> {
    const policy: PolicySqlModel = await PolicySqlModel
      .findByPk(policyId, {
        rejectOnEmpty: false, include: [{ all: true }, { model: PolicyRiskSqlModel, include: [{ all: true }] }]
      })
    if (policy) {
      return sqlToDomain(policy)
    }
    throw new PolicyNotFoundError(policyId)
  }

  async isIdAvailable (policyId: string): Promise<boolean> {
    const foundPolicy: PolicySqlModel = await PolicySqlModel.findByPk(policyId, { rejectOnEmpty: false })
    if (foundPolicy) return false
    return true
  }

  async setEmailValidatedAt (policyId: string, date: Date): Promise<void> {
    const policy: PolicySqlModel = await PolicySqlModel.findByPk(policyId, { rejectOnEmpty: false })
    if (policy) {
      policy.emailValidationDate = date
      await policy.save()
      return Promise.resolve()
    }
    throw new PolicyNotFoundError(policyId)
  }

  async updateAfterPayment (policyId: string, paymentDate: Date, subscriptionDate: Date, status: Policy.Status): Promise<void> {
    const policy: PolicySqlModel = await PolicySqlModel.findByPk(policyId, { rejectOnEmpty: false })
    if (policy) {
      policy.paymentDate = paymentDate
      policy.subscriptionDate = subscriptionDate
      policy.status = status
      await policy.save()
      return Promise.resolve()
    }
    throw new PolicyNotFoundError(policyId)
  }

  async updateAfterSignature (policyId: string, signatureDate: Date, status: Policy.Status): Promise<void> {
    const policy: PolicySqlModel = await PolicySqlModel.findByPk(policyId, { rejectOnEmpty: false })
    if (policy) {
      policy.signatureDate = signatureDate
      policy.status = status
      await policy.save()
      return Promise.resolve()
    }
    throw new PolicyNotFoundError(policyId)
  }

  // TODO 1: Integrate the previous specific updates into this generic one
  // TODO 2: Refacto in order to find a beter way to update, without the need to request the db for the policy
  async update (policy: Policy): Promise<void> {
    const persitedPolicy: PolicySqlModel = await PolicySqlModel.findByPk(
      policy.id, {
        rejectOnEmpty: false,
        include: [{ all: true },
          { model: PolicyRiskSqlModel, include: [{ all: true }] }]
      })
    if (persitedPolicy) {
      persitedPolicy.premium = toAmount(policy.premium).toString()
      persitedPolicy.nbMonthsDue = policy.nbMonthsDue
      persitedPolicy.startDate = policy.startDate
      persitedPolicy.termStartDate = policy.termStartDate
      persitedPolicy.termEndDate = policy.termEndDate
      persitedPolicy.specialOperationsCode = policy.specialOperationsCode
      persitedPolicy.specialOperationsCodeAppliedAt = policy.specialOperationsCodeAppliedAt
      await persitedPolicy.save()
      return Promise.resolve()
    }
    throw new PolicyNotFoundError(policy.id)
  }
}
