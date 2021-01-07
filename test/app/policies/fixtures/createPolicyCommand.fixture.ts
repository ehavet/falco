import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { PropertyType } from '../../../../src/app/common-api/domain/common-type/property-type'

export function createCreatePolicyCommand (attr: Partial<CreatePolicyCommand> = {}): CreatePolicyCommand {
  return {
    partnerCode: 'myPartner',
    quoteId: '376DJ2',
    risk: {
      property: {
        address: '13 rue du loup garou',
        postalCode: '91100',
        city: 'Corbeil-Essonnes',
        type: PropertyType.FLAT
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
      email: 'jeandupont@email.com',
      phoneNumber: '+33684205510'
    },
    startDate: new Date('2020-04-05T10:09:08Z'),
    ...attr
  }
}
