import { Email } from '../../common-api/domain/mailer'
const config = require('../../../config')

export function buildValidationLinkEmail (recipient, uri): Email {
  return {
    sender: config.get('FALCO_API_APPENIN_EMAIL_ADDRESS'),
    recipient: recipient,
    subject: 'valider votre email',
    message: `${uri}`
  }
}
