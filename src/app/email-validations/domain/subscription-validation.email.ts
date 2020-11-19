import { Policy } from '../../policies/domain/policy'
import { Certificate } from '../../policies/domain/certificate/certificate'
import { Contract } from '../../policies/domain/contract/contract'
import { HtmlTemplateEngine } from '../../common-api/domain/html-template-engine'
import { Email } from '../../common-api/domain/mailer'
import { SubscriptionValidationEmailBuildError } from '../../policies/domain/subcription-validation-email.errors'

const EMAIL_CONGRATULATIONS_TEMPLATE_NAME = 'email-congratulations'

export interface SubscriptionValidationEmail extends Email {
  readonly sender: string,
  readonly recipient: string,
  readonly subject: string,
  readonly messageText?: string,
  readonly messageHtml?: string,
  readonly attachments?: (Email.AttachedBuffer|Email.AttachedFile)[],
  readonly cc?: string
}

export async function buildSubscriptionValidationEmail (policy: Policy, certificate: Certificate, signedContract: Contract, templateEngine: HtmlTemplateEngine): Promise<SubscriptionValidationEmail> {
  try {
    const attachedCertificate: Email.AttachedBuffer = {
      filename: certificate.name,
      content: certificate.buffer
    }
    const attachedSignedContract: Email.AttachedBuffer = {
      filename: signedContract.name,
      content: signedContract.buffer
    }

    return {
      sender: '"Appenin Assurance" <moncontrat@appenin.fr>',
      recipient: policy.contact.email,
      subject: 'Appenin - vos documents contractuels / your contractual documents',
      messageHtml: await templateEngine.render(EMAIL_CONGRATULATIONS_TEMPLATE_NAME),
      attachments: [attachedCertificate, attachedSignedContract],
      cc: 'notif-souscription@appenin.fr'
    }
  } catch (error) {
    throw new SubscriptionValidationEmailBuildError(policy.id)
  }
}
