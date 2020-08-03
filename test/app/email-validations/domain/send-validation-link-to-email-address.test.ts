import { EmailValidationQuery } from '../../../../src/app/email-validations/domain/email-validation-query'
import { SendValidationLinkToEmailAddress } from '../../../../src/app/email-validations/domain/send-validation-link-to-email-address.usecase'
import { dateFaker, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationLinkConfig } from '../../../../src/configs/validation-link.config'
import { expectedValidationEmailMessage } from '../expectations/expected-validation-email-message'

describe('Usecase - Send a validation link to an email address', async () => {
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

  it('should build a validation link and send it to a provided email address', async () => {
    // GIVEN
    const emailValidationQuery: EmailValidationQuery = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://given/callback',
      partnerCode: 'partnerCode',
      policyId: 'APP746312047'
    }
    const validationTokenPayload: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://given/callback',
      policyId: 'APP746312047',
      expiredAt: new Date('2021-02-12T00:00:00.000Z')
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

  it('should generate a callbackUrl on Appenin front if no callbackUrl is given', async () => {
    // GIVEN
    const emailValidationQuery: EmailValidationQuery = {
      email: 'albert.hofmann@science.org',
      callbackUrl: '',
      partnerCode: 'partnerCode',
      policyId: 'APP746312047'
    }
    const validationTokenPayloadFr: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://front-ulr.fr/fr/partnerCode/synthese?policy_id=APP746312047',
      policyId: 'APP746312047',
      expiredAt: new Date('2021-02-12T00:00:00.000Z')
    }
    const validationTokenPayloadEn: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://front-ulr.fr/en/partnerCode/synthese?policy_id=APP746312047',
      policyId: 'APP746312047',
      expiredAt: new Date('2021-02-12T00:00:00.000Z')
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
