import { EmailValidationQuery } from '../../../../src/app/email-validations/domain/email-validation-query'
import { SendValidationLinkToEmailAddress } from '../../../../src/app/email-validations/domain/send-validation-link-to-email-address.usecase'
import { dateFaker, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationLinkConfig } from '../../../../src/configs/validation-link.config'

describe('Usecase - Send a validation link to an email address', async () => {
  before(async () => {
    dateFaker.setCurrentDate(new Date('2020-08-12T00:00:00.000Z'))
  })

  after(function () {
    dateFaker.restoreDate()
  })

  it('should build a validation link and send it to a provided email address', async () => {
    // GIVEN
    const encrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
    const mailer = { send: sinon.spy() }
    const config: ValidationLinkConfig = { baseUrl: 'http://front-url/validate', validityPeriodinMonth: 6, emailSender: 'sender@email.com' }
    const emailValidationQuery: EmailValidationQuery = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com'
    }
    const validationTokenPayload: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      expiredAt: new Date('2021-02-12T00:00:00.000Z')
    }
    const encryptedValidationToken = '3NCRYPT3DB4+S364STR1NG=='
    encrypter.encrypt.withExactArgs(JSON.stringify(validationTokenPayload)).returns(encryptedValidationToken)
    const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress =
            SendValidationLinkToEmailAddress.factory(encrypter, mailer, config)
    // WHEN
    await sendValidationLinkToEmailAddress(emailValidationQuery)
    // THEN
    sinon.assert.calledOnceWithExactly(mailer.send, {
      sender: config.emailSender,
      recipient: 'albert.hofmann@science.org',
      subject: 'valider votre email',
      message: 'http://front-url/validate?token=3NCRYPT3DB4%2BS364STR1NG%3D%3D'
    })
  })
})
