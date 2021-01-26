import replace from 'buffer-replace'
import * as path from 'path'
import { CertificateGenerator } from '../../domain/certificate/certificate.generator'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate/certificate'
import { encodeForPdf, formatDate, formatPolicyId } from '../../../common-api/infrastructure/pdf-formatter'
import { PDFProcessor } from '../pdf/pdf-processor'

const CERTIFICATE_TEMPLATE_FILENAME: string = 'certificate-template.pdf'

export class CertificatePdfGenerator implements CertificateGenerator {
  #pdfProcessor: PDFProcessor

  constructor (pdfProcessor: PDFProcessor) {
    this.#pdfProcessor = pdfProcessor
  }

  async generate (policy: Policy): Promise<Certificate> {
    let certificateTemplateBuffer = await this.#pdfProcessor.readPdfFile(path.join(__dirname, CERTIFICATE_TEMPLATE_FILENAME), policy.partnerCode)

    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[firstname]]', encodeForPdf(policy.contact.firstname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[lastname]]', encodeForPdf(policy.contact.lastname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[address]]', encodeForPdf(policy.contact.address))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[postal_code]]', encodeForPdf(policy.contact.postalCode.toString()))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[city]]', encodeForPdf(policy.contact.city))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_start_date]]', encodeForPdf(formatDate(policy.termStartDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_end_date]]', encodeForPdf(formatDate(policy.termEndDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[date_today]]', encodeForPdf(formatDate(new Date())))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[policy_id]]', encodeForPdf(formatPolicyId(policy.id)))

    const filledUpCertificateBuffer = await this.#pdfProcessor.formatPdfBufferProperly(certificateTemplateBuffer)

    return { name: this.generateFileName(policy.id), buffer: filledUpCertificateBuffer }
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Attestation_assurance_habitation_${policyId}.pdf`
  }
}
