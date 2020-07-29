import { Nodemailer } from '../../../../src/app/common-api/infrastructure/nodemailer.mailer'
import { Email, MailerResponse } from '../../../../src/app/common-api/domain/mailer'
import { expect, sinon } from '../../../test-utils'
import { MailDeliveryFailureError } from '../../../../src/app/common-api/domain/mailer.errors'

describe('Nodemailer', async () => {
  let mailer: Nodemailer
  let nodemailerTransporterMock

  before(async () => {
    nodemailerTransporterMock = { sendMail: sinon.mock() }
    mailer = new Nodemailer(nodemailerTransporterMock)
  })

  describe('send', async () => {
    afterEach(() => {
      nodemailerTransporterMock.sendMail.reset()
    })

    it('should call sendMail with right payload when message is provided', async () => {
      // GIVEN
      const email: Email = {
        sender: 'sender@email.com',
        recipient: 'recipient@email.com',
        subject: 'a subject',
        messageText: 'a message',
        messageHtml: '<b>a message</b>'
      }
      nodemailerTransporterMock.sendMail.withExactArgs({
        from: email.sender,
        to: email.recipient,
        subject: email.subject,
        text: email.messageText,
        html: email.messageHtml
      }).resolves({ messageId: 'messageId' })
      // WHEN
      const response = await mailer.send(email)
      // THEN
      expect(response).to.be.eql({ messageId: 'messageId' })
    })

    it('should call sendMail method with right payload when message and files are provided', async () => {
      // GIVEN
      const email: Email = {
        sender: 'sender@email.com',
        recipient: 'recipient@email.com',
        subject: 'a subject',
        messageText: 'a message',
        messageHtml: '<b>a message</b>',
        attachments: [
          { filename: 'file.pdf', path: '/path/file.pdf' },
          { filename: 'file.pdf', content: Buffer.alloc(1) }
        ]
      }
      nodemailerTransporterMock.sendMail.withExactArgs({
        from: email.sender,
        to: email.recipient,
        subject: email.subject,
        text: email.messageText,
        html: email.messageHtml,
        attachments: [
          { filename: 'file.pdf', path: '/path/file.pdf' },
          { filename: 'file.pdf', content: Buffer.alloc(1) }
        ]
      }).resolves({ messageId: 'messageId' })
      // WHEN
      const response = await mailer.send(email)
      // THEN
      expect(response).to.be.eql({ messageId: 'messageId' })
    })

    it('should thrown MailDeliveryFailureError when email delivery failed', async () => {
      // GIVEN
      const email: Email = {
        sender: 'sender@email.com',
        recipient: 'recipient@email.com',
        subject: 'a subject',
        messageText: 'a message'
      }
      nodemailerTransporterMock.sendMail.rejects(Error)
      // WHEN
      const response: Promise<MailerResponse> = mailer.send(email)
      // THEN
      return expect(response).to.be.rejectedWith(MailDeliveryFailureError)
    })
  })
})
