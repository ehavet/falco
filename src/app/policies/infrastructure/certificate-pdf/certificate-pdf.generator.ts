import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import * as path from 'path'
import { CertificateGenerator } from '../../domain/certificate/certificate.generator'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate/certificate'
import { _encodeForPdf, _formatDate, _formatPolicyId } from '../../../common-api/infrastructure/pdf-formatter'

const CERTIFICATE_TEMPLATE_FILENAME: string = 'certificate-template.pdf'
const SPECIMEN_STAMP_FILENAME: string = 'specimen-stamp.pdf'
const DEMO_PARTNER_CODE_PREFIX: string = 'demo-'

export class CertificatePdfGenerator implements CertificateGenerator {
  async generate (policy: Policy): Promise<Certificate> {
    let certificateTemplateBuffer = await pdftk
      .input(path.join(__dirname, CERTIFICATE_TEMPLATE_FILENAME))
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

    const filledUpCertificateBuffer = await this.reencodeToPdf(certificateTemplateBuffer, policy)

    return { name: this.generateFileName(policy.id), buffer: filledUpCertificateBuffer }
  }

  private async reencodeToPdf (certificateTemplateBuffer: Buffer, policy: Policy): Promise<Buffer> {
    if (this.isRelatedToADemoPartner(policy)) {
      return pdftk.input(certificateTemplateBuffer).stamp(path.join(__dirname, SPECIMEN_STAMP_FILENAME)).compress().output()
    }
    return pdftk.input(certificateTemplateBuffer).compress().output()
  }

  private isRelatedToADemoPartner (policy: Policy) {
    return policy.partnerCode.startsWith(DEMO_PARTNER_CODE_PREFIX)
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Attestation_assurance_habitation_${policyId}.pdf`
  }
}
