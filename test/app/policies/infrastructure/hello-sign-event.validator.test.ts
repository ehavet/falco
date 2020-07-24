import { expect } from '../../../test-utils'
import { HelloSignConfig } from '../../../../src/configs/hello-sign.config'
import { HelloSignEventValidator } from '../../../../src/app/policies/infrastructure/signature/hello-sign-event.validator'
import { signatureEventFixture } from '../fixtures/signatureEvent.fixture'

describe('Signature - Infra - Hello Sign event validator', () => {
  const config: HelloSignConfig = {
    clientId: '',
    testMode: true,
    hellosign: {},
    key: 'fakeKey'
  }

  const helloSignEventValidator: HelloSignEventValidator = new HelloSignEventValidator(config)

  describe('isValid', () => {
    it('should return false is the event event_hash is not good', () => {
      // Given
      const helloSignEventFixture = signatureEventFixture()

      // When
      const isValid = helloSignEventValidator.isValid(helloSignEventFixture)

      // Then
      expect(isValid).to.be.false
    })

    it('should return true is the event event_hash is good', () => {
      // Given
      const helloSignEventFixture = signatureEventFixture()
      helloSignEventFixture.validation.hash = '17668c08248741350a8ab0d8285330f339768d1533eed2a8126e3c9d48614439'

      // When
      const isValid = helloSignEventValidator.isValid(helloSignEventFixture)

      // Then
      expect(isValid).to.be.true
    })
  })
})
