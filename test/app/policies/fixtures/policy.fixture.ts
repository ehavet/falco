import { Policy } from '../../../../src/app/policies/domain/policy'

export function createPolicyFixture (attr: Partial<Policy> = {}): Policy {
  const now: Date = new Date('2020-01-05T00:00:00Z')
  return {
    id: 'APP753210859',
    partnerCode: 'myPartner',
    insurance: {
      estimate: {
        monthlyPrice: 5.82,
        defaultDeductible: 150,
        defaultCeiling: 7000
      },
      currency: 'EUR',
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      productCode: 'APP999',
      productVersion: 'v2020-02-01',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    },
    risk: {
      property: {
        roomCount: 2,
        address: '13 rue du loup garou',
        postalCode: '91100',
        city: 'Corbeil-Essonnes'
      },
      people: {
        person: {
          firstname: 'Jean',
          lastname: 'Dupont'
        },
        otherPeople: [
          {
            firstname: 'John',
            lastname: 'Doe'
          }
        ]
      }
    },
    contact: {
      firstname: 'Jean',
      lastname: 'Dupont',
      address: '13 rue du loup garou',
      postalCode: '91100',
      city: 'Corbeil-Essonnes',
      email: 'jeandupont@email.com',
      phoneNumber: '+33684205510'
    },
    premium: 69.84,
    nbMonthsDue: 12,
    startDate: now,
    termStartDate: now,
    termEndDate: now,
    subscriptionDate: now,
    signatureDate: now,
    paymentDate: now,
    emailValidationDate: now,
    specialOperationsCodeAppliedAt: null,
    specialOperationsCode: null,
    status: Policy.Status.Initiated,
    ...attr
  }
}

export function createOngoingPolicyFixture (attr: Partial<Policy> = {}): Policy {
  return createPolicyFixture({
    signatureDate: undefined,
    paymentDate: undefined,
    subscriptionDate: undefined,
    emailValidationDate: undefined,
    ...attr
  })
}
