import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import * as path from 'path'
import { CertificateRepository } from '../../domain/certificate/certificate.repository'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate/certificate'
import { _encodeForPdf, _formatDate, _formatPolicyId } from '../../../common-api/infrastructure/pdf-formatter'

export class CertificatePdfRepository implements CertificateRepository {
  async generate (policy: Policy): Promise<Certificate> {
    let certificateTemplateBuffer = await pdftk
      .input(path.join(__dirname, 'certificate-template.pdf'))
      .uncompress()
      .output()

    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[firstname]]', _encodeForPdf(policy.contact.firstname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[lastname]]', _encodeForPdf(policy.contact.lastname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[address]]', _encodeForPdf(policy.contact.address))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[postal_code]]', _encodeForPdf(policy.contact.postalCode.toString()))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[city]]', _encodeForPdf(policy.contact.city))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_start_date]]', _encodeForPdf(_formatDate(policy.termStartDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_end_date]]', _encodeForPdf(_formatDate(policy.termEndDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[date_today]]', _encodeForPdf(_formatDate(new Date())))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[policy_id]]', _encodeForPdf(_formatPolicyId(policy.id)))

    const filledUpCertificateBuffer = await this.reencodeProperlyPdf(certificateTemplateBuffer)

    return { name: this.generateFileName(policy.id), buffer: filledUpCertificateBuffer }
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Attestation_assurance_habitation_${policyId}.pdf`
  }

  private async reencodeProperlyPdf (certificateTemplateBuffer: Buffer): Promise<Buffer> {
    return await pdftk.input(certificateTemplateBuffer).compress().output()
  }
}
