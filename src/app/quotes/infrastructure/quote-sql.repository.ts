import { QuoteRepository } from '../domain/quote.repository'
import { Quote } from '../domain/quote'
import { sqlToDomain } from './quote-sql.mapper'
import { QuoteNotFoundError } from '../domain/quote.errors'
import { QuoteInsuranceSqlModel } from './sql-models/quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './sql-models/quote-risk-sql.model'
import { QuotePropertySqlModel } from './sql-models/quote-property-sql.model'
import { QuoteSqlModel } from './sql-models/quote-sql-model'
import { QuotePersonSqlModel } from './sql-models/quote-person-sql.model'
import { QuoteRiskOtherPeopleSqlModel } from './sql-models/quote-risk-other-people-sql.model'

export class QuoteSqlRepository implements QuoteRepository {
  async save (quote: Quote): Promise<Quote> {
    const personSql = await QuotePersonSqlModel.create({
      firstname: quote.policyHolder ? quote.policyHolder.firstname : null,
      lastname: quote.policyHolder ? quote.policyHolder.lastname : null,
      address: quote.policyHolder ? quote.policyHolder.address : null,
      postalCode: quote.policyHolder ? quote.policyHolder.postalCode : null,
      city: quote.policyHolder ? quote.policyHolder.city : null,
      email: quote.policyHolder ? quote.policyHolder.email : null,
      phoneNumber: quote.policyHolder ? quote.policyHolder.phoneNumber : null
    })

    const quoteSql = await QuoteSqlModel.create({
      id: quote.id,
      partnerCode: quote.partnerCode,
      risk: {
        property: quote.risk.property,
        quotePersonId: personSql.id,
        otherPeople: quote.risk.otherPeople
      },
      insurance: {
        monthlyPrice: quote.insurance.estimate.monthlyPrice,
        currency: quote.insurance.currency,
        defaultDeductible: quote.insurance.estimate.defaultDeductible,
        defaultCeiling: quote.insurance.estimate.defaultCeiling,
        simplifiedCovers: quote.insurance.simplifiedCovers,
        productCode: quote.insurance.productCode,
        productVersion: quote.insurance.productVersion,
        contractualTerms: quote.insurance.contractualTerms,
        ipid: quote.insurance.ipid
      },
      policyHolderId: personSql.id,
      premium: quote.premium,
      nbMonthsDue: quote.nbMonthsDue,
      startDate: quote.startDate,
      termStartDate: quote.termStartDate,
      termEndDate: quote.termEndDate
    }, {
      include: [
        { all: true },
        {
          model: QuoteRiskSqlModel,
          include: [{ all: true }]
        }
      ]
    })

    quoteSql.policyHolder = personSql
    quoteSql.risk.person = personSql

    return sqlToDomain(quoteSql)
  }

  async get (quoteId: string): Promise<Quote> {
    const quoteSql: QuoteSqlModel = await QuoteSqlModel
      .findByPk(quoteId, {
        include: [{ all: true }, { model: QuoteRiskSqlModel, include: [{ all: true }] }],
        rejectOnEmpty: false
      })
    if (quoteSql) {
      return sqlToDomain(quoteSql)
    }
    throw new QuoteNotFoundError(quoteId)
  }

