import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import path from 'path'
import { Policy } from '../../domain/policy'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import {
  _encodeForPdf,
  _formatDate,
  _formatNumber, _formatOtherInsured,
  _formatPolicyId
} from '../../../common-api/infrastructure/pdf-formatter'
import { SpecificTermsGenerator } from '../../domain/specific-terms/specific-terms.generator'

export class SpecificTermsPdfGenerator implements SpecificTermsGenerator {
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
    let specificTermsTemplateBuffer = await pdftk
      .input(path.join(__dirname, templateName))
      .uncompress()
      .output()

    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[start_date]', _encodeForPdf(_formatDate(policy.termStartDate)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[policy_id]', _encodeForPdf(_formatPolicyId(policy.id)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[product_id]', _encodeForPdf(policy.insurance.productCode))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[term_end_date]', _encodeForPdf(_formatDate(policy.termEndDate)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[total_price]', _encodeForPdf(_formatNumber(policy.premium)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[firstname]', _encodeForPdf(policy.contact.firstname))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[lastname]', _encodeForPdf(policy.contact.lastname))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[email]', _encodeForPdf(policy.contact.email))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[other_insured]', _encodeForPdf(_formatOtherInsured(policy.risk.people.otherPeople)))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[address]', _encodeForPdf(policy.contact.address))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[postal_code]', _encodeForPdf(policy.contact.postalCode.toString()))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[city]', _encodeForPdf(policy.contact.city))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[room_count]', _encodeForPdf(policy.risk.property.roomCount.toString()))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[default_ceiling]', _formatNumber(policy.insurance.estimate.defaultCeiling))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[default_deduction]', _formatNumber(policy.insurance.estimate.defaultDeductible))
    specificTermsTemplateBuffer = replace(specificTermsTemplateBuffer, '[subscribtion_date]', _encodeForPdf(_formatDate(new Date())))

    const filledUpSpecificTermsBuffer = await this.reencodeProperlyPdf(specificTermsTemplateBuffer)

    return filledUpSpecificTermsBuffer
  }

  private async reencodeProperlyPdf (certificateTemplateBuffer: Buffer): Promise<Buffer> {
    return await pdftk.input(certificateTemplateBuffer).compress().output()
  }
}
