import { EmailValidationQuery } from '../../../../src/app/email-validations/domain/email-validation-query'
import { SendValidationLinkToEmailAddress } from '../../../../src/app/email-validations/domain/send-validation-link-to-email-address.usecase'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationLinkConfig } from '../../../../src/configs/validation-link.config'
import { expectedValidationEmailMessage } from '../expectations/expected-validation-email-message'
import { EmailValidationQueryConsistencyError } from '../../../../src/app/email-validations/domain/email-validation.errors'

describe('Email validations - Usecase - Send a validation link to an email address', async () => {
  const encrypter = { encrypt: sinon.stub(), decrypt: sinon.mock() }
  const mailer = { send: sinon.spy() }
  const config: ValidationLinkConfig = {
    baseUrl: 'http://front-url/validate',
    validityPeriodinMonth: 6,
    frontCallbackPageRoute: 'synthese',
    frontUrl: 'http://front-ulr.fr',
    locales: ['fr', 'en']
  }

  beforeEach(async () => {
    dateFaker.setCurrentDate(new Date('2020-08-12T00:00:00.000Z'))
  })

  afterEach(() => {
    encrypter.encrypt.reset()
    encrypter.decrypt.reset()
  })

  it('should throw EmailValidationQueryConsistencyError when both policy id and quote are specified', async () => {
    // GIVEN
    const emailValidationQuery: EmailValidationQuery = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://given/callback',
      partnerCode: 'partnerCode',
      quoteId: 'QU0T31D666',
      policyId: 'APP746312047'
    }
    const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress =
        SendValidationLinkToEmailAddress.factory(encrypter, mailer, config)
    // WHEN
    const promise = sendValidationLinkToEmailAddress(emailValidationQuery)
    // THEN
    return expect(promise).to.be.rejectedWith(EmailValidationQueryConsistencyError)
  })

  it('should throw EmailValidationQueryConsistencyError when both policy id and quote are undefined', async () => {
    // GIVEN
    const emailValidationQuery: EmailValidationQuery = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://given/callback',
      partnerCode: 'partnerCode'
    }
    const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress =
        SendValidationLinkToEmailAddress.factory(encrypter, mailer, config)
    // WHEN
    const promise = sendValidationLinkToEmailAddress(emailValidationQuery)
    // THEN
    return expect(promise).to.be.rejectedWith(EmailValidationQueryConsistencyError)
  })

  describe('when success', async () => {
    const idTypes = [{ policyId: 'APP746312047' }, { quoteId: 'APP746312047' }]
    idTypes.forEach(async function (idType) {
      const idTypeString = Object.keys(idType)[0]

      describe('when callback url is present', async () => {
        beforeEach(async () => {
          mailer.send = sinon.spy()
        })

        afterEach(async () => {
          encrypter.encrypt.reset()
        })

        it(`should build a validation link and token with ${idTypeString} then send it to a provided email address`, async () => {
        // GIVEN
          const emailValidationQuery: EmailValidationQuery = {
            ...{ email: 'albert.hofmann@science.org', callbackUrl: 'http://given/callback', partnerCode: 'partnerCode' },
            ...idType
          }

          const validationTokenPayload: ValidationTokenPayload = {
            ...{ email: 'albert.hofmann@science.org', callbackUrl: 'http://given/callback', expiredAt: new Date('2021-02-12T00:00:00.000Z') },
            ...idType
          }

          const encryptedValidationToken = '3NCRYPT3DB4+S364STR1NG=='

          encrypter.encrypt.withArgs(JSON.stringify(validationTokenPayload))
            .onFirstCall().returns(encryptedValidationToken)
            .onSecondCall().returns(encryptedValidationToken)

          const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress =
            SendValidationLinkToEmailAddress.factory(encrypter, mailer, config)

          // WHEN
          await sendValidationLinkToEmailAddress(emailValidationQuery)

          // THEN
          sinon.assert.calledOnceWithExactly(mailer.send, {
            sender: '"Appenin Assurance" <validation@appenin.fr>',
            recipient: 'albert.hofmann@science.org',
            subject: 'Appenin - validation de votre adresse e-mail / e-mail validation',
            messageHtml: expectedValidationEmailMessage
          })
        })
      })

      describe('when callback url is not provided', async () => {
        afterEach(async () => {
          encrypter.encrypt.reset()
        })

        it(`should generate a callbackUrl with ${idTypeString}`, async () => {
        // GIVEN
          const emailValidationQuery: EmailValidationQuery = {
            ...{
              email: 'albert.hofmann@science.org',
              callbackUrl: '',
              partnerCode: 'partnerCode'
            },
            ...idType
          }

          const validationTokenPayloadFr: ValidationTokenPayload = {
            ...{
              email: 'albert.hofmann@science.org',
              callbackUrl: `http://front-ulr.fr/fr/partnerCode/synthese?${_camelToSnakeCase(idTypeString)}=APP746312047`,
              expiredAt: new Date('2021-02-12T00:00:00.000Z')
            },
            ...idType
          }

          const validationTokenPayloadEn: ValidationTokenPayload = {
            ...{
              email: 'albert.hofmann@science.org',
              callbackUrl: `http://front-ulr.fr/en/partnerCode/synthese?${_camelToSnakeCase(idTypeString)}=APP746312047`,
              expiredAt: new Date('2021-02-12T00:00:00.000Z')
            },
            ...idType
          }

          const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress =
              SendValidationLinkToEmailAddress.factory(encrypter, mailer, config)

          // WHEN
          await sendValidationLinkToEmailAddress(emailValidationQuery)

          // THEN
          sinon.assert.calledWithExactly(encrypter.encrypt, JSON.stringify(validationTokenPayloadFr))
          sinon.assert.calledWithExactly(encrypter.encrypt, JSON.stringify(validationTokenPayloadEn))
        })
      })
    })
  })
})

const _camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
