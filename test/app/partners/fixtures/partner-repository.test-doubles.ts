import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'

export function partnerRepositoryStub (attr = {}): SinonStubbedInstance<PartnerRepository> {
  return {
    getOperationCodes: sinon.stub(),
    getByCode: sinon.stub(),
    getCallbackUrl: sinon.stub(),
    getOffer: sinon.stub(),
    ...attr
  }
}
