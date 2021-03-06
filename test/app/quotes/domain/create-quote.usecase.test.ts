import { dateFaker, expect, sinon } from '../../../test-utils'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { CreateQuoteCommand } from '../../../../src/app/quotes/domain/create-quote-command'
import {
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskOccupancyNotInsurableError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteRiskPropertyTypeNotInsurableError,
  QuoteRiskRoommatesNotAllowedError
} from '../../../../src/app/quotes/domain/quote.errors'
import { CreateQuote } from '../../../../src/app/quotes/domain/create-quote.usecase'
import { quoteRepositoryMock } from '../fixtures/quote-repository.test-doubles'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'
import { defaultCapAdviceRepositoryStub } from '../fixtures/default-cap-advice-repository.test-doubles'
import { DefaultCapAdviceNotFoundError } from '../../../../src/app/quotes/domain/default-cap-advice/default-cap-advice.errors'
import { PropertyType } from '../../../../src/app/common-api/domain/type/property-type'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { coverMonthlyPriceRepositoryStub } from '../fixtures/cover-monthly-price-repository.test-doubles'
import { Occupancy } from '../../../../src/app/common-api/domain/type/occupancy'
import { pricingZoneRepositoryStub } from '../fixtures/pricing-zone-repository.test-doubles'
import { CoverPricingZone } from '../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone'
import { sumCoverMonthlyPrices } from '../../../../src/app/quotes/domain/cover-monthly-price/cover-monthly-price.func'
import { Partner } from '../../../../src/app/partners/domain/partner'
import Question = Partner.Question

