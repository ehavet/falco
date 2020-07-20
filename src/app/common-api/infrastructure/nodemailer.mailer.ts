import { Email, Mailer, MailerResponse } from '../domain/mailer'
import { MailDeliveryFailureError } from '../domain/mailer.errors'
import { logger } from '../../../libs/logger'

export class Nodemailer implements Mailer {
  constructor (private nodemailerTransporter) {
  }

  async send (email: Email) : Promise<MailerResponse> {
    try {
      const response = await this.nodemailerTransporter.sendMail({
        from: email.sender,
        to: email.recipient,
        subject: email.subject,
        text: email.messageText,
        html: email.messageHtml
      })
      return { messageId: response.messageId }
    } catch (error) {
      logger.error(error)
      throw new MailDeliveryFailureError(email.sender)
    }
  }
}
