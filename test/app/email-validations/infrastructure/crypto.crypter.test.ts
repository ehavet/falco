import { expect } from '../../../test-utils'
import { BadDecryptError, CryptoCrypter } from '../../../../src/app/email-validations/infrastructure/crypto.crypter'
import { cryptoTestConfig } from '../../../configs/crypto.test.config'

describe('CryptoCrypter', async () => {
  const originalString: string = 'goodbye world'
  const encryptedString: string = 'GVCr0U93UGAnHqxYQIg0tw=='

  const cryptoCrypter: CryptoCrypter = new CryptoCrypter(cryptoTestConfig)

  describe('encrypt', async () => {
    it('should return a base64 encrypted string when a string is passed as argument', async () => {
      expect(cryptoCrypter.encrypt(originalString)).to.be.equal(encryptedString)
    })
  })

  describe('decrypt', async () => {
    it('should return the corresponding string when a crypto base64 string is passed as argument', async () => {
      expect(cryptoCrypter.decrypt(encryptedString)).to.be.equal(originalString)
    })

    it('should thrown BadDecryptError when base64 string provided is invalid or unrecognized', async () => {
      // GIVEN
      const invalidCryptoBase64String = 'x4QURd/JOf4v4Re3Dy/wxQ=='
      // WHEN
      expect(cryptoCrypter.decrypt.bind(cryptoCrypter, invalidCryptoBase64String))
      // THEN
        .to.throw(BadDecryptError)
    })
  })
})
