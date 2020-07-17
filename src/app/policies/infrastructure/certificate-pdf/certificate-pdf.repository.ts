import { CertificateRepository } from '../../domain/certificate/certificate.repository'
import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate/certificate'
import * as path from 'path'
import { _encodeForPdf, _formatDate, _formatPolicyId } from '../../../common-api/infrastructure/pdf-formatter'

export class CertificatePdfRepository implements CertificateRepository {
  async generate (policy: Policy): Promise<Certificate> {
    let buffer = await pdftk
      .input(path.join(__dirname, 'certificate-template.pdf'))
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
    return { name: this.generateFileName(policy.id), buffer }
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Attestation_assurance_habitation_${policyId}.pdf`
  }
}
