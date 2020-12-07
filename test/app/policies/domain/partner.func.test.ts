import { expect } from '../../../test-utils'
import { isRelatedToADemoPartner } from '../../../../src/app/partners/domain/partner.func'

describe('isRelatedToDemoPartners', async () => {
  it('Should return true if the partner names start with demo', () => {
    const demoPartnerNames = ['demo', 'demo-student', 'demostudent']
    demoPartnerNames.forEach((demoPartnerName) => {
      expect(isRelatedToADemoPartner(demoPartnerName)).to.be.true
    })
  })

  describe('Should return false if', () => {
    it('the partner names dont start with demo', () => {
      const demoPartnerNames = ['dem', 'essca', 'estudent']
      demoPartnerNames.forEach((demoPartnerName) => {
        expect(isRelatedToADemoPartner(demoPartnerName)).to.be.false
      })
    })

    it('the partner names is undefined', () => {
      expect(isRelatedToADemoPartner(undefined)).to.be.false
    })
  })
})
