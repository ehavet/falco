import { CertificateRepository } from '../../domain/certificate.repository'
import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate'

function _encodeForPdf (value: string): string {
  const dict = {
    '€': '\\200',
    Š: '\\212',
    Ž: '\\216',
    š: '\\232',
    ž: '\\236',
    Ÿ: '\\237'
  }
  return value.replace(/[^\w ]/g,
    char => dict[char] || '\\' + ('000' + char.charCodeAt(0).toString(8)).slice(-3))
}

function _formatPolicyId (policyId: string): string {
  const sub1 = policyId.substr(0, 3)
  const sub2 = policyId.substr(3, 3)
  const sub3 = policyId.substr(6, 3)
  const sub4 = policyId.substr(9, 3)
  return `${sub1} ${sub2} ${sub3} ${sub4}`
}

function _formatDate (date: Date): string {
  return date ? new Intl.DateTimeFormat('fr-FR').format(date) : ''
}

export class CertificatePdfRepository implements CertificateRepository {
  async generate (policy: Policy): Promise<Certificate> {
    let buffer = await pdftk
      .input('/Users/mathieu.laurent/Workspace/Appenin/falco-api/src/app/policies/infrastructure/certificate-pdf/certificate-template.pdf')
      .uncompress()
      .output()
    buffer = replace(buffer, '[[firstname]]', _encodeForPdf(policy.contact.firstname))
    buffer = replace(buffer, '[[lastname]]', _encodeForPdf(policy.contact.lastname))
    buffer = replace(buffer, '[[address]]', _encodeForPdf(policy.contact.address))
    buffer = replace(buffer, '[[postal_code]]', _encodeForPdf(policy.contact.postalCode.toString()))
    buffer = replace(buffer, '[[city]]', _encodeForPdf(policy.contact.city))
    buffer = replace(buffer, '[[term_start_date]]', _encodeForPdf(_formatDate(policy.termStartDate)))
    buffer = replace(buffer, '[[term_end_date]]', _encodeForPdf(_formatDate(policy.termEndDate)))
    buffer = replace(buffer, '[[date_today]]', _encodeForPdf(_formatDate(new Date())))
    buffer = replace(buffer, '[[policy_id]]', _encodeForPdf(_formatPolicyId(policy.id)))
    return { buffer }
  }
}
