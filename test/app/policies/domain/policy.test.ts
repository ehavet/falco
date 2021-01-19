import { dateFaker, expect } from '../../../test-utils'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuoteFixture } from '../../quotes/fixtures/quote.fixture'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { SinonStubbedInstance } from 'sinon'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import {
  PolicyRiskNumberOfRoommatesError,
  PolicyRiskPropertyMissingFieldError,
  PolicyRiskPropertyOccupancyNotInsurableError,
  PolicyRiskPropertyTypeNotInsurableError,
  PolicyRiskRoommatesNotAllowedError
} from '../../../../src/app/policies/domain/policies.errors'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { PropertyType } from '../../../../src/app/common-api/domain/type/property-type'
import { Occupancy } from '../../../../src/app/common-api/domain/type/occupancy'
import Question = Partner.Question;

describe('Policies - Domain', async () => {
  describe('#create', async () => {
    const now = new Date('2020-02-29T10:09:08Z')
    const expectedTermEndDate = new Date('2021-04-04T10:09:08.000Z')
    const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
    let quote: Quote
    let partner: Partner
    let createPolicyCommand: CreatePolicyCommand

    beforeEach(() => {
      quote = createQuoteFixture()
      createPolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })
      partner = createPartnerFixture()
      dateFaker.setCurrentDate(now)
      policyRepository.isIdAvailable.resolves(true)
    })

    afterEach(() => {
      policyRepository.isIdAvailable.reset()
    })

    describe('should generate an id', async () => {
      it('which is a string with 12 characters', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.id).to.be.a.string
        expect(createdPolicy.id).to.have.lengthOf(12)
      })

      it('with three first characters are uppercase letters from partner code', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        const idPrefix: string = createdPolicy.id.substring(0, 3)
        expect(idPrefix).to.equal('TRI')
      })

      it('with 3 next characters are from partners product code', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        const idSuffix: string = createdPolicy.id.substring(3, 6)
        expect(idSuffix).to.equal('666')
      })

      it('with 6 last characters are random numbers', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        const idSuffix: string = createdPolicy.id.substring(6, 12)
        expect(idSuffix).to.match(/^[1-9]{6}/)
      })

      it('which does not already exists',
        async () => {
        // Given
          policyRepository.isIdAvailable.onFirstCall().resolves(false)
          policyRepository.isIdAvailable.onSecondCall().resolves(true)

          // When
          const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

          // Then
          const existingPolicyId = policyRepository.isIdAvailable.getCall(0).args[0]
          const nonExistingPolicyId = policyRepository.isIdAvailable.getCall(1).args[0]
          expect(policyRepository.isIdAvailable).to.have.been.calledTwice
          expect(createdPolicy.id).to.not.equal(existingPolicyId)
          expect(createdPolicy.id).to.equal(nonExistingPolicyId)
        })
    })

    it('should set the insurance from the quote', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.insurance).to.deep.equal(quote.insurance)
    })

    it('should set the risk from the quote and the command', async () => {
      // Given
      const expectedRisk: Policy.Risk = {
        property: {
          roomCount: 2,
          address: '88 rue des prairies',
          postalCode: '91100',
          city: 'Kyukamura',
          type: PropertyType.FLAT,
          occupancy: Occupancy.TENANT
        },
        people: {
          person: {
            lastname: 'Dupont',
            firstname: 'Jean'
          },
          otherPeople: [
            {
              lastname: 'Doe',
              firstname: 'John'
            }
          ]
        }
      }

      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.risk).to.deep.equal(expectedRisk)
    })

    it('should set the other insured to empty list if the partner does not allow roommates and there are no roommates', async () => {
      // Given
      createPolicyCommand.risk.people.otherInsured = []

      partner.questions = [{ code: Partner.Question.QuestionCode.ROOMMATE, applicable: false },
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

      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.risk.people.otherPeople).to.be.empty
    })

    it('should set the contact', async () => {
      // Given
      const expectedContact: Policy.Holder = {
        lastname: 'Dupont',
        firstname: 'Jean',
        address: '88 rue des prairies',
        postalCode: '91100',
        city: 'Kyukamura',
        email: 'jeandupont@email.com',
        phoneNumber: '+33684205510'
      }

      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.contact).to.deep.equal(expectedContact)
    })

    it('should set the partner code', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.partnerCode).to.deep.equal(createPolicyCommand.partnerCode)
    })

    it('should set signatureDate, subscription and paymentDate to undefined because policy is not signed not payed yet', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.signatureDate).to.be.undefined
      expect(createdPolicy.subscriptionDate).to.be.undefined
      expect(createdPolicy.paymentDate).to.be.undefined
    })

    describe('should set startDate and termStartDate', async () => {
      it('to the given start date', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(createPolicyCommand.startDate)
        expect(createdPolicy.termStartDate).to.deep.equal(createPolicyCommand.startDate)
      })

      it('to now by default', async () => {
        // When
        const createPolicyCommandWithNoStartDate: CreatePolicyCommand =
            createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
        const createdPolicy: Policy = await Policy.create(createPolicyCommandWithNoStartDate, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(now)
        expect(createdPolicy.termStartDate).to.deep.equal(now)
      })
    })

    it('should set termEndDate to startDate + 1 year - 1 day by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.termEndDate).to.deep.equal(expectedTermEndDate)
    })

    it('should set nbDueMonths to 12 by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.nbMonthsDue).to.equal(12)
    })

    it('should set premium to monthlyPrice * nbMonthsDue(12 by default)', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.premium).to.equal(69.84)
    })

    it('should set the policy status to INITIATED', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.status).to.equal(Policy.Status.Initiated)
    })

    it('should set the contractual terms and ipid document links', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.insurance.contractualTerms).to.equal(quote.insurance.contractualTerms)
      expect(createdPolicy.insurance.ipid).to.equal(quote.insurance.ipid)
    })

    it('should throw an error if there are roommates but the partner does not allow it', async () => {
      // Given
      const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.ROOMMATE, applicable: false }]
      partner.questions = questions

      // When
      const promise = Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyRiskRoommatesNotAllowedError, 'Adding roommates is not allowed')
    })

    it('should throw an error if the partner allows roommates but there are more roommates than allowed', async () => {
      // Given
      const commandWith2Roommates: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })
      commandWith2Roommates.risk.people.otherInsured = [{ firstname: 'John', lastname: 'Doe' }, { firstname: 'Eric', lastname: 'Smith' }]

      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: quote.risk.property.roomCount, value: 1 }]
      }]
      partner.questions = questions

      // When
      const promise = Policy.create(commandWith2Roommates, quote, policyRepository, partner)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyRiskNumberOfRoommatesError, 'A property of 2 room(s) allows a maximum of 1 roommate(s)')
    })

    it('should throw an error if the partner allows roommates but no limitation is found for the property room count', async () => {
      // Given
      const commandWith2Roommates: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })
      commandWith2Roommates.risk.people.otherInsured = [{ firstname: 'John', lastname: 'Doe' }]

      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: 5, value: 1 }]
      }]
      partner.questions = questions

      // When
      const promise = Policy.create(commandWith2Roommates, quote, policyRepository, partner)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyRiskNumberOfRoommatesError, 'A property of 2 room(s) allows a maximum of 0 roommate(s)')
    })

    it('should take the address, postalCode and city from the command when quote address is empty', async () => {
      const quoteWithoutAddress: Quote = createQuoteFixture({
        risk: {
          property: {
            roomCount: 2,
            address: undefined,
            postalCode: undefined,
            city: undefined
          }
        }
      } as any)
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quoteWithoutAddress.id })

      const policy = await Policy.create(createPolicyCommand, quoteWithoutAddress, policyRepository, partner)

      expect(policy.risk.property.address).to.be.equal(createPolicyCommand.risk.property.address)
      expect(policy.risk.property.postalCode).to.be.equal(createPolicyCommand.risk.property.postalCode)
      expect(policy.risk.property.city).to.be.equal(createPolicyCommand.risk.property.city)
    })

    it('should take the address, postalCode and city from the quote when they are present', async () => {
      const quoteWithAddress: Quote = createQuoteFixture({
        risk: {
          property: {
            roomCount: 2,
            address: 'Rue de la Nouvelle Quote',
            postalCode: '75019',
            city: 'QuoteCity'
          }
        }
      } as any)
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quoteWithAddress.id })

      const policy = await Policy.create(createPolicyCommand, quoteWithAddress, policyRepository, partner)

      expect(policy.risk.property.address).to.be.equal(quoteWithAddress.risk.property.address)
      expect(policy.risk.property.postalCode).to.be.equal(quoteWithAddress.risk.property.postalCode)
      expect(policy.risk.property.city).to.be.equal(quoteWithAddress.risk.property.city)
    })

    it('should take the property.type from the quote when it is present', async () => {
      const quoteWithType: Quote = createQuoteFixture({
        risk: {
          property: {
            roomCount: 2,
            address: 'Rue de la Nouvelle Quote',
            postalCode: '75019',
            city: 'QuoteCity',
            type: PropertyType.FLAT
          }
        }
      } as any)
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithType.id,
        risk: {
          property: {
            address: '13 rue du loup garou',
            postalCode: '91100',
            city: 'Corbeil-Essonnes',
            type: undefined,
            occupancy: undefined
          },
          people: {
            policyHolder: {
              lastname: 'Dupont',
              firstname: 'Jean'
            },
            otherInsured: [
              {
                lastname: 'Doe',
                firstname: 'John'
              }
            ]
          }
        }
      })

      const policy = await Policy.create(createPolicyCommand, quoteWithType, policyRepository, partner)

      expect(policy.risk.property.type).to.be.equal(quoteWithType.risk.property.type)
    })

    it('should take the property.type from the command when the quote does not provide property.type', async () => {
      const quoteWithoutType: Quote = createQuoteFixture({
        risk: {
          property: {
            roomCount: 2,
            address: 'Rue de la Nouvelle Quote',
            postalCode: '75019',
            city: 'QuoteCity',
            type: undefined
          }
        }
      } as any)
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithoutType.id
      })

      const policy = await Policy.create(createPolicyCommand, quoteWithoutType, policyRepository, partner)

      expect(policy.risk.property.type).to.be.equal(createPolicyCommand.risk.property.type)
    })

    it('should take the default property.type from partner if the command and the quote do not provide property.type', async () => {
      const quoteWithoutType: Quote = createQuoteFixture({
        risk: {
          property: {
            roomCount: 2,
            address: 'Rue de la Nouvelle Quote',
            postalCode: '75019',
            city: 'QuoteCity',
            type: undefined
          }
        }
      } as any)
      const createPolicyCommandWithoutType: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithoutType.id
      })
      createPolicyCommandWithoutType.risk.property.type = undefined

      const policy = await Policy.create(createPolicyCommandWithoutType, quoteWithoutType, policyRepository, partner)

      expect(policy.risk.property.type).to.be.equal(PropertyType.FLAT)
    })

    it('should take the occupancy from the quote when it is present', async () => {
      const quoteWithOccupancy: Quote = createQuoteFixture()
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithOccupancy.id
      })
      createPolicyCommand.risk.property.occupancy = undefined

      const policy = await Policy.create(createPolicyCommand, quoteWithOccupancy, policyRepository, partner)

      expect(policy.risk.property.occupancy).to.be.equal(quoteWithOccupancy.risk.property.occupancy)
    })

    it('should take the occupancy from the command when the quote does not provide occupancy', async () => {
      const quoteWithoutOccupancy: Quote = createQuoteFixture()
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithoutOccupancy.id
      })
      quoteWithoutOccupancy.risk.property.occupancy = undefined

      const policy = await Policy.create(createPolicyCommand, quoteWithoutOccupancy, policyRepository, partner)

      expect(policy.risk.property.occupancy).to.be.equal(createPolicyCommand.risk.property.occupancy)
    })

    it('should take the default occupancy from partner if the command and the quote do not provide occupancy', async () => {
      const quoteWithoutOccupancy: Quote = createQuoteFixture()
      quoteWithoutOccupancy.risk.property.occupancy = undefined
      const createPolicyCommandWithoutOccupancy: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quoteWithoutOccupancy.id
      })
      createPolicyCommandWithoutOccupancy.risk.property.occupancy = undefined

      const policy = await Policy.create(createPolicyCommandWithoutOccupancy, quoteWithoutOccupancy, policyRepository, partner)

      expect(policy.risk.property.occupancy).to.be.equal(Occupancy.TENANT)
    })

    it('should take the property type from the quote to create the policy (v1)', async () => {
      // Given
      const quoteWithPropertyType: Quote = createQuoteFixture()
      quoteWithPropertyType.policyHolder!.emailValidatedAt = new Date()
      // When
      const policy = await Policy.createFromQuote('POLICYID', quoteWithPropertyType)
      // Then
      expect(policy.risk.property.type).to.be.equal(PropertyType.FLAT)
    })

    it('should take the occupancy from the quote to create the policy (v1)', async () => {
      // Given
      const quoteWithOccupancy: Quote = createQuoteFixture()
      quoteWithOccupancy.policyHolder!.emailValidatedAt = new Date()
      // When
      const policy = await Policy.createFromQuote('POLICYID', quoteWithOccupancy)
      // Then
      expect(policy.risk.property.occupancy).to.be.equal(Occupancy.TENANT)
    })

    it('should throw an error if the property.type from the command is not insurable by the partner and no type is provided in the quote', () => {
      // Given
      const commandWithNotInsurableType: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quote.id
      })
      commandWithNotInsurableType.risk.property.type = PropertyType.HOUSE
      quote.risk.property.type = undefined

      // When
      const promise = Policy.create(commandWithNotInsurableType, quote, policyRepository, partner)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyRiskPropertyTypeNotInsurableError, 'Cannot create policy, HOUSE is not insured by this partner')
    })

    it('should throw an error if the occupancy from the command is not insurable by the partner and no occupancy is provided in the quote', () => {
      // Given
      const commandWithNotInsurableOccupancy: CreatePolicyCommand = createCreatePolicyCommand({
        quoteId: quote.id
      })
      commandWithNotInsurableOccupancy.risk.property.occupancy = Occupancy.LANDLORD
      quote.risk.property.occupancy = undefined

      // When
      const promise = Policy.create(commandWithNotInsurableOccupancy, quote, policyRepository, partner)

      // Then
      return expect(promise).to.be.rejectedWith(PolicyRiskPropertyOccupancyNotInsurableError, 'Cannot create policy, LANDLORD is not insured by this partner')
    })

    describe('should throw an error if', () => {
      it('city is not present from quote and command', async () => {
        const quoteWithoutCity: Quote = createQuoteFixture({
          risk: {
            property: {
              roomCount: 2,
              address: '28 Rue des Acacias',
              postalCode: '91100',
              city: undefined
            }
          }
        } as any)
        const createPolicyCommandWithoutCity: CreatePolicyCommand = createCreatePolicyCommand({
          quoteId: quoteWithoutCity.id,
          risk: {
            property: {
              address: '28 Rue des Acacias',
              postalCode: '91110',
              city: undefined
            }
          }
        } as any)

        const promise = Policy.create(createPolicyCommandWithoutCity, quoteWithoutCity, policyRepository, partner)

        return expect(promise).to.be.rejectedWith(PolicyRiskPropertyMissingFieldError, `Quote ${quoteWithoutCity.id} risk property city should be completed`)
      })

      it('address is not present from quote and command', async () => {
        const quoteWithoutAddress: Quote = createQuoteFixture({
          risk: {
            property: {
              roomCount: 2,
              address: undefined,
              postalCode: '91100',
              city: 'Villabe'
            }
          }
        } as any)
        const createPolicyCommandWithoutAddress: CreatePolicyCommand = createCreatePolicyCommand({
          quoteId: quoteWithoutAddress.id,
          risk: {
            property: {
              address: undefined,
              postalCode: '91100',
              city: 'Villabe'
            }
          }
        } as any)

        const promise = Policy.create(createPolicyCommandWithoutAddress, quoteWithoutAddress, policyRepository, partner)

        return expect(promise).to.be.rejectedWith(PolicyRiskPropertyMissingFieldError, `Quote ${quoteWithoutAddress.id} risk property address should be completed`)
      })

      it('postalCode is not present from quote and command', async () => {
        const quoteWithoutPostalCode: Quote = createQuoteFixture({
          risk: {
            property: {
              roomCount: 2,
              address: '28 Rue des Acacias',
              postalCode: undefined,
              city: 'Villabe'
            }
          }
        } as any)
        const createPolicyCommandWithoutPostalCode: CreatePolicyCommand = createCreatePolicyCommand({
          quoteId: quoteWithoutPostalCode.id,
          risk: {
            property: {
              address: '28 Rue des Acacias',
              postalCode: undefined,
              city: 'Villabe'
            }
          }
        } as any)

        const promise = Policy.create(createPolicyCommandWithoutPostalCode, quoteWithoutPostalCode, policyRepository, partner)

        return expect(promise).to.be.rejectedWith(PolicyRiskPropertyMissingFieldError, `Quote ${quoteWithoutPostalCode.id} risk property postalCode should be completed`)
      })

      it('type is not present from quote on V1', async () => {
        const quoteWithoutType: Quote = createQuoteFixture({
          risk: {
            property: {
              roomCount: 2,
              address: '28 Rue des Acacias',
              postalCode: '91100',
              city: 'Villabe',
              type: undefined
            },
            person: {
              firstname: 'Jean-Jean',
              lastname: 'Lapin'
            },
            otherPeople: [
              {
                firstname: 'John',
                lastname: 'Doe'
              }
            ]
          }
        } as any)

        quoteWithoutType.policyHolder!.emailValidatedAt = new Date()

        const promise = Policy.createFromQuote('DEMO1234', quoteWithoutType)

        return expect(promise).to.be.rejectedWith(PolicyRiskPropertyMissingFieldError, `Quote ${quoteWithoutType.id} risk property type should be completed`)
      })
    })
  })
})