describe('Quotes - Usecase - Create Quote', async () => {
  let createQuote: CreateQuote
  let partner: Partner
  const now = new Date('2020-04-18T10:09:08Z')
  const quoteRepository = quoteRepositoryMock()
  const partnerRepository = { getByCode: sinon.stub(), getCallbackUrl: sinon.stub(), getOperationCodes: sinon.stub() }
  const defaultCapAdviceRepository = defaultCapAdviceRepositoryStub()
  const partnerOffer = {
    defaultDeductible: 150,
    simplifiedCovers: ['ACDDE', 'ACVOL'],
    productCode: 'MRH_Etudiant',
    productVersion: '1.0',
    contractualTerms: '/path/to/contractual/terms',
    ipid: '/path/to/ipid',
    operationCodes: [
      OperationCode.SEMESTER1,
      OperationCode.SEMESTER2,
      OperationCode.FULLYEAR
    ]
  }
  const coverMonthlyPriceRepository = coverMonthlyPriceRepositoryStub()
  const expectedQuote: Quote = {
    id: '',
    partnerCode: 'myPartner',
    risk: {
      property: {
        roomCount: 2,
        address: '15 Rue Des Amandiers',
        postalCode: '91110',
        city: 'Les Ulysses',
        type: PropertyType.FLAT,
        occupancy: Occupancy.TENANT
      },
      person: { firstname: 'John', lastname: 'Doe' },
      otherPeople: [{ firstname: 'Jane', lastname: 'Does' }]
    },
    insurance: {
      estimate: {
        monthlyPrice: 5.82,
        defaultDeductible: 150,
        defaultCeiling: 6000
      },
      currency: 'EUR',
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    },
    policyHolder: {
      firstname: 'June',
      lastname: 'Did',
      address: '74 avenue des ??glantines',
      postalCode: '75011',
      city: 'Paris',
      email: 'june@did.com',
      phoneNumber: '+33645290841'
    },
    nbMonthsDue: 12,
    premium: 69.84,
    specialOperationsCode: null,
    specialOperationsCodeAppliedAt: null,
    startDate: now,
    termStartDate: now,
    termEndDate: new Date('2021-04-17')
  }
  const pricingZoneRepository = pricingZoneRepositoryStub()
  const pricingZones: CoverPricingZone[] = [
    { zone: 'ZD1', cover: 'DDEAUX' },
    { zone: 'ZB2', cover: 'INCEND' },
    { zone: 'ZC3', cover: 'VOLXXX' }
  ]

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
    partner = createPartnerFixture({ code: 'myPartner', offer: partnerOffer })
    partnerRepository.getByCode.withArgs('myPartner').returns(partner)
    createQuote = CreateQuote.factory(quoteRepository, partnerRepository, defaultCapAdviceRepository, coverMonthlyPriceRepository, pricingZoneRepository)
    pricingZoneRepository.getAllForProductByLocation.resolves(pricingZones)
  })

  afterEach(() => {
    quoteRepository.save.reset()
    pricingZoneRepository.getAllForProductByLocation.reset()
  })

  describe('should create a quote', async () => {
    beforeEach(() => {
      quoteRepository.save.resolves()
      defaultCapAdviceRepository.get.withArgs('myPartner', 2).resolves({ value: 6000 })
      pricingZoneRepository.getAllForProductByLocation.resolves(pricingZones)
      coverMonthlyPriceRepository.getAllForPartnerByPricingZone.resolves([{ price: '0.82000', cover: 'DDEAUX' }, { price: '5.00000', cover: 'INCEND' }])
      coverMonthlyPriceRepository.getAllForPartnerWithoutZone.resolves([{ price: '0.82000', cover: 'DDEAUX' }, { price: '5.00000', cover: 'INCEND' }])
    })
    afterEach(() => {
      defaultCapAdviceRepository.get.reset()
      pricingZoneRepository.getAllForProductByLocation.reset()
      coverMonthlyPriceRepository.getAllForPartnerByPricingZone.reset()
      coverMonthlyPriceRepository.getAllForPartnerWithoutZone.reset()
    })

    it('with the partner code and the risk coming from the command', async () => {
      // When
      const quote: Quote = await createQuote({
        partnerCode: 'myPartner',
        specOpsCode: OperationCode.BLANK,
        risk: {
          property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', type: PropertyType.FLAT, occupancy: Occupancy.TENANT },
          person: { firstname: 'John', lastname: 'Doe' },
          otherPeople: [{ firstname: 'Jane', lastname: 'Does' }]
        }
      })

      // Then
      expect(quote).to.deep.include({ partnerCode: expectedQuote.partnerCode })
      expect(quote).to.deep.include({ risk: expectedQuote.risk })
    })

    it('with the property type provided by default by partner if not provided in command', async () => {
      // When
      const quote: Quote = await createQuote({ partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', occupancy: Occupancy.TENANT } } })

      // Then
      expect(quote.risk.property.type).to.be.equal(PropertyType.FLAT)
    })

    it('with the occupancy provided by default by partner if not provided in command', async () => {
      // When
      const quote: Quote = await createQuote({ partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', type: PropertyType.FLAT } } })

      // Then
      expect(quote.risk.property.occupancy).to.be.equal(Occupancy.TENANT)
    })

    it('with the insurance', async () => {
      // Given
      const createQuoteCommand: CreateQuoteCommand = {
        partnerCode: 'myPartner',
        specOpsCode: OperationCode.BLANK,
        risk: {
          property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
        }
      }
      const expectedInsurance: Quote.Insurance = expectedQuote.insurance

      // When
      const quote: Quote = await createQuote(createQuoteCommand)

      // Then
      expect(quote).to.deep.include({ insurance: expectedInsurance })
    })

    it('with the policy holder if specified', async () => {
      // Given
      const createQuoteCommand: CreateQuoteCommand = {
        partnerCode: 'myPartner',
        specOpsCode: OperationCode.BLANK,
        risk: {
          property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
        },
        policyHolder: {
          firstname: 'June',
          lastname: 'Did',
          address: '74 avenue des ??glantines',
          postalCode: '75011',
          city: 'Paris',
          email: 'june@did.com',
          phoneNumber: '+33645290841'
        }
      }
      const expectedPolicyHolder = expectedQuote.policyHolder

      // When
      const quote: Quote = await createQuote(createQuoteCommand)

      // Then
      expect(quote).to.deep.include({ policyHolder: expectedPolicyHolder })
    })

    it('with the nbDueMonths set to 12 by default', async () => {
      // Given
      const createQuoteCommand: CreateQuoteCommand = {
        partnerCode: 'myPartner',
        specOpsCode: OperationCode.BLANK,
        risk: {
          property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
        }
      }

      // When
      const quote: Quote = await createQuote(createQuoteCommand)

      // Then
      expect(quote.nbMonthsDue).to.equal(12)
    })

    it('with the premium set to computed monthlyPrice * nbMonthsDue(12 by default)', async () => {
      // Given
      const createQuoteCommand: CreateQuoteCommand = {
        partnerCode: 'myPartner',
        specOpsCode: OperationCode.BLANK,
        risk: {
          property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
        }
      }

      // When
      const quote: Quote = await createQuote(createQuoteCommand)

      // Then
      expect(quote.premium).to.equal(69.84)
    })

    describe('with the start date and term start date', async () => {
      it('set to the given start date', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = {
          partnerCode: 'myPartner',
          specOpsCode: OperationCode.BLANK,
          risk: {
            property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
          },
          startDate: new Date('2021-01-05T17:31:95Z')
        }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.startDate).to.deep.equal(createQuoteCommand.startDate)
        expect(quote.termStartDate).to.deep.equal(createQuoteCommand.startDate)
      })

      it('set to now if no start date is given', async () => {
        // Given
        const createQuoteCommandWithNoStartDate: CreateQuoteCommand = {
          partnerCode: 'myPartner',
          specOpsCode: OperationCode.BLANK,
          risk: {
            property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
          }
        }

        // When
        const quote: Quote = await createQuote(createQuoteCommandWithNoStartDate)

        // Then
        const nowWithNoTime = new Date(now)
        nowWithNoTime.setUTCHours(0, 0, 0, 0)
        expect(quote.startDate).to.deep.equal(nowWithNoTime)
        expect(quote.termStartDate).to.deep.equal(nowWithNoTime)
      })
    })

    describe('with the term end date', async () => {
      it('set to startDate + 1 year - 1 day by default', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = {
          partnerCode: 'myPartner',
          specOpsCode: OperationCode.BLANK,
          risk: {
            property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT }
          },
          startDate: new Date('2021-01-05')
        }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.termEndDate).to.deep.equal(new Date('2022-01-04'))
      })
    })

    describe('with the special operations code', async () => {
      it('SEMESTER1 setting the number of months due to 5 and computing the new premium', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.SEMESTER1, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.deep.include({
          specialOperationsCode: 'SEMESTER1',
          specialOperationsCodeAppliedAt: now,
          nbMonthsDue: 5,
          premium: 29.1
        })
      })

      it('SEMESTER2 setting the number of months due to 5 and computing the new premium', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.SEMESTER2, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.deep.include({
          specialOperationsCode: 'SEMESTER2',
          specialOperationsCodeAppliedAt: now,
          nbMonthsDue: 5,
          premium: 29.1
        })
      })

      it('FULLYEAR setting the number of months due to 10 and computing the new premium', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.FULLYEAR, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.deep.include({
          specialOperationsCode: 'FULLYEAR',
          specialOperationsCodeAppliedAt: now,
          nbMonthsDue: 10,
          premium: 58.2
        })
      })

      it('BLANK setting the number of months due to 12 and computing the new premium', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.deep.include({
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: null,
          nbMonthsDue: 12,
          premium: 69.84
        })
      })
    })

    describe('with a generated alphanumerical id that', async () => {
      it('has 7 characters', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.id.length).to.equal(7)
      })

      it('has no I nor l nor O nor 0', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.id).to.not.have.string('O')
        expect(quote.id).to.not.have.string('I')
        expect(quote.id).to.not.have.string('l')
        expect(quote.id).to.not.have.string('0')
      })

      it('is returned within the quote', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.include.keys('id')
      })
    })
  })

  it('should save the quote', async () => {
    // Given
    const city = 'Les Ulysses'
    const postalCode = '91110'
    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: {
          roomCount: 2,
          address: '15 Rue Des Amandiers',
          postalCode,
          city,
          type: PropertyType.FLAT,
          occupancy: Occupancy.TENANT
        },
        person: { firstname: 'John', lastname: 'Doe' },
        otherPeople: [{ firstname: 'Jane', lastname: 'Does' }]
      },
      policyHolder: {
        firstname: 'June',
        lastname: 'Did',
        address: '74 avenue des ??glantines',
        postalCode: '75011',
        city: 'Paris',
        email: 'june@did.com',
        phoneNumber: '+33645290841'
      },
      startDate: now
    }
    const pricingZones: CoverPricingZone[] = [
      { zone: 'ZD1', cover: 'DDEAUX' },
      { zone: 'ZB2', cover: 'INCEND' }
    ]
    quoteRepository.save.resolves()
    defaultCapAdviceRepository.get.withArgs('myPartner', 2).resolves({ value: 6000 })
    pricingZoneRepository.getAllForProductByLocation.withArgs(partner.offer.productCode, city, postalCode).resolves(pricingZones)
    coverMonthlyPriceRepository.getAllForPartnerByPricingZone
      .withArgs('myPartner', pricingZones, 2)
      .resolves([
        { price: '0.82000', cover: 'DDEAUX' },
        { price: '5.00000', cover: 'INCEND' }
      ])

    // When
    const quote = await createQuote(createQuoteCommand)

    // Then
    const saveSpy = quoteRepository.save.getCall(0)
    expectedQuote.id = quote.id
    return expect(saveSpy).to.have.been.calledWith(expectedQuote)
  })

  it('should throw an error if there are roommates but the partner does not allow it', async () => {
    // Given
    const questions: Array<Question> = [
      { code: Partner.Question.QuestionCode.ROOMMATE, applicable: false },
      {
        code: Partner.Question.QuestionCode.ROOM_COUNT,
        toAsk: true,
        options: [
          { value: 1 },
          { value: 2 }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: 1
      },
      {
        code: Partner.Question.QuestionCode.PROPERTY_TYPE,
        toAsk: false,
        defaultValue: PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      },
      {
        code: Partner.Question.QuestionCode.OCCUPANCY,
        toAsk: false,
        defaultValue: Occupancy.TENANT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      }
    ]
    partner.questions = questions

    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', type: PropertyType.FLAT, occupancy: Occupancy.TENANT },
        otherPeople: [{ firstname: 'Jane', lastname: 'Does' }]
      }
    }

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise).to.be.rejectedWith(QuoteRiskRoommatesNotAllowedError, '2 room(s) property does not allow roommates')
  })

  it('should throw an error if the partner allows roommates but there are more roommates than allowed', async () => {
    // Given
    const questions: Array<Question> = [
      { code: Partner.Question.QuestionCode.ROOMMATE, applicable: true, maximumNumbers: [{ roomCount: 2, value: 1 }] },
      {
        code: Partner.Question.QuestionCode.ROOM_COUNT,
        toAsk: true,
        options: [
          { value: 1 },
          { value: 2 }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: 1
      },
      {
        code: Partner.Question.QuestionCode.PROPERTY_TYPE,
        toAsk: false,
        defaultValue: PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      },
      {
        code: Partner.Question.QuestionCode.OCCUPANCY,
        toAsk: false,
        defaultValue: Occupancy.TENANT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      }
    ]
    partner.questions = questions

    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', type: PropertyType.FLAT, occupancy: Occupancy.TENANT },
        otherPeople: [{ firstname: 'Jane', lastname: 'Does' }, { firstname: 'Jene', lastname: 'Done' }]
      }
    }

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise).to.be.rejectedWith(QuoteRiskNumberOfRoommatesError, '2 room(s) property allows a maximum of 1 roommate(s)')
  })

  it('should throw an error if the partner allows roommates but no limitation is found for the property room count', async () => {
    // Given
    const questions: Array<Question> = [
      { code: Partner.Question.QuestionCode.ROOMMATE, applicable: true, maximumNumbers: [{ roomCount: 1, value: 0 }] },
      {
        code: Partner.Question.QuestionCode.ROOM_COUNT,
        toAsk: true,
        options: [
          { value: 1 },
          { value: 2 }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: 1
      },
      {
        code: Partner.Question.QuestionCode.PROPERTY_TYPE,
        toAsk: false,
        defaultValue: PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      },
      {
        code: Partner.Question.QuestionCode.OCCUPANCY,
        toAsk: false,
        defaultValue: Occupancy.TENANT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      }
    ]
    partner.questions = questions

    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses', type: PropertyType.FLAT, occupancy: Occupancy.TENANT },
        otherPeople: [{ firstname: 'Jane', lastname: 'Does' }, { firstname: 'Jene', lastname: 'Done' }]
      }
    }

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise).to.be.rejectedWith(QuoteRiskRoommatesNotAllowedError, '2 room(s) property does not allow roommates')
  })

  it('should throw an error if the property type is not insured by the partner', async () => {
    // Given
    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: {
          roomCount: 2,
          type: PropertyType.HOUSE
        }
      }
    }

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        QuoteRiskPropertyTypeNotInsurableError,
        'Cannot create quote, HOUSE is not insured by this partner'
      )
  })

  it('should throw an error if the occupancy is not insured by the partner', async () => {
    // Given
    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode: 'myPartner',
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: {
          roomCount: 2,
          occupancy: Occupancy.LANDLORD
        }
      }
    }
    defaultCapAdviceRepository.get.withArgs('myPartner', 2).resolves({ value: 6000 })
    coverMonthlyPriceRepository.getAllForPartnerByPricingZone.withArgs('myPartner', pricingZones, 2).resolves([{ price: '0.820000', cover: 'DDEAUX' }, { price: '5.000000', cover: 'INCEND' }])

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        QuoteRiskOccupancyNotInsurableError,
        'Cannot create quote, LANDLORD is not insured by this partner'
      )
  })

  it('should throw an error if there is no insurance for the given risk', async () => {
    // Given
    const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 3, type: PropertyType.FLAT, occupancy: Occupancy.TENANT } } }
    coverMonthlyPriceRepository.getAllForPartnerByPricingZone.withArgs('myPartner', pricingZones, 3).resolves([])

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        QuoteRiskPropertyRoomCountNotInsurableError,
        '3 room(s) property is not insurable'
      )
  })

  it('should throw an error if there is no default cap advices for a given partner and room count', async () => {
    // GIVEN
    const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', specOpsCode: OperationCode.BLANK, risk: { property: { roomCount: 2, address: '15 Rue Des Amandiers', postalCode: '91110', city: 'Les Ulysses' } } }
    defaultCapAdviceRepository.get.withArgs('myPartner', 2).rejects(new DefaultCapAdviceNotFoundError('myPartner', 2))

    // WHEN
    const quotePromise = createQuote(createQuoteCommand)

    // THEN
    return expect(quotePromise).to.be.rejectedWith(DefaultCapAdviceNotFoundError)
  })

  it('should return cover monthly prices when no city or postal code are found', async () => {
    // Given
    const postalCode = '66666'
    const city = 'Babylone'
    const partnerCode = 'myPartner'

    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode,
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: {
          roomCount: 2,
          address: '15 Rue Des Amandiers',
          postalCode,
          city,
          type: PropertyType.FLAT,
          occupancy: Occupancy.TENANT
        }
      }
    }

    pricingZoneRepository.getAllForProductByLocation.withArgs(partner.offer.productCode, city, postalCode).resolves([])
    defaultCapAdviceRepository.get.withArgs(partnerCode, 2).resolves({ value: 6000 })
    coverMonthlyPriceRepository.getAllForPartnerWithoutZone.resolves([{ price: '0.25233', cover: 'ZNOTFOUND' }])

    // When
    await createQuote(createQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(coverMonthlyPriceRepository.getAllForPartnerWithoutZone, partnerCode, 2)
  })

  it('should return cover monthly prices when no city or postal code are provided', async () => {
    // Given
    const postalCode = '75019'
    const city = undefined
    const partnerCode = 'myPartner'

    const createQuoteCommand: CreateQuoteCommand = {
      partnerCode,
      specOpsCode: OperationCode.BLANK,
      risk: {
        property: {
          roomCount: 2,
          address: '15 Rue Des Amandiers',
          postalCode,
          city,
          type: PropertyType.FLAT,
          occupancy: Occupancy.TENANT
        }
      }
    }

    coverMonthlyPriceRepository.getAllForPartnerWithoutZone.resolves([{ price: '0.25233', cover: 'ZNOTFOUND' }])
    defaultCapAdviceRepository.get.withArgs('myPartner', 2).resolves({ value: 6000 })

    // When
    await createQuote(createQuoteCommand)

    // Then
    sinon.assert.calledWithExactly(coverMonthlyPriceRepository.getAllForPartnerWithoutZone, partnerCode, 2)
  })

  describe('Quotes - Domain - coverMonthlyPrice#sumCoverMonthlyPrices', () => {
    it('should return 0 when there is no coverMonthlyPrices', () => {
      expect(sumCoverMonthlyPrices([])).to.be.equal(0)
    })

    describe('should round numbers correctly', () => {
      it('when the third digit is below 5', () => {
        expect(sumCoverMonthlyPrices([
          { price: '1.99467', cover: 'DDEAUX' }
        ])).to.be.equal(1.99)
      })

      it('when the third digit is above 5', () => {
        expect(sumCoverMonthlyPrices([
          { price: '1.99977', cover: 'DDEAUX' }
        ])).to.be.equal(2)
      })

      it('when the third digit is 5', () => {
        expect(sumCoverMonthlyPrices([
          { price: '1.99500', cover: 'DDEAUX' }
        ])).to.be.equal(2)
      })
    })

    describe('should sum the coverMonthlyPrices correctly', () => {
      it('when there is 1 coverMonthlyPrice', () => {
        expect(sumCoverMonthlyPrices([
          { price: '0.12000', cover: 'DDEAUX' }
        ])).to.be.equal(0.12)
      })

      it('when there is no decimal point in the result', () => {
        expect(sumCoverMonthlyPrices([
          { price: '0.12000', cover: 'DDEAUX' },
          { price: '0.29250', cover: 'DDEAUX' },
          { price: '0.47167', cover: 'DDEAUX' },
          { price: '0.02333', cover: 'DDEAUX' },
          { price: '1.81333', cover: 'DDEAUX' },
          { price: '0.84417', cover: 'DDEAUX' },
          { price: '1.16750', cover: 'DDEAUX' },
          { price: '0.17917', cover: 'DDEAUX' },
          { price: '1.08833', cover: 'DDEAUX' }
        ])).to.be.equal(6)
      })

      it('when there is a decimal point in the result', () => {
        expect(sumCoverMonthlyPrices([
          { price: '0.02420', cover: 'DDEAUX' },
          { price: '0.12833', cover: 'DDEAUX' },
          { price: '0.19083', cover: 'DDEAUX' },
          { price: '0.31166', cover: 'DDEAUX' },
          { price: '0.49666', cover: 'DDEAUX' },
          { price: '0.84583', cover: 'DDEAUX' },
          { price: '1.16166', cover: 'DDEAUX' },
          { price: '1.24500', cover: 'DDEAUX' },
          { price: '1.93583', cover: 'DDEAUX' }
        ])).to.be.equal(6.34)
      })
    })
  })
})
