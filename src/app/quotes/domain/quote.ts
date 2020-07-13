import { Partner } from '../../partners/domain/partner'
import { NoPartnerInsuranceForRiskError } from './quote.errors'
import { generate } from 'randomstring'

export interface Quote {
    id: string,
    partnerCode: string,
    risk: Quote.Risk,
    insurance: Quote.Insurance
}

export namespace Quote {

    export interface Risk {
        property: Risk.Property
    }

    export interface Insurance {
        estimate: Insurance.Estimate
        currency: string,
        simplifiedCovers: Array<Insurance.SimplifiedCover>,
        productCode: string,
        productVersion: string,
        contractualTerms: string,
        ipid: string
    }

    export function getInsurance (risk: Risk, partnerOffer: Partner.Offer, partnerCode: string): Insurance {
      const estimate: Insurance.Estimate | undefined = partnerOffer.pricingMatrix.get(risk.property.roomCount)

      if (estimate === undefined) {
        throw new NoPartnerInsuranceForRiskError(partnerCode, risk)
      }

      return <Insurance>{
        estimate,
        simplifiedCovers: partnerOffer.simplifiedCovers,
        currency: 'EUR',
        productCode: partnerOffer.productCode,
        productVersion: partnerOffer.productVersion,
        contractualTerms: partnerOffer.contractualTerms,
        ipid: partnerOffer.ipid
      }
    }

    export function nextId (): string {
      return generate({ length: 7, charset: 'alphanumeric', readable: true, capitalization: 'uppercase' })
    }

}

export namespace Quote.Risk {
    export interface Property {
        roomCount: number
    }
}

export namespace Quote.Insurance {
    export interface Estimate {
        monthlyPrice: number,
        defaultDeductible: number,
        defaultCeiling: number,
    }

    export type SimplifiedCover = string
}
