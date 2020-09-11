import { Quote } from '../../../../src/app/quotes/domain/quote'

export function createQuote (attr:Partial<Quote> = {}): Quote {
  return {
    id: 'UD65X3A',
    partnerCode: 'myPartner',
    risk: {
      property: {
        roomCount: 2
      }
    },
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
    ...attr
  }
}