  async update (quote: Quote): Promise<Quote> {
    const updatedQuotesResult = await QuoteSqlModel.update(
      {
        partnerCode: quote.partnerCode,
        premium: quote.premium,
        nbMonthsDue: quote.nbMonthsDue,
        startDate: quote.startDate,
        termStartDate: quote.termStartDate,
        termEndDate: quote.termEndDate
      },
      {
        where: { id: quote.id },
        returning: true
      }
    )

    const updatedQuoteSql = updatedQuotesResult[1][0]

    const risk = await QuoteRiskSqlModel
      .findByPk(updatedQuoteSql.quoteRiskId, {
        rejectOnEmpty: false,
        include: [{ all: true }]
      })

    const updatedQuotePropertiesResult = await QuotePropertySqlModel.update(
      {
        roomCount: (quote.risk.property && quote.risk.property.roomCount) ? quote.risk.property.roomCount : null,
        address: (quote.risk.property && quote.risk.property.address) ? quote.risk.property.address : null,
        postalCode: (quote.risk.property && quote.risk.property.postalCode) ? quote.risk.property.postalCode : null,
        city: (quote.risk.property && quote.risk.property.city) ? quote.risk.property.city : null
      },
      {
        where: { id: risk.quotePropertyId },
        returning: true
      }
    )

    const updatedPeopleResult = await QuotePersonSqlModel.update(
      {
        firstname: (quote.risk.person && quote.risk.person.firstname) ? quote.risk.person.firstname : null,
        lastname: (quote.risk.person && quote.risk.person.lastname) ? quote.risk.person.lastname : null
      },
      {
        where: { id: risk.quotePersonId },
        returning: true
      }
    )

    const riskPeopleAssociationsResult = await QuoteRiskOtherPeopleSqlModel.findAll(
      {
        where: { quoteRiskId: risk.id }
      }
    )

    await QuotePersonSqlModel.destroy({
      where: { id: riskPeopleAssociationsResult.map(e => { return e.quotePersonId }) }
    })

    let otherPeopleResult
    if (quote.risk.otherPeople && quote.risk.otherPeople.length > 0) {
      otherPeopleResult = await QuotePersonSqlModel.bulkCreate(
        quote.risk.otherPeople, { returning: true }
      )
      const quoteRiskOtherPeopleAssociationsResult = otherPeopleResult.map(person => {
        return { quoteRiskId: risk.id, quotePersonId: person.id }
      })
      await QuoteRiskOtherPeopleSqlModel.bulkCreate(
        quoteRiskOtherPeopleAssociationsResult
      )
    }

    const updatedInsurancesResult = await QuoteInsuranceSqlModel.update(
      {
        monthlyPrice: quote.insurance.estimate.monthlyPrice,
        defaultDeductible: quote.insurance.estimate.defaultDeductible,
        defaultCeiling: quote.insurance.estimate.defaultCeiling,
        simplifiedCovers: quote.insurance.simplifiedCovers,
        currency: quote.insurance.currency,
        productCode: quote.insurance.productCode,
        productVersion: quote.insurance.productVersion,
        contractualTerms: quote.insurance.contractualTerms,
        ipid: quote.insurance.ipid
      },
      {
        where: { id: updatedQuoteSql.quoteInsuranceId },
        returning: true
      }
    )

    const updatedPolicyHoldersResult = await QuotePersonSqlModel.update(
      {
        address: (quote.policyHolder && quote.policyHolder.address) ? quote.policyHolder.address : null,
        postalCode: (quote.policyHolder && quote.policyHolder.postalCode) ? quote.policyHolder.postalCode : null,
        city: (quote.policyHolder && quote.policyHolder.city) ? quote.policyHolder.city : null,
        email: (quote.policyHolder && quote.policyHolder.email) ? quote.policyHolder.email : null,
        phoneNumber: (quote.policyHolder && quote.policyHolder.phoneNumber) ? quote.policyHolder.phoneNumber : null,
        emailValidatedAt: (quote.policyHolder && quote.policyHolder.emailValidatedAt) ? quote.policyHolder.emailValidatedAt : null
      },
      {
        where: { id: updatedQuoteSql.policyHolderId },
        returning: true
      }
    )

    updatedQuoteSql.insurance = updatedInsurancesResult[1][0]
    updatedQuoteSql.risk = risk
    updatedQuoteSql.risk.property = updatedQuotePropertiesResult[1][0]
    updatedQuoteSql.risk.person = updatedPeopleResult[1][0]
    updatedQuoteSql.risk.otherPeople = otherPeopleResult
    updatedQuoteSql.policyHolder = updatedPolicyHoldersResult[1][0]

    return sqlToDomain(updatedQuoteSql)
  }
}
