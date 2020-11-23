import { dateFaker, expect, sinon } from '../../../test-utils'
import { UpdateQuoteCommand } from '../../../../src/app/quotes/domain/update-quote-command'
import { UpdateQuote } from '../../../../src/app/quotes/domain/update-quote.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import {
  createQuoteFixture,
  createQuotePolicyHolderFixture,
  createUpdateQuoteCommandFixture,
  createUpdateQuoteCommandPolicyHolderFixture,
  createUpdateQuoteCommandRiskFixture
} from '../fixtures/quote.fixture'
import { SinonStubbedInstance } from 'sinon'
import {
  QuoteNotFoundError,
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteRiskRoommatesNotAllowedError,
  QuoteStartDateConsistencyError
} from '../../../../src/app/quotes/domain/quote.errors'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'
import { OperationCodeNotApplicableError } from '../../../../src/app/policies/domain/operation-code.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { partnerRepositoryStub } from '../../partners/fixtures/partner-repository.test-doubles'
import { quoteRepositoryStub } from '../fixtures/quote-repository.test-doubles'

describe('Quotes - Usecase - Update Quote', async () => {
  const now: Date = new Date('2020-01-05T00:00:00Z')
  let updateQuote: UpdateQuote
  let quoteRepository
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
            },
            manageOtherCases: false
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
            [2, { monthlyPrice: 5.82, defaultDeductible: 150, defaultCeiling: 7000 }],
            [3, { monthlyPrice: 5.82, defaultDeductible: 150, defaultCeiling: 7000 }]
          ]),
          productCode: 'APP999',
          productVersion: 'v2020-02-01',
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
      nbMonthsDue: 10,
      premium: 58.2,
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
      specialOperationsCode: OperationCode.FULLYEAR,
      specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
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
        premium: 29.1,
        nbMonthsDue: 5,
        specialOperationsCode: OperationCode.SEMESTER1,
        specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
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
        premium: 29.1,
        nbMonthsDue: 5,
        specialOperationsCode: OperationCode.SEMESTER2,
        specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
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
        premium: 58.2,
        nbMonthsDue: 10,
        specialOperationsCode: OperationCode.FULLYEAR,
        specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
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

  describe('when empty operation code is provided', async () => {
    it('should update premium on 12 months with specialOperationsCode and specialOperationsCodeAppliedAt not filled up when no spec ops code applied previously', async () => {
      // Given
      quoteRepository.get.withArgs(quoteId).resolves(quote)
      const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: '' })
      const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
      const updatedQuote = createQuoteFixture(
        {
          id: 'UDQUOT3',
          partnerCode: 'myPartner',
          premium: 69.84,
          nbMonthsDue: 12,
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: null,
          startDate: new Date('2020-01-05T00:00:00.000Z'),
          termStartDate: new Date('2020-01-05T00:00:00.000Z'),
          termEndDate: new Date('2021-01-04T00:00:00.000Z')
        }
      )
      quoteRepository.update.withArgs(updatedQuote).resolves()

      // When
      await updateQuote(updateQuoteCommand)

      // Then
      return expect(quoteRepository.update).to.have.been.calledWithExactly(updatedQuote)
    })

    it('should update premium on 12 months with specialOperationsCode null and specialOperationsCodeAppliedAt filled up when a spec ops code has been applied previously', async () => {
      // Given
      const quote = createQuoteFixture({ id: quoteId, partnerCode: partnerCode, specialOperationsCode: OperationCode.SEMESTER1, specialOperationsCodeAppliedAt: new Date() })
      quoteRepository.get.withArgs(quoteId).resolves(quote)
      const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quote.id, specOpsCode: '' })
      const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
      const updatedQuote = createQuoteFixture(
        {
          id: 'UDQUOT3',
          partnerCode: 'myPartner',
          premium: 69.84,
          nbMonthsDue: 12,
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
          startDate: new Date('2020-01-05T00:00:00.000Z'),
          termStartDate: new Date('2020-01-05T00:00:00.000Z'),
          termEndDate: new Date('2021-01-04T00:00:00.000Z')
        }
      )
      quoteRepository.update.withArgs(updatedQuote).resolves()

      // When
      await updateQuote(updateQuoteCommand)

      // Then
      return expect(quoteRepository.update).to.have.been.calledWithExactly(updatedQuote)
    })
  })

  describe('when undefined operation code is provided', async () => {
    it('should update premium on 12 months with specialOperationsCode and specialOperationsCodeAppliedAt not filled up when no spec ops code applied previously', async () => {
      // Given
      quoteRepository.get.withArgs(quoteId).resolves(quote)
      const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: undefined })
      const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
      const updatedQuote = createQuoteFixture(
        {
          id: 'UDQUOT3',
          partnerCode: 'myPartner',
          premium: 69.84,
          nbMonthsDue: 12,
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: null,
          startDate: new Date('2020-01-05T00:00:00.000Z'),
          termStartDate: new Date('2020-01-05T00:00:00.000Z'),
          termEndDate: new Date('2021-01-04T00:00:00.000Z')
        }
      )
      quoteRepository.update.withArgs(updatedQuote).resolves()

      // When
      await updateQuote(updateQuoteCommand)

      // Then
      return expect(quoteRepository.update).to.have.been.calledWithExactly(updatedQuote)
    })

    it('should update premium on 12 months with specialOperationsCode null and specialOperationsCodeAppliedAt filled up when a spec ops code has been applied previously', async () => {
      // Given
      const quote = createQuoteFixture({ id: quoteId, partnerCode: partnerCode, specialOperationsCode: OperationCode.SEMESTER1, specialOperationsCodeAppliedAt: new Date() })
      quoteRepository.get.withArgs(quoteId).resolves(quote)
      const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quote.id, specOpsCode: undefined })
      const updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
      const updatedQuote = createQuoteFixture(
        {
          id: 'UDQUOT3',
          partnerCode: 'myPartner',
          premium: 69.84,
          nbMonthsDue: 12,
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
          startDate: new Date('2020-01-05T00:00:00.000Z'),
          termStartDate: new Date('2020-01-05T00:00:00.000Z'),
          termEndDate: new Date('2021-01-04T00:00:00.000Z')
        }
      )
      quoteRepository.update.withArgs(updatedQuote).resolves()

      // When
      await updateQuote(updateQuoteCommand)

      // Then
      return expect(quoteRepository.update).to.have.been.calledWithExactly(updatedQuote)
    })
  })

  describe('should apply operation code when valid code contains spaces or non alphanumeric characters', async () => {
    const codesList = ['FULL   YEAR', 'FULL_YEAR', 'FULL.YEAR', 'fullyear', 'full@year', 'FUll!ç&Year']
    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        nbMonthsDue: 10,
        specialOperationsCode: OperationCode.FULLYEAR,
        specialOperationsCodeAppliedAt: new Date('2020-01-05T00:00:00.000Z'),
        startDate: new Date('2020-01-05T00:00:00.000Z'),
        termStartDate: new Date('2020-01-05T00:00:00.000Z'),
        premium: 58.2,
        termEndDate: new Date('2020-11-04T00:00:00.000Z')
      }
    )

    for (const code of codesList) {
      it(`when ${code} is passed as special operations code`, async () => {
        // Given
        quoteRepository.get.withArgs(quoteId).resolves(quote)
        quoteRepository.update.withArgs(updatedQuote).resolves()
        updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)
        const updateQuoteCommand = createUpdateQuoteCommandFixture({ id: quoteId, specOpsCode: code })
        // When
        await updateQuote(updateQuoteCommand)
        // Then
        quoteRepository.update.verify()
      })
    }
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
        premium: 69.84,
        nbMonthsDue: 12,
        specialOperationsCode: null,
        specialOperationsCodeAppliedAt: null
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

  it('should reset emailValidatedAt when email is updated', async () => {
    // Given
    const quote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        policyHolder: createQuotePolicyHolderFixture({
          email: 'former@email.com',
          emailValidatedAt: new Date('2022-01-13T00:00:00.000Z')
        })
      }
    )

    const updatedQuote = createQuoteFixture(
      {
        id: 'UDQUOT3',
        partnerCode: 'myPartner',
        specialOperationsCode: null,
        specialOperationsCodeAppliedAt: null,
        termEndDate: new Date('2021-01-04T00:00:00.000Z'),
        policyHolder: createQuotePolicyHolderFixture({
          email: 'updated@email.com',
          emailValidatedAt: undefined
        })
      }
    )
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    quoteRepository.update.withArgs(updatedQuote).resolves()
    updateQuote = UpdateQuote.factory(quoteRepository, partnerRepository)

    const updateQuoteCommand = createUpdateQuoteCommandFixture({
      id: quoteId,
      policyHolder: createUpdateQuoteCommandPolicyHolderFixture({
        email: 'updated@email.com'
      })
    })

    // When
    await updateQuote(updateQuoteCommand)
    // Then
    sinon.assert.calledWithExactly(quoteRepository.update, updatedQuote)
  })
})
