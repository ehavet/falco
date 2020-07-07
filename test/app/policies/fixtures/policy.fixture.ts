import { Policy } from '../../../../src/app/policies/domain/policy'

export function createPolicyFixture (attr: Partial<Policy> = {}): Policy {
  const now: Date = new Date('2020-01-05T10:09:08Z')
  return {
    id: 'D9C61E',
    partnerCode: 'myPartner',
    insurance: {
      estimate: {
        monthlyPrice: 5.82,
        defaultDeductible: 150,
        defaultCeiling: 7000
      },
      currency: 'EUR',
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      productCode: 'MRH-Loc-Etud',
      productVersion: 'v2020-02-01'
    },
    risk: {
      property: {
        roomCount: 2,
        address: '13 rue du loup garou',
        postalCode: 91100,
        city: 'Corbeil-Essones'
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
    },
    contact: {
      lastname: 'Dupont',
      firstname: 'Jean',
      address: '13 rue du loup garou',
      postalCode: 91100,
      city: 'Corbeil-Essones',
      email: 'jeandupont@email.com',
      phoneNumber: '+33684205510'
    },
    nbMonthsDue: 12,
    premium: 69.84,
    subscriptionDate: now,
    startDate: now,
    termStartDate: now,
    termEndDate: now,
    signatureDate: now,
    paymentDate: now,
    ...attr
  }
}

export function createOngoingPolicyFixture (attr: Partial<Policy> = {}): Policy {
  return createPolicyFixture({ signatureDate: null, paymentDate: null, subscriptionDate: null, ...attr })
}
