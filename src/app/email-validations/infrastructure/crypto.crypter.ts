import { Crypter } from '../domain/crypter'
import { CryptoConfig } from '../../../configs/crypto.config'

const crypto = require('crypto')
const bufferEncryption = 'utf-8'

export class CryptoCrypter implements Crypter {
  algorithm: string
  encryptionEncoding: BufferEncoding
  key: string
  initializationVector: string

  constructor (
    config: CryptoConfig
  ) {
    this.algorithm = config.algorithm
    this.encryptionEncoding = config.encryptionEncoding
    this.key = config.key
    this.initializationVector = 'ABCDEFGHIJKLMNOP'
  }

  encrypt (stringToEncrypt: string): string {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.key, bufferEncryption),
      Buffer.from(this.initializationVector, bufferEncryption)
    )

    let encrypted = cipher.update(stringToEncrypt, bufferEncryption, this.encryptionEncoding)
    encrypted += cipher.final(this.encryptionEncoding)

    return encrypted
  }

  decrypt (cryptoEncryptedString: string): string {
    const encryptedText = Buffer.from(cryptoEncryptedString, this.encryptionEncoding)
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key, bufferEncryption),
      Buffer.from(this.initializationVector, bufferEncryption)
    )
    decipher.setAutoPadding(true)
    try {
      const decryptedString: string = decipher.update(encryptedText) + decipher.final()
      return decryptedString
    } catch (error) {
      throw new BadDecryptError(cryptoEncryptedString)
    }
  }
}

export class BadDecryptError extends Error {
  constructor (cryptoEncryptedString: string) {
    const message: string = `Could not decrypt ${cryptoEncryptedString}`
    super(message)
    this.name = 'BadDecryptError'
  }
}
