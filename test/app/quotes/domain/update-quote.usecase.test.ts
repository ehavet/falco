import { dateFaker, expect, sinon } from '../../../test-utils'
import { UpdateQuoteCommand } from '../../../../src/app/quotes/domain/update-quote-command'
import { UpdateQuote } from '../../../../src/app/quotes/domain/update-quote.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuoteFixture, createQuoteInsuranceFixture, createQuoteRiskFixture, createUpdateQuoteCommandFixture, createUpdateQuoteCommandRiskFixture } from '../fixtures/quote.fixture'
import { SinonStubbedInstance } from 'sinon'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { QuoteRiskPropertyRoomCountNotInsurableError, QuoteNotFoundError, QuoteRiskNumberOfRoommatesError, QuoteRiskRoommatesNotAllowedError, QuoteStartDateConsistencyError } from '../../../../src/app/quotes/domain/quote.errors'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { OperationCode } from '../../../../src/app/policies/domain/operation-code'
import { OperationCodeNotApplicableError } from '../../../../src/app/policies/domain/operation-code.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { partnerRepositoryStub } from '../../partners/fixtures/partner-repository.test-doubles'
import { quoteRepositoryStub } from '../fixtures/quote-repository.test-doubles'

describe('Quotes - Usecase - Update Quote', async () => {
  const now: Date = new Date('2020-01-05T00:00:00Z')
  let updateQuote: UpdateQuote
  let quoteRepository: SinonStubbedInstance<QuoteRepository>
  let partnerRepository: SinonStubbedInstance<PartnerRepository>
  let quote: Quote
  const quoteId: string = 'UDQUOT3'
  const partnerCode: string = 'myPartner'

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
    quote = createQuoteFixture({ id: quoteId, partnerCode: partnerCode })
    quoteRepository = quoteRepositoryStub({ update: sinon.mock() })
    partnerRepository = partnerRepositoryStub()
    partnerRepository.getByCode.withArgs(partnerCode).resolves(createPartnerFixture(
      {
        code: partnerCode,
        questions: [
          {
            code: Partner.Question.QuestionCode.RoomCount,
            options: {
              list: [1, 2, 3]
            }
          },
          {
            code: Partner.Question.QuestionCode.Roommate,
            applicable: true,
            maximumNumbers: [
              { roomCount: 1, value: 0 },
              { roomCount: 2, value: 1 },
              { roomCount: 3, value: 0 }
            ]
          }
        ],
        offer: {
          simplifiedCovers: ['ACDDE', 'ACVOL'],
          pricingMatrix: new Map([
            [1, { monthlyPrice: 5.82, defaultDeductible: 150, defaultCeiling: 7000 }],
            [2, { monthlyPrice: 10, defaultDeductible: 100, defaultCeiling: 1000 }],
            [3, { monthlyPrice: 10, defaultDeductible: 100, defaultCeiling: 1000 }]
          ]),
          productCode: 'APP999',
          productVersion: '1.0',
          contractualTerms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid',
          operationCodes: [OperationCode.SEMESTER1, OperationCode.FULLYEAR]
        }
      }
    ))
    partnerRepository.getOperationCodes.withArgs(partnerCode).resolves(
      [OperationCode.FULLYEAR, OperationCode.SEMESTER1, OperationCode.SEMESTER2, OperationCode.BLANK]
    )
  })

  afterEach(() => {
    quoteRepository.get.reset()
    partnerRepository.getByCode.reset()
    partnerRepository.getOperationCodes.reset()
    quoteRepository.update.reset()
  })

  it('should throw a QuoteNotFoundError when quote to update is not found', async () => {
    // Given
    const unknowQuoteId = 'UNKN0W'
    const updateQuoteCommand: UpdateQuoteCommand = createUpdateQuoteCommandFixture({ id: unknowQuoteId })
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    quoteRepository.get.withArgs(unknowQuoteId).rejects(new QuoteNotFoundError(unknowQuoteId))

    // When
    const promise = updateQuote(updateQuoteCommand)

    // Then
    return expect(promise).to.be.rejectedWith(QuoteNotFoundError)
  })

  it('should throw a QuoteRiskRoommatesNotAllowedError when roommates are not allowed', async () => {
    // Given
    const unknowQuoteId = 'UNKN0W'
    const updateQuoteCommand: UpdateQuoteCommand = createUpdateQuoteCommandFixture({
      id: unknowQuoteId,
      risk: createUpdateQuoteCommandRiskFixture({
        property: { roomCount: 3, city: '', postalCode: '', address: '' }
      })
    })
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    quoteRepository.get.withArgs(unknowQuoteId).rejects(new QuoteRiskRoommatesNotAllowedError(3))

    // When
    const promise = updateQuote(updateQuoteCommand)

    // Then
    return expect(promise).to.be.rejectedWith(QuoteRiskRoommatesNotAllowedError)
  })

  it('should throw a QuoteRiskNumberOfRoommatesError when max number of roommates is exceeded', async () => {
    // Given
    const unknowQuoteId = 'UNKN0W'
    const updateQuoteCommand: UpdateQuoteCommand = createUpdateQuoteCommandFixture({
      id: unknowQuoteId,
      risk: createUpdateQuoteCommandRiskFixture({
        property: { roomCount: 2, city: '', postalCode: '', address: '' },
        otherPeople: [
          {
            firstname: 'Samy',
            lastname: 'Aza'
          },
          {
            firstname: 'Kasy',
            lastname: 'Ade'
          }
        ]
      })
    })
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    quoteRepository.get.withArgs(unknowQuoteId).rejects(new QuoteRiskNumberOfRoommatesError(1, 2))

    // When
    const promise = updateQuote(updateQuoteCommand)

    // Then
    return expect(promise).to.be.rejectedWith(QuoteRiskNumberOfRoommatesError)
  })

  it('should call update on repository then return updated quote when success', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const expectedQuote: Quote = createQuoteFixture({
      id: quoteId,
      partnerCode: partnerCode,
      premium: 58.2,
      nbMonthsDue: 10,
      risk: {
        property: {
          roomCount: 1,
          address: '666 rue de la mer morte',
          postalCode: '66666',
          city: 'Babylone'
        },
        person: {
          firstname: 'Lucie',
          lastname: 'Fer'
        },
        otherPeople: undefined
      },
      insurance: createQuoteInsuranceFixture({
        productVersion: '1.0',
        estimate: { defaultCeiling: 7000, defaultDeductible: 150, monthlyPrice: 5.82 }
      }),
      policyHolder: {
        firstname: 'Lucie',
        lastname: 'Fer',
        address: '666 rue de la mer morte',
        postalCode: '66666',
        city: 'Babylone',
        email: 'henoch@book.com',
        phoneNumber: '+66666666666',
        emailValidatedAt: undefined
      },
      startDate: new Date('2020-01-05T00:00:00.000Z'),
      termStartDate: new Date('2020-01-05T00:00:00.000Z'),
      termEndDate: new Date('2020-11-04T00:00:00.000Z')
    })

    const updateQuoteCommand: UpdateQuoteCommand = {
      id: quoteId,
      risk: {
        property: {
          roomCount: 1,
          address: '666 rue de la mer morte',
          postalCode: '66666',
          city: 'Babylone'
        },
        person: {
          firstname: 'Lucie',
          lastname: 'Fer'
        }
      },
      policyHolder: {
        email: 'henoch@book.com',
        phoneNumber: '+66666666666'
      },
      startDate: now,
      specOpsCode: 'FULLYEAR'
    }

    quoteRepository.update.withArgs(expectedQuote).resolves(expectedQuote)

    // When
    const result = await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, expectedQuote)
    expect(result).to.deep.equal(expectedQuote)
  })

  it('should throw QuoteRiskPropertyRoomCountNotInsurableError when there is no coverage for the given property room count', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updateQuoteCommand: UpdateQuoteCommand = createUpdateQuoteCommandFixture({
      id: quoteId,
      specOpsCode: undefined,
      risk: createUpdateQuoteCommandRiskFixture({
        property: {
          roomCount: 10,
          address: '101 rue des lapins',
          postalCode: '77000',
          city: 'Malinville'
        }
      })
    })
    // When
    const quotePromise = updateQuote(updateQuoteCommand)
    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        QuoteRiskPropertyRoomCountNotInsurableError,
        '10 room(s) property is not insurable'
      )
  })

  it('should throw OperationCodeNotApplicableError if operation code is not applicable for partner', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updateQuoteCommande = createUpdateQuoteCommandFixture({
      id: quoteId,
      specOpsCode: 'NOTAPPLICABLECODE',
      risk: createUpdateQuoteCommandRiskFixture({
        property: {
          roomCount: 1,
          address: '101 rue des lapins',
          postalCode: '77000',
          city: 'Malinville'
        },
        person: { firstname: 'jean', lastname: 'jean' },
        otherPeople: []
      })
    })

    // When
    const promise = updateQuote(updateQuoteCommande)

    // Then
    return expect(promise).to.be.rejectedWith(
      OperationCodeNotApplicableError,
      'The operation code NOTAPPLICABLECODE is not applicable for partner : myPartner'
    )
  })

  it('should update premium on 5 months if provided operation code is SEMESTER1', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: 'SEMESTER1' })
    const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 50,
        nbMonthsDue: 5,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2020-06-04T00:00:00.000Z')
      }
    )
    quoteRepository.update.withArgs(updatedQuote).resolves()

    // When
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })

  it('should update premium on 5 months if provided operation code is SEMESTER2', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: 'SEMESTER2' })
    const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 50,
        nbMonthsDue: 5,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2020-06-04T00:00:00.000Z')
      }
    )
    quoteRepository.update.withArgs(updatedQuote).resolves()

    // When
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })

  it('should update premium on 10 months if provided operation code is FULLYEAR', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: 'FULLYEAR' })
    const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 100,
        nbMonthsDue: 10,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2020-11-04T00:00:00.000Z')
      }
    )
    quoteRepository.update.withArgs(updatedQuote).resolves()

    // When
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })

  it('should update premium on 12 months if provided operation code is empty', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: '' })
    const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 120,
        nbMonthsDue: 12,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2021-01-04T00:00:00.000Z')
      }
    )
    quoteRepository.update.withArgs(updatedQuote).resolves()

    // When
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })

  it('should update premium on 12 months if provided operation code is undefined', async () => {
    // Given
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: undefined })
    const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 120,
        nbMonthsDue: 12,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2021-01-04T00:00:00.000Z')
      }
    )
    quoteRepository.update.withArgs(updatedQuote).resolves()

    // When
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })

  it('should apply operation code when valid code contains spaces or non alphanumeric characters', async () => {
    // Given
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        risk: createQuoteRiskFixture({
          otherPeople: [
            { firstname: 'Samy', lastname: 'Aza' }
          ]
        }),
        insurance: createQuoteInsuranceFixture({
          estimate: {
            monthlyPrice: 10,
            defaultDeductible: 100,
            defaultCeiling: 1000
          },
          productVersion: '1.0'
        }),
        premium: 100,
        nbMonthsDue: 10,
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        termEndDate: new Date('2020-11-04T00:00:00.000Z')
      }
    )

    quoteRepository.get.withArgs(quoteId).resolves(quote)
    quoteRepository.update = sinon.stub()
    quoteRepository.update.withArgs(updatedQuote).resolves(updatedQuote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)

    const codesList = ['FULL   YEAR', 'FULL_YEAR', 'FULL.YEAR', 'fullyear', 'full@year', 'FUll!ç&Year']
    codesList.forEach(async (code) => {
    // When
      const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: code })
      const result = await updateQuote(updateQuoteCommand)
      // Then
      expect(result).to.deep.equal(updatedQuote)
    })
  })

  it('should throw an QuoteStartDateConsistencyError when start date is earlier than today', async () => {
    // Given
    const earlierThanTodayDate: Date = new Date('2009-01-27')
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)

    // When
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, startDate: earlierThanTodayDate })
    const promise = updateQuote(updateQuoteCommand)

    // Then
    return expect(promise).to.be.rejectedWith(QuoteStartDateConsistencyError)
  })

  it('should modify start date and update term dates accordingly then return updated quote', async () => {
    // Given
    const updatedStartDate: Date = new Date('2020-07-01')
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        startDate: new Date('2020-07-01T00:00:00.000Z'),
        termStartDate: new Date('2020-07-01T00:00:00.000Z'),
        termEndDate: new Date('2021-06-30T00:00:00.000Z'),
        premium: 120,
        nbMonthsDue: 12,
        insurance: createQuoteInsuranceFixture({
          contractualTerms: '/path/to/contractual/terms',
          currency: 'EUR',
          estimate: { defaultCeiling: 1000, defaultDeductible: 100, monthlyPrice: 10 },
          ipid: '/path/to/ipid',
          productCode: 'APP999',
          productVersion: '1.0',
          simplifiedCovers: ['ACDDE', 'ACVOL']
        }),
        risk: createQuoteRiskFixture({
          otherPeople: [{ firstname: 'Samy', lastname: 'Aza' }],
          person: { firstname: 'Jean-Jean', lastname: 'Lapin' }
        })
      }
    )
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    quoteRepository.update.withArgs(updatedQuote).resolves(updatedQuote)
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)

    // When
    const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, startDate: updatedStartDate })
    await updateQuote(updateQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })
})
