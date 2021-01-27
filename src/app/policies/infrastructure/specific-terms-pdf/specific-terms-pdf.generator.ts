import replace from 'buffer-replace'
import path from 'path'
import { Policy } from '../../domain/policy'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import {
  encodeForPdf, formatAmount,
  formatDate,
  formatNumber,
  formatOtherInsured,
  formatPolicyId, encodeSpacesForPdf, formatHomeAddress, formatName, formatRoundAmount
} from '../../../common-api/infrastructure/pdf-formatter'
import { SpecificTermsGenerator } from '../../domain/specific-terms/specific-terms.generator'
import { PDFProcessor } from '../pdf/pdf-processor'

export class SpecificTermsPdfGenerator implements SpecificTermsGenerator {
  #pdfProcessor: PDFProcessor

  constructor (pdfProcessor: PDFProcessor) {
    this.#pdfProcessor = pdfProcessor
  }

  async generate (policy: Policy): Promise<SpecificTerms> {
    const specificTermsName: string = this.getNameFor(policy.id)
    const buffer = await this.fillupSpecificTermsTemplate(policy)

    return { name: specificTermsName, buffer }
  }

  getNameFor (policyId: string): string {
    return `Appenin_Condition_Particulieres_assurance_habitation_${policyId}.pdf`
  }

  private async fillupSpecificTermsTemplate (policy: Policy) {
    const templateName: string = `specific-terms-template-${policy.partnerCode}.pdf`
    let specificTermsTemplateBuffer = await this.#pdfProcessor.readPdfFile(path.join(__dirname, templateName), policy.partnerCode)

    // for student partners old templates pdfs, which will tend to be generated the same way than e-mobilia and demo
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[start_date]', encodeForPdf(formatDate(policy.termStartDate)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[policy_id]', encodeForPdf(formatPolicyId(policy.id)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[product_id]', encodeForPdf(policy.insurance.productCode))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[term_end_date]', encodeForPdf(formatDate(policy.termEndDate)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[total_price]', encodeForPdf(formatNumber(policy.premium)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[firstname]', encodeForPdf(policy.contact.firstname))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[lastname]', encodeForPdf(policy.contact.lastname))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[email]', encodeForPdf(policy.contact.email))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[other_insured]', encodeForPdf(formatOtherInsured(policy.risk.people.otherPeople)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[address]', encodeForPdf(policy.contact.address))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[postal_code]', encodeForPdf(policy.contact.postalCode.toString()))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[city]', encodeForPdf(policy.contact.city))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[room_count]', encodeForPdf(policy.risk.property.roomCount.toString()))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[default_ceiling]', formatNumber(policy.insurance.estimate.defaultCeiling))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[default_deduction]', formatNumber(policy.insurance.estimate.defaultDeductible))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[subscribtion_date]', encodeForPdf(formatDate(new Date())))

    // for general partners new template pdfs, only applied for now to e-mobilia and demo
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_start_date]', encodeSpacesForPdf(encodeForPdf(formatDate(policy.termStartDate))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_policy_id]', encodeSpacesForPdf(encodeForPdf(formatPolicyId(policy.id))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_product_id]', encodeSpacesForPdf(encodeForPdf(policy.insurance.productCode)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_term_end_date]', encodeSpacesForPdf(encodeForPdf(formatDate(policy.termEndDate))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_total_price]', encodeSpacesForPdf(encodeForPdf(formatNumber(policy.premium))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_name]', encodeSpacesForPdf(encodeForPdf(formatName(policy.contact))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_email]', encodeSpacesForPdf(encodeForPdf(policy.contact.email)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_other_insured]', encodeSpacesForPdf(encodeForPdf(formatOtherInsured(policy.risk.people.otherPeople))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_home_address]', encodeSpacesForPdf(encodeForPdf(formatHomeAddress(policy.contact))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_room_count]', encodeSpacesForPdf(encodeForPdf(policy.risk.property.roomCount.toString())))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_subscribtion_date]', encodeSpacesForPdf(encodeForPdf(formatDate(new Date()))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_deduc]', encodeSpacesForPdf(encodeForPdf(formatAmount(policy.insurance.estimate.defaultDeductible))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_defcap]', encodeSpacesForPdf(encodeForPdf(formatAmount(policy.insurance.estimate.defaultCeiling))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_50p100_defcap]', encodeSpacesForPdf(encodeForPdf(formatRoundAmount(Policy.getDefaultCapAdvice50p100(policy)))))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[_20p100_defcap]', encodeSpacesForPdf(encodeForPdf(formatRoundAmount(Policy.getDefaultCapAdvice20p100(policy)))))

    const filledUpSpecificTermsBuffer = await this.#pdfProcessor.formatPdfBufferProperly(specificTermsTemplateBuffer)

    return filledUpSpecificTermsBuffer
  }
}
