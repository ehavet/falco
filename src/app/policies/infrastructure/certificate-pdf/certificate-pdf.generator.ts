import replace from 'buffer-replace'
import * as path from 'path'
import { CertificateGenerator } from '../../domain/certificate/certificate.generator'
import { Policy } from '../../domain/policy'
import { Certificate } from '../../domain/certificate/certificate'
import { _encodeForPdf, _formatDate, _formatPolicyId } from '../../../common-api/infrastructure/pdf-formatter'
import { PDFProcessor } from '../pdf/pdf-processor'

const CERTIFICATE_TEMPLATE_FILENAME: string = 'certificate-template.pdf'

export class CertificatePdfGenerator implements CertificateGenerator {
  #pdfProcessor: PDFProcessor

  constructor (pdfProcessor: PDFProcessor) {
    this.#pdfProcessor = pdfProcessor
  }

  async generate (policy: Policy): Promise<Certificate> {
    let certificateTemplateBuffer = await this.#pdfProcessor.readPdfFile(path.join(__dirname, CERTIFICATE_TEMPLATE_FILENAME), policy.partnerCode)

    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[firstname]]', _encodeForPdf(policy.contact.firstname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[lastname]]', _encodeForPdf(policy.contact.lastname))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[address]]', _encodeForPdf(policy.contact.address))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[postal_code]]', _encodeForPdf(policy.contact.postalCode.toString()))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[city]]', _encodeForPdf(policy.contact.city))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_start_date]]', _encodeForPdf(_formatDate(policy.termStartDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[term_end_date]]', _encodeForPdf(_formatDate(policy.termEndDate)))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[date_today]]', _encodeForPdf(_formatDate(new Date())))
    certificateTemplateBuffer = replace(certificateTemplateBuffer, '[[policy_id]]', _encodeForPdf(_formatPolicyId(policy.id)))

    const filledUpCertificateBuffer = await this.#pdfProcessor.formatPdfBufferProperly(certificateTemplateBuffer)

    return { name: this.generateFileName(policy.id), buffer: filledUpCertificateBuffer }
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Attestation_assurance_habitation_${policyId}.pdf`
  }
}
