import { HtmlTemplateEngine, HtmlTemplateEngineFileNotFoundError } from '../../common-api/domain/html-template-engine'
import { Email } from '../../common-api/domain/mailer'
import { EmailValidationTemplateNotFoundError } from './email-validation.errors'

const EMAIL_VALIDATION_TEMPLATE_NAME = 'email-validation'

export interface EmailValidationLinkEmail extends Email {
    readonly sender: string,
    readonly recipient: string,
    readonly subject: string,
    readonly messageText?: string
}

export async function buildValidationLinkEmail (templateEngine: HtmlTemplateEngine, recipient, uriFr, uriEn): Promise<EmailValidationLinkEmail> {
  let html: string
  try {
    html = await templateEngine.render(EMAIL_VALIDATION_TEMPLATE_NAME, { uriEn: uriEn, uriFr: uriFr })
  } catch (error) {
    if (error instanceof HtmlTemplateEngineFileNotFoundError) {
      throw new EmailValidationTemplateNotFoundError(EMAIL_VALIDATION_TEMPLATE_NAME)
    } else { throw error }
  }

  return {
    sender: '"Appenin Assurance" <validation@appenin.fr>',
    recipient: recipient,
    subject: 'Appenin - validation de votre adresse e-mail / e-mail validation',
    messageHtml: html
  }
}
